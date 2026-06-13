# Medi Sheba - Healthcare Management Platform

A comprehensive healthcare management platform for Bangladesh that connects patients with doctors, hospitals, ambulances, e-medicine pharmacies, and online doctor consultations.

## Project Demonstration

Watch the initial project demonstration here: [Facebook Reel](https://www.facebook.com/reel/1673892307204403/?app=fbl)


## ✨ Features

### Core Modules

1. **Doctors** - Find specialists, view profiles, check availability, book appointments
2. **Hospitals** - Browse hospitals, beds available, emergency services
3. **Appointments** - Schedule, manage, and track doctor appointments
4. **Ambulance Services** - Emergency ambulance booking with various vehicle types
5. **E-Medicine** - Online pharmacy with medicine catalog and delivery
6. **E-Doctor** - Video consultations with online doctors
7. **Blood Bank** - Blood donor registration and blood request management
8. **Users** - Patient, doctor, and donor account management
9. **Payments** - Secure payment processing



```

### Step : Install Python Dependencies

```bash
# Install from pyproject.toml or requirements
pip install -e .

# Or install manually
pip install django
pip install djangorestframework
pip install django-cors-headers
pip install mysqlclient  # or psycopg2 for PostgreSQL
pip install python-decouple
```

### Step : Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DB_ENGINE=django.db.backends.mysql
DB_NAME=medical_sheba
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Step : Apply Database Migrations

```bash
python manage.py migrate
```

### Step : Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### Step : Set Up Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

```

### Step : Configure Frontend

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```


```

#### : Using UV (Recommended)

```bash
# From project root
cd medical_sheba

# Run with uv (default port 8000)
uv run manage.py runserver


```

Backend will be available at: `http://localhost:8000`

### Run Frontend (React/Vite)

```bash
# From frontend directory
cd frontend
npm run dev

# Or with yarn
yarn dev
```

Frontend will be available at: `http://localhost:5173` or `http://localhost:3000`

### Access Admin Panel

Navigate to: `http://localhost:8000/admin`
Use your superuser credentials to log in.

```


## 🛠️ Technologies Used

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Database
- **Django CORS Headers** - CORS handling
- **Python Decouple** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Routing
- **Tailwind CSS** - Styling

### DevOps & Tools
- **Git** - Version control
- **Postman** - API testing

## 🔧 Common Commands

### Django Management Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver


# Run tests
python manage.py test

# Shell access
python manage.py shell
```

### Frontend Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 👥 Team & Support

For issues, feature requests, or contributions:
- Create an issue in the repository
- Contact: support.medisheba@gmail.com
- WhatsApp: +880 1322458732



