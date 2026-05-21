# Medi Sheba Project Description

Medi Sheba is a healthcare service platform for Bangladesh. The project has a React/Vite frontend, a Django REST Framework backend, and a MySQL database. The frontend shows pages for patients and admins. The backend exposes REST APIs under `/api/`. The database stores users, hospitals, doctors, appointments, ambulance requests, medicine orders, payments, subscriptions, and location data.

## 1. Project Structure

```text
e:\medi-sheba
|-- README.md
|-- PROJECT_DESCRIPTION.md
|-- package-lock.json
|-- medical_sheba/
    |-- manage.py
    |-- pyproject.toml
    |-- uv.lock
    |-- config/
    |   |-- urls.py
    |   |-- asgi.py
    |   |-- wsgi.py
    |   |-- settings/
    |       |-- base.py
    |       |-- development.py
    |       |-- production.py
    |-- apps/
    |   |-- users/
    |   |-- hospitals/
    |   |-- doctors/
    |   |-- appointments/
    |   |-- blood/
    |   |-- payments/
    |   |-- notifications/
    |   |-- location/
    |   |-- search/
    |   |-- ambulance/
    |   |-- emedicine/
    |   |-- edoctor/
    |   |-- contact/
    |-- media/
    |-- sent_emails/
    |-- frontend/
        |-- package.json
        |-- vite.config.js
        |-- index.html
        |-- src/
            |-- main.jsx
            |-- App.jsx
            |-- api/
            |-- pages/
            |-- components/
            |-- context/
            |-- hooks/
            |-- styles/
            |-- utils/
```

## 2. Main Technology Stack

| Layer | Technology | Main Files |
| --- | --- | --- |
| Frontend | React 18, Vite, React Router, Axios, Zustand, Tailwind CSS, lucide-react | `medical_sheba/frontend/src/` |
| Backend | Python, Django, Django REST Framework, Simple JWT, django-filter, drf-spectacular | `medical_sheba/apps/`, `medical_sheba/config/` |
| Database | MySQL | Configured in `medical_sheba/config/settings/base.py` and `development.py` |
| Auth | JWT access token stored in browser localStorage | `frontend/src/api/client.js`, `frontend/src/context/authStore.js`, `apps/users/` |
| Payments | SSLCommerz plus payment records/subscriptions | `apps/payments/`, `frontend/src/api/payments.js` |
| API Docs | Swagger/OpenAPI | `/api/schema/`, `/api/docs/` |

## 3. Frontend Overview

The frontend is inside `medical_sheba/frontend/`.

| File or Folder | Purpose |
| --- | --- |
| `frontend/package.json` | Frontend dependencies and scripts: `npm run dev`, `npm run build`, `npm run preview`. |
| `frontend/vite.config.js` | Vite config. Dev server uses port `3000`. It also has an `/api` proxy to Django on `http://localhost:8000`. |
| `frontend/index.html` | HTML entry file loaded by Vite. |
| `frontend/src/main.jsx` | React entry point. Renders `<App />` into the DOM. |
| `frontend/src/App.jsx` | Main route map. Connects URL paths to page components. |
| `frontend/src/api/client.js` | Shared Axios client with base URL `http://localhost:8000/api`. Adds JWT token from `localStorage.access_token`. |
| `frontend/src/api/*.js` | API wrapper files. Each file calls backend endpoints for one module. |
| `frontend/src/context/authStore.js` | Zustand auth store. Handles login/register state and initializes user auth. |
| `frontend/src/pages/` | Full page components used by React Router. |
| `frontend/src/components/` | Reusable UI pieces such as Navbar, Footer, cards, modals, payment, reviews, loading, and errors. |
| `frontend/src/hooks/` | Shared React hooks for data and payment behavior. |
| `frontend/src/styles/` | CSS files for app, components, pages, admin dashboard, and responsive styling. |
| `frontend/src/utils/` | Helper utilities for validation, SEO, and image URL handling. |

## 4. Frontend Page Map

Routes are defined in `medical_sheba/frontend/src/App.jsx`.

| Browser URL | Frontend Page File | What It Does | Main API File |
| --- | --- | --- | --- |
| `/` | `frontend/src/pages/Home.jsx` | Home page, platform summary, subscription/payment entry points, home stats. | `api/payments.js`, direct users stats API |
| `/doctors` | `frontend/src/pages/Doctors.jsx` | Lists doctors, filtering/searching, links to detail page. | `api/doctors.js` |
| `/doctors/:id` | `frontend/src/pages/DoctorDetail.jsx` | Shows one doctor, reviews, appointment booking. | `api/doctors.js`, `api/reviews.js`, `api/appointments.js`, `api/payments.js` |
| `/hospitals` | `frontend/src/pages/Hospitals.jsx` | Lists hospitals. | `api/hospitals.js` |
| `/hospitals/:id` | `frontend/src/pages/HospitalDetail.jsx` | Shows one hospital and related doctors. | `api/hospitals.js`, `api/doctors.js` |
| `/blood` | `frontend/src/pages/Blood.jsx` | Blood donor listing and donor profile management. | `api/blood.js` |
| `/ambulance` | `frontend/src/pages/Ambulance.jsx` | Ambulance service listing and ambulance request creation. | `api/ambulance.js` |
| `/emedicine` | `frontend/src/pages/EMedicine.jsx` | Pharmacy and medicine listing, order medicine workflow. | `api/emedicine.js`, `api/payments.js` |
| `/edoctor` | `frontend/src/pages/EDoctor.jsx` | Online doctor listing, slots, consultation booking. | `api/edoctor.js`, `api/payments.js` |
| `/appointments` | `frontend/src/pages/Appointments.jsx` | Patient service dashboard for appointments, consultations, ambulance requests, and medicine orders. | `api/appointments.js`, `api/edoctor.js`, `api/ambulance.js`, `api/emedicine.js` |
| `/login` | `frontend/src/pages/Login.jsx` | User login. | `api/auth.js`, `context/authStore.js` |
| `/register` | `frontend/src/pages/Register.jsx` | User registration. | `api/auth.js`, `context/authStore.js` |
| `/forgot-password` | `frontend/src/pages/ForgotPassword.jsx` | Sends password reset request. | `api/auth.js` |
| `/reset-password` | `frontend/src/pages/ResetPassword.jsx` | Confirms password reset token and new password. | `api/auth.js` |
| `/payment/success` | `frontend/src/pages/PaymentResultPage.jsx` | Shows successful payment result and report actions. | `api/payments.js` |
| `/payment/failed` | `frontend/src/pages/PaymentResultPage.jsx` | Shows failed payment result. | `api/payments.js` |
| `/contact-sales` | `frontend/src/pages/ContactSales.jsx` | Sales/contact page. | Usually static or contact-related |
| `/contact` | `frontend/src/pages/Contact.jsx` | Contact form. | `api/contact.js` |
| `/about` | `frontend/src/pages/AboutUs.jsx` | About page. | Static page |
| `/privacy` | `frontend/src/pages/PrivacyPolicy.jsx` | Privacy policy. | Static page |
| `/terms` | `frontend/src/pages/TermsOfService.jsx` | Terms of service. | Static page |
| `/pharmacy-admin` | `frontend/src/pages/PharmacyAdminDashboard.jsx` | Pharmacy admin dashboard: pharmacy profile, medicines, orders. | `api/emedicine.js`, `api/hospitals.js` for image upload |
| `/pharmacy-create` | `frontend/src/pages/PharmacyCreatePage.jsx` | Create pharmacy profile after subscription/trial check. | `api/emedicine.js`, `api/payments.js`, `api/hospitals.js` |
| `/hospital-admin` | `frontend/src/pages/HospitalAdminDashboard.jsx` | Hospital admin dashboard: hospital, doctors, e-doctors, appointments, consultations. | `api/hospitals.js`, `api/doctors.js`, `api/edoctor.js`, `api/appointments.js` |
| `/hospital-create` | `frontend/src/pages/HospitalCreatePage.jsx` | Create hospital profile after subscription/trial check. | `api/hospitals.js`, `api/payments.js` |
| `/ambulance-admin` | `frontend/src/pages/AmbulanceAdminDashboard.jsx` | Ambulance admin dashboard: ambulances and ambulance requests. | `api/ambulance.js`, `api/hospitals.js` for image upload |
| `/super-admin` | `frontend/src/pages/SuperAdminDashboard.jsx` | Super admin dashboard for users, providers, orders, requests, appointments, payments, subscriptions. | `api/auth.js`, `api/hospitals.js`, `api/emedicine.js`, `api/ambulance.js`, `api/appointments.js`, `api/edoctor.js`, `api/payments.js` |

## 5. Frontend API Wrapper Files

| API File | Backend Base Endpoint | Purpose |
| --- | --- | --- |
| `frontend/src/api/client.js` | `http://localhost:8000/api` | Shared Axios client. Adds `Authorization: Bearer <token>` for authenticated requests. |
| `frontend/src/api/auth.js` | `/api/users/` | Login, register, current user, user CRUD, password reset. |
| `frontend/src/api/hospitals.js` | `/api/hospitals/` | Hospital list/detail/create/update/delete, my hospital, image upload. |
| `frontend/src/api/doctors.js` | `/api/doctors/` | Doctor list/detail/create/update/delete, hospital admin doctors. |
| `frontend/src/api/reviews.js` | `/api/reviews/` | Doctor review list/create/update/delete and mark helpful. |
| `frontend/src/api/appointments.js` | `/api/appointments/` | Appointment list/create/update/cancel/confirm/complete and hospital appointments. |
| `frontend/src/api/blood.js` | `/api/blood/` | Blood donors and blood requests. |
| `frontend/src/api/ambulance.js` | `/api/ambulance/` | Ambulance services and ambulance requests. |
| `frontend/src/api/emedicine.js` | `/api/emedicine/` | Pharmacies, medicines, and medicine orders. |
| `frontend/src/api/edoctor.js` | `/api/edoctor/` | Online doctors, consultation slots, and consultations. |
| `frontend/src/api/payments.js` | `/api/payments/` | Payments, SSLCommerz checkout, reports, subscriptions, payment intents. |
| `frontend/src/api/contact.js` | `/api/contact/` | Contact messages and admin message actions. |

## 6. Backend Overview

The backend is a Django project inside `medical_sheba/`.

| File or Folder | Purpose |
| --- | --- |
| `medical_sheba/manage.py` | Django command runner. Used for `runserver`, `migrate`, `createsuperuser`, seed commands, and tests. |
| `medical_sheba/pyproject.toml` | Python package metadata and backend dependencies. |
| `medical_sheba/config/urls.py` | Root URL routing. Connects `/api/...` paths to each Django app. |
| `medical_sheba/config/settings/base.py` | Shared settings: installed apps, middleware, MySQL database config, JWT, REST framework, CORS, media/static, payment settings. |
| `medical_sheba/config/settings/development.py` | Development settings: debug toolbar, local MySQL defaults, Gmail SMTP/file/console email options, CORS allow all. |
| `medical_sheba/config/settings/production.py` | Production settings: secure cookies, SSL redirect, production MySQL, email, optional S3, Celery config. |
| `medical_sheba/config/asgi.py` | ASGI app entry for async servers. |
| `medical_sheba/config/wsgi.py` | WSGI app entry for production servers like Gunicorn. |
| `medical_sheba/apps/*/models.py` | Database table definitions. |
| `medical_sheba/apps/*/serializers.py` | Converts database models to JSON and validates incoming API data. |
| `medical_sheba/apps/*/views.py` | API logic using DRF viewsets and actions. |
| `medical_sheba/apps/*/urls.py` | App-level API route registration. |
| `medical_sheba/apps/*/admin.py` | Django admin registration/configuration. |
| `medical_sheba/apps/*/migrations/` | Database schema migration history. |
| `medical_sheba/media/` | Uploaded media/images in development. |
| `medical_sheba/sent_emails/` | File-based test email output when file email backend is used. |

## 7. Backend App Map

| Backend App | Main Files | Database Models | API Base URL | Purpose |
| --- | --- | --- | --- | --- |
| `apps.users` | `models.py`, `serializers.py`, `views.py`, `urls.py`, `validators.py` | `User`, `PasswordResetToken` | `/api/users/` | Custom user accounts, roles, login/register, password reset, current user, home stats, admin user CRUD. |
| `apps.hospitals` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `Hospital` | `/api/hospitals/` | Hospital directory, hospital admin profile, emergency filter, district filter, image upload. |
| `apps.doctors` | `models.py`, `serializers.py`, `views.py`, `urls.py`, `reviews_urls.py` | `Doctor`, `DoctorReview` | `/api/doctors/`, `/api/reviews/` | Physical/chamber doctors, hospital admin doctors, doctor reviews. |
| `apps.appointments` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `Appointment` | `/api/appointments/` | Doctor appointment booking and status management. |
| `apps.blood` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `BloodDonor`, `BloodRequest` | `/api/blood/` | Blood donor registration/search and blood request management. |
| `apps.payments` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `Payment`, `Subscription`, `PaymentIntent` | `/api/payments/` | Payments, SSLCommerz checkout/callbacks, payment reports, refunds, subscriptions, trials. |
| `apps.notifications` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `Notification` | `/api/notifications/` | User notifications, unread list, mark read, delete all. |
| `apps.location` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `District`, `Upazila` | `/api/location/` | Bangladesh district/upazila lookup data. |
| `apps.search` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `Review` | `/api/search/` | Generic review/search-related endpoints. |
| `apps.ambulance` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `AmbulanceService`, `AmbulanceRequest` | `/api/ambulance/` | Ambulance listings, requests, assignment, fare/status updates. |
| `apps.emedicine` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `EMedicinePharmacy`, `MedicineItem`, `EMedicineOrder` | `/api/emedicine/` | Online pharmacies, medicine catalog, medicine orders. |
| `apps.edoctor` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `EDoctorProfile`, `ConsultationSlot`, `EDoctorConsultation` | `/api/edoctor/` | Online doctor profiles, consultation slots, video consultation booking/status. |
| `apps.contact` | `models.py`, `serializers.py`, `views.py`, `urls.py` | `ContactMessage` | `/api/contact/` | Contact form messages and admin message workflow. |

## 8. Backend API Routing

Root routing is in `medical_sheba/config/urls.py`.

| Root Path | Connected Backend File | Endpoint Group |
| --- | --- | --- |
| `/admin/` | Django admin | Admin panel |
| `/api/schema/` | `drf_spectacular` | OpenAPI schema |
| `/api/docs/` | `drf_spectacular` | Swagger API docs |
| `/api/users/` | `apps/users/urls.py` | User/auth APIs |
| `/api/hospitals/` | `apps/hospitals/urls.py` | Hospital APIs |
| `/api/doctors/` | `apps/doctors/urls.py` | Doctor APIs |
| `/api/reviews/` | `apps/doctors/reviews_urls.py` | Doctor review APIs |
| `/api/appointments/` | `apps/appointments/urls.py` | Appointment APIs |
| `/api/blood/` | `apps/blood/urls.py` | Blood donor/request APIs |
| `/api/payments/` | `apps/payments/urls.py` | Payment/subscription APIs |
| `/api/notifications/` | `apps/notifications/urls.py` | Notification APIs |
| `/api/location/` | `apps/location/urls.py` | District/upazila APIs |
| `/api/search/` | `apps/search/urls.py` | Generic review/search APIs |
| `/api/ambulance/` | `apps/ambulance/urls.py` | Ambulance APIs |
| `/api/emedicine/` | `apps/emedicine/urls.py` | E-medicine APIs |
| `/api/edoctor/` | `apps/edoctor/urls.py` | E-doctor APIs |
| `/api/contact/` | `apps/contact/urls.py` | Contact message APIs |

## 9. Important API Endpoints

### Users and Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/users/login/` | Login and receive JWT tokens/user data. |
| `POST` | `/api/users/register/` | Register a user. |
| `GET` | `/api/users/me/` | Get current logged-in user. |
| `GET` | `/api/users/` | List users, mainly for admin. |
| `POST` | `/api/users/request_password_reset/` | Send reset link/token. |
| `POST` | `/api/users/confirm_password_reset/` | Reset password with token. |
| `GET` | `/api/users/home_stats/` | Home page statistics. |

### Hospitals

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/hospitals/` | List hospitals. |
| `GET` | `/api/hospitals/{id}/` | Hospital detail. |
| `POST` | `/api/hospitals/` | Create hospital. |
| `PATCH` | `/api/hospitals/{id}/` | Update hospital. |
| `DELETE` | `/api/hospitals/{id}/` | Delete hospital. |
| `GET` | `/api/hospitals/my_hospital/` | Hospital admin's hospital. |
| `POST` | `/api/hospitals/upload_image/` | Upload image file. |

### Doctors and Reviews

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/doctors/` | List doctors. |
| `GET` | `/api/doctors/{id}/` | Doctor detail. |
| `POST` | `/api/doctors/` | Create doctor. |
| `PUT` | `/api/doctors/{id}/` | Update doctor. |
| `DELETE` | `/api/doctors/{id}/` | Delete doctor. |
| `GET` | `/api/doctors/my_doctors/` | Hospital admin's doctors. |
| `GET` | `/api/reviews/` | List doctor reviews. |
| `POST` | `/api/reviews/` | Create doctor review. |
| `POST` | `/api/reviews/{id}/mark_helpful/` | Mark review helpful. |

### Appointments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/appointments/` | List appointments visible to current user/admin. |
| `POST` | `/api/appointments/` | Create appointment. |
| `GET` | `/api/appointments/{id}/` | Appointment detail. |
| `PUT` | `/api/appointments/{id}/` | Update appointment. |
| `POST` | `/api/appointments/{id}/confirm/` | Confirm appointment. |
| `POST` | `/api/appointments/{id}/complete/` | Complete appointment. |
| `POST` | `/api/appointments/{id}/cancel/` | Cancel appointment. |
| `GET` | `/api/appointments/hospital_appointments/` | Hospital admin appointments. |

### Ambulance

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/ambulance/services/` | List ambulance services. |
| `GET` | `/api/ambulance/services/{id}/` | Ambulance service detail. |
| `POST` | `/api/ambulance/services/` | Create ambulance service. |
| `PATCH` | `/api/ambulance/services/{id}/` | Update ambulance service. |
| `DELETE` | `/api/ambulance/services/{id}/` | Delete ambulance service. |
| `GET` | `/api/ambulance/services/my_ambulances/` | Ambulance admin's ambulances. |
| `GET` | `/api/ambulance/services/by_vehicle_type/` | Filter ambulances by vehicle type. |
| `GET` | `/api/ambulance/services/by_district/` | Filter ambulances by district. |
| `GET` | `/api/ambulance/requests/` | List ambulance requests. |
| `POST` | `/api/ambulance/requests/` | Create ambulance request. |
| `POST` | `/api/ambulance/requests/{id}/accept/` | Assign an ambulance to a request. |
| `POST` | `/api/ambulance/requests/{id}/cancel/` | Cancel request. |
| `POST` | `/api/ambulance/requests/{id}/update_status/` | Update request status. |
| `POST` | `/api/ambulance/requests/{id}/update_fare/` | Set distance and calculate fare. |
| `GET` | `/api/ambulance/requests/admin_requests/` | Ambulance admin request queue. |

### E-Medicine

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/emedicine/pharmacies/` | List pharmacies. |
| `GET` | `/api/emedicine/pharmacies/{id}/` | Pharmacy detail. |
| `POST` | `/api/emedicine/pharmacies/` | Create pharmacy. |
| `PATCH` | `/api/emedicine/pharmacies/{id}/` | Update pharmacy. |
| `GET` | `/api/emedicine/pharmacies/my_pharmacy/` | Pharmacy admin's pharmacy. |
| `GET` | `/api/emedicine/medicines/` | List medicines. |
| `POST` | `/api/emedicine/medicines/` | Add medicine. |
| `PATCH` | `/api/emedicine/medicines/{id}/` | Update medicine. |
| `DELETE` | `/api/emedicine/medicines/{id}/` | Delete medicine. |
| `GET` | `/api/emedicine/medicines/my_medicines/` | Pharmacy admin's medicines. |
| `GET` | `/api/emedicine/orders/` | List medicine orders. |
| `POST` | `/api/emedicine/orders/` | Create medicine order. |
| `POST` | `/api/emedicine/orders/{id}/confirm/` | Confirm order. |
| `POST` | `/api/emedicine/orders/{id}/cancel/` | Cancel order. |
| `POST` | `/api/emedicine/orders/{id}/update_status/` | Update order status. |
| `POST` | `/api/emedicine/orders/{id}/mark_medicine_delivered/` | Mark one medicine as delivered. |

### E-Doctor

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/edoctor/doctors/` | List online doctors. |
| `GET` | `/api/edoctor/doctors/{id}/` | Online doctor detail. |
| `POST` | `/api/edoctor/doctors/` | Create online doctor profile. |
| `PUT` | `/api/edoctor/doctors/{id}/` | Update online doctor profile. |
| `DELETE` | `/api/edoctor/doctors/{id}/` | Delete online doctor profile. |
| `GET` | `/api/edoctor/doctors/my_edoctors/` | Hospital admin's online doctors. |
| `GET` | `/api/edoctor/slots/` | List consultation slots. |
| `GET` | `/api/edoctor/consultations/` | List consultations. |
| `POST` | `/api/edoctor/consultations/` | Create consultation booking. |
| `POST` | `/api/edoctor/consultations/{id}/confirm/` | Confirm consultation. |
| `POST` | `/api/edoctor/consultations/{id}/cancel/` | Cancel consultation. |
| `POST` | `/api/edoctor/consultations/{id}/start_consultation/` | Start consultation. |
| `POST` | `/api/edoctor/consultations/{id}/complete/` | Complete consultation. |
| `GET` | `/api/edoctor/consultations/hospital_consultations/` | Hospital admin consultations. |

### Payments and Subscriptions

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/payments/payments/` | List payment records. |
| `POST` | `/api/payments/payments/initiate/` | Create/initiate normal payment. |
| `POST` | `/api/payments/payments/sslcommerz/initiate/` | Start SSLCommerz checkout. |
| `GET/POST` | `/api/payments/payments/sslcommerz/success/` | SSLCommerz success callback. |
| `GET/POST` | `/api/payments/payments/sslcommerz/fail/` | SSLCommerz fail callback. |
| `GET/POST` | `/api/payments/payments/sslcommerz/cancel/` | SSLCommerz cancel callback. |
| `POST` | `/api/payments/payments/sslcommerz/ipn/` | SSLCommerz IPN callback. |
| `POST` | `/api/payments/payments/verify/` | Verify payment. |
| `GET` | `/api/payments/payments/my_payments/` | Current user's payments. |
| `POST` | `/api/payments/payments/{id}/refund/` | Refund payment. |
| `GET` | `/api/payments/payments/{id}/download-report/` | Download payment report. |
| `POST` | `/api/payments/payments/{id}/email-report/` | Email payment report. |
| `GET` | `/api/payments/subscriptions/` | List subscriptions. |
| `POST` | `/api/payments/subscriptions/create_subscription/` | Create subscription workflow. |
| `POST` | `/api/payments/subscriptions/start_trial/` | Start trial subscription. |
| `GET` | `/api/payments/subscriptions/active_subscription/` | Current active subscription. |
| `POST` | `/api/payments/subscriptions/{id}/cancel/` | Cancel subscription. |

## 10. Database

The database is configured for MySQL.

### Database Settings

Main database config is in:

```text
medical_sheba/config/settings/base.py
medical_sheba/config/settings/development.py
medical_sheba/config/settings/production.py
```

Development defaults in `development.py`:

```text
DB_ENGINE=django.db.backends.mysql
DB_NAME=medical_sheba
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

The backend reads environment values using `python-decouple`. Usually these values live in a `.env` file inside `medical_sheba/`.

### Database Tables and Models

| Table / Model | Backend File | Stores |
| --- | --- | --- |
| `users` / `User` | `apps/users/models.py` | User account, email, phone, roles, profile data, auth flags. |
| `password_reset_tokens` / `PasswordResetToken` | `apps/users/models.py` | Password reset tokens and expiration. |
| `hospitals` / `Hospital` | `apps/hospitals/models.py` | Hospital details, admin user, location, beds, emergency, image URLs. |
| `doctors` / `Doctor` | `apps/doctors/models.py` | Physical doctor profile, hospital relation, fee, availability, rating. |
| `doctor_reviews` / `DoctorReview` | `apps/doctors/models.py` | Patient reviews for doctors. |
| `appointments` / `Appointment` | `apps/appointments/models.py` | Doctor appointments, patient, doctor, hospital, status, payment status. |
| `blood_donors` / `BloodDonor` | `apps/blood/models.py` | Donor profile, blood group, location, availability. |
| `blood_requests` / `BloodRequest` | `apps/blood/models.py` | Blood requests, urgency, hospital, status. |
| `payments` / `Payment` | `apps/payments/models.py` | Payment transaction, user, amount, gateway, type, status, callback details. |
| `subscriptions` / `Subscription` | `apps/payments/models.py` | Subscription plan, duration, status, start/end date, trial flag. |
| `payment_intents` / `PaymentIntent` | `apps/payments/models.py` | Payment processing session/token status. |
| `notifications` / `Notification` | `apps/notifications/models.py` | User notification title/body/type/status/read state. |
| `districts` / `District` | `apps/location/models.py` | District name, code, region. |
| `upazilas` / `Upazila` | `apps/location/models.py` | Upazila name, code, district relation. |
| `AmbulanceService` | `apps/ambulance/models.py` | Ambulance provider, vehicle type, driver, location, cost per km, admin. |
| `AmbulanceRequest` | `apps/ambulance/models.py` | Ambulance booking request, pickup/dropoff, urgency, assignment, fare, payment. |
| `EMedicinePharmacy` | `apps/emedicine/models.py` | Pharmacy provider profile, license, location, delivery info, admin. |
| `MedicineItem` | `apps/emedicine/models.py` | Medicine catalog item, price, stock, pharmacy relation. |
| `EMedicineOrder` | `apps/emedicine/models.py` | Medicine order, medicines JSON list, delivery status, payment. |
| `EDoctorProfile` | `apps/edoctor/models.py` | Online doctor profile, specialization, fee, availability, hospital relation. |
| `ConsultationSlot` | `apps/edoctor/models.py` | Available online consultation time slots. |
| `EDoctorConsultation` | `apps/edoctor/models.py` | E-doctor booking, patient details, schedule, status, payment, video link. |
| `ContactMessage` | `apps/contact/models.py` | Contact form messages and admin notes/status. |
| `Review` | `apps/search/models.py` | Generic review records for search/review module. |

## 11. How Frontend, Backend, Database, and API Connect

### Simple Request Flow

```text
User clicks page/button in React
        |
        v
Page component calls an API wrapper in frontend/src/api/
        |
        v
Axios sends HTTP request to http://localhost:8000/api/...
        |
        v
Django config/urls.py routes request to apps/<module>/urls.py
        |
        v
DRF ViewSet in apps/<module>/views.py handles business logic
        |
        v
Serializer in apps/<module>/serializers.py validates input/output
        |
        v
Model in apps/<module>/models.py reads/writes MySQL table
        |
        v
Django returns JSON response
        |
        v
React updates page state and UI
```

### Example: Ambulance Page

| Step | File |
| --- | --- |
| User opens `/ambulance` | `frontend/src/App.jsx` routes to `frontend/src/pages/Ambulance.jsx`. |
| Page loads services | `Ambulance.jsx` calls `ambulanceAPI.listServices()`. |
| API wrapper sends request | `frontend/src/api/ambulance.js` calls `GET /api/ambulance/services/`. |
| Root backend route | `config/urls.py` includes `apps.ambulance.urls` under `/api/ambulance/`. |
| App route | `apps/ambulance/urls.py` routes `services/` to `AmbulanceServiceViewSet`. |
| Backend logic | `apps/ambulance/views.py` reads ambulance services. |
| Serialization | `apps/ambulance/serializers.py` converts services to JSON. |
| Database | `apps/ambulance/models.py` maps to `AmbulanceService` records in MySQL. |
| Result | React receives services and renders cards in `Ambulance.jsx`. |

### Example: Login

| Step | File |
| --- | --- |
| User submits login form | `frontend/src/pages/Login.jsx`. |
| Auth store/API call | `frontend/src/context/authStore.js` calls `authAPI.login()`. |
| API wrapper | `frontend/src/api/auth.js` calls `POST /api/users/login/`. |
| Backend route | `apps/users/urls.py` routes to `UserViewSet.login`. |
| Backend logic | `apps/users/views.py` validates credentials and returns JWT/user data. |
| Database | `apps/users/models.py` reads the custom `User` table. |
| Frontend storage | Token is saved in localStorage. |
| Future requests | `frontend/src/api/client.js` adds `Authorization: Bearer <access_token>`. |

### Example: Payment

| Step | File |
| --- | --- |
| User starts payment | Page/component calls `paymentsAPI.initiateSSLCommerzPayment()`. |
| API wrapper | `frontend/src/api/payments.js` calls `/api/payments/payments/sslcommerz/initiate/`. |
| Backend route | `apps/payments/urls.py` routes to `PaymentViewSet.sslcommerz_initiate`. |
| Payment record | `apps/payments/models.py` creates/updates `Payment` and possibly `PaymentIntent`. |
| External gateway | Backend communicates with SSLCommerz using settings from `config/settings/base.py`. |
| Gateway callback | SSLCommerz calls success/fail/cancel/IPN endpoints. |
| Service update | Payment logic marks appointment, consultation, ambulance request, medicine order, or subscription as paid. |
| Result page | Browser returns to `/payment/success` or `/payment/failed`, handled by `PaymentResultPage.jsx`. |

## 12. Authentication and Roles

The project uses a custom user model:

```text
medical_sheba/apps/users/models.py
AUTH_USER_MODEL = 'users.User'
```

User roles are stored in `User.roles` as a JSON list. Important roles:

| Role | Used For |
| --- | --- |
| `patient` | Normal patient account. Can book services. |
| `donor` | Blood donor role. |
| `doctor` | Doctor-related user role. |
| `hospital_admin` | Manages hospital, doctors, e-doctors, appointments. |
| `pharmacy_admin` | Manages pharmacy, medicines, orders. |
| `ambulance_driver_admin` | Manages ambulance services and requests. |
| `admin` | Super/admin dashboard access. |

JWT authentication is configured in `REST_FRAMEWORK` in `config/settings/base.py`:

```text
rest_framework_simplejwt.authentication.JWTAuthentication
```

The frontend sends the JWT automatically through `frontend/src/api/client.js`.

## 13. Page to Backend Connection Summary

| Frontend Page | Backend App(s) |
| --- | --- |
| `Home.jsx` | `users`, `payments` |
| `Doctors.jsx` | `doctors` |
| `DoctorDetail.jsx` | `doctors`, `doctors reviews`, `appointments`, `payments` |
| `Hospitals.jsx` | `hospitals` |
| `HospitalDetail.jsx` | `hospitals`, `doctors` |
| `Blood.jsx` | `blood` |
| `Ambulance.jsx` | `ambulance`, optionally `payments` |
| `EMedicine.jsx` | `emedicine`, `payments` |
| `EDoctor.jsx` | `edoctor`, `payments` |
| `Appointments.jsx` | `appointments`, `edoctor`, `ambulance`, `emedicine` |
| `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | `users` |
| `PaymentResultPage.jsx` | `payments` |
| `Contact.jsx` | `contact` |
| `PharmacyAdminDashboard.jsx`, `PharmacyCreatePage.jsx` | `emedicine`, `payments`, `hospitals` image upload |
| `HospitalAdminDashboard.jsx`, `HospitalCreatePage.jsx` | `hospitals`, `doctors`, `edoctor`, `appointments`, `payments` |
| `AmbulanceAdminDashboard.jsx` | `ambulance`, `hospitals` image upload |
| `SuperAdminDashboard.jsx` | `users`, `hospitals`, `emedicine`, `ambulance`, `appointments`, `edoctor`, `payments` |

## 14. Important Components

| Component File | Purpose |
| --- | --- |
| `components/Navbar.jsx` | Main site navigation. |
| `components/Footer.jsx` | Footer shown below pages. |
| `components/DoctorCard.jsx` | Doctor list card UI. |
| `components/HospitalCard.jsx` | Hospital list card UI. |
| `components/BookAppointmentModal.jsx` | Appointment booking modal. |
| `components/OrderMedicinesModal.jsx` | Medicine order modal. |
| `components/Payment.jsx` | Payment UI/workflow component. |
| `components/AdminSubscriptionAccess.jsx` | Checks admin subscription/trial access. |
| `components/ReviewList.jsx` | Displays doctor reviews. |
| `components/ReviewForm.jsx` | Creates/edits reviews. |
| `components/Pagination.jsx` | Pagination UI. |
| `components/Loading.jsx` | Loading state UI. |
| `components/Error.jsx` | Error state UI. |
| `components/AuthForm.jsx` | Shared auth form UI. |

## 15. How to Run the Project

### Backend

Run from `medical_sheba/`:

```bash
python manage.py migrate
python manage.py runserver 8000
```

Or with uv:

```bash
uv run manage.py runserver 8000
```

Backend URL:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/api/docs/
```

Django admin:

```text
http://localhost:8000/admin/
```

### Frontend

Run from `medical_sheba/frontend/`:

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## 16. Environment Variables

Create `.env` in `medical_sheba/` for backend settings.

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.mysql
DB_NAME=medical_sheba
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=support.medisheba@gmail.com

SSLCOMMERZ_SANDBOX=True
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
```

## 17. Common Development Commands

Run these from `medical_sheba/` unless noted.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
python manage.py test
```

Seed commands found in management folders:

```bash
python manage.py seed_hospitals
python manage.py seed_doctors
python manage.py seed_ambulance
python manage.py seed_emedicine
python manage.py seed_edoctor
```

Frontend commands from `medical_sheba/frontend/`:

```bash
npm run dev
npm run build
npm run preview
```

## 18. Development Notes

- Backend API pagination is configured in `REST_FRAMEWORK` with page size `20`.
- CORS is enabled for frontend origins in `base.py`; development allows all CORS origins in `development.py`.
- Uploaded images are served from `MEDIA_URL=/media/` during development when `DEBUG=True`.
- The frontend currently uses hardcoded API origins in `frontend/src/api/client.js`, `frontend/src/api/payments.js`, and `frontend/src/utils/images.js`.
- `frontend/vite.config.js` has an `/api` proxy, but the shared API client already points directly to `http://localhost:8000/api`.
- Admin provider pages rely on active subscription/trial checks through `apps.payments`.
- Static informational pages such as About, Privacy, and Terms do not require backend APIs unless future dynamic content is added.

## 19. Why Each File Type Was Created

This project is separated into layers so each file has one clear responsibility.

| File Type | Why It Exists | Work It Does | Connects To |
| --- | --- | --- | --- |
| Frontend page file | To show one full browser screen or route. | Loads data, stores page state, renders UI, handles clicks/forms. | Calls `frontend/src/api/*.js`; rendered by `App.jsx`. |
| Frontend component file | To reuse UI in many pages. | Shows cards, forms, modals, navigation, loading, errors. | Used by page files. Some components call API files. |
| Frontend API file | To keep HTTP calls separate from UI. | Sends GET/POST/PATCH/DELETE requests to Django. | Uses `api/client.js`; backend `urls.py` and `views.py`. |
| Frontend context/store file | To keep shared app state. | Stores auth user/token and login/register behavior. | Calls `api/auth.js`; used by pages/components. |
| Frontend hook file | To reuse React logic. | Fetches common data or payment state. | Calls API files; used by pages/components. |
| Frontend CSS file | To style pages/components. | Layout, colors, spacing, responsive design. | Imported by page/component/global files. |
| Backend `models.py` | To define database structure. | Creates Django model classes and table relationships. | MySQL tables through migrations; used by serializers/views/admin. |
| Backend `serializers.py` | To convert model data to/from JSON. | Validates request data and formats API responses. | Used by `views.py`; reads/writes `models.py`. |
| Backend `views.py` | To hold API business logic. | Lists, creates, updates, deletes, filters, and custom actions. | Called by `urls.py`; uses serializers/models. |
| Backend `urls.py` | To define API routes. | Registers DRF routers and endpoint paths. | Included by `config/urls.py`; points to `views.py`. |
| Backend `admin.py` | To show/manage models in Django admin. | Registers models for `/admin/`. | Uses `models.py`. |
| Backend `apps.py` | To define Django app configuration. | Names the app for Django `INSTALLED_APPS`. | Referenced in `config/settings/base.py`. |
| Backend `migrations/*.py` | To version database schema changes. | Creates/alters tables and columns in MySQL. | Generated from `models.py`; applied by `python manage.py migrate`. |
| Backend management command | To run custom CLI tasks. | Seeds demo data or updates images. | Run with `python manage.py <command>`. |

## 20. Complete Connection Process

### Read/List Data Process

```text
React page opens
-> page calls frontend API wrapper
-> api/client.js adds token if user is logged in
-> request goes to http://localhost:8000/api/<module>/
-> config/urls.py sends it to apps/<module>/urls.py
-> urls.py sends it to a ViewSet in views.py
-> views.py gets queryset from models.py
-> serializers.py converts model rows to JSON
-> frontend receives JSON and renders it
```

Example:

```text
Hospitals.jsx
-> hospitalsAPI.list()
-> GET /api/hospitals/
-> config/urls.py
-> apps/hospitals/urls.py
-> HospitalViewSet
-> Hospital model / hospitals table
-> HospitalListSerializer
-> React hospital cards
```

### Create/Update Data Process

```text
User submits form
-> frontend validates or prepares data
-> frontend API wrapper sends POST/PATCH/PUT
-> Django ViewSet receives request
-> Serializer validates fields
-> Model saves data into MySQL
-> API returns saved object/status
-> React updates UI
```

Example:

```text
Ambulance.jsx request form
-> ambulanceAPI.createRequest(requestData)
-> POST /api/ambulance/requests/
-> AmbulanceRequestViewSet
-> AmbulanceRequestCreateSerializer
-> AmbulanceRequest model saves row
-> MySQL stores request
-> React shows success/error
```

### Authentication Process

```text
Login.jsx
-> authStore.login()
-> authAPI.login()
-> POST /api/users/login/
-> UserViewSet.login()
-> User model checks account
-> JWT tokens returned
-> token saved to localStorage
-> api/client.js sends token on future requests
```

## 21. Core Frontend Files, Work, and Connections

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `frontend/src/main.jsx` | Starts the React app and renders `App`. | Every React/Vite app needs an entry point. | `App.jsx`, `index.html`. |
| `frontend/src/App.jsx` | Defines all frontend routes and shared layout with Navbar/Footer. | Central place for page navigation. | All files in `pages/`, `Navbar.jsx`, `Footer.jsx`. |
| `frontend/src/index.css` | Global CSS loaded once. | Base app styling. | Imported by `main.jsx`. |
| `frontend/src/styles/App.css` | Main app layout styling. | Keeps app shell styles separate. | Imported by `App.jsx`. |
| `frontend/src/styles/Responsive.css` | Responsive/mobile rules. | Makes pages work on small screens. | Imported by `App.jsx`. |
| `frontend/src/context/authStore.js` | Stores logged-in user, token, login, register, logout/init auth behavior. | Avoids passing auth state manually through every component. | `api/auth.js`, `Login.jsx`, `Register.jsx`, `Navbar.jsx`, protected/admin pages. |
| `frontend/src/hooks/useData.js` | Reusable data loading for doctors/hospitals. | Avoids duplicate fetch logic. | `api/doctors.js`, `api/hospitals.js`. |
| `frontend/src/hooks/usePayment.js` | Reusable payment state/actions. | Keeps payment status/list logic outside pages. | `api/payments.js`. |
| `frontend/src/utils/images.js` | Builds full backend media image URLs. | Backend stores relative media paths; frontend needs full URL. | `http://localhost:8000/media/...`. |
| `frontend/src/utils/validators.js` | Frontend validation helpers. | Keeps validation logic reusable. | Forms/pages. |
| `frontend/src/utils/seo.js` | SEO/title helper utilities. | Keeps metadata handling reusable. | Page files. |

## 22. Frontend Page Files, Work, and Backend Connection

| Page File | Work It Does | Why Created | API/Backend Connection |
| --- | --- | --- | --- |
| `pages/Home.jsx` | Shows home screen, platform stats, subscription/payment actions. | Landing/home experience for users. | `/api/users/home_stats/`, `api/payments.js`. |
| `pages/Doctors.jsx` | Lists doctors with filters/search and links to detail. | Patient can find doctors. | `api/doctors.js` -> `/api/doctors/`. |
| `pages/DoctorDetail.jsx` | Shows one doctor, reviews, and booking modal. | Patient needs full doctor profile before booking. | `api/doctors.js`, `api/reviews.js`, `api/appointments.js`, `api/payments.js`. |
| `pages/Hospitals.jsx` | Lists hospitals with filters/search. | Patient can find hospitals. | `api/hospitals.js` -> `/api/hospitals/`. |
| `pages/HospitalDetail.jsx` | Shows one hospital and related doctors. | Patient needs full hospital profile. | `api/hospitals.js`, `api/doctors.js`. |
| `pages/Blood.jsx` | Lists donors and manages current user's donor profile. | Blood donation/request feature. | `api/blood.js` -> `/api/blood/donors/`. |
| `pages/Ambulance.jsx` | Lists ambulance services and creates ambulance requests. | Emergency transport booking. | `api/ambulance.js` -> `/api/ambulance/services/`, `/api/ambulance/requests/`. |
| `pages/EMedicine.jsx` | Lists pharmacies/medicines and opens order workflow. | Online pharmacy ordering. | `api/emedicine.js`, `api/payments.js`. |
| `pages/EDoctor.jsx` | Lists online doctors, slots, and creates consultations. | Online doctor consultation booking. | `api/edoctor.js`, `api/payments.js`. |
| `pages/Appointments.jsx` | Shows patient's appointments, consultations, ambulance requests, and medicine orders. | One place to track all services. | `api/appointments.js`, `api/edoctor.js`, `api/ambulance.js`, `api/emedicine.js`. |
| `pages/Login.jsx` | Login form. | User authentication. | `api/auth.js`, `authStore.js`, `/api/users/login/`. |
| `pages/Register.jsx` | Registration form. | New user account creation. | `api/auth.js`, `authStore.js`, `/api/users/register/`. |
| `pages/ForgotPassword.jsx` | Password reset request form. | Account recovery. | `api/auth.js` -> `/api/users/request_password_reset/`. |
| `pages/ResetPassword.jsx` | New password form using reset token. | Complete account recovery. | `api/auth.js` -> `/api/users/confirm_password_reset/`. |
| `pages/PaymentResultPage.jsx` | Shows payment success/failure and report options. | Payment gateway returns user here. | `api/payments.js`. |
| `pages/Contact.jsx` | Contact message form. | Let users contact platform/admin. | `api/contact.js` -> `/api/contact/messages/`. |
| `pages/ContactSales.jsx` | Sales contact page. | Business/admin subscription contact. | Static/contact behavior. |
| `pages/AboutUs.jsx` | About page. | Informational page. | Static. |
| `pages/PrivacyPolicy.jsx` | Privacy policy. | Legal/informational page. | Static. |
| `pages/TermsOfService.jsx` | Terms of service. | Legal/informational page. | Static. |
| `pages/HospitalCreatePage.jsx` | Creates hospital admin profile after subscription/trial check. | Onboarding for hospital admin. | `api/hospitals.js`, `api/payments.js`. |
| `pages/HospitalAdminDashboard.jsx` | Manages hospital, doctors, e-doctors, appointments, consultations. | Admin work area for hospitals. | `api/hospitals.js`, `api/doctors.js`, `api/edoctor.js`, `api/appointments.js`. |
| `pages/PharmacyCreatePage.jsx` | Creates pharmacy profile after subscription/trial check. | Onboarding for pharmacy admin. | `api/emedicine.js`, `api/payments.js`, image upload through `api/hospitals.js`. |
| `pages/PharmacyAdminDashboard.jsx` | Manages pharmacy, medicines, and orders. | Admin work area for pharmacy. | `api/emedicine.js`, image upload through `api/hospitals.js`. |
| `pages/AmbulanceAdminDashboard.jsx` | Manages ambulance services and requests. | Admin work area for ambulance provider. | `api/ambulance.js`, image upload through `api/hospitals.js`. |
| `pages/SuperAdminDashboard.jsx` | Manages users, service providers, service requests, payments, subscriptions. | Platform owner/admin control panel. | `api/auth.js`, `api/hospitals.js`, `api/emedicine.js`, `api/ambulance.js`, `api/appointments.js`, `api/edoctor.js`, `api/payments.js`. |

## 23. Frontend Component Files, Work, and Connections

| Component File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `components/Navbar.jsx` | Main navigation and auth-aware links. | Shared navigation on every page. | `authStore.js`, React Router. |
| `components/Footer.jsx` | Site footer. | Shared footer on every page. | Used by `App.jsx`. |
| `components/AuthForm.jsx` | Shared login/register form UI. | Avoid duplicate auth form markup. | `Login.jsx`, `Register.jsx`. |
| `components/DoctorCard.jsx` | Displays one doctor summary. | Reusable doctor list item. | `Doctors.jsx`, possibly hospital/detail pages. |
| `components/HospitalCard.jsx` | Displays one hospital summary. | Reusable hospital list item. | `Hospitals.jsx`, home/related listings. |
| `components/BookAppointmentModal.jsx` | Appointment booking modal. | Keeps booking form separate from doctor pages. | `api/appointments.js`, `api/payments.js`. |
| `components/OrderMedicinesModal.jsx` | Medicine order modal. | Keeps medicine order form separate. | `api/emedicine.js`, `api/payments.js`. |
| `components/Payment.jsx` | Payment component/workflow. | Reusable payment UI. | `api/payments.js`. |
| `components/AdminSubscriptionAccess.jsx` | Checks active admin subscription/trial. | Controls access to admin provider features. | `api/payments.js`. |
| `components/ReviewList.jsx` | Displays doctor reviews. | Reusable review list. | `api/reviews.js` through parent actions. |
| `components/ReviewForm.jsx` | Review create/edit form. | Reusable review input UI. | `api/reviews.js`. |
| `components/Pagination.jsx` | Pagination controls. | Reusable page navigation for API lists. | List pages. |
| `components/Loading.jsx` | Loading display. | Consistent loading UI. | Any async page/component. |
| `components/Error.jsx` | Error display. | Consistent error UI. | Any async page/component. |
| `components/Payment.css`, `components/Subscription.css` | Component-specific styles. | Keeps payment/subscription styles close to components. | Imported by related components. |

## 24. Frontend API Files, Work, and Backend Connection

| API File | Work It Does | Why Created | Backend File/Endpoint |
| --- | --- | --- | --- |
| `api/client.js` | Creates shared Axios instance, adds JWT, handles 401 redirect. | Central HTTP behavior for most APIs. | All backend `/api/...` endpoints. |
| `api/auth.js` | Auth and user API calls. | Keeps user HTTP calls outside UI. | `apps/users/urls.py`, `apps/users/views.py`. |
| `api/hospitals.js` | Hospital list/detail/admin/upload API calls. | Keeps hospital HTTP calls outside UI. | `apps/hospitals/urls.py`, `apps/hospitals/views.py`. |
| `api/doctors.js` | Doctor list/detail/admin API calls. | Keeps doctor HTTP calls outside UI. | `apps/doctors/urls.py`, `apps/doctors/views.py`. |
| `api/reviews.js` | Doctor review API calls. | Keeps review HTTP calls outside UI. | `apps/doctors/reviews_urls.py`, `DoctorReviewViewSet`. |
| `api/appointments.js` | Appointment API calls and admin actions. | Keeps appointment HTTP calls outside UI. | `apps/appointments/urls.py`, `apps/appointments/views.py`. |
| `api/blood.js` | Blood donor/request API calls. | Keeps blood feature HTTP calls outside UI. | `apps/blood/urls.py`, `apps/blood/views.py`. |
| `api/ambulance.js` | Ambulance service/request API calls. | Keeps ambulance HTTP calls outside UI. | `apps/ambulance/urls.py`, `apps/ambulance/views.py`. |
| `api/emedicine.js` | Pharmacy, medicine, order API calls. | Keeps e-medicine HTTP calls outside UI. | `apps/emedicine/urls.py`, `apps/emedicine/views.py`. |
| `api/edoctor.js` | Online doctor, slots, consultations API calls. | Keeps e-doctor HTTP calls outside UI. | `apps/edoctor/urls.py`, `apps/edoctor/views.py`. |
| `api/payments.js` | Payment, SSLCommerz, reports, subscriptions, intents. | Payment logic is shared across many pages. | `apps/payments/urls.py`, `apps/payments/views.py`. |
| `api/contact.js` | Contact message create/admin actions. | Keeps contact HTTP calls outside UI. | `apps/contact/urls.py`, `apps/contact/views.py`. |

## 25. Backend Project Files, Work, and Connections

| Backend File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `manage.py` | Runs Django commands. | Main CLI for backend development. | Settings, apps, migrations, runserver. |
| `pyproject.toml` | Lists Python dependencies and project metadata. | Dependency/build configuration. | Django, DRF, MySQL, JWT, payment packages. |
| `uv.lock` | Locks Python dependency versions for uv. | Reproducible installs. | `uv run`, `uv sync`. |
| `config/urls.py` | Root URL router. | One central place to connect all API modules. | Includes every `apps/*/urls.py`. |
| `config/settings/base.py` | Shared Django settings. | Core config for apps, DB, JWT, REST, CORS, media, payments. | MySQL, frontend CORS, REST API. |
| `config/settings/development.py` | Local development settings. | Easier local setup with debug/CORS/MySQL defaults. | Used when running development server. |
| `config/settings/production.py` | Production settings. | Secure production deployment. | Production DB, email, S3, Celery. |
| `config/asgi.py` | ASGI app entry. | Async-capable deployment. | Django config. |
| `config/wsgi.py` | WSGI app entry. | Traditional deployment with Gunicorn/uWSGI. | Django config. |

## 26. Backend App File Working Pattern

Every main backend app follows this pattern:

```text
apps/<app_name>/models.py
-> defines database tables

apps/<app_name>/serializers.py
-> validates request data and formats response JSON

apps/<app_name>/views.py
-> contains API logic and permissions

apps/<app_name>/urls.py
-> exposes viewsets as URL endpoints

config/urls.py
-> includes the app endpoints under /api/<app_name>/

frontend/src/api/<app_name>.js
-> calls those endpoints

frontend/src/pages/*.jsx
-> uses the API wrapper to render UI
```

## 27. Backend App Files, Work, and Frontend/Database Connections

### Users App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/users/models.py` | Defines custom `User`, roles, validation, reset token model. | Project needs custom email/phone/role based auth. | MySQL `users`, `password_reset_tokens`; `AUTH_USER_MODEL`; almost every app has user FK. |
| `apps/users/serializers.py` | Converts user data to JSON and validates user inputs. | API needs safe user input/output format. | `UserViewSet`, frontend `api/auth.js`. |
| `apps/users/views.py` | Login, register, password reset, current user, home stats, admin user CRUD. | Auth and user APIs live here. | `/api/users/`, JWT, frontend auth pages. |
| `apps/users/urls.py` | Registers `UserViewSet`. | Exposes user endpoints. | Included by `config/urls.py`. |
| `apps/users/validators.py` | Validates Gmail and Bangladesh phone numbers. | Keeps validation reusable and consistent. | `models.py`, serializers/views. |
| `apps/users/admin.py` | User admin setup. | Manage users in Django admin. | `/admin/`. |
| `apps/users/apps.py` | Django app config. | Registers app in Django. | `INSTALLED_APPS`. |
| `apps/users/migrations/*.py` | User table schema history. | Applies user DB changes. | MySQL through `migrate`. |

### Hospitals App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/hospitals/models.py` | Defines `Hospital` table and fields. | Store hospital information and admin relation. | MySQL `hospitals`; doctors, appointments, ambulance, payments. |
| `apps/hospitals/serializers.py` | Hospital list/detail JSON. | Format hospital data for frontend. | `HospitalViewSet`, `api/hospitals.js`. |
| `apps/hospitals/views.py` | Hospital CRUD, filters, `my_hospital`, image upload. | Hospital business API. | `/api/hospitals/`, frontend hospital/admin pages. |
| `apps/hospitals/urls.py` | Registers hospital API routes. | Exposes hospital endpoints. | `config/urls.py`. |
| `apps/hospitals/admin.py` | Hospital admin panel config. | Manage hospitals in admin. | `/admin/`. |
| `apps/hospitals/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/hospitals/management/commands/*.py` | Seeds hospitals and image data. | Demo/testing data creation. | Run through `manage.py`. |
| `apps/hospitals/migrations/*.py` | Hospital schema changes. | Keeps DB in sync. | MySQL. |

### Doctors App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/doctors/models.py` | Defines `Doctor` and `DoctorReview`. | Store doctor profiles and reviews. | MySQL `doctors`, `doctor_reviews`; user/hospital/appointment relations. |
| `apps/doctors/serializers.py` | Doctor/review JSON and validation. | API response/input layer. | Doctor and review ViewSets. |
| `apps/doctors/views.py` | Doctor CRUD, filters, hospital admin doctors, reviews. | Doctor API behavior. | `/api/doctors/`, `/api/reviews/`. |
| `apps/doctors/urls.py` | Registers doctor routes. | Exposes doctor endpoints. | `config/urls.py`. |
| `apps/doctors/reviews_urls.py` | Registers review routes separately. | Reviews have separate `/api/reviews/` base path. | `config/urls.py`. |
| `apps/doctors/admin.py` | Doctor admin setup. | Manage doctors/reviews in admin. | `/admin/`. |
| `apps/doctors/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/doctors/management/commands/*.py` | Seeds doctor data. | Demo/testing data creation. | Run through `manage.py`. |
| `apps/doctors/migrations/*.py` | Doctor schema history. | Keeps DB in sync. | MySQL. |

### Appointments App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/appointments/models.py` | Defines `Appointment`. | Store doctor booking records and statuses. | User, Doctor, Hospital, Payment tables. |
| `apps/appointments/serializers.py` | Appointment JSON/validation. | API input/output layer. | `AppointmentViewSet`. |
| `apps/appointments/views.py` | Appointment CRUD, my/upcoming/hospital appointments, confirm/complete/cancel. | Booking business workflow. | `/api/appointments/`, frontend appointment pages. |
| `apps/appointments/urls.py` | Registers appointment endpoints. | Exposes appointment APIs. | `config/urls.py`. |
| `apps/appointments/admin.py` | Admin panel setup. | Manage appointments in admin. | `/admin/`. |
| `apps/appointments/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/appointments/migrations/*.py` | Appointment schema history. | Keeps DB in sync. | MySQL. |

### Ambulance App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/ambulance/models.py` | Defines `AmbulanceService` and `AmbulanceRequest`. | Store ambulance providers and bookings. | User, Hospital, District, Upazila, Payment tables. |
| `apps/ambulance/serializers.py` | Ambulance service/request JSON and validation. | Handles create/list/detail formats. | `AmbulanceServiceViewSet`, `AmbulanceRequestViewSet`. |
| `apps/ambulance/views.py` | Service CRUD, request CRUD, admin queues, accept/cancel/status/fare actions. | Ambulance business workflow. | `/api/ambulance/`, `Ambulance.jsx`, `AmbulanceAdminDashboard.jsx`. |
| `apps/ambulance/urls.py` | Registers `services` and `requests` routes. | Exposes ambulance APIs. | `config/urls.py`. |
| `apps/ambulance/admin.py` | Admin panel setup. | Manage ambulances/requests in admin. | `/admin/`. |
| `apps/ambulance/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/ambulance/management/commands/*.py` | Seeds ambulances and image data. | Demo/testing data creation. | Run through `manage.py`. |
| `apps/ambulance/migrations/*.py` | Ambulance schema history. | Keeps DB in sync. | MySQL. |

### E-Medicine App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/emedicine/models.py` | Defines `EMedicinePharmacy`, `MedicineItem`, `EMedicineOrder`. | Store pharmacy profiles, catalog, orders. | User, District, Upazila, Payment tables. |
| `apps/emedicine/serializers.py` | Pharmacy/medicine/order JSON and validation. | API input/output layer. | E-medicine ViewSets. |
| `apps/emedicine/views.py` | Pharmacy CRUD, medicine CRUD, order CRUD/status/delivery actions. | Online pharmacy workflow. | `/api/emedicine/`, EMedicine and pharmacy admin pages. |
| `apps/emedicine/urls.py` | Registers `pharmacies`, `medicines`, and `orders`. | Exposes e-medicine APIs. | `config/urls.py`. |
| `apps/emedicine/admin.py` | Admin panel setup. | Manage pharmacies/medicines/orders in admin. | `/admin/`. |
| `apps/emedicine/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/emedicine/management/commands/*.py` | Seeds e-medicine data. | Demo/testing data creation. | Run through `manage.py`. |
| `apps/emedicine/migrations/*.py` | E-medicine schema history. | Keeps DB in sync. | MySQL. |

### E-Doctor App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/edoctor/models.py` | Defines `EDoctorProfile`, `ConsultationSlot`, `EDoctorConsultation`. | Store online doctors, slots, bookings. | User, Hospital, Payment tables. |
| `apps/edoctor/serializers.py` | E-doctor/slot/consultation JSON and validation. | API input/output layer. | E-doctor ViewSets. |
| `apps/edoctor/views.py` | Online doctor CRUD, slots, consultation create/status/actions. | Online consultation workflow. | `/api/edoctor/`, EDoctor and hospital admin pages. |
| `apps/edoctor/urls.py` | Registers `doctors`, `slots`, and `consultations`. | Exposes e-doctor APIs. | `config/urls.py`. |
| `apps/edoctor/admin.py` | Admin panel setup. | Manage e-doctors/slots/consultations in admin. | `/admin/`. |
| `apps/edoctor/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/edoctor/management/commands/*.py` | Seeds e-doctor data. | Demo/testing data creation. | Run through `manage.py`. |
| `apps/edoctor/migrations/*.py` | E-doctor schema history. | Keeps DB in sync. | MySQL. |

### Blood App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/blood/models.py` | Defines `BloodDonor` and `BloodRequest`. | Store donors and blood needs. | User and Hospital tables. |
| `apps/blood/serializers.py` | Donor/request JSON and validation. | API input/output layer. | Blood ViewSets. |
| `apps/blood/views.py` | Donor/request CRUD, filters, current donor, fulfill action. | Blood bank workflow. | `/api/blood/`, `Blood.jsx`. |
| `apps/blood/urls.py` | Registers `donors` and `requests`. | Exposes blood APIs. | `config/urls.py`. |
| `apps/blood/admin.py` | Admin panel setup. | Manage donors/requests in admin. | `/admin/`. |
| `apps/blood/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/blood/migrations/*.py` | Blood schema history. | Keeps DB in sync. | MySQL. |

### Payments App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/payments/models.py` | Defines `Payment`, `Subscription`, `PaymentIntent`. | Store transaction, subscription, and checkout state. | User, Hospital, Pharmacy, appointment/order/request models. |
| `apps/payments/serializers.py` | Payment/subscription/intent JSON and validation. | API input/output layer. | Payment ViewSets. |
| `apps/payments/views.py` | Payment initiate/verify/refund/report, SSLCommerz callbacks, subscription/trial logic. | Central money workflow. | `/api/payments/`, SSLCommerz, many frontend pages. |
| `apps/payments/urls.py` | Registers `payments`, `subscriptions`, `intents`. | Exposes payment APIs. | `config/urls.py`. |
| `apps/payments/admin.py` | Admin panel setup. | Manage payments/subscriptions in admin. | `/admin/`. |
| `apps/payments/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/payments/migrations/*.py` | Payment schema history. | Keeps DB in sync. | MySQL. |

### Location App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/location/models.py` | Defines `District` and `Upazila`. | Reusable Bangladesh location data. | Ambulance, pharmacy, and location APIs. |
| `apps/location/serializers.py` | Location JSON. | Send location data to frontend. | `DistrictViewSet`, `UpazilaViewSet`. |
| `apps/location/views.py` | Read-only location APIs and filters. | Lookup endpoints for districts/upazilas. | `/api/location/`. |
| `apps/location/urls.py` | Registers `districts` and `upazilas`. | Exposes location APIs. | `config/urls.py`. |
| `apps/location/admin.py` | Admin setup. | Manage location data in admin. | `/admin/`. |
| `apps/location/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/location/migrations/*.py` | Location schema history. | Keeps DB in sync. | MySQL. |

### Notifications App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/notifications/models.py` | Defines `Notification`. | Store user notifications. | User table. |
| `apps/notifications/serializers.py` | Notification JSON. | API response/input layer. | `NotificationViewSet`. |
| `apps/notifications/views.py` | List, unread, mark read, mark all read, delete all. | Notification workflow. | `/api/notifications/`. |
| `apps/notifications/urls.py` | Registers notification routes. | Exposes notification APIs. | `config/urls.py`. |
| `apps/notifications/admin.py` | Admin setup. | Manage notifications in admin. | `/admin/`. |
| `apps/notifications/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/notifications/migrations/*.py` | Notification schema history. | Keeps DB in sync. | MySQL. |

### Contact App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/contact/models.py` | Defines `ContactMessage`. | Store contact form submissions. | User/admin assignment. |
| `apps/contact/serializers.py` | Contact message JSON and validation. | API input/output layer. | `ContactMessageViewSet`. |
| `apps/contact/views.py` | Create contact message and admin actions: new/read/respond/search. | Contact support workflow. | `/api/contact/`, `Contact.jsx`, super/admin pages if used. |
| `apps/contact/urls.py` | Registers `messages` route. | Exposes contact APIs. | `config/urls.py`. |
| `apps/contact/admin.py` | Admin setup. | Manage contact messages in admin. | `/admin/`. |
| `apps/contact/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/contact/migrations/*.py` | Contact schema history. | Keeps DB in sync. | MySQL. |

### Search App

| File | Work It Does | Why Created | Connects To |
| --- | --- | --- | --- |
| `apps/search/models.py` | Defines generic `Review`. | Store generic review/search data separate from doctor reviews. | MySQL review table. |
| `apps/search/serializers.py` | Review JSON and validation. | API input/output layer. | `ReviewViewSet`. |
| `apps/search/views.py` | Review CRUD and review filters/top rated. | Generic review/search workflow. | `/api/search/`. |
| `apps/search/urls.py` | Registers search/review routes. | Exposes search APIs. | `config/urls.py`. |
| `apps/search/admin.py` | Admin setup. | Manage search reviews in admin. | `/admin/`. |
| `apps/search/apps.py` | App config. | Django registration. | `INSTALLED_APPS`. |
| `apps/search/migrations/*.py` | Search schema history. | Keeps DB in sync. | MySQL. |

## 28. Database Relationship Summary

| Relationship | Meaning |
| --- | --- |
| `User -> Hospital` | A hospital admin user can own one hospital through `Hospital.admin_user`. |
| `Hospital -> Doctor` | One hospital can have many physical doctors. |
| `User -> Doctor` | A doctor profile belongs to one user account. |
| `User -> Appointment` | A patient user can have many appointments. |
| `Doctor -> Appointment` | A doctor can have many appointments. |
| `Hospital -> Appointment` | Appointments can belong to a hospital. |
| `User -> BloodDonor` | One user can have one donor profile. |
| `User -> BloodRequest` | A user can create many blood requests. |
| `Hospital -> BloodRequest` | Blood request can be linked to a hospital. |
| `District -> Upazila` | One district has many upazilas. |
| `District/Upazila -> AmbulanceService` | Ambulance service has location. |
| `AmbulanceService -> AmbulanceRequest` | Request can be assigned to one ambulance service. |
| `User -> AmbulanceRequest` | Logged-in user can own ambulance requests. |
| `User -> EMedicinePharmacy` | Pharmacy admin can own one pharmacy. |
| `EMedicinePharmacy -> MedicineItem` | One pharmacy has many medicines. |
| `EMedicinePharmacy -> EMedicineOrder` | One pharmacy receives many medicine orders. |
| `Hospital -> EDoctorProfile` | One hospital can have many online doctor profiles. |
| `EDoctorProfile -> ConsultationSlot` | One online doctor has many slots. |
| `EDoctorProfile -> EDoctorConsultation` | One online doctor has many consultations. |
| `User -> EDoctorConsultation` | Logged-in patient can own consultations. |
| `User -> Payment` | A user can make many payments. |
| `Payment -> Appointment/Consultation/Ambulance/Order/Subscription` | Payments are attached to service records using foreign keys/reference fields. |
| `User -> Subscription` | Admin users can have subscription/trial access. |
| `User -> Notification` | A user can receive many notifications. |

## 29. File Creation Reason by Layer

### Frontend

Frontend files were created to make a browser UI. Pages are for full screens, components are for reusable pieces, API files are for backend communication, CSS files are for design, context/hooks are for shared state and shared logic.

```text
App.jsx controls routes
pages/*.jsx control screens
components/*.jsx control reusable UI
api/*.js controls HTTP requests
context/authStore.js controls auth state
styles/*.css controls visual design
utils/*.js controls helper logic
```

### Backend

Backend files were created to make a secure API and business logic layer. Models create database tables. Serializers protect and format data. Views decide what each endpoint does. URLs expose endpoints. Admin files allow manual management in Django admin.

```text
models.py controls database structure
serializers.py controls JSON format and validation
views.py controls API logic
urls.py controls API address
admin.py controls Django admin
migrations/*.py controls database schema updates
```

### API

API files exist in both frontend and backend:

```text
frontend/src/api/*.js
-> client-side functions that call backend

apps/*/urls.py
-> backend route address

apps/*/views.py
-> backend response/action logic

apps/*/serializers.py
-> backend JSON format
```

### Database

Database structure is not written directly in SQL in daily work. It is defined in Django models and converted into migrations.

```text
models.py changed
-> python manage.py makemigrations
-> migration file created
-> python manage.py migrate
-> MySQL table/column updated
```

## 30. Practical Example: Creating a New Feature

If you create a new feature, usually these files are needed:

| Step | File | Work |
| --- | --- | --- |
| 1 | `apps/new_feature/models.py` | Create database table model. |
| 2 | `apps/new_feature/serializers.py` | Create JSON validation/response. |
| 3 | `apps/new_feature/views.py` | Create API logic. |
| 4 | `apps/new_feature/urls.py` | Register API route. |
| 5 | `config/urls.py` | Include route under `/api/new-feature/`. |
| 6 | `config/settings/base.py` | Add app to `INSTALLED_APPS`. |
| 7 | `python manage.py makemigrations && python manage.py migrate` | Create/update MySQL tables. |
| 8 | `frontend/src/api/newFeature.js` | Add frontend HTTP functions. |
| 9 | `frontend/src/pages/NewFeature.jsx` | Add browser page. |
| 10 | `frontend/src/App.jsx` | Add frontend route. |
| 11 | `frontend/src/styles/pages/NewFeature.css` | Add page style if needed. |

This is the same pattern already used by hospitals, doctors, ambulance, e-medicine, e-doctor, blood, appointments, payments, and contact.
