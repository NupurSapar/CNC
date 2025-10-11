import psycopg2
from psycopg2 import pool
import logging
from backend.config import DB_CONFIG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        self.connection_pool = None
        self.create_pool()

    def create_pool(self):
        try:
            self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,
                **DB_CONFIG
            )
            logger.info("Connection pool created successfully")
        except Exception as e:
            logger.error(f"Error creating connection pool: {e}")

    def get_connection(self):
        try:
            return self.connection_pool.getconn()
        except Exception as e:
            logger.error(f"Error getting connection: {e}")
            return None

    def put_connection(self, conn):
        try:
            self.connection_pool.putconn(conn)
        except Exception as e:
            logger.error(f"Error returning connection: {e}")

    def close_all(self):
        if self.connection_pool:
            self.connection_pool.closeall()

db_manager = DatabaseConnection()

def get_connection():
    return db_manager.get_connection()

def put_connection(conn):
    db_manager.put_connection(conn)
