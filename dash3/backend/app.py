from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.db import get_connection, put_connection

app = Flask(__name__)
CORS(app)

@app.route("/api/realtime", methods=["GET"])
def realtime():
    interval = request.args.get("interval", default=5, type=int)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT *
        FROM machine_data
        WHERE time > now() - interval '%s seconds'
        ORDER BY time DESC
        LIMIT 1000;
    """ % interval)
    cols = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    cursor.close()
    put_connection(conn)
    return jsonify([dict(zip(cols, row)) for row in rows])

@app.route("/api/historical", methods=["GET"])
def historical():
    start = request.args.get("start")
    end = request.args.get("end")
    bucket = request.args.get("bucket", default="1h")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT time_bucket('{bucket}', time) AS bucket,
               avg(cutting_speed) AS avg_speed,
               sum(CASE WHEN arc_error THEN 1 ELSE 0 END) AS error_count
        FROM machine_data
        WHERE time BETWEEN %s AND %s
        GROUP BY bucket
        ORDER BY bucket;
    """, (start, end))
    cols = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    cursor.close()
    put_connection(conn)
    return jsonify([dict(zip(cols, row)) for row in rows])

@app.route("/api/errors", methods=["GET"])
def errors():
    since = request.args.get("since")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT time, machine_id, error_code, error_text, error_level
        FROM machine_data
        WHERE (arc_error OR error_level > 0)
          AND time > %s
        ORDER BY time DESC;
    """, (since,))
    cols = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    cursor.close()
    put_connection(conn)
    return jsonify([dict(zip(cols, row)) for row in rows])


@app.route("/api/oee", methods=["GET"])
def oee():
    window = request.args.get("window", default=5, type=int)
    planned_time = request.args.get("planned_time", default=3600, type=int)
    ideal_cycle_time = request.args.get("ideal_cycle_time", default=60, type=int)

    conn = get_connection()
    cursor = conn.cursor()

    interval_literal = f"{window} minutes"

    sql = f"""
        WITH run_intervals AS (
          SELECT machine_id,
                 SUM(
                   CASE WHEN state='RUN'
                        THEN EXTRACT(EPOCH FROM LEAD(time) OVER w - time)
                        ELSE 0 END
                 ) AS run_seconds,
                 SUM(CASE WHEN program_state='COMPLETE' THEN 1 ELSE 0 END) AS cycle_count,
                 SUM(CASE WHEN program_state='COMPLETE' AND scrap_cut THEN 1 ELSE 0 END) AS scrap_count
          FROM machine_data
          WINDOW w AS (PARTITION BY machine_id ORDER BY time)
          WHERE time > now() - INTERVAL '{interval_literal}'
          GROUP BY machine_id
        )
        SELECT
          machine_id,
          run_seconds::numeric / %s AS availability,
          (%s * cycle_count)::numeric / NULLIF(run_seconds, 0) AS performance,
          (CASE WHEN cycle_count = 0 THEN 0 ELSE (cycle_count - scrap_count)::numeric / cycle_count END) AS quality,
          (run_seconds::numeric / %s)
            * ((%s * cycle_count)::numeric / NULLIF(run_seconds, 0))
            * (CASE WHEN cycle_count = 0 THEN 0 ELSE (cycle_count - scrap_count)::numeric / cycle_count END) AS oee
        FROM run_intervals;
    """

    params = (planned_time, ideal_cycle_time, planned_time, ideal_cycle_time)
    cursor.execute(sql, params)

    cols = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    cursor.close()
    put_connection(conn)

    data = [dict(zip(cols, row)) for row in rows]
    return jsonify(data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
