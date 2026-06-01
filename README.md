# Medi Sheba - Healthcare Management Platform

A comprehensive healthcare management platform for Bangladesh that connects patients with doctors, hospitals, ambulances, e-medicine pharmacies, and online doctor consultations.


## ✨ Features

### Core Modules

1. **Doctors** - Find specialists, view profiles, check availability, book appointments
2. **Hospitals** - Browse hospitals with ratings, beds available, emergency services
3. **Appointments** - Schedule, manage, and track doctor appointments
4. **Ambulance Services** - Emergency ambulance booking with various vehicle types
5. **E-Medicine** - Online pharmacy with medicine catalog and delivery
6. **E-Doctor** - Video consultations with online doctors
7. **Blood Bank** - Blood donor registration and blood request management
8. **Users** - Patient, doctor, and donor account management
9. **Payments** - Secure payment processing
10. **Notifications** - Real-time notifications for appointments and services


## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd medical_sheba
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Python Dependencies

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

### Step 4: Configure Environment Variables

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

### Step 5: Apply Database Migrations

```bash
python manage.py migrate
```

### Step 6: Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### Step 7: Set Up Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Or with yarn
yarn install
```

### Step 8: Configure Frontend

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🏃 Running the Project

### Run Backend (Django)

#### Option 1: Standard Python

```bash
# From project root
cd medical_sheba
python manage.py runserver

# Or specify port
python manage.py runserver 8000
```

#### Option 2: Using UV (Recommended)

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

### Main Endpoints

#### Doctors
- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Get doctor detail
- `POST /api/doctors/` - Create new doctor
- `PUT /api/doctors/{id}/` - Update doctor
- `DELETE /api/doctors/{id}/` - Delete doctor

#### Hospitals
- `GET /api/hospitals/` - List all hospitals
- `GET /api/hospitals/{id}/` - Get hospital detail
- `POST /api/hospitals/` - Create hospital
- `PUT /api/hospitals/{id}/` - Update hospital
- `DELETE /api/hospitals/{id}/` - Delete hospital

#### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment detail
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Cancel appointment

#### E-Medicine
- `GET /api/emedicine/pharmacies/` - List pharmacies
- `GET /api/emedicine/medicines/` - List medicines
- `POST /api/emedicine/orders/` - Create medicine order
- `GET /api/emedicine/orders/` - View your orders

#### E-Doctor
- `GET /api/edoctor/doctors/` - List online doctors
- `GET /api/edoctor/slots/` - View consultation slots
- `POST /api/edoctor/consultations/` - Book consultation
- `GET /api/edoctor/consultations/` - View your consultations

#### Ambulance
- `GET /api/ambulance/services/` - List ambulance services
- `POST /api/ambulance/requests/` - Request ambulance
- `GET /api/ambulance/requests/` - View your requests
- `GET /api/ambulance/requests/{id}/` - Get request detail

#### Blood Bank
- `GET /api/blood/donors/` - List blood donors
- `POST /api/blood/requests/` - Create blood request
- `GET /api/blood/requests/` - View blood requests
- `GET /api/blood/donors/{id}/` - Get donor detail

#### Users
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login user
- `POST /api/users/logout/` - Logout user
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile

## 🛠️ Technologies Used

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **MySQL/PostgreSQL** - Database
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
- **Docker** (Optional) - Containerization
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

# Collect static files
python manage.py collectstatic

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

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: `django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")`

**Solution**:
```bash
# Check your .env file for correct database credentials
# Ensure MySQL/PostgreSQL is running
# On Windows:
mysql -u root -p

# Test connection with:
python manage.py dbshell
```

### Migration Issues

**Problem**: `django.db.migrations.exceptions.MigrationSchemaMissing`

**Solution**:
```bash
# Create a fresh database
python manage.py migrate --run-syncdb

# Or reset migrations (careful in production!)
python manage.py migrate apps <app_name> zero
python manage.py migrate
```

### CORS Errors

**Problem**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
```bash
# Update CORS_ALLOWED_ORIGINS in .env:
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Restart Django server
```

### Node Modules Issues

**Problem**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

**Problem**: `Address already in use`

**Solution**:
```bash
# Django - Use different port
python manage.py runserver 8001

# Find and kill process using port
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

### Static Files Not Loading

**Problem**: CSS/JS files return 404 errors

**Solution**:
```bash
# Collect static files
python manage.py collectstatic --noinput

# Ensure DEBUG=True in development
# Check STATIC_URL and STATIC_ROOT settings
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 👥 Team & Support

For issues, feature requests, or contributions:
- Create an issue in the repository
- Contact: support.medisheba@gmail.com
- WhatsApp: +880 1322458732

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

