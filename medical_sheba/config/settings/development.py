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

# Monkey patch to allow MariaDB 10.4 and disable RETURNING at SQL compiler level
import django.db.backends.base.base
from django.db.backends.mysql import base as mysql_base

django.db.backends.base.base.BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# Patch at the compiler level for SQL operations
from django.db.models.sql import compiler
old_as_sql = compiler.SQLInsertCompiler.as_sql

def patched_as_sql(self, *args, **kwargs):
    result = old_as_sql(self, *args, **kwargs)
    if isinstance(result, tuple) and len(result) >= 1:
        sql = result[0] if isinstance(result[0], str) else str(result[0])
        # Remove RETURNING clause from SQL
        if 'RETURNING' in sql:
            sql = sql[:sql.find('RETURNING')].rstrip()
        return (sql,) + result[1:]
    return result

compiler.SQLInsertCompiler.as_sql = patched_as_sql

# Database - MySQL for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'medical_sheba',
        'USER': 'sheba_user',
        'PASSWORD': 'StrongPassword123!',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }
}

# Email - Console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable SSL in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Allow all CORS origins in development
CORS_ALLOW_ALL_ORIGINS = True
