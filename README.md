# Quiz Speed Challenge

A full-stack cloud-based quiz application built with React and Flask, with AWS infrastructure provisioned using Terraform.

The application allows players to answer technical quiz questions, submit scores, and view leaderboard results. It also includes backend functionality for managing questions, game results, and application statistics.

> This project was developed as an academic team project focused on cloud infrastructure, full-stack development, and Infrastructure as Code.

## Architecture

The application follows a three-tier cloud architecture:

- **Frontend:** React + Vite
- **Backend:** Flask REST API
- **Database:** MySQL
- **Cloud Platform:** AWS
- **Infrastructure as Code:** Terraform

The AWS deployment architecture uses:

- Amazon EC2 for application servers
- Application Load Balancer for traffic distribution
- Auto Scaling Group for instance management
- VPC with multiple public subnets
- Security Groups for network access control
- MySQL database connectivity through environment variables

The Application Load Balancer routes:

```text
/        → React Frontend (Port 3000)
/api/*   → Flask Backend (Port 3010)
```

## Features

- Interactive quiz interface
- Multiple-choice technical questions
- Player score tracking
- Leaderboard
- Unique player codes
- Question management API
- Game result management
- Admin statistics
- Backend and database health checks
- Persistent MySQL storage
- Load-balanced AWS architecture
- Terraform-managed cloud infrastructure

## Project Structure

```text
Quiz-Speed-Challenge/
├── backend/
│   ├── app.py
│   ├── data.py
│   ├── database_setup.sql
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── terraform/
│   ├── alb.tf
│   ├── asg.tf
│   ├── lanch-template.tf
│   ├── outputs.tf
│   ├── providers.tf
│   ├── sg.tf
│   ├── variables-locals.tf
│   ├── versions.tf
│   └── vpc.tf
│
├── .gitignore
└── README.md
```

## Backend API

The Flask backend provides REST endpoints for:

- Retrieving and managing quiz questions
- Saving player scores
- Retrieving leaderboard results
- Viewing game results
- Retrieving admin statistics
- Checking application and database health

The backend runs on port `3010`.

## Database

The application uses MySQL with tables for:

- Questions
- Players
- Game results
- Administrators

Database credentials are provided through environment variables rather than stored directly in the source code.

Required environment variables:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

## AWS Infrastructure

Terraform is used to define the cloud infrastructure.

The configuration includes:

- VPC (`10.10.0.0/16`)
- Two public subnets
- Application Load Balancer
- Frontend target group on port `3000`
- Backend target group on port `3010`
- Auto Scaling Group
- EC2 launch template
- Security Groups
- Health checks

The Auto Scaling Group was configured with two EC2 instances.

## Technologies

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Python
- Flask
- PyMySQL
- Flask-CORS

**Database**
- MySQL

**Cloud & DevOps**
- AWS
- EC2
- Application Load Balancer
- Auto Scaling
- VPC
- Terraform

## Running Locally

### Backend

Install the Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Configure the required database environment variables and run:

```bash
python app.py
```

The backend runs at:

```text
http://localhost:3010
```

### Frontend

Install the frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

## Deployment Note

The project was originally deployed on AWS as part of the academic project. A live AWS deployment is not currently maintained.

The Terraform configuration is included to demonstrate the infrastructure architecture and Infrastructure as Code implementation. Environment-specific values such as the AMI may need to be updated before deploying the infrastructure in a new AWS environment.