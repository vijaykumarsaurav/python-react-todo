# init_db.py
import os
import psycopg2
from psycopg2 import sql
from app.config import settings
from app.database import engine, Base
from app import models  # ensures models are imported so metadata is populated

def create_database_if_not_exists():
    # connect to default 'postgres' database to be able to create a new DB
    conn = None
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=settings.POSTGRES_USERNAME,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOSTNAME,
            port=settings.POSTGRES_PORT,
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Check if database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (settings.DATABASE_NAME,))
        exists = cur.fetchone()
        if not exists:
            print(f"Database '{settings.DATABASE_NAME}' does not exist. Creating...")
            cur.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(settings.DATABASE_NAME)
            ))
            print("Database created.")
        else:
            print(f"Database '{settings.DATABASE_NAME}' already exists.")
        cur.close()
    except Exception as e:
        print("Error creating database:", e)
        raise
    finally:
        if conn:
            conn.close()

def create_tables():
    # Uses SQLAlchemy engine pointed at the target DB
    print("Creating tables (if not exist)...")
    Base.metadata.create_all(bind=engine)
    print("Tables created/checked.")

if __name__ == "__main__":
    create_database_if_not_exists()
    create_tables()
    print("Init finished.")
