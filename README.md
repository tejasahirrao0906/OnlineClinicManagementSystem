# 🏥 Online Clinic Management System

A mobile-based **Online Clinic Management System** developed using **React Native, Expo, Firebase Authentication, and Cloud Firestore**.

The system provides separate interfaces for **Patients, Doctors, and Administrators**, allowing users to manage appointments, prescriptions, bills, doctor profiles, and patient information through a centralized Firebase backend.

---

## 📱 Project Overview

The Online Clinic Management System is designed to simplify common clinic operations by providing a single mobile application with role-based functionality.

The application supports three main user roles:

* 👤 **Patient**
* 👨‍⚕️ **Doctor**
* 🛡️ **Administrator**

The application uses Firebase for authentication and real-time cloud data storage, allowing information such as appointments, prescriptions, and bills to remain synchronized across devices.

---

## ✨ Features

### 👤 Patient Module

* Patient registration and login
* Patient profile management
* Browse available doctors
* Book doctor appointments
* Appointment slot availability
* Duplicate appointment-slot prevention
* Appointment cancellation
* Automatic appointment-slot release after cancellation
* View appointment status
* View prescriptions
* View medical bills
* Firebase-based data synchronization

### 👨‍⚕️ Doctor Module

* Doctor account registration
* Doctor login
* Doctor profile verification
* Doctor dashboard
* View patient appointments
* Manage appointment status
* Create prescriptions
* View prescription information
* Generate patient bills
* Firebase Authentication-based doctor access

### 🛡️ Admin Module

* Secure administrator login
* Admin dashboard
* Dashboard statistics
* Manage doctors
* Add doctors
* Edit doctor information
* Delete doctors
* Manage patients
* View patient details
* Manage appointments
* View appointment details
* Manage bills
* View bill details
* Admin-only Firestore operations

---

## 🔐 Security

Firestore Security Rules are implemented to control access to application data based on the authenticated user's role and relationship with the data.

Security has been implemented for the following collections:

* `users`
* `doctors`
* `appointments`
* `appointmentSlots`
* `prescriptions`
* `bills`
* `adminUsers`

### Security Highlights

* Patients can access their own personal information.
* Patients can manage their own appointment cancellation.
* Doctors can access appointments associated with their doctor account.
* Doctors can create prescriptions for their assigned appointments.
* Doctors can generate bills for their assigned appointments.
* Administrators have controlled access to administrative operations.
* Doctor profile creation, modification, and deletion are restricted to administrators.
* Firestore write operations are restricted according to application roles and ownership.
* Appointment booking uses Firestore transactions to prevent duplicate slot booking.

---

## 🗓️ Appointment Booking

The appointment system uses a deterministic slot identifier based on:

```text
Doctor + Date + Time
```

Before creating an appointment, the application checks whether the corresponding slot already exists.

Firestore transactions are used so that two patients cannot successfully book the same appointment slot simultaneously.

When an appointment is cancelled:

1. The appointment status is changed to `Cancelled`.
2. The associated appointment slot is deleted.
3. The slot becomes available for another patient.

---

## 🏗️ Technology Stack

| Technology              | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| React Native            | Mobile application development              |
| Expo                    | React Native development and build workflow |
| TypeScript              | Application programming                     |
| Firebase Authentication | User authentication                         |
| Cloud Firestore         | Database and real-time synchronization      |
| AsyncStorage            | Persistent authentication state             |
| Expo Router             | Application navigation                      |
| Android                 | Target mobile platform                      |
| Git & GitHub            | Version control and source-code hosting     |

---

## 🔥 Firebase Architecture

The application uses Firebase as its backend.

```text
                Online Clinic App
                       │
          ┌────────────┼────────────┐
          │            │            │
     Firebase Auth   Firestore   AsyncStorage
          │            │
          │            ├── users
          │            ├── doctors
          │            ├── appointments
          │            ├── appointmentSlots
          │            ├── prescriptions
          │            ├── bills
          │            └── adminUsers
          │
          └── Patient / Doctor / Admin Authentication
```

---

## 📂 Main Firestore Collections

### `users`

Stores patient information such as:

* Name
* Email
* Phone
* Address
* Role
* Account timestamps

### `doctors`

Stores doctor information such as:

* Name
* Specialization
* Email
* Firebase Authentication UID when linked

### `appointments`

Stores:

* Patient
* Doctor
* Date
* Time
* Reason
* Appointment status
* Appointment slot ID
* Creation timestamp

### `appointmentSlots`

Used to maintain appointment-slot availability and prevent duplicate bookings.

### `prescriptions`

Stores prescription information associated with patients, doctors, and appointments.

### `bills`

Stores billing information associated with appointments and patients.

### `adminUsers`

Used to identify authorized administrator accounts.

---

## 📱 Application Flow

```text
                         Home Screen
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
     Patient Login       Doctor Login        Admin Login
          │                   │                   │
          ▼                   ▼                   ▼
   Patient Dashboard   Doctor Dashboard    Admin Dashboard
          │                   │                   │
     ┌────┼────┐         ┌────┼────┐       ┌────┼────┐
     │    │    │         │    │    │       │    │    │
Appointments  Bills  Appointments  Prescriptions  Manage
Prescriptions Profile    │          Bills          Doctors
     │                     │                       Patients
     │                     │                       Appointments
     ▼                     ▼                       Bills
  Firestore              Firestore              Firestore
```

---

## 🔑 Authentication

The application uses **Firebase Authentication with Email/Password authentication**.

Different application roles have separate login flows:

* Patient Login
* Doctor Login
* Admin Login

### Doctor Authentication

Doctors are first registered by the administrator in the `doctors` collection.

A doctor can then create their Firebase Authentication account through the Doctor Registration screen.

During registration, the application verifies the doctor's registered email and links the Firebase Authentication UID to the doctor profile.

This prevents an unrelated Firebase account from accessing the doctor dashboard.

---

## 👨‍⚕️ Doctor Registration Flow

```text
Admin creates Doctor Profile
             │
             ▼
Doctor profile stored in Firestore
             │
             ▼
Doctor opens Doctor Registration
             │
             ▼
Email verification against doctor profile
             │
             ▼
Firebase Authentication account created
             │
             ▼
Firebase UID linked to doctor profile
             │
             ▼
Doctor Login
             │
             ▼
Doctor Dashboard
```

---

## 🛡️ Admin Access

The administrator dashboard is protected using Firebase Authentication and the `adminUsers` collection.

Before administrative Firestore listeners are started, the application verifies that the authenticated user has an administrator role.

This prevents unauthorized users from accessing administrative data.

---

## 📲 Running the Project Locally

### Prerequisites

Install the following:

* Node.js
* npm
* Android Studio
* Android SDK
* Java Development Kit
* Expo / React Native development environment

### 1. Clone the Repository

```bash
git clone https://github.com/tejasahirrao0906/OnlineClinicManagementSystem.git
```

### 2. Navigate to the Project

```bash
cd OnlineClinicManagementSystem
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

Create/configure the Firebase project and add the required Firebase configuration files for the Android build.

> Firebase configuration files containing project-specific credentials or configuration should not be committed to the repository.

### 5. Start the Development Server

```bash
npx expo start
```

For Android development:

```bash
npx expo run:android
```

---

## 📦 Release APK

A standalone Android release APK has been generated and tested.

The release build was created using:

```bash
npx expo run:android --variant release
```

The generated APK is located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

The release APK can be installed directly on a compatible Android device for testing and demonstration.

The application can communicate with Firebase without requiring a USB connection or a running Metro development server.

---

## 🧪 Testing

The following major application workflows have been tested:

### Patient

* Registration
* Login
* Profile editing
* Appointment booking
* Duplicate-slot prevention
* Appointment cancellation
* Slot release
* Prescription viewing
* Bill viewing

### Doctor

* Doctor registration
* Doctor login
* Doctor authentication verification
* Appointment management
* Prescription creation
* Bill generation

### Admin

* Admin authentication
* Dashboard statistics
* Doctor management
* Patient management
* Appointment management
* Bill management

### Security

Firestore security rules have been tested for:

* Users
* Doctors
* Appointments
* Appointment slots
* Prescriptions
* Bills
* Admin users

---

## 🖥️ Project Structure

```text
OnlineClinicApp/
│
├── android/
│
├── assets/
│
├── src/
│   ├── app/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── book-appointment.tsx
│   │   ├── appointments.tsx
│   │   ├── appointment-details.tsx
│   │   ├── prescriptions.tsx
│   │   ├── bills.tsx
│   │   ├── profile.tsx
│   │   │
│   │   ├── doctor-login.tsx
│   │   ├── doctor-register.tsx
│   │   ├── doctor-dashboard.tsx
│   │   ├── doctor-appointments.tsx
│   │   ├── doctor-prescriptions.tsx
│   │   ├── add-prescription.tsx
│   │   ├── add-bill.tsx
│   │   │
│   │   ├── admin-login.tsx
│   │   ├── admin-dashboard.tsx
│   │   ├── manage-doctors.tsx
│   │   ├── add-doctor.tsx
│   │   ├── edit-doctor.tsx
│   │   ├── manage-patients.tsx
│   │   ├── patient-details.tsx
│   │   ├── manage-appointments.tsx
│   │   ├── appointment-details-admin.tsx
│   │   ├── manage-bills.tsx
│   │   └── bill-details-admin.tsx
│   │
│   └── firebaseConfig.ts
│
├── firestore.rules
├── firebase.json
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🔒 Repository Security

The repository excludes generated and sensitive files such as:

```text
node_modules/
.expo/
android/app/build/
android/.gradle/
android/local.properties
android/app/google-services.json
*.keystore
*.jks
.env
```

Firebase Android configuration files are intentionally excluded from the public repository.

---

## 🚀 Future Enhancements

Possible future improvements include:

* Push notifications for appointment reminders
* More advanced appointment scheduling
* Online payment integration
* Medical document uploads
* Prescription PDF generation
* Advanced admin reports
* Doctor availability management
* Patient medical-history management
* Improved analytics and reporting

---

## 🎓 Academic Project

This project was developed as an academic **Software Engineering / Computer Engineering project** demonstrating:

* Mobile application development
* Role-based access control
* Firebase Authentication
* Cloud database integration
* CRUD operations
* Real-time data synchronization
* Transaction-based data consistency
* Firestore security rules
* Software engineering principles

---

## 👨‍💻 Author

**Tejas Ahirrao**

Bachelor of Engineering — Computer Engineering

University of Mumbai

---

## 📄 License

This project is developed for academic and educational purposes.
