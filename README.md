# 🌿 Eco Haat - Eco-Friendly E-Commerce Platform

An eco-friendly e-commerce marketplace where sellers list biodegradable products, admins approve and rate eco-friendliness, and buyers purchase sustainable goods.

## 🚀 Features

### For Buyers
- Browse eco-friendly products with filters (category, material, eco-rating)
- View detailed product pages with eco-friendliness ratings
- Shopping cart and checkout functionality
- Order history and tracking

### For Sellers
- Dashboard with product statistics
- Add new products with images and descriptions
- Track product approval status
- View orders containing their products

### For Admins
- Dashboard with platform statistics
- Approve/reject products with eco-rating (0-100%)
- Manage categories and users
- Order management

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Python + FastAPI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Authentication |
| Storage | Supabase Storage |

## 📁 Project Structure

```
Eco_Haat/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Supabase configuration
│   ├── models.py            # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   └── routes/
│       ├── auth.py          # Authentication endpoints
│       ├── products.py      # Product CRUD
│       ├── admin.py         # Admin operations
│       ├── cart.py          # Shopping cart
│       └── orders.py        # Order management
├── database/
│   └── schema.sql           # Supabase database schema
└── frontend/
    ├── index.html           # Landing page
    ├── css/
    │   ├── main.css         # Core styles
    │   └── animations.css   # Premium animations
    ├── js/
    │   ├── config.js        # API configuration
    │   ├── api.js           # API helper
    │   └── utils.js         # Utility functions
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── products.html
    │   ├── product-detail.html
    │   ├── cart.html
    │   └── checkout.html
    ├── seller/
    │   ├── index.html       # Seller dashboard
    │   └── add-product.html # Add product form
    └── admin/
        └── index.html       # Admin dashboard
```

## 🔧 Setup Instructions

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `database/schema.sql`
3. Copy your Project URL and API keys from Settings → API

### 2. Configure Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env with your Supabase credentials
```

### 3. Run Backend

```bash
cd backend
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 4. Configure Frontend

Edit `frontend/js/config.js` and update:
```javascript
SUPABASE_URL: 'your_supabase_url',
SUPABASE_ANON_KEY: 'your_supabase_anon_key',
```

### 5. Run Frontend

Open `frontend/index.html` in a browser, or use a local server:

```bash
# Option 1: Python server
cd frontend
python -m http.server 5500

# Option 2: Live Server (VS Code extension)
```

## 👤 Creating an Admin User

1. Register a new account via the UI
2. In Supabase SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## 🎨 Design Features

- **Green Eco Theme** with forest gradients
- **Premium Animations**: Floating leaves, ripple effects, particles
- **Responsive Design** for all screen sizes
- **Eco-Rating System** with visual indicators

## 📝 License

MIT License - Feel free to use for your projects!

---

Made with 💚 for a greener planet
