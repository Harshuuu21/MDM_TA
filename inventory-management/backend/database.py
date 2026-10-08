import sqlite3
import os

DB_PATH = 'inventory.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity >= 0),
        price REAL NOT NULL CHECK(price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Check if we need to insert sample data
    cursor.execute('SELECT COUNT(*) FROM products')
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_data = [
            ('PRD001', 'Arduino Uno', 'Electronics', 25, 650.0),
            ('PRD002', 'ESP32', 'Electronics', 8, 450.0),
            ('PRD003', 'USB C Cable', 'Accessories', 42, 150.0),
            ('PRD004', 'Notebook', 'Stationery', 5, 80.0),
            ('PRD005', 'Wireless Mouse', 'Electronics', 0, 750.0),
            ('PRD006', 'Raspberry Pi 4', 'Electronics', 12, 4500.0),
            ('PRD007', 'Office Chair', 'Furniture', 15, 6500.0),
            ('PRD008', 'Mechanical Keyboard', 'Electronics', 6, 3200.0)
        ]
        
        cursor.executemany('''
        INSERT INTO products (product_id, name, category, quantity, price)
        VALUES (?, ?, ?, ?, ?)
        ''', sample_data)
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
