# 🌱 Smart Plant Care

A modern **cloud-based Smart Plant Care application** built using **React.js and Firebase**. The application helps users maintain their plants by storing plant information in the cloud and providing a simple dashboard for monitoring plant care activities.

The project demonstrates the practical implementation of **Cloud Computing, Firebase Authentication, Cloud Firestore, CRUD operations, and responsive web development**.

---

## 📌 Project Overview

Taking care of multiple plants can become difficult when users need to remember watering schedules, plant details, care requirements, and growth information.

**Smart Plant Care** provides a centralized platform where users can add their plants, store plant information, monitor care requirements, and manage their plants through a personalized dashboard.

The application uses:

* 🔐 Firebase Authentication for user accounts
* ☁️ Cloud Firestore for plant data
* ⚛️ React.js for the frontend
* 🎨 CSS for the user interface

> **Note:** This project uses Firebase Authentication and Cloud Firestore. Firebase Storage is not required.

---

# ✨ Features

## 🔐 User Authentication

Users can:

* Create an account
* Log in securely
* Log out
* Access their personalized plant dashboard

Authentication is handled using **Firebase Authentication**.

---

## 🌱 Plant Management

Users can:

* Add new plants
* View their plants
* Edit plant information
* Delete plants
* Track plant care details
* Manage multiple plants

---

## 💧 Plant Care Tracking

Users can maintain important plant information such as:

* Plant name
* Plant type
* Watering frequency
* Sunlight requirement
* Soil type
* Care notes
* Plant status

---

## 📅 Watering Management

The application can help users keep track of when plants need watering.

Example:

```text
🌱 Money Plant
💧 Watering: Every 3 Days
☀️ Light: Indirect Sunlight
```

---

## ☀️ Light Requirements

Users can store the sunlight requirements of their plants.

Examples:

* Direct sunlight
* Indirect sunlight
* Low light
* Partial sunlight

---

## 👤 Personalized Dashboard

Each logged-in user can view and manage their own plants.

The dashboard provides a centralized view of plant information and care activities.

---

## ☁️ Cloud Data Storage

Plant information is stored using **Cloud Firestore**, allowing data to persist between sessions.

---

## 📱 Responsive Interface

The application is designed to work on:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

---

# 🛠️ Technologies Used

| Technology              | Purpose                 |
| ----------------------- | ----------------------- |
| React.js                | Frontend development    |
| Vite                    | Development environment |
| JavaScript              | Application logic       |
| Firebase Authentication | User authentication     |
| Cloud Firestore         | Cloud database          |
| HTML5                   | Application structure   |
| CSS3                    | User interface          |
| Git                     | Version control         |
| GitHub                  | Repository hosting      |

---

# ☁️ Cloud Architecture

```text
                       ┌──────────────────┐
                       │       User       │
                       │ Web Browser      │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   React + Vite   │
                       │    Frontend      │
                       └────────┬─────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
           ┌─────────────────┐     ┌──────────────────┐
           │ Firebase Auth   │     │ Cloud Firestore  │
           │                 │     │                  │
           │ Login/Register  │     │ Plant Data       │
           │ User Sessions   │     │ Care Information │
           └─────────────────┘     └──────────────────┘
```

---

# 📂 Project Structure

```text
smart-plant-care/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/smart-plant-care.git
```

Navigate to the project:

```bash
cd smart-plant-care
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Start the development server

```bash
npm run dev
```

The application will be available at a local URL similar to:

```text
http://localhost:5173/
```

Open the URL in your browser.

---

# 🔥 Firebase Configuration

## Step 1 — Create Firebase Project

Create a new project in the Firebase Console.

Enable:

```text
Firebase Authentication
Cloud Firestore
```

Firebase Storage is **not required** for this project.

---

## Step 2 — Enable Authentication

Navigate to:

```text
Firebase Console
        ↓
Authentication
        ↓
Sign-in method
        ↓
Email/Password
```

Enable:

**Email/Password**

---

## Step 3 — Create Firestore Database

Navigate to:

```text
Firebase Console
        ↓
Firestore Database
        ↓
Create Database
```

Create the database.

---

## Step 4 — Register Web Application

Go to:

```text
Project Settings
        ↓
Your Apps
        ↓
Web App
```

Register the application.

Firebase will provide configuration values such as:

```text
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Add the required configuration values to:

```text
src/firebase.js
```

---

# 🗄️ Firestore Database Structure

A simple Firestore structure can be used.

```text
users
 └── userId
      ├── name
      └── email

plants
 └── plantId
      ├── userId
      ├── name
      ├── type
      ├── wateringFrequency
      ├── sunlight
      ├── soil
      ├── notes
      ├── status
      └── createdAt
```

---

# 🔄 Application Workflow

```text
                       START
                         │
                         ▼
                  Create Account
                         │
                         ▼
                       Login
                         │
                         ▼
                 Plant Dashboard
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
          Add          Edit         Delete
         Plant         Plant         Plant
            │            │            │
            └────────────┼────────────┘
                         │
                         ▼
                  Cloud Firestore
                         │
                         ▼
                  Updated Plant Data
```

---

# 🌿 Example Plant Information

Example plant record:

```text
Plant Name: Money Plant
Type: Indoor Plant
Watering: Every 3 Days
Sunlight: Indirect Sunlight
Soil: Well Drained
Status: Healthy
```

Another example:

```text
Plant Name: Aloe Vera
Type: Succulent
Watering: Once a Week
Sunlight: Bright Light
Soil: Sandy / Well Drained
Status: Healthy
```

---

# 💡 Plant Categories

The application can be used to track different types of plants:

* 🌿 Indoor Plants
* 🌵 Succulents
* 🌸 Flowering Plants
* 🌱 Herbs
* 🌳 Outdoor Plants
* 🪴 Decorative Plants
* 🌿 Medicinal Plants
* 🌱 Vegetable Plants

---

# 🎯 Learning Objectives

This project provides practical experience with:

* Cloud Computing
* Firebase
* Firebase Authentication
* Cloud Firestore
* React.js
* JavaScript
* CRUD operations
* Cloud database integration
* User-specific data
* Responsive UI development
* Git and GitHub

---

# 🔐 Security

Firebase Authentication is used to authenticate users.

Firestore Security Rules should be configured so that users can access and modify only the plant records associated with their authenticated account.

For example, plant records can contain the authenticated user's UID:

```text
userId = Firebase Authentication UID
```

This allows application logic and Firestore rules to associate plant data with the correct user.

---

# 🚀 Future Enhancements

The project can be extended with:

* 💧 Automatic watering reminders
* 🔔 Push notifications
* 🌦️ Weather API integration
* 🌡️ Temperature monitoring
* 💦 Soil moisture monitoring
* 📊 Plant growth analytics
* 📅 Care calendar
* 🌱 Plant disease detection
* 🤖 AI-based plant recommendations
* 📷 Plant identification
* 🏠 IoT sensor integration
* 📱 Progressive Web App support
* 🌐 Firebase Hosting deployment

---

# 🔮 Advanced Version

A future IoT-enabled version could connect physical sensors to the cloud.

```text
        🌱 Plant
           │
           ▼
    ┌───────────────┐
    │ IoT Sensors   │
    │               │
    │ Soil Moisture │
    │ Temperature   │
    │ Humidity      │
    └───────┬───────┘
            │
            ▼
       Cloud Service
            │
            ▼
     Cloud Firestore
            │
            ▼
      React Dashboard
            │
            ▼
     User Notifications
```

This would transform the project from a cloud-based plant management system into a **Cloud + IoT Smart Plant Care System**.

---

# 📸 Screenshots

Recommended screenshots for the repository:

<img width="1366" height="768" alt="Screenshot 2026-09-28 212024" src="https://github.com/user-attachments/assets/2a2c1a68-994b-49f4-ae78-daf169daf181" />
<img width="1366" height="768" alt="Screenshot 2026-09-28 212239" src="https://github.com/user-attachments/assets/42803c94-b5df-448c-824e-45d3283e0b18" />
<img width="1366" height="768" alt="Screenshot 2026-09-28 212547" src="https://github.com/user-attachments/assets/f3a48cf7-4d9d-45e6-b7ad-e092e4b187ac" />
<img width="1366" height="768" alt="Screenshot 2026-09-28 215501" src="https://github.com/user-attachments/assets/7eb77bcf-4ecf-48fc-a44c-ca6c05e519fa" />
<img width="1366" height="768" alt="Screenshot 2026-09-28 215524" src="https://github.com/user-attachments/assets/17d7d3f4-55a4-4521-9242-1c939b8f8649" />
<img width="1366" height="768" alt="Screenshot 2026-09-28 215548" src="https://github.com/user-attachments/assets/6f6a22b6-2681-419e-94fc-dbcba43f4ecd" />



Add screenshots to the README:

```markdown
![Login Page](screenshots/login.png)

![Plant Dashboard](screenshots/dashboard.png)

![Add Plant](screenshots/add-plant.png)
```

---

# 💻 Available Commands

Start development:

```bash
npm run dev
```

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🌐 Deployment

The application can be deployed using:

* Firebase Hosting
* Vercel
* Netlify

---

# 👩‍💻 Author

**Your Name**

B.Tech — Electronics and Computer Engineering

GitHub:
`https://github.com/YOUR-USERNAME`

LinkedIn:
`https://linkedin.com/in/YOUR-PROFILE`

---

# ⭐ Project Highlights

```text
🌱 Smart Plant Management
☁️ Cloud-Based Application
🔐 Firebase Authentication
🗄️ Cloud Firestore
💧 Plant Care Tracking
☀️ Sunlight Tracking
👤 Personalized Dashboard
⚛️ React.js
📱 Responsive UI
🚀 Future IoT Integration
```

---

## 📄 License

This project is developed for **educational and portfolio purposes**.
