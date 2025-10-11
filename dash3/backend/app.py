from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG
import traceback

app = Flask(__name__)
CORS(app)

# ============================================================
# DATABASE CONNECTION
# ============================================================
def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

# ============================================================
# UTILITY FUNCTIONS
# ============================================================
def parse_time_range(time_range):
    """Convert time range string to datetime"""
    now = datetime.now()
    
    if time_range == '1h':
        return now - timedelta(hours=1)
    elif time_range == '24h':
        return now - timedelta(hours=24)
    elif time_range == '7d':
        return now - timedelta(days=7)
    elif time_range == '30d':
        return now - timedelta(days=30)
    elif time_range == '1y':
        return now - timedelta(days=365)
    else:
        return now - timedelta(hours=24)

# ============================================================
# HEALTH CHECK
# ============================================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ============================================================
# MACHINES ENDPOINTS
# ============================================================
@app.route('/api/machines', methods=['GET'])
def get_machines():
    """Get list of all machines with latest data"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT DISTINCT ON (machine_id) 
            machine_id,
            time,
            state,
            program_state,
            current,
            drilling,
            cutting_speed,
            override_flag,
            homing,
            homed,
            technology_name,
            technology_index,
            technology_dataset,
            material,
            thickness,
            gas_type,
            arc,
            arc_ignite,
            drilling_depth,
            scrap_cut,
            din_file_name,
            arc_error,
            error_code,
            error_text,
            error_parameter,
            error_level
        FROM machine_data
        ORDER BY machine_id, time DESC;
        """
        
        cur.execute(query)
        machines = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'machines': machines,
            'count': len(machines),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in get_machines: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'machines': []
        }), 500

@app.route('/api/machines/<machine_id>/realtime', methods=['GET'])
def get_realtime_data(machine_id):
    """Get latest realtime data for a specific machine"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT *
        FROM machine_data
        WHERE machine_id = %s
        ORDER BY time DESC
        LIMIT 1;
        """
        
        cur.execute(query, (machine_id,))
        data = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if data:
            return jsonify({
                'success': True,
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No data found',
                'data': None
            }), 404
            
    except Exception as e:
        print(f"Error in get_realtime_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/machines/<machine_id>/raw-data', methods=['GET'])
def get_raw_data(machine_id):
    """Get raw OPCUA data for a machine within time range"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT *
        FROM machine_data
        WHERE machine_id = %s
        AND time >= %s
        ORDER BY time ASC;
        """
        
        cur.execute(query, (machine_id, start_time))
        data = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data),
            'time_range': time_range,
            'start_time': start_time.isoformat()
        })
        
    except Exception as e:
        print(f"Error in get_raw_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# OEE ENDPOINTS
# ============================================================
@app.route('/api/metrics/oee', methods=['GET'])
def get_oee_metrics():
    """Get OEE metrics for all machines"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        WITH machine_stats AS (
            SELECT 
                machine_id,
                COUNT(*) as total_records,
                SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_count,
                AVG(cutting_speed) as avg_speed,
                SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) as error_count
            FROM machine_data
            WHERE time >= %s
            GROUP BY machine_id
        )
        SELECT 
            machine_id,
            CAST(ROUND(CAST((running_count::numeric / NULLIF(total_records, 0) * 100) AS numeric), 2) AS float) as availability,
            CAST(ROUND(CAST(CASE 
                WHEN avg_speed > 0 THEN (avg_speed / 500.0 * 100)
                ELSE 0 
            END AS numeric), 2) AS float) as performance,
            CAST(ROUND(CAST((1 - (error_count::numeric / NULLIF(total_records, 0))) * 100 AS numeric), 2) AS float) as quality,
            CAST(ROUND(CAST(
                (running_count::numeric / NULLIF(total_records, 0)) * 
                (CASE WHEN avg_speed > 0 THEN (avg_speed / 500.0) ELSE 0 END) * 
                (1 - (error_count::numeric / NULLIF(total_records, 0))) * 100
             AS numeric), 2) AS float) as oee
        FROM machine_stats;
        """
        
        cur.execute(query, (start_time,))
        metrics = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'time_range': time_range
        })
        
    except Exception as e:
        print(f"Error in get_oee_metrics: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/machines/<machine_id>/oee', methods=['GET'])
def get_machine_oee(machine_id):
    """Get OEE metrics for specific machine"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        WITH machine_stats AS (
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_count,
                AVG(cutting_speed) as avg_speed,
                SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) as error_count
            FROM machine_data
            WHERE machine_id = %s
            AND time >= %s
        )
        SELECT 
            COALESCE(CAST(ROUND(CAST((running_count::numeric / NULLIF(total_records, 0) * 100) AS numeric), 2) AS float), 0) as availability,
            COALESCE(CAST(ROUND(CAST(CASE 
                WHEN avg_speed > 0 THEN (avg_speed / 500.0 * 100)
                ELSE 0 
            END AS numeric), 2) AS float), 0) as performance,
            COALESCE(CAST(ROUND(CAST((1 - (error_count::numeric / NULLIF(total_records, 0))) * 100 AS numeric), 2) AS float), 100) as quality,
            COALESCE(CAST(ROUND(CAST(
                (running_count::numeric / NULLIF(total_records, 0)) * 
                (CASE WHEN avg_speed > 0 THEN (avg_speed / 500.0) ELSE 0 END) * 
                (1 - (error_count::numeric / NULLIF(total_records, 0))) * 100
             AS numeric), 2) AS float), 0) as oee
        FROM machine_stats;
        """
        
        cur.execute(query, (machine_id, start_time))
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if result:
            return jsonify({
                'success': True,
                'oee': float(result['oee']),
                'availability': float(result['availability']),
                'performance': float(result['performance']),
                'quality': float(result['quality']),
                'time_range': time_range
            })
        else:
            return jsonify({
                'success': True,
                'oee': 0,
                'availability': 0,
                'performance': 0,
                'quality': 0
            })
            
    except Exception as e:
        print(f"Error in get_machine_oee: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# TIMELINE ENDPOINTS
# ============================================================
@app.route('/api/machines/<machine_id>/timeline', methods=['GET'])
def get_machine_timeline(machine_id):
    """Get machine state timeline"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT 
            time,
            state,
            drilling,
            current,
            EXTRACT(EPOCH FROM (LEAD(time) OVER (ORDER BY time) - time)) as duration_seconds
        FROM machine_data
        WHERE machine_id = %s
        AND time >= %s
        ORDER BY time ASC;
        """
        
        cur.execute(query, (machine_id, start_time))
        raw_data = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Process timeline data
        timeline = {
            'overview': [],
            'Drilling': [],
            'Marking': [],
            'Idle': [],
            'Running': [],
            'Error': [],
            'Stopped': []
        }
        
        for record in raw_data:
            duration = record['duration_seconds'] or 0
            state = record['state'] or 'Unknown'
            
            # Overview based on machine state
            timeline['overview'].append({
                'status': state,
                'duration': duration,
                'timestamp': record['time'].isoformat()
            })
            
            # Drilling status
            if record['drilling'] and record['drilling'] > 0:
                timeline['Drilling'].append({
                    'status': 'Drilling',
                    'duration': duration,
                    'timestamp': record['time'].isoformat()
                })
            
            # Marking status (current > 0)
            if record['current'] and record['current'] > 0:
                timeline['Marking'].append({
                    'status': 'Marking',
                    'duration': duration,
                    'timestamp': record['time'].isoformat()
                })
            
            # State-specific timelines
            if state in timeline:
                timeline[state].append({
                    'status': state,
                    'duration': duration,
                    'timestamp': record['time'].isoformat()
                })
        
        return jsonify({
            'success': True,
            'timeline': timeline,
            'time_range': time_range
        })
        
    except Exception as e:
        print(f"Error in get_machine_timeline: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# STATUS SUMMARY ENDPOINTS
# ============================================================
@app.route('/api/machines/<machine_id>/status-summary', methods=['GET'])
def get_status_summary(machine_id):
    """Get status duration summary"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT 
            state,
            COUNT(*) as count,
            SUM(EXTRACT(EPOCH FROM (LEAD(time) OVER (ORDER BY time) - time))) as total_duration
        FROM machine_data
        WHERE machine_id = %s
        AND time >= %s
        GROUP BY state;
        """
        
        cur.execute(query, (machine_id, start_time))
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        summary = {}
        for row in results:
            summary[row['state']] = row['total_duration'] or 0
        
        return jsonify({
            'success': True,
            'summary': summary,
            'time_range': time_range
        })
        
    except Exception as e:
        print(f"Error in get_status_summary: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# ERROR ANALYSIS ENDPOINTS
# ============================================================
@app.route('/api/machines/<machine_id>/errors', methods=['GET'])
def get_error_analysis(machine_id):
    """Get error analysis for machine"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get error statistics
        query = """
        WITH error_stats AS (
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) as total_errors,
                SUM(CASE WHEN arc_error = TRUE THEN 1 ELSE 0 END) as arc_errors
            FROM machine_data
            WHERE machine_id = %s
            AND time >= %s
        ),
        error_types AS (
            SELECT 
                error_code,
                error_text,
                error_level,
                COUNT(*) as count,
                MAX(time) as last_occurrence
            FROM machine_data
            WHERE machine_id = %s
            AND time >= %s
            AND error_code IS NOT NULL
            GROUP BY error_code, error_text, error_level
            ORDER BY count DESC
        )
        SELECT 
            (SELECT total_errors FROM error_stats) as total_errors,
            (SELECT arc_errors FROM error_stats) as arc_errors,
            (SELECT total_records FROM error_stats) as total_records,
            json_agg(
                json_build_object(
                    'code', error_code,
                    'text', error_text,
                    'level', error_level,
                    'count', count,
                    'last', last_occurrence
                )
            ) FILTER (WHERE error_code IS NOT NULL) as error_types
        FROM error_types;
        """
        
        cur.execute(query, (machine_id, start_time, machine_id, start_time))
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if result and result['total_records']:
            error_rate = (result['total_errors'] / result['total_records']) * 100
        else:
            error_rate = 0
        
        return jsonify({
            'success': True,
            'totalErrors': result['total_errors'] if result else 0,
            'arcErrors': result['arc_errors'] if result else 0,
            'errorRate': round(error_rate, 2),
            'errorTypes': result['error_types'] if result and result['error_types'] else [],
            'timeRange': {
                'start': start_time.isoformat(),
                'end': datetime.now().isoformat(),
                'range': time_range
            }
        })
        
    except Exception as e:
        print(f"Error in get_error_analysis: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# HISTORICAL DATA ENDPOINTS
# ============================================================
@app.route('/api/machines/<machine_id>/historical', methods=['GET'])
def get_historical_data(machine_id):
    """Get historical data for charts"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get aggregated data
        query = """
        SELECT 
            time,
            cutting_speed,
            current,
            drilling,
            drilling_depth,
            thickness,
            state,
            material,
            gas_type,
            override_flag,
            scrap_cut,
            technology_name
        FROM machine_data
        WHERE machine_id = %s
        AND time >= %s
        ORDER BY time ASC;
        """
        
        cur.execute(query, (machine_id, start_time))
        data = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data),
            'time_range': time_range
        })
        
    except Exception as e:
        print(f"Error in get_historical_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# STATISTICS ENDPOINTS
# ============================================================
@app.route('/api/machines/<machine_id>/statistics', methods=['GET'])
def get_statistics(machine_id):
    """Get statistical aggregations"""
    try:
        time_range = request.args.get('range', '24h')
        start_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT 
            COUNT(*) as total_records,
            AVG(cutting_speed) as avg_speed,
            MAX(cutting_speed) as max_speed,
            MIN(cutting_speed) as min_speed,
            AVG(current) as avg_current,
            MAX(current) as max_current,
            COUNT(DISTINCT material) as material_count,
            COUNT(DISTINCT gas_type) as gas_type_count,
            SUM(CASE WHEN scrap_cut = TRUE THEN 1 ELSE 0 END) as scrap_count
        FROM machine_data
        WHERE machine_id = %s
        AND time >= %s;
        """
        
        cur.execute(query, (machine_id, start_time))
        stats = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'time_range': time_range
        })
        
    except Exception as e:
        print(f"Error in get_statistics: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# RUN SERVER
# ============================================================
if __name__ == '__main__':
    print("=" * 60)
    print("Starting Flask API Server")
    print("=" * 60)
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)