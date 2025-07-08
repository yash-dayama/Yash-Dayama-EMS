# Employee Leave & Attendance Management System

A simple web application for managing employee leaves and attendance, with separate dashboards for Admin and Employee roles.

---

## Features

- **Role-based login:** Admin and Employee
- **Leave management:** Apply, approve, and track leaves
- **Attendance tracking:** Daily check-in and check-out
- **Dashboards:** See your stats at a glance
- **Simple, clean UI:** Easy to use for everyone

---

## How it Works

- **Employees** can log in, check in/out for attendance, and apply for leaves.
- **Admins** can view all employees, manage leave requests, and monitor attendance.
- All data is stored in MongoDB and managed via a Node.js/Express backend.
- The frontend is built with React and Bootstrap for a responsive experience.

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yash-dayama/Yash-Dayama-EMS.git
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

4. **Configure environment variables:**
   - Copy `config/dev.env.example` to `config/dev.env` and update as needed.

5. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

6. **Start the backend:**
   ```bash
   npm start
   ```

7. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

---

## Architecture Overview

- **Backend:** Node.js, Express, MongoDB (Mongoose)
  - Handles authentication, leave, and attendance APIs
  - Role-based access for Admin and Employee
- **Frontend:** React (Vite), Bootstrap
  - Admin and Employee dashboards
  - Simple, functional UI for leave and attendance management

---

For any issues, check the code comments or contact the maintainer.
