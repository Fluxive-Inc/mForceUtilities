import sqlite3
import os
from typing import List, Tuple, Optional

DB_PATH = "investigator.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create investigations table
    c.execute('''
        CREATE TABLE IF NOT EXISTS investigations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create sources table
    c.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            investigation_id INTEGER,
            source_type TEXT NOT NULL,
            path TEXT NOT NULL,
            last_indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (investigation_id) REFERENCES investigations (id)
        )
    ''')
    
    # Create agent_versions table
    c.execute('''
        CREATE TABLE IF NOT EXISTS agent_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            investigation_id INTEGER,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (investigation_id) REFERENCES investigations (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# --- Investigation CRUD ---

def create_investigation(name: str, description: str) -> int:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO investigations (name, description) VALUES (?, ?)', (name, description))
    investigation_id = c.lastrowid
    conn.commit()
    conn.close()
    return investigation_id

def update_investigation(investigation_id: int, name: str, description: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE investigations SET name = ?, description = ? WHERE id = ?', (name, description, investigation_id))
    conn.commit()
    conn.close()

def get_investigations() -> List[dict]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM investigations ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_investigation(investigation_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM sources WHERE investigation_id = ?', (investigation_id,))
    c.execute('DELETE FROM investigations WHERE id = ?', (investigation_id,))
    conn.commit()
    conn.close()

# --- Source CRUD ---

def add_source(investigation_id: int, source_type: str, path: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO sources (investigation_id, source_type, path) VALUES (?, ?, ?)', 
              (investigation_id, source_type, path))
    conn.commit()
    conn.close()

def get_sources(investigation_id: int) -> List[dict]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM sources WHERE investigation_id = ? ORDER BY id DESC', (investigation_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_source(source_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM sources WHERE id = ?', (source_id,))
    conn.commit()
    conn.close()

# --- Agent Version CRUD ---

def create_agent_version(investigation_id: int, name: str) -> int:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO agent_versions (investigation_id, name) VALUES (?, ?)', (investigation_id, name))
    version_id = c.lastrowid
    conn.commit()
    conn.close()
    return version_id

def get_agent_versions(investigation_id: int) -> List[dict]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM agent_versions WHERE investigation_id = ? ORDER BY created_at DESC', (investigation_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_agent_version(version_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM agent_versions WHERE id = ?', (version_id,))
    conn.commit()
    conn.close()
