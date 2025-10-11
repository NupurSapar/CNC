import psycopg2
import time
from datetime import datetime
import random
from config import DB_CONFIG

def generate_data():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    machines = ['ByStar-1', 'ByStar-2', 'ByStar-3']

    while True:
        now = datetime.utcnow()
        for machine_id in machines:
            cursor.execute(
                """INSERT INTO machine_data(
                    time, machine_id, state, program_state, cutting_speed,
                    scrap_cut)
                VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    now,
                    machine_id,
                    random.choice(['RUN', 'IDLE']),
                    random.choice(['ACTIVE', 'INACTIVE']),
                    random.uniform(100, 300),
                    random.choice([True, False])
                )
            )
        conn.commit()
        print(f"Inserted data for {len(machines)} machines at {now}")
        time.sleep(1)

if __name__ == "__main__":
    generate_data()
