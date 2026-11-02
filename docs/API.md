# ORDEXA REST API Reference

Base URL: `http://localhost:3030/api`

## 1. Authentication & Profile
- `POST /admin/register` - Create administrator account
- `POST /admin/login` - Admin login with BCrypt verification
- `PUT /admin/{id}` - Update admin account profile
- `POST /admin/forgot-password` - Reset admin password
- `POST /user/register` - Create customer account
- `POST /user/login` - Customer login
- `GET /user/{id}` - Retrieve customer profile
- `PUT /user/{id}` - Update customer profile
- `POST /user/forgot-password` - Reset customer password

## 2. Organization Management
- `GET /organizations` - List all registered organizations
- `GET /organizations/{id}` - Get organization details
- `POST /organizations` - Create organization profile
- `PUT /organizations/{id}` - Update organization settings

## 3. Services & Counters
- `GET /services/organization/{orgId}` - Get services for organization
- `POST /services` - Create service item
- `PUT /services/{id}` - Update service item
- `GET /counters/organization/{orgId}` - Get counter desks
- `POST /counters` - Add counter desk
- `PUT /counters/{id}` - Update counter status (OPEN / CLOSED)

## 4. Queue & Token Engine
- `POST /queue/join` - Customer joins service queue
- `GET /queue/organization/{orgId}/service/{serviceId}/status` - Live wait estimate & queue depth
- `POST /queue/counter/{counterId}/serve-next` - Desk staff calls next token
- `POST /queue/{id}/complete` - Mark service complete
- `POST /queue/{id}/hold` - Pause token (delay arrival)
- `POST /queue/{id}/rejoin` - Rejoin active queue
- `POST /queue/{id}/skip` - Skip no-show token
- `GET /queue/user/{userId}/history` - Customer token visit history
- `GET /queue/organization/{orgId}/tokens` - All tokens for organization
- `GET /queue/organization/{orgId}/analytics` - Aggregated queue performance metrics
