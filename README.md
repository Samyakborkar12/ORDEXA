# ORDEXA - Smart Queue Management System 🚀

![ORDEXA Banner](https://img.shields.io/badge/ORDEXA-Queue%20Engine-00d9ff?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x%20%2F%204.x-brightgreen?style=for-the-badge&logo=springboot)
![Java](https://img.shields.io/badge/Java-21%2B-orange?style=for-the-badge&logo=openjdk)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue?style=for-the-badge&logo=mysql)
![Frontend](https://img.shields.io/badge/Frontend-Modern%20HTML5%20%2F%20CSS3%20%2F%20JS-blueviolet?style=for-the-badge)

**ORDEXA** is an enterprise-grade, touchless queue and token management platform designed for hospitals, banks, diagnostic clinics, government service centers, and retail stores. It eliminates physical waiting lines, empowers customers with real-time digital queue tracking on their mobile devices, and equips administrators with automated counter pacing and live analytics.

---

## ✨ Key Highlights & Features

### 🏢 1. Admin & Staff Operations Portal (`frontend/admin-web`)
- **Executive Dashboard:** Live metrics on waiting queue depth, counters open, staff throughput, and estimated pacing.
- **Counter Workflow Management:** Call next token, serve, skip no-shows, add service time, and mark completion.
- **Service & Desk Assignment:** Flexible routing of specific services (e.g. OPD, Billing, Pharmacy) to designated counter desks.
- **Walk-in Support:** Instant spot-token creation for elderly or walk-in visitors without smartphones.
- **Live Queue Monitoring:** Real-time synchronized queue boards with automated audio chimes.
- **Queue Analytics & CSAT:** Visual hourly traffic flow, service breakdown, counter efficiency comparisons, and customer satisfaction ratings.
- **Printable Standee QR Posters:** Automatic generation of branded QR code standees for clinic doors and table kiosks.

### 📱 2. Customer Mobile Experience (`frontend/customer-app`)
- **Digital Token Issuance:** Join queue remotely or scan an entrance QR standee to receive an instant token slip (e.g. `CIT-GEN-002`).
- **Live Countdown & Position Tracker:** See real-time "People ahead of you" and dynamic remaining wait time.
- **Hold My Spot:** Running 5 or 10 minutes late? Put your token on hold and rejoin once you're on-site.
- **Token History & Digital Receipts:** Full log of past visits and timestamps.
- **In-App Alerts:** Auditory and visual cues when your turn is next.

---

## 🛠️ Architecture & Tech Stack

```text
ORDEXA_SPRING_BOOT/
├── backend/ordexa-api/            # Spring Boot REST API
│   ├── src/main/java/com/ordexa/
│   │   ├── admin/                 # Admin auth & profile management
│   │   ├── counter/               # Counter desk configurations
│   │   ├── notification/          # Notification dispatcher
│   │   ├── organization/          # Business entity management
│   │   ├── queue/                 # Core Token & Queue Engine
│   │   ├── service/               # Service catalog & counter mapping
│   │   ├── staff/                 # Staff credentials & assignments
│   │   └── user/                  # Customer registration & auth
│   └── src/main/resources/
│       └── application.properties # Server port 3030 & MySQL credentials
├── frontend/
│   ├── index.html                 # Main Landing Gateway
│   ├── admin-web/                 # Admin & Staff Web Dashboard
│   └── customer-app/              # Customer Mobile PWA Portal
├── database/
│   ├── schema/ordexa_schema.sql   # Complete MySQL DDL schema
│   └── seed/ordexa_seed.sql       # Demo seed data (Admins, Orgs, Tokens)
└── docs/                          # Architecture & API specifications
```

---

## 🚀 Quick Start Guide

### 1. Database Setup
1. Ensure **MySQL Server** is running on `localhost:3306`.
2. Create the database and import schema:
   ```bash
   mysql -u root -p < database/schema/ordexa_schema.sql
   mysql -u root -p < database/seed/ordexa_seed.sql
   ```
3. Update `backend/ordexa-api/src/main/resources/application.properties` with your MySQL password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ordexa_db
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```

### 2. Start the Backend API
Navigate to `backend/ordexa-api` and run:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```
Backend API will start on **`http://localhost:3030`**.

### 3. Launch Frontend
Simply open `frontend/index.html` in your web browser, or serve it using any HTTP server:
- Open `frontend/index.html` to access the Role Switcher.
- Direct Admin Portal: `frontend/admin-web/pages/login.html`
- Direct Customer App: `frontend/customer-app/pages/login.html`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@ordexa.com` | `admin123` |
| **Customer** | `rahul@gmail.com` | `user123` |
| **Staff** | `sarah@ordexa.com` | `admin123` |

---

## 📖 REST API Endpoints Overview

- `POST /api/admin/login` - Admin authentication
- `POST /api/user/login` - Customer authentication
- `GET /api/organizations` - List active organizations
- `GET /api/services/organization/{id}` - Services for organization
- `GET /api/counters/organization/{id}` - Counters for organization
- `POST /api/queue/join` - Join queue and issue digital token
- `GET /api/queue/organization/{id}/service/{serviceId}/status` - Live queue estimation
- `POST /api/queue/counter/{counterId}/serve-next` - Call next token to desk
- `POST /api/queue/{id}/complete` - Mark service completed
- `POST /api/queue/{id}/hold` - Put token on temporary hold
- `POST /api/queue/{id}/rejoin` - Rejoin waiting queue
- `GET /api/queue/organization/{id}/analytics` - Queue analytics & metrics

---

## 📄 License
This project is licensed under the MIT License.
