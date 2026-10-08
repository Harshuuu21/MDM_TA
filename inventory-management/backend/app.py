import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

# Initialize DB on startup
with app.app_context():
    init_db()

def dict_from_row(row):
    return dict(zip(row.keys(), row))

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict_from_row(p) for p in products])

@app.route('/api/products/<int:product_id_pk>', methods=['GET'])
def get_product(product_id_pk):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id_pk,)).fetchone()
    conn.close()
    
    if product is None:
        return jsonify({'error': 'Product not found'}), 404
        
    return jsonify(dict_from_row(product))

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '')
    conn = get_db_connection()
    
    search_term = f"%{query}%"
    products = conn.execute('''
        SELECT * FROM products 
        WHERE product_id LIKE ? OR name LIKE ? OR category LIKE ?
        ORDER BY name ASC
    ''', (search_term, search_term, search_term)).fetchall()
    
    conn.close()
    return jsonify([dict_from_row(p) for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    
    required_fields = ['product_id', 'name', 'category', 'quantity', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400
            
    if data['quantity'] < 0:
        return jsonify({'error': 'Quantity cannot be negative'}), 400
    if data['price'] < 0:
        return jsonify({'error': 'Price cannot be negative'}), 400
        
    conn = get_db_connection()
    try:
        cursor = conn.execute('''
            INSERT INTO products (product_id, name, category, quantity, price)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['product_id'], data['name'], data['category'], data['quantity'], data['price']))
        conn.commit()
        new_id = cursor.lastrowid
        
        product = conn.execute('SELECT * FROM products WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict_from_row(product)), 201
        
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Product ID already exists'}), 409
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id_pk>', methods=['PUT'])
def update_product(product_id_pk):
    data = request.json
    
    if 'quantity' in data and data['quantity'] < 0:
        return jsonify({'error': 'Quantity cannot be negative'}), 400
    if 'price' in data and data['price'] < 0:
        return jsonify({'error': 'Price cannot be negative'}), 400
        
    conn = get_db_connection()
    
    # Check if product exists
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id_pk,)).fetchone()
    if product is None:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
        
    try:
        conn.execute('''
            UPDATE products 
            SET name = ?, category = ?, quantity = ?, price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (data['name'], data['category'], data['quantity'], data['price'], product_id_pk))
        conn.commit()
        
        updated_product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id_pk,)).fetchone()
        conn.close()
        return jsonify(dict_from_row(updated_product))
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id_pk>', methods=['DELETE'])
def delete_product(product_id_pk):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id_pk,)).fetchone()
    
    if product is None:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
        
    conn.execute('DELETE FROM products WHERE id = ?', (product_id_pk,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Product deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
