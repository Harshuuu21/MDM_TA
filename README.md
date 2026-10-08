# Inventory / Product Management System

A polished, full-stack inventory management web application where users can add, view, search, update, and delete products. 

## Tech Stack
* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Fetch API
* **Backend**: Python, Flask, Flask REST API
* **Database**: SQLite

## Folder Structure
```
inventory-management/
│
├── backend/
│   ├── app.py           # Main Flask application and API endpoints
│   ├── database.py      # SQLite database initialization
│   ├── requirements.txt # Python dependencies
│   └── inventory.db     # SQLite database (auto-generated)
│
├── frontend/
│   ├── index.html       # Main HTML file
│   ├── css/
│   │   ├── style.css    # Main styling and CSS variables
│   │   └── responsive.css # Media queries
│   └── js/
│       ├── api.js       # Centralized Fetch API utility
│       ├── app.js       # Entry point and initialization
│       ├── dashboard.js # Dashboard logic (stats, charts)
│       ├── products.js  # Product CRUD operations
│       ├── ui.js        # DOM manipulation, modals, toasts
│       └── validation.js# Form validation
│
└── package.json         # Node dependencies for frontend serving
```

## Setup Instructions

### 1. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. (Optional) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://127.0.0.1:5000`. The database will be initialized with sample data automatically.*

### 2. Frontend Setup

You can serve the frontend using any static file server. Node.js is recommended.

1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```
   *The frontend will run on `http://localhost:3000`.*

## Features
- **Dashboard Stats**: Real-time statistics including total products, total stock, low stock items, and overall inventory value.
- **Product Management**: Full CRUD operations on inventory.
- **Dynamic Search & Filters**: Search in real-time by ID, Name, or Category. Filter by categories and stock status.
- **Low Stock Alerts**: Warnings for products running low (<= 10 units).
- **Responsive Design**: Works gracefully on desktop, tablet, and mobile.
- **Modern UI/UX**: SaaS-like clean, modern dashboard design with toast notifications, skeleton loaders, modals, and smooth animations.
