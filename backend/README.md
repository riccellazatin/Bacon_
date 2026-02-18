# Django Login Backend

A simple Django REST API backend for user authentication (login and signup).

## Setup Instructions

### 1. Create a Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
cd loginproject
python manage.py migrate
```

### 4. Start the Development Server
```bash
python manage.py runserver 8000
```

The backend will be available at `http://localhost:8000`

## API Endpoints

### Signup
- **URL**: `POST /api/auth/signup/`
- **Body**:
```json
{
    "username": "john123",
    "email": "john@example.com",
    "password": "password123",
    "password_confirm": "password123"
}
```
- **Response**: User data with ID

### Login
- **URL**: `POST /api/auth/login/`
- **Body**:
```json
{
    "username": "john123",
    "password": "password123"
}
```
- **Response**: User data if authentication is successful

### Get User Details
- **URL**: `GET /api/auth/user/<user_id>/`
- **Response**: User information

## Example React Integration

```javascript
// Signup
const handleSignup = async (formData) => {
    const response = await fetch('http://localhost:8000/api/auth/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    const data = await response.json();
    return data;
};

// Login
const handleLogin = async (username, password) => {
    const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    return data;
};
```

## Notes
- The backend uses SQLite database (db.sqlite3) for simplicity
- CORS is configured to allow requests from React frontend on localhost:3000
- No authentication tokens implemented (simple username/password validation)
- Passwords are hashed automatically by Django
