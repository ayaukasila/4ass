# Task Manager App

## Description

A secure and interactive web application using **Node.js, Express, EJS, and MongoDB Atlas**. This app allows users to **register, log in, create tasks, and manage them**.

## Features

- ✅ User authentication (Register/Login with JWT)
- ✅ Task management (CRUD operations)
- ✅ Role-based access control (Admin/User)
- ✅ Secure password hashing (bcrypt)
- ✅ CSRF protection & Input validation

## Installation

### 1️⃣ Clone the repository (or navigate to your project folder):

```sh
# Clone the repository
 git clone https://github.com/your-repo/taskmanager.git
 cd taskmanager
```

### 2️⃣ Install dependencies

```sh
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory and add the following:

```sh
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.cv7mr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
BASE_URL=http://localhost:3000
PORT=3000
JWT_SECRET=<your_generated_jwt_secret>
WEATHER_API_KEY=<your_weather_api_key>
```

### 4️⃣ Start the Server

```sh
npm start
```

The server should be running at: `http://localhost:3000`

## Usage

- **Register/Login** to access the dashboard.
- **Create, Update, Delete, and Filter tasks**.
- **Admin can manage users and tasks**.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, CSS
- **Database:** MongoDB Atlas
- **Authentication:** JWT & bcrypt




