from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def parse_time_range(time_range):
    """Parse time range string to start and end datetime"""
    end_time = datetime.now()
    
    if time_range == '1h':
        start_time = end_time - timedelta(hours=1)
    elif time_range == '24h':
        start_time = end_time - timedelta(hours=24)
    elif time_range == '7d':
        start_time = end_time - timedelta(days=7)
    elif time_range == '30d':
        start_time = end_time - timedelta(days=30)
    else:
        start_time = end_time - timedelta(hours=24)  # Default
    
    return start_time, end_time

def calculate_oee(availability, performance, quality):
    """Calculate OEE from components"""
    return (availability * performance * quality) / 10000  # Convert percentages

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/api/machines', methods=['GET'])
def get_machines():
    """Get list of all machines with their current status"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get unique machines with their latest data
        query = """
            SELECT DISTINCT ON (machine_id)
                machine_id,
                state,
                program_state,
                technology_name,
                material,
                time as last_update
            FROM machine_data
            ORDER BY machine_id, time DESC
        """
        
        cur.execute(query)
        machines = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({"machines": machines}), 200
        
    except Exception as e:
        print(f"Error in get_machines: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/realtime', methods=['GET'])
def get_realtime_data(machine_id):
    """Get latest real-time data for a specific machine"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT *
            FROM machine_data
            WHERE machine_id = %s
            ORDER BY time DESC
            LIMIT 1
        """
        
        cur.execute(query, (machine_id,))
        data = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not data:
            return jsonify({"error": "Machine not found"}), 404
        
        return jsonify({"data": data}), 200
        
    except Exception as e:
        print(f"Error in get_realtime_data: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/raw-data', methods=['GET'])
def get_raw_data(machine_id):
    """Get raw OPC-UA data for a machine within time range"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT *
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
            ORDER BY time ASC
        """
        
        cur.execute(query, (machine_id, start_time, end_time))
        data = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            "data": data,
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_raw_data: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/timeline', methods=['GET'])
def get_machine_timeline(machine_id):
    """Get machine state timeline (Work, Error, Wait, Idle, etc.)"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get state changes with durations
        query = """
            WITH state_changes AS (
                SELECT 
                    time as start_time,
                    state,
                    LEAD(time) OVER (ORDER BY time) as end_time
                FROM machine_data
                WHERE machine_id = %s
                    AND time BETWEEN %s AND %s
                ORDER BY time
            )
            SELECT 
                start_time,
                end_time,
                state,
                EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) as duration_seconds
            FROM state_changes
            WHERE state IS NOT NULL
            ORDER BY start_time
        """
        
        cur.execute(query, (machine_id, start_time, end_time))
        timeline = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Group by status
        grouped = {
            'overview': [],
            'Work': [],
            'Error': [],
            'Wait': [],
            'Idle': [],
            'Stop': [],
            'Offline': []
        }
        
        for entry in timeline:
            status = entry['state']
            timeline_entry = {
                'start': entry['start_time'].isoformat(),
                'duration': entry['duration_seconds'],
                'status': status
            }
            
            grouped['overview'].append(timeline_entry)
            
            # Map state to status categories
            if status == 'Running':
                grouped['Work'].append(timeline_entry)
            elif status == 'Error' or entry.get('error_code', 0) > 0:
                grouped['Error'].append(timeline_entry)
            elif status == 'Idle':
                grouped['Idle'].append(timeline_entry)
            elif status == 'Stopped':
                grouped['Stop'].append(timeline_entry)
            else:
                grouped['Wait'].append(timeline_entry)
        
        return jsonify({"timeline": grouped}), 200
        
    except Exception as e:
        print(f"Error in get_machine_timeline: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/status-summary', methods=['GET'])
def get_status_summary(machine_id):
    """Get aggregated status duration summary"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT 
                state,
                COUNT(*) as count,
                SUM(EXTRACT(EPOCH FROM (LEAD(time) OVER (ORDER BY time) - time))) as total_seconds
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
            GROUP BY state
        """
        
        cur.execute(query, (machine_id, start_time, end_time))
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Convert to status summary format
        summary = {}
        for row in results:
            status = row['state']
            duration = row['total_seconds'] or 0
            
            if status == 'Running':
                summary['Work'] = duration
            elif status == 'Error':
                summary['Error'] = duration
            elif status == 'Idle':
                summary['Idle'] = duration
            elif status == 'Stopped':
                summary['Stop'] = duration
            else:
                summary['Wait'] = summary.get('Wait', 0) + duration
        
        return jsonify({"summary": summary}), 200
        
    except Exception as e:
        print(f"Error in get_status_summary: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/oee', methods=['GET'])
def get_machine_oee(machine_id):
    """Calculate OEE metrics for a machine"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Calculate availability (Running time / Total time)
        query_availability = """
            WITH total_time AS (
                SELECT 
                    COUNT(*) as total_records,
                    SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_records
                FROM machine_data
                WHERE machine_id = %s
                    AND time BETWEEN %s AND %s
            )
            SELECT 
                CASE 
                    WHEN total_records > 0 
                    THEN (running_records::float / total_records * 100)
                    ELSE 0 
                END as availability
            FROM total_time
        """
        
        cur.execute(query_availability, (machine_id, start_time, end_time))
        availability_result = cur.fetchone()
        availability = availability_result['availability'] if availability_result else 0
        
        # Calculate performance (Actual speed / Ideal speed)
        query_performance = """
            SELECT 
                AVG(cutting_speed) as avg_speed,
                MAX(cutting_speed) as max_speed
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
                AND state = 'Running'
                AND cutting_speed > 0
        """
        
        cur.execute(query_performance, (machine_id, start_time, end_time))
        performance_result = cur.fetchone()
        
        if performance_result and performance_result['max_speed']:
            performance = (performance_result['avg_speed'] / performance_result['max_speed']) * 100
        else:
            performance = 0
        
        # Calculate quality (Good parts / Total parts) - using error rate as proxy
        query_quality = """
            WITH error_analysis AS (
                SELECT 
                    COUNT(*) as total_records,
                    SUM(CASE WHEN error_code > 0 THEN 1 ELSE 0 END) as error_records
                FROM machine_data
                WHERE machine_id = %s
                    AND time BETWEEN %s AND %s
            )
            SELECT 
                CASE 
                    WHEN total_records > 0 
                    THEN ((total_records - error_records)::float / total_records * 100)
                    ELSE 100 
                END as quality
            FROM error_analysis
        """
        
        cur.execute(query_quality, (machine_id, start_time, end_time))
        quality_result = cur.fetchone()
        quality = quality_result['quality'] if quality_result else 100
        
        cur.close()
        conn.close()
        
        oee = calculate_oee(availability, performance, quality)
        
        return jsonify({
            "oee": round(oee, 2),
            "availability": round(availability, 2),
            "performance": round(performance, 2),
            "quality": round(quality, 2),
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_machine_oee: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/metrics/oee', methods=['GET'])
def get_overall_oee():
    """Get OEE metrics aggregated by month for all machines"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # First check if we have any data
        cur.execute("SELECT COUNT(*) as count FROM machine_data")
        count_result = cur.fetchone()
        
        if not count_result or count_result['count'] == 0:
            # Return empty data if no records
            cur.close()
            conn.close()
            return jsonify({"metrics": []}), 200
        
        # Get last 12 months of data with safer aggregation
        query = """
            WITH monthly_metrics AS (
                SELECT 
                    TO_CHAR(time, 'Mon') as month,
                    EXTRACT(MONTH FROM time) as month_num,
                    COUNT(*) as total_records,
                    SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_records,
                    AVG(CASE WHEN cutting_speed > 0 THEN cutting_speed ELSE NULL END) as avg_speed,
                    MAX(cutting_speed) as max_speed,
                    SUM(CASE WHEN error_code IS NOT NULL AND error_code > 0 THEN 1 ELSE 0 END) as error_records
                FROM machine_data
                WHERE time >= NOW() - INTERVAL '12 months'
                GROUP BY TO_CHAR(time, 'Mon'), EXTRACT(MONTH FROM time)
            )
            SELECT 
                month,
                month_num,
                CASE 
                    WHEN total_records > 0 
                    THEN (running_records::float / total_records * 100)
                    ELSE 0 
                END as availability,
                CASE 
                    WHEN max_speed > 0 AND avg_speed IS NOT NULL
                    THEN (avg_speed / max_speed * 100)
                    ELSE 0 
                END as performance,
                CASE 
                    WHEN total_records > 0 
                    THEN ((total_records - error_records)::float / total_records * 100)
                    ELSE 100 
                END as quality
            FROM monthly_metrics
            ORDER BY month_num
        """
        
        cur.execute(query)
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Calculate OEE and format response
        metrics = []
        for row in results:
            availability = row['availability'] or 0
            performance = row['performance'] or 0
            quality = row['quality'] or 100
            oee = calculate_oee(availability, performance, quality)
            
            metrics.append({
                'month': row['month'],
                'OEEE': round(oee, 2),
                'Availability': round(availability, 2),
                'Performance': round(performance, 2),
                'Quality': round(quality, 2)
            })
        
        return jsonify({"metrics": metrics}), 200
        
    except Exception as e:
        print(f"Error in get_overall_oee: {traceback.format_exc()}")
        return jsonify({"error": str(e), "metrics": []}), 500

@app.route('/api/machines/<machine_id>/errors', methods=['GET'])
def get_error_analysis(machine_id):
    """Get error analysis for a machine"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            WITH error_data AS (
                SELECT 
                    time,
                    error_code,
                    error_text,
                    error_level
                FROM machine_data
                WHERE machine_id = %s
                    AND time BETWEEN %s AND %s
                    AND error_code > 0
            )
            SELECT 
                error_code,
                error_text,
                error_level,
                COUNT(*) as count,
                MAX(time) as last_occurrence
            FROM error_data
            GROUP BY error_code, error_text, error_level
            ORDER BY count DESC
        """
        
        cur.execute(query, (machine_id, start_time, end_time))
        errors = cur.fetchall()
        
        # Get total records for error rate
        cur.execute("""
            SELECT COUNT(*) as total
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
        """, (machine_id, start_time, end_time))
        
        total_result = cur.fetchone()
        total_records = total_result['total'] if total_result else 0
        
        cur.close()
        conn.close()
        
        error_types = []
        for error in errors:
            error_types.append({
                'code': error['error_code'],
                'text': error['error_text'],
                'level': error['error_level'],
                'count': error['count'],
                'last': error['last_occurrence'].isoformat()
            })
        
        total_errors = sum(e['count'] for e in error_types)
        error_rate = (total_errors / total_records * 100) if total_records > 0 else 0
        
        return jsonify({
            "totalErrors": total_errors,
            "errorRate": round(error_rate, 2),
            "errorTypes": error_types,
            "timeRange": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_error_analysis: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/machines/<machine_id>/production', methods=['GET'])
def get_production_summary(machine_id):
    """Get production summary for a machine"""
    try:
        time_range = request.args.get('range', '24h')
        start_time, end_time = parse_time_range(time_range)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT 
                material,
                COUNT(*) as records,
                AVG(tickness) as avg_thickness,
                AVG(current_marking) as avg_current,
                SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_time
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
                AND material IS NOT NULL
            GROUP BY material
        """
        
        cur.execute(query, (machine_id, start_time, end_time))
        materials = cur.fetchall()
        
        # Get total time
        cur.execute("""
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN state = 'Running' THEN 1 ELSE 0 END) as running_records
            FROM machine_data
            WHERE machine_id = %s
                AND time BETWEEN %s AND %s
        """, (machine_id, start_time, end_time))
        
        totals = cur.fetchone()
        
        cur.close()
        conn.close()
        
        material_summary = []
        for mat in materials:
            material_summary.append({
                'name': mat['material'],
                'hours': mat['running_time'],
                'avgThickness': round(mat['avg_thickness'] or 0, 1),
                'avgCurrent': round(mat['avg_current'] or 0, 1)
            })
        
        utilization = (totals['running_records'] / totals['total_records'] * 100) if totals['total_records'] > 0 else 0
        
        return jsonify({
            "runningHours": totals['running_records'],
            "totalHours": totals['total_records'],
            "utilizationRate": round(utilization, 2),
            "materials": material_summary
        }), 200
        
    except Exception as e:
        print(f"Error in get_production_summary: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask API server on port 5000...")
    print("Available endpoints:")
    print("  GET  /api/health")
    print("  GET  /api/machines")
    print("  GET  /api/machines/<id>/realtime")
    print("  GET  /api/machines/<id>/raw-data?range=<1h|24h|7d|30d>")
    print("  GET  /api/machines/<id>/timeline?range=<1h|24h|7d|30d>")
    print("  GET  /api/machines/<id>/status-summary?range=<1h|24h|7d|30d>")
    print("  GET  /api/machines/<id>/oee?range=<1h|24h|7d|30d>")
    print("  GET  /api/metrics/oee")
    print("  GET  /api/machines/<id>/errors?range=<1h|24h|7d|30d>")
    print("  GET  /api/machines/<id>/production?range=<1h|24h|7d|30d>")
    app.run(debug=True, port=5000, host='0.0.0.0')