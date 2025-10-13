import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from datetime import datetime
from config import DB_CONFIG

# ============================================================
#  CONNECTION POOL
# ============================================================
connection_pool = None

def init_connection_pool(minconn=1, maxconn=5):
    """Initialize PostgreSQL connection pool"""
    global connection_pool
    if connection_pool is None:
        try:
            connection_pool = psycopg2.pool.SimpleConnectionPool(
                minconn, maxconn, **DB_CONFIG
            )
            print("✅ Database connection pool initialized")
        except Exception as e:
            print(f"❌ Error creating connection pool: {e}")
            raise

def get_connection():
    """Get connection from pool or create new if pool unavailable"""
    global connection_pool
    if connection_pool is None:
        init_connection_pool()
    try:
        return connection_pool.getconn()
    except Exception as e:
        print(f"❌ Error getting connection from pool: {e}")
        raise

def release_connection(conn):
    """Release connection back to pool"""
    global connection_pool
    if connection_pool:
        connection_pool.putconn(conn)
    else:
        conn.close()

# ============================================================
#  TABLE CREATION
# ============================================================
def create_table():
    """Create machine_data table (Timescale-enabled if available)"""
    conn = get_connection()
    cur = conn.cursor()

    create_table_query = """
    CREATE TABLE IF NOT EXISTS machine_data (
        time TIMESTAMPTZ NOT NULL,
        machine_id TEXT NOT NULL,
        state TEXT,
        program_state TEXT,
        current DOUBLE PRECISION,
        drilling DOUBLE PRECISION,
        cutting_speed DOUBLE PRECISION,
        override_flag BOOLEAN,
        homing BOOLEAN,
        homed BOOLEAN,
        technology_name TEXT,
        technology_index INTEGER,
        technology_dataset TEXT,
        material TEXT,
        thickness DOUBLE PRECISION,
        gas_type TEXT,
        arc BOOLEAN,
        arc_ignite BOOLEAN,
        drilling_depth DOUBLE PRECISION,
        scrap_cut BOOLEAN,
        din_file_name TEXT,
        arc_error BOOLEAN,
        error_code INTEGER,
        error_text TEXT,
        error_parameter TEXT,
        error_level INTEGER
    );
    """

    try:
        cur.execute(create_table_query)

        # Try to convert to hypertable (if TimescaleDB exists)
        try:
            cur.execute("""
                SELECT create_hypertable('machine_data', 'time',
                    if_not_exists => TRUE,
                    migrate_data => TRUE
                );
            """)
            print("🧩 Hypertable created successfully (TimescaleDB)")
        except Exception:
            print("ℹ️ TimescaleDB not installed – using normal table")

        # Indexes
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_machine_time
            ON machine_data (machine_id, time DESC);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_machine_state
            ON machine_data (state, time DESC);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_machine_error
            ON machine_data (error_code)
            WHERE error_code IS NOT NULL;
        """)

        conn.commit()
        print("✅ Table and indexes ready")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating table: {e}")
        raise
    finally:
        cur.close()
        release_connection(conn)

# ============================================================
#  INSERT OPERATIONS
# ============================================================
def _normalize_data(data):
    """Fix legacy field names and missing values"""
    # Backward compatibility for old key name
    if "thickness" in data and "thickness" not in data:
        data["thickness"] = data.pop("thickness")

    # Auto-fill missing time if not present
    if "time" not in data:
        data["time"] = datetime.utcnow()

    # Fill missing optional keys to prevent KeyError
    default_fields = [
        "state", "program_state", "current", "drilling", "cutting_speed",
        "override_flag", "homing", "homed", "technology_name", "technology_index",
        "technology_dataset", "material", "thickness", "gas_type", "arc", "arc_ignite",
        "drilling_depth", "scrap_cut", "din_file_name", "arc_error", "error_code",
        "error_text", "error_parameter", "error_level"
    ]
    for f in default_fields:
        data.setdefault(f, None)
    return data

def insert_machine_data(data):
    """Insert single record"""
    conn = get_connection()
    cur = conn.cursor()

    data = _normalize_data(data)

    insert_query = """
    INSERT INTO machine_data (
        time, machine_id, state, program_state, current, drilling,
        cutting_speed, override_flag, homing, homed, technology_name,
        technology_index, technology_dataset, material, thickness, gas_type,
        arc, arc_ignite, drilling_depth, scrap_cut, din_file_name,
        arc_error, error_code, error_text, error_parameter, error_level
    ) VALUES (
        %(time)s, %(machine_id)s, %(state)s, %(program_state)s, %(current)s,
        %(drilling)s, %(cutting_speed)s, %(override_flag)s, %(homing)s,
        %(homed)s, %(technology_name)s, %(technology_index)s, %(technology_dataset)s,
        %(material)s, %(thickness)s, %(gas_type)s, %(arc)s, %(arc_ignite)s,
        %(drilling_depth)s, %(scrap_cut)s, %(din_file_name)s, %(arc_error)s,
        %(error_code)s, %(error_text)s, %(error_parameter)s, %(error_level)s
    );
    """
    try:
        cur.execute(insert_query, data)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting data: {e}\nData: {data}")
        raise
    finally:
        cur.close()
        release_connection(conn)

def insert_multiple_machine_data(data_list):
    """Batch insert multiple records efficiently"""
    if not data_list:
        return False

    conn = get_connection()
    cur = conn.cursor()

    insert_query = """
    INSERT INTO machine_data (
        time, machine_id, state, program_state, current, drilling,
        cutting_speed, override_flag, homing, homed, technology_name,
        technology_index, technology_dataset, material, thickness, gas_type,
        arc, arc_ignite, drilling_depth, scrap_cut, din_file_name,
        arc_error, error_code, error_text, error_parameter, error_level
    ) VALUES (
        %(time)s, %(machine_id)s, %(state)s, %(program_state)s, %(current)s,
        %(drilling)s, %(cutting_speed)s, %(override_flag)s, %(homing)s,
        %(homed)s, %(technology_name)s, %(technology_index)s, %(technology_dataset)s,
        %(material)s, %(thickness)s, %(gas_type)s, %(arc)s, %(arc_ignite)s,
        %(drilling_depth)s, %(scrap_cut)s, %(din_file_name)s, %(arc_error)s,
        %(error_code)s, %(error_text)s, %(error_parameter)s, %(error_level)s
    );
    """
    try:
        normalized_list = [_normalize_data(d) for d in data_list]
        cur.executemany(insert_query, normalized_list)
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting multiple records: {e}")
        raise
    finally:
        cur.close()
        release_connection(conn)

# ============================================================
#  QUERY FUNCTIONS
# ============================================================
def get_latest_data(machine_id=None, limit=10):
    """Fetch latest records"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT * FROM machine_data
        WHERE (%s IS NULL OR machine_id = %s)
        ORDER BY time DESC
        LIMIT %s;
    """
    cur.execute(query, (machine_id, machine_id, limit))
    results = cur.fetchall()

    cur.close()
    release_connection(conn)
    return results

def get_machine_list():
    """Get unique machines with record stats"""
    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT machine_id,
           COUNT(*) AS record_count,
           MAX(time) AS last_update
    FROM machine_data
    GROUP BY machine_id
    ORDER BY machine_id;
    """

    cur.execute(query)
    results = cur.fetchall()
    cur.close()
    release_connection(conn)
    return results

def get_data_statistics():
    """Database summary stats"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
    SELECT 
        COUNT(*) AS total_records,
        COUNT(DISTINCT machine_id) AS unique_machines,
        MIN(time) AS earliest_record,
        MAX(time) AS latest_record,
        SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) AS error_count
    FROM machine_data;
    """
    cur.execute(query)
    result = cur.fetchone()

    cur.close()
    release_connection(conn)
    return result

# ============================================================
#  CLEANUP + UTILITIES
# ============================================================
def cleanup_old_data(days=30):
    """Delete records older than N days"""
    conn = get_connection()
    cur = conn.cursor()

    query = "DELETE FROM machine_data WHERE time < NOW() - INTERVAL %s;"
    try:
        cur.execute(query, (f'{days} days',))
        deleted_count = cur.rowcount
        conn.commit()
        print(f"🧹 Deleted {deleted_count} old records (> {days} days)")
        return deleted_count
    except Exception as e:
        conn.rollback()
        print(f"❌ Error cleaning data: {e}")
        raise
    finally:
        cur.close()
        release_connection(conn)

def test_connection():
    """Verify DB connection & TimescaleDB"""
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"✅ PostgreSQL version: {version[0]}")

        cur.execute("""
            SELECT installed_version 
            FROM pg_available_extensions 
            WHERE name='timescaledb';
        """)
        timescale = cur.fetchone()
        if timescale:
            print(f"🧩 TimescaleDB version: {timescale[0]}")
        else:
            print("ℹ️ TimescaleDB not installed")

        cur.close()
        release_connection(conn)
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# ============================================================
#  MAIN TEST BLOCK
# ============================================================
if __name__ == "__main__":
    print("🔍 Testing database connection...\n" + "=" * 60)
    if test_connection():
        print("\n🛠 Creating table if needed...")
        create_table()
        print("\n📊 Fetching database stats...")
        stats = get_data_statistics()
        if stats:
            print(stats)
        print("\n🧾 Machines:")
        for m in get_machine_list():
            print(m)
    else:
        print("⚠️ Check database configuration in config.py")
