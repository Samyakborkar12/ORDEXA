# ORDEXA – Smart Queue Management System

\<p align="center">
&#x20; \<img src="[https://img.shields.io/badge/Project-ORDEXA-0A84FF?style=for-the-badge](https://img.shields.io/badge/Project-ORDEXA-0A84FF?style=for-the-badge)" alt="ORDEXA">
&#x20; \<img src="[https://img.shields.io/badge/Java-Spring%20Boot-orange?style=for-the-badge&logo=openjdk](https://img.shields.io/badge/Java-Spring%20Boot-orange?style=for-the-badge\&logo=openjdk)" alt="Java">
&#x20; \<img src="[https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue?style=for-the-badge](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue?style=for-the-badge)" alt="Frontend">
&#x20; \<img src="[https://img.shields.io/badge/Database-MySQL-blue?style=for-the-badge&logo=mysql](https://img.shields.io/badge/Database-MySQL-blue?style=for-the-badge\&logo=mysql)" alt="MySQL">
\</p>

\<p align="center">
&#x20; \<strong>A smarter way to manage queues, reduce waiting time and improve service experiences.\</strong>
\</p>

---

## 1. About the Project

**ORDEXA** is a Smart Queue Management System developed to modernize the traditional queue management process in places such as hospitals, banks and government offices.

In traditional queue systems, customers often have to stand in long physical lines without knowing their position or estimated waiting time. This can lead to overcrowding, wasted time and inefficient service management.

ORDEXA aims to solve these problems through a digital platform that allows customers to obtain queue tokens and track their queue progress, while administrators can manage services, counters and customer flow through a centralized dashboard.

The system is designed to make queue management more organized, convenient and efficient for both customers and service providers.

## 2. Problem Statement

Traditional queue management systems have several limitations:

- Long physical waiting lines.
- Uncertainty about waiting time and token position.
- Difficulty managing multiple service counters.
- Manual queue handling by staff.
- Unnecessary crowding in service locations.
- Limited visibility into daily queue operations.

ORDEXA addresses these challenges by introducing a digital approach to token generation and queue management.

## 3. Project Objectives

- Reduce physical waiting time for customers.
- Provide a convenient digital token system.
- Allow customers to monitor their queue status.
- Help administrators manage services and counters.
- Improve coordination between customers and service staff.
- Make queue operations more organized and transparent.

## 4. Key Modules

### Customer Module

The customer module provides an interface for users to access queue-related services.

Key functionalities include:

- Customer registration and login.
- Browsing available organizations.
- Selecting an organization, branch and service.
- Joining a queue and obtaining a digital token.
- Viewing token information and queue status.
- Checking estimated waiting time and queue position.
- Viewing previous token records, where supported.

### Admin Module

The admin module provides a centralized interface for managing queue operations.

Key functionalities include:

- Administrator authentication.
- Organization and service management.
- Counter management.
- Staff management and assignments.
- Monitoring customer queues.
- Managing token operations.
- Viewing available queue information and operational statistics.

### Staff and Counter Management

This module supports the management of service counters and staff responsibilities.

Key functionalities include:

- Managing counter assignments.
- Calling the next customer.
- Processing customers at assigned counters.
- Updating token status.
- Completing queue transactions.

### Queue Management Module

This is the core module of ORDEXA.

It is responsible for:

- Generating queue tokens.
- Maintaining queue records.
- Managing token status.
- Processing queue operations.
- Tracking customer progress.
- Supporting queue-related administrative operations.

## 5. System Workflow

The general workflow of ORDEXA is as follows:

1. The customer opens the ORDEXA application.
2. The customer logs in or registers.
3. The customer selects an organization and required service.
4. The customer joins the selected queue.
5. The system generates a digital token.
6. The customer checks their queue position and waiting information.
7. The administrator or staff manages the queue through the dashboard.
8. The next customer is called for service.
9. After the service is completed, the token status is updated.

### Queue Lifecycle

`Waiting → Serving → Completed`

Additional states, such as held or skipped, can be used where supported by the application.

## 6. Technology Stack

| Technology   | Purpose                                      |
| ------------ | -------------------------------------------- |
| HTML5        | Structure of web pages                       |
| CSS3         | Styling and responsive layouts               |
| JavaScript   | Frontend functionality and interactions      |
| Java         | Backend programming                          |
| Spring Boot  | Backend application and REST API development |
| MySQL        | Relational database management               |
| Maven        | Dependency management and project build      |
| Git & GitHub | Version control and source code management   |

## 7. System Architecture

ORDEXA follows a frontend-backend architecture.

```text
       CUSTOMER APPLICATION
                |
                |
          ADMIN PORTAL
                |
                v
       FRONTEND LAYER
       HTML / CSS / JS
                |
                | HTTP Requests
                | REST APIs
                v
        BACKEND APPLICATION
          Java + Spring Boot
                |
                |
        BUSINESS LOGIC
                |
                v
          MySQL DATABASE
```

### Architecture Explanation

- **Frontend Layer:** Provides interfaces for customers and administrators.
- **Backend Layer:** Processes requests, applies application logic and manages operations.
- **Database Layer:** Stores application information such as users, organizations, services, counters and queue records.
- **REST API:** Enables communication between the frontend and backend.

## 8. Project Directory Structure

The project is organized into separate frontend, backend, database and documentation directories.

```text
ORDEXA/
│
├── backend/
│   └── ordexa-api/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/
│       │       │       └── ordexa/
│       │       │           ├── admin/
│       │       │           ├── counter/
│       │       │           ├── notification/
│       │       │           ├── organization/
│       │       │           ├── queue/
│       │       │           ├── service/
│       │       │           ├── staff/
│       │       │           └── user/
│       │       │
│       │       └── resources/
│       │           └── application.properties
│       │
│       └── pom.xml
│
├── frontend/
│   ├── index.html
│   ├── admin-web/
│   └── customer-app/
│
├── database/
│   ├── schema/
│   │   └── ordexa_schema.sql
│   └── seed/
│       └── ordexa_seed.sql
│
├── docs/
│
├── .gitignore
├── LICENSE
└── README.md
```

*Note: This is a high-level representation of the project structure. Individual files and folders may vary as development progresses.*

## 9. Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install the following software:

- Java Development Kit (JDK).
- MySQL Server.
- Maven or the project's Maven Wrapper.
- A modern web browser.
- Visual Studio Code or another suitable IDE.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Samyakborkar12/ORDEXA.git
```

Navigate to the project directory:

```bash
cd ORDEXA
```

### Step 2: Configure the Database

1. Start your MySQL server.
2. Open MySQL Workbench or a MySQL terminal.
3. Import the database schema.

```bash
mysql -u root -p < database/schema/ordexa_schema.sql
```

If the project includes the seed SQL file and you want to load its initial records, run:

```bash
mysql -u root -p < database/seed/ordexa_seed.sql
```

### Step 3: Configure Backend Database Connection

Open:

`backend/ordexa-api/src/main/resources/application.properties`

Configure the database connection according to your local MySQL setup.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ordexa_db
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

Do not commit actual database passwords or other secret credentials to GitHub.

### Step 4: Run the Backend

Navigate to the backend directory:

```bash
cd backend/ordexa-api
```

If the Maven Wrapper is available on Windows:

```bash
.\mvnw.cmd spring-boot:run
```

On Linux or macOS:

```bash
./mvnw spring-boot:run
```

Alternatively, if Maven is installed:

```bash
mvn spring-boot:run
```

The backend is configured to run on:

```text
http://localhost:3030
```

### Step 5: Run the Frontend

Open the project in Visual Studio Code.

You can launch the frontend using the Live Server extension or another local HTTP server.

Main entry point:

```text
frontend/index.html
```

The customer and admin interfaces are maintained separately inside the frontend directory.

**Important:** Start the backend and configure the database before testing frontend features that depend on the API.

## 10. Database Overview

ORDEXA uses MySQL as its relational database.

The database is intended to manage information related to:

- Customers and administrators.
- Organizations and branches.
- Services.
- Counters.
- Staff members.
- Queue tokens and their status.
- Other application-related records.

The database schema is maintained separately under the `database/schema` directory.

## 11. Advantages of ORDEXA

- Reduces dependency on traditional physical queues.
- Improves customer convenience.
- Provides better visibility into queue progress.
- Simplifies counter and service management.
- Helps reduce unnecessary crowding.
- Supports organized handling of multiple services.
- Provides a foundation for future queue automation.

## 12. Future Scope

ORDEXA can be extended with additional features in future versions:

- Android and iOS mobile applications.
- SMS and push notifications.
- QR-based queue joining and verification.
- Improved waiting-time prediction.
- Advanced analytics and reporting.
- Multi-branch organization management.
- Accessibility improvements for senior citizens and differently abled users.
- Cloud deployment and scalability enhancements.

## 13. Team Contributions

This project was developed collaboratively by a team of four members.

| Responsibility  | Work Area                                              |
| --------------- | ------------------------------------------------------ |
| Samyak Borkar   | Frontend development and frontend-backend integration  |
| Aryan Chavan    | Backend development and database connectivity          |
| Manthan Bhawari | Project documentation and testing                      |
| Shubham Bobade  | Requirement analysis, workflow planning and UI testing |

All team members contributed to understanding the project requirements, discussing the system workflow and reviewing the overall application.

## 14. Learning Outcomes

Through this project, we gained practical experience in:

- Developing a full-stack web application.
- Understanding frontend-backend communication.
- Working with Java and Spring Boot.
- Designing and using a relational database.
- Understanding REST API concepts.
- Organizing software modules.
- Debugging and testing application functionality.
- Collaborating as a development team.

## 15. License

This project is licensed under the MIT License. Refer to the `LICENSE` file for more information.

---

\<p align="center">
&#x20; \<strong>ORDEXA – Making Queue Management Smarter.\</strong>
&#x20; \<br>
&#x20; Built with teamwork, technology and innovation.
\</p>
