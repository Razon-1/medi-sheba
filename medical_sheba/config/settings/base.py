"""
Base Django settings for medical_sheba project.
"""
import os
from pathlib import Path
from decouple import config

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
APPS_DIR = BASE_DIR / "apps"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'django_extensions',
    'django_filters',
    
    # Local apps
    'apps.users.apps.UsersConfig',
    'apps.hospitals.apps.HospitalsConfig',
    'apps.doctors.apps.DoctorsConfig',
    'apps.appointments.apps.AppointmentsConfig',
    'apps.blood.apps.BloodConfig',
    'apps.payments.apps.PaymentsConfig',
    'apps.notifications.apps.NotificationsConfig',
    'apps.location.apps.LocationConfig',
    'apps.search.apps.SearchConfig',
    'apps.ambulance.apps.AmbulanceConfig',
    'apps.emedicine.apps.EmedicineConfig',
    'apps.edoctor.apps.EdoctorConfig',
    'apps.contact.apps.ContactConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database - MySQL ONLY (no SQLite fallback)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# Static & Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

CORS_ALLOW_CREDENTIALS = True

# App URL.
APP_NAME = config('APP_NAME', default='Medi Sheba')
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')
API_BASE_URL = config('API_BASE_URL', default='http://localhost:8000')

# SSLCommerz Configuration
SSLCOMMERZ_SANDBOX = config('SSLCOMMERZ_SANDBOX', default=True, cast=bool)
SSLCOMMERZ_STORE_ID = config('SSLCOMMERZ_STORE_ID', default='').strip() or 'testbox'
SSLCOMMERZ_STORE_PASSWORD = config('SSLCOMMERZ_STORE_PASSWORD', default='').strip() or 'qwerty'
SSLCOMMERZ_INIT_URL = config(
    'SSLCOMMERZ_INIT_URL',
    default='https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
    if SSLCOMMERZ_SANDBOX else 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
)
SSLCOMMERZ_VALIDATION_URL = config(
    'SSLCOMMERZ_VALIDATION_URL',
    default='https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
    if SSLCOMMERZ_SANDBOX else 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
)

# Email Configuration
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@medisheba.com')

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=config('JWT_EXPIRATION_HOURS', default=24, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_EXPIRATION_DAYS', default=7, cast=int)),
    'ALGORITHM': config('JWT_ALGORITHM', default='HS256'),
}

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'apps.users.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.core.mail': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
