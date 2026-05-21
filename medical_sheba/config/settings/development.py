"""
Development-specific Django settings for medical_sheba project.
"""
from .base import *

DEBUG = True

INSTALLED_APPS += [
    'debug_toolbar',
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Debug Toolbar
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# MySQL Configuration for development with XAMPP
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.mysql'),
        'NAME': config('DB_NAME', default='medical_sheba'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}

# Email Configuration for development

# Get credentials from .env file
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='support.medisheba@gmail.com')
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# Choose ONE email backend below:

# OPTION 1: Real Emails via Gmail SMTP (Requires valid app password from Google Account) - ACTIVE
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# OPTION 2: File-based Backend (emails saved locally to folder - good for testing without SMTP)
# EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
# EMAIL_FILE_PATH = BASE_DIR / 'sent_emails'

# OPTION 3: Console Backend (emails printed to terminal)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable SSL in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Allow all CORS origins in development
CORS_ALLOW_ALL_ORIGINS = True
