# Medi Sheba Browser Demo Script

Use this script while demonstrating the project in a browser. Start with the frontend at `http://localhost:5173` and keep the backend running at `http://localhost:8000`.

## 1. Opening

Hello everyone. Today I am going to demonstrate **Medi Sheba**, a healthcare management platform for Bangladesh. The main goal of this project is to connect patients with essential healthcare services from one place, including doctors, hospitals, blood donors, ambulances, online medicine delivery, and online doctor consultations.

This project has two main parts:

- A **React frontend** for the user interface.
- A **Django REST API backend** for data, authentication, service management, appointments, payments, and admin operations.

## 2. Landing Page

I will start from the landing page.

On the top, we have the navigation bar with the Medi Sheba logo and quick links: Home, Doctors, Hospitals, Blood Bank, Ambulance, E-Medicine, and E-Doctor. On the right side, users can log in or register. After login, this area changes to an account menu based on the user's role.

The hero section introduces the platform as a trusted healthcare partner. From here, a patient can directly click **Book Appointment Now** to go to the Doctors page, or **Find Hospital** to browse hospitals.

Below the hero section, the platform shows statistics such as active users, hospitals, and doctors. These values come from the backend API.

Next, the **Our Services** section shows the main modules of the system:

- Find Expert Doctors
- Search Hospitals
- Blood Bank
- Emergency Ambulance
- E-Doctor Telemedicine
- E-Medicine Pharmacy

Each card is clickable and takes the user to that service page.

The landing page also has subscription plans for business users. I can switch between **Pharmacy Admin**, **Hospital Admin**, and **Ambulance Driver Admin**. Each admin type has trial, monthly, yearly, and custom plans. Paid plans start the SSLCommerz payment flow, while custom plans take the user to Contact Sales.

## 3. Doctors Page

Now I will open the **Doctors** page.

This page lists available doctors. Users can search by doctor name or specialty, for example cardiologist. The result cards show doctor information, and pagination appears when there are many doctors.

When I click a doctor, the app opens the **Doctor Detail** page. Here we can see the doctor's profile, specialty, experience, consultation fee, availability, qualifications, chamber address, languages, and patient reviews.

The main action here is **Book Appointment**. When the patient clicks it, an appointment booking modal opens. The patient submits appointment information, and the backend stores the appointment record. Reviews can also be submitted from this detail page.

## 4. Hospitals Page

Next, I will open the **Hospitals** page.

This page allows users to search hospitals by hospital name or location. Hospital cards show key details such as location, rating, beds, and emergency availability.

When I open a hospital detail page, I can see the hospital profile, contact information, capacity, services, about section, and special facilities. The page also gives quick actions to find doctors or request emergency support.

## 5. Blood Bank Page

Now I will open the **Blood Bank** page.

This module helps users find blood donors. Users can search by name, blood group, or location. There are also quick filter buttons for blood groups like A+, B+, O+, AB+, and others.

A user can click **Donate Blood** and submit donor details. After submission, the donor information is saved and can appear in the donor list. This is useful for emergency blood needs.

## 6. Ambulance Page

Next is the **Ambulance** page.

This page lists ambulance services. Users can search by service name, driver, or phone number. They can also filter by vehicle type: basic, advanced, or ICU ambulance.

Each ambulance card shows availability, vehicle details, fare, service area, and contact information.

When a user clicks **Request Ambulance**, a request form opens. The patient enters patient name, contact phone, pickup location, destination, urgency, and special medical notes. After submission, the request is stored in the backend and can be managed by the ambulance admin.

## 7. E-Medicine Page

Now I will open **E-Medicine**.

This page has two tabs: **Pharmacies** and **Medicines**.

In the Pharmacies tab, users can search pharmacies by name, address, or phone. They can also filter pharmacy type, such as chain, independent, or hospital pharmacy.

Each pharmacy card shows contact details, address, delivery information, minimum order amount, and availability.

When the user clicks **Order Medicines**, an order modal opens. The user selects medicines, adds delivery details, and submits the order. The order is then available in the patient's care services page and in the pharmacy admin dashboard.

In the Medicines tab, users can view available medicines from listed pharmacies.

## 8. E-Doctor Page

Next, I will demonstrate **E-Doctor**.

This module is for online doctor consultation. Users can search by doctor name, specialization, or hospital. They can filter by specialization such as general, cardiology, pediatrics, or gynecology.

Each doctor card shows online consultation information and fee. When the user clicks **Book Consultation**, a modal opens. The user enters patient name, email, phone, age, main health concern, medical history, date, time slot, and urgency.

After booking, a confirmation appears and the user can proceed to payment. Once payment succeeds, the consultation payment status is updated.

## 9. Login, Register, and Password Reset

The platform has an authentication system.

On the **Register** page, a new user can create an account and set up a profile. On the **Login** page, existing users can access their account.

If a user forgets their password, the **Forgot Password** page sends a password reset link to the user's email. The **Reset Password** page allows the user to create a new password from that reset link.

After login, the navigation bar changes based on the user's role.

## 10. My Care Services Page

For a patient account, the account menu shows **My Care Services**.

This page collects the patient's service history in one place. It includes:

- Doctor appointments
- E-Doctor consultations
- Ambulance requests
- E-Medicine orders

The user can filter by service type, see status and payment information, and cancel eligible services. This page works like a personal healthcare activity dashboard.

## 11. Pharmacy Admin Dashboard

Now I will demonstrate the **Pharmacy Admin Dashboard**.

This dashboard is for pharmacy owners or managers. It has tabs for:

- Medicines
- Orders
- Revenue Review
- Pharmacy Info

In the Medicines tab, the pharmacy admin can add, edit, delete, and manage medicine availability.

In the Orders tab, the admin can view medicine orders, filter by status or urgency, confirm pending orders, move orders through processing, shipped, and delivered statuses, or cancel orders.

The Revenue Review tab summarizes pharmacy income and order performance.

The Pharmacy Info tab allows the admin to view and update pharmacy profile information such as address, phone, delivery availability, minimum order amount, image, and verification status.

## 12. Hospital Admin Dashboard

The **Hospital Admin Dashboard** is for hospital management.

This dashboard manages hospital information, doctor profiles, appointments, consultations, and revenue review. A hospital admin can add and update doctors, manage appointments, review service activity, and keep the hospital profile updated.

The purpose is to give hospitals a central place to manage their digital presence and patient services.

## 13. Ambulance Admin Dashboard

The **Ambulance Admin Dashboard** is for ambulance service providers.

It has tabs for ambulance listings, service requests, and revenue review.

The admin can create or update ambulance service information, manage availability, view assigned ambulance requests, and update request statuses such as accepted, on the way, arrived, completed, or cancelled.

The revenue review section calculates completed and pending revenue from ambulance requests.

## 14. Super Admin Dashboard

The **Super Admin Dashboard** is the highest-level management panel.

The super admin can manage:

- Admin accounts
- Hospitals
- Pharmacies
- Ambulances
- Appointments
- Medicine orders
- Ambulance requests
- E-Doctor consultations
- Payments
- Subscriptions

This dashboard gives the platform owner full control over services, user roles, business subscriptions, payment records, and request statuses.

## 15. Payment Flow

Medi Sheba includes a payment flow.

Payments are used for subscriptions and service payments such as E-Doctor consultation. When a payment succeeds, the user is redirected to the **Payment Successful** page. If it fails or is cancelled, the payment result page shows the correct status.

From the payment result page, the user can download a payment report or email the report using the transaction ID.

## 16. Contact, About, Privacy, and Terms Pages

The **About Us** page explains the mission, vision, services, and commitment of Medi Sheba.

The **Contact** page includes contact information, a message form, and frequently asked questions.

The **Contact Sales** page is used for custom subscription plans, especially for enterprise pharmacies, hospitals, or ambulance fleets.

The **Privacy Policy** page explains how user and medical data are handled.

The **Terms of Service** page explains platform rules, account responsibilities, appointment rules, medical disclaimer, and limitations.

## 17. How The Project Works

Here is the basic working process:

1. The user opens the React frontend in the browser.
2. React Router loads the correct page based on the URL.
3. Pages call API modules such as doctors, hospitals, ambulance, e-medicine, e-doctor, appointments, users, and payments.
4. The API modules use Axios to send requests to the Django REST API.
5. Django validates the request, reads or writes data in the database, and returns JSON.
6. The frontend updates the UI based on the response.
7. Role-based dashboards are shown depending on the logged-in user's roles.
8. Payment-related actions connect to the payment API and redirect users to the payment gateway or result page.

## 18. Closing

To summarize, Medi Sheba is a complete healthcare service platform. Patients can find doctors, hospitals, blood donors, ambulances, medicines, and online consultations. Business admins can manage their own services, orders, appointments, and revenue. The super admin can control the whole platform.

This project demonstrates a full-stack healthcare system using React, Django REST Framework, role-based access, API integration, service booking, and payment workflow.

Thank you.

## Quick Demo Order

For a smooth browser presentation, follow this order:

1. Home
2. Doctors
3. Doctor Detail and Book Appointment
4. Hospitals
5. Hospital Detail
6. Blood Bank
7. Ambulance and Request Ambulance
8. E-Medicine and Order Medicines
9. E-Doctor and Book Consultation
10. Register and Login
11. My Care Services
12. Pharmacy Admin Dashboard
13. Hospital Admin Dashboard
14. Ambulance Admin Dashboard
15. Super Admin Dashboard
16. Payment Result
17. About, Contact, Privacy, and Terms

## Commands To Run Before Demo

Backend:

```bash
cd medical_sheba
python manage.py runserver
```

Frontend:

```bash
cd medical_sheba/frontend
npm run dev
```

Open in browser:

```text
http://localhost:5173
```
