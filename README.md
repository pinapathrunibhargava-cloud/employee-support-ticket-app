# Employee Support Ticket Management System

A full-stack web application designed to manage employee IT support requests through a centralized ticket management platform. The system allows employees to create, track, update, and comment on support tickets, while support staff can manage tickets, update their statuses, and communicate with employees.

Built using **Spring Boot, React, TypeScript, and MySQL**, the application demonstrates role-based access control, REST API integration, ticket lifecycle management, and a responsive user interface.

---

## 1. Project Overview

The Employee Support Ticket Management System provides a centralized platform for handling internal IT support requests.

Employees can submit support tickets for technical issues, monitor their ticket progress, edit their requests when permitted, and communicate with support staff through comments.

Support staff can view all employee tickets, manage ticket statuses through a predefined workflow, and provide updates through the commenting system.

The application uses a demo identity mechanism to simulate employee and support staff roles for development and demonstration purposes.

### Project Objectives

- Provide a centralized platform for employee IT support requests.
- Simplify ticket creation and tracking.
- Implement role-based access restrictions.
- Manage ticket status transitions through a controlled workflow.
- Enable communication between employees and support staff.
- Maintain ticket information and comment history.
- Demonstrate full-stack application development using modern technologies.

---

## 2. Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot 3.3.5 | Backend application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database operations |
| Hibernate | ORM and persistence |
| Maven | Dependency and build management |
| MySQL | Relational database |

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI development |
| TypeScript | Type-safe JavaScript development |
| Vite 6 | Frontend development and build tool |
| Axios | HTTP communication with backend |
| CSS | Styling and responsive UI |

### Development Tools

- Visual Studio Code / Antigravity IDE
- Git
- GitHub
- MySQL Server
- Postman (API testing)

---

## 3. Key Features

### 3.1 Employee Features

- View personal support tickets.
- Create new support tickets.
- View individual ticket details.
- Edit personal tickets when permitted.
- Track ticket status.
- Add comments to personal tickets.
- View communication history.
- Access the application through an employee persona.

### 3.2 Support Staff Features

- View all employee support tickets.
- Access individual ticket details.
- Update ticket status.
- Follow the predefined ticket lifecycle.
- Add comments to any ticket.
- View existing comments and communication history.
- Manage support requests through a centralized interface.

### 3.3 Ticket Management

Each ticket contains information such as:

- Ticket ID
- Title
- Description
- Category
- Priority
- Status
- Created By
- Created At
- Updated At

### 3.4 Comment Management

The commenting functionality allows employees and support staff to communicate regarding support requests.

Each comment contains:

- Comment ID
- Author
- Author Role
- Comment Content
- Created At
- Associated Ticket ID

The system automatically determines the comment author, role, and timestamp from the validated demo user context.

### 3.5 Professional User Interface

The frontend provides a modern IT Service Management (ITSM) interface with:

- Dashboard-style ticket overview.
- Sidebar navigation.
- Ticket summary cards.
- Status and priority indicators.
- Ticket details and management views.
- Comment timeline.
- Persona-based interface controls.
- Responsive layouts.

---

## 4. User Roles and Permissions

The application supports two primary roles.

| Feature | Employee | Support Staff |
|---|---|---|
| View own tickets | Yes | Yes |
| View all tickets | No | Yes |
| Create tickets | Yes | No |
| Edit own tickets | Yes, when permitted | No |
| Edit other employees' tickets | No | No |
| Update ticket status | No | Yes |
| Comment on own tickets | Yes | Yes |
| Comment on other employees' tickets | No | Yes |
| Comment on closed tickets | Yes, own tickets | Yes |

### Demo User Accounts

The application provides three predefined demo personas.

| User ID | Display Name | Role |
|---|---|---|
| alice.employee | Alice Walker | EMPLOYEE |
| charlie.employee | Charlie Davis | EMPLOYEE |
| bob.support | Bob Tech | SUPPORT_STAFF |

These identities are used for demonstration and testing.

**Note:** The application uses demo identity headers rather than production authentication. It is not intended to provide real-world authentication or security without additional implementation.

---

## 5. Ticket Lifecycle Management

The system follows a sequential ticket status workflow.

```text
       OPEN
         |
         v
    IN_PROGRESS
         |
         v
      RESOLVED
         |
         v
       CLOSED
```

### Status Descriptions

| Status | Description |
|---|---|
| Open | Newly created support request |
| In Progress | Support staff are working on the issue |
| Resolved | The reported issue has been resolved |
| Closed | The ticket lifecycle is completed |

### Business Rules

- Tickets follow the defined sequential workflow.
- Status transitions cannot skip intermediate stages.
- Backward status transitions are not permitted.
- Closed tickets cannot be reopened through the status update operation.
- Employees cannot change ticket statuses.
- Only support staff can manage ticket status transitions.
- Closed ticket core information cannot be edited.
- Comments remain available on closed tickets.

---

## 6. Ticket Categories and Priorities

### Categories

The application supports the following ticket categories:

- Hardware
- Software
- Network
- Access
- Other

### Priorities

| Priority | Description |
|---|---|
| Low | General request with low urgency |
| Medium | Issue requiring normal attention |
| High | Issue requiring higher attention |

---

## 7. Project Architecture

The application follows a frontend-backend architecture.

```text
             USER
              |
              v
     REACT + TYPESCRIPT
          FRONTEND
          Port 5173
              |
              | Axios HTTP Requests
              |
              v
       SPRING BOOT API
          BACKEND
          Port 8080
              |
              v
       SERVICE LAYER
              |
              v
      SPRING DATA JPA
              |
              v
          MYSQL
         DATABASE
```

### Backend Structure

```text
backend/
│
├── pom.xml
│
└── src/
    └── main/
        ├── java/
        │   └── com/company/ticketsystem/
        │       │
        │       ├── TicketApplication.java
        │       │
        │       ├── config/
        │       │   ├── DatabaseSeeder.java
        │       │   ├── DemoUserInterceptor.java
        │       │   └── WebMvcConfig.java
        │       │
        │       ├── controller/
        │       │   ├── TicketController.java
        │       │   └── CommentController.java
        │       │
        │       ├── dto/
        │       │   ├── CommentRequestDto.java
        │       │   ├── ErrorResponse.java
        │       │   ├── StatusUpdateDto.java
        │       │   ├── TicketRequestDto.java
        │       │   └── UserContext.java
        │       │
        │       ├── entity/
        │       │   ├── Comment.java
        │       │   └── Ticket.java
        │       │
        │       ├── exception/
        │       │   ├── BadRequestException.java
        │       │   ├── DemoIdentityException.java
        │       │   ├── ForbiddenException.java
        │       │   ├── GlobalExceptionHandler.java
        │       │   └── ResourceNotFoundException.java
        │       │
        │       ├── model/
        │       │   ├── Category.java
        │       │   ├── Priority.java
        │       │   ├── Role.java
        │       │   ├── Status.java
        │       │   └── StatusConverter.java
        │       │
        │       ├── repository/
        │       │   ├── CommentRepository.java
        │       │   └── TicketRepository.java
        │       │
        │       └── service/
        │           └── TicketService.java
        │
        └── resources/
            └── application.properties
```

### Frontend Structure

```text
frontend/
│
├── package.json
├── package-lock.json
├── index.html
├── tsconfig.json
├── vite.config.ts
│
└── src/
    │
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    │
    ├── api/
    │   ├── client.ts
    │   └── ticketApi.ts
    │
    ├── components/
    │   ├── Header.tsx
    │   ├── Sidebar.tsx
    │   ├── TicketList.tsx
    │   ├── TicketDetail.tsx
    │   ├── TicketCreate.tsx
    │   └── TicketEdit.tsx
    │
    ├── context/
    │   └── PersonaContext.tsx
    │
    ├── types/
    │   └── ticket.ts
    │
    └── vite-env.d.ts
```

---

## 8. Database Configuration

The application uses MySQL as its relational database.

### Database Name

```sql
CREATE DATABASE employee_support_ticket_db;
```

### Database Environment Variables

The backend reads database configuration through environment variables.

| Variable | Description |
|---|---|
| DB_URL | MySQL database connection URL |
| DB_USERNAME | MySQL username |
| DB_PASSWORD | MySQL password |

Example connection URL:

```text
jdbc:mysql://localhost:3306/employee_support_ticket_db
```

The backend configuration is located at:

```text
backend/src/main/resources/application.properties
```

Example configuration:

```properties
spring.application.name=employee-support-ticket-system

spring.datasource.url=${DB_URL:}
spring.datasource.username=${DB_USERNAME:}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
```

### Setting Environment Variables on Windows

Open PowerShell and configure the variables for your current terminal session.

Replace the example values with your own local MySQL configuration.

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/employee_support_ticket_db"
$env:DB_USERNAME="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
```

These environment variables must be set in the terminal session used to start the backend.

**Security Note:** Never upload actual database credentials, `.env` files containing secrets, API keys, or private credentials to GitHub.

---

## 9. Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install the following software:

- Java 17 or later
- Maven
- Node.js and npm
- MySQL Server
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/pinapathrunibhargava-cloud/employee-support-ticket-app.git
```

Navigate to the project directory:

```bash
cd employee-support-ticket-app
```

### Step 2: Create the MySQL Database

Open MySQL Workbench or MySQL Command Line.

Execute:

```sql
CREATE DATABASE employee_support_ticket_db;
```

### Step 3: Configure Database Environment Variables

In PowerShell:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/employee_support_ticket_db"
$env:DB_USERNAME="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
```

Use your actual local MySQL credentials.

### Step 4: Start the Backend

Open a terminal in the project root.

Navigate to the backend directory:

```bash
cd backend
```

Compile the application:

```bash
mvn clean install
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

### Step 5: Start the Frontend

Open another terminal.

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

### Step 6: Access the Application

Open your browser and navigate to:

```text
http://localhost:5173
```

The application can now be used with the predefined demo personas.

---

## 10. REST API Endpoints

The backend exposes RESTful endpoints for ticket and comment management.

Base URL:

```text
http://localhost:8080/api
```

### Ticket APIs

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets` | Retrieve tickets according to the current user's permissions |
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets/{id}` | Retrieve an individual ticket |
| PUT | `/api/tickets/{id}` | Update ticket information |
| PATCH | `/api/tickets/{id}/status` | Update ticket status |

### Comment APIs

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets/{id}/comments` | Retrieve comments for a ticket |
| POST | `/api/tickets/{id}/comments` | Add a comment to a ticket |

### Demo Identity Headers

The application uses the following headers to identify the current demo persona:

```text
X-User-Id
X-User-Role
```

Example:

```http
X-User-Id: alice.employee
X-User-Role: EMPLOYEE
```

Support staff example:

```http
X-User-Id: bob.support
X-User-Role: SUPPORT_STAFF
```

The backend validates these identity headers for API requests.

Invalid or missing demo identities are rejected.

**Important:** These headers simulate identity for demonstration only. They are not a replacement for production authentication.

---

## 11. Sample Ticket Data

The application initializes five sample tickets when the database is empty.

| ID | Ticket Title | Category | Priority | Status | Employee |
|---|---|---|---|---|---|
| 1 | Laptop not charging | Hardware | High | Open | Alice |
| 2 | Cannot log in to VPN | Network | High | In Progress | Alice |
| 3 | Need access to the shared project folder | Access | Medium | Open | Charlie |
| 4 | Excel keeps crashing on startup | Software | Medium | Resolved | Charlie |
| 5 | Request a second monitor | Hardware | Low | Closed | Alice |

The database seeder initializes sample data without repeatedly inserting the same initial records.

---

## 12. Validation and Error Handling

The backend implements request validation and centralized exception handling.

Examples of enforced rules include:

- Ticket title is required and limited to 100 characters.
- Ticket description is required.
- Category and priority must use supported values.
- Empty comments are rejected.
- Employees cannot modify other employees' tickets.
- Employees cannot update ticket statuses.
- Support staff cannot create tickets or edit ticket core fields.
- Closed tickets cannot be edited.
- Invalid status transitions are rejected.
- Invalid demo identities are rejected.

The application uses appropriate HTTP response codes, including:

| HTTP Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created successfully |
| 400 | Invalid request or demo identity |
| 403 | Access forbidden |
| 404 | Resource not found |

---

## 13. Security Considerations

The project demonstrates basic application-level access control and secure configuration practices.

Implemented protections include:

- Demo identity validation through request headers.
- Role-based authorization checks.
- Server-side ownership validation.
- Server-side request validation.
- Centralized exception handling.
- Environment-variable-based database configuration.
- Git ignore rules for local secrets and generated files.

### Important Security Limitation

This is a training and demonstration application.

The demo identity mechanism does not provide real authentication. Since the identity headers can be supplied by a client, this mechanism must not be used as production-grade security.

For production deployment, additional security mechanisms such as Spring Security, proper authentication, secure session or token management, and stronger authorization controls would be required.

---

## 14. Future Enhancements

Possible future improvements include:

- Production authentication and authorization.
- Email notifications.
- Ticket attachments.
- Advanced ticket search and filtering.
- Ticket assignment to support agents.
- Audit logging.
- Reporting and analytics.
- Service-level agreement (SLA) management.
- Automated testing and CI/CD integration.

These are potential enhancements and are not represented as currently implemented features.

---

## 15. Git and GitHub

The project source code is maintained using Git and hosted on GitHub.

**GitHub Repository:**

https://github.com/pinapathrunibhargava-cloud/employee-support-ticket-app

Clone the repository:

```bash
git clone https://github.com/pinapathrunibhargava-cloud/employee-support-ticket-app.git
```

To upload future changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

The `.gitignore` file excludes generated build files, dependencies, and local secret configuration files.

---

## 16. Author

**Project:** Employee Support Ticket Management System

**Development:** Seanergy.ai Training Project

**Technology:** Spring Boot, React, TypeScript, MySQL

**Repository:**  
https://github.com/pinapathrunibhargava-cloud/employee-support-ticket-app

---

## 17. License

This project is developed as a training and demonstration application.

A separate open-source license has not been specified.
