# Dependency-Aware Planner

Setup Guide：
1. Clone the repo
2. Backend Setup (Spring Boot + PostgreSQL)
   cd backend
  make sure u installed PostgreSQL and running on port 5432

Create database + user (in psql or pgAdmin) using this script:
CREATE DATABASE planner;
CREATE USER planner_user WITH ENCRYPTED PASSWORD 'planner_pass';
GRANT ALL PRIVILEGES ON DATABASE planner TO planner_user;


Run backend (with Maven wrapper)
.\mvnw spring-boot:run
The backend runs at http://localhost:8080
Test it: open http://localhost:8080/api/hello
 → should show Hello from Backend 👋
 
3. Frontend Setup (React + Vite + Tailwind)
  cd ../frontend
  npm install
  npm run dev
The frontend runs at http://localhost:5173
It should display Hello from Backend 👋 coming from the API.
Make sure both back end and front end are running.

