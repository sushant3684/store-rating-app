# Store Rating System

A full-stack web application for rating and reviewing local stores. Built with **React** (frontend) and **Node.js/MySQL** (backend).

## Features

*   **Admin Panel:** Manage users and stores (add, edit, delete). View dashboard stats.
*   **Store Owners:** View ratings and reviews for your assigned stores.
*   **Users:** Search for stores and submit ratings/reviews.
*   **Authentication:** Role-based login (Admin, Owner, User) using JWT.

## Tech Stack

*   **Frontend:** React.js, React Router, CSS modules (no frameworks), Axios.
*   **Backend:** Node.js, Express, MySQL, JWT authentication.

## Setup Instructions

### 1. Database Setup
Make sure you have MySQL installed and running.
The project includes a setup script to create the database and tables for you.

```bash
cd backend
npm install
npm run init-db
```
This script creates the `store_rating_db` database and seeds it with default users.

### 2. Backend Server
Start the API server:
```bash
cd backend
npm start
```
Runs on `http://localhost:5001`.

### 3. Frontend Client
Open a new terminal and start the React app:
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`.

## Default Login Credentials

You can use these accounts to test the different roles:

**Admin:**
*   Email: `admin@storerating.com`
*   Password: `Admin@123`

**Store Owner:**
*   Email: `starbucks@stores.com`
*   Password: `Owner@123`

**Regular User:**
*   Email: `user@test.com`
*   Password: `User@123`

## Project Structure
*   `/backend` - Express API and database scripts
*   `/frontend` - React application

