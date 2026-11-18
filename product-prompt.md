# Product Requirements Document (PRD)
## Employee Support Ticket Management System

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Employees need a simple application to report workplace technical issues, track ticket status, and communicate with support staff.

### 1.2 Objective
Develop a simple, clean, and straightforward **Employee Support Ticket Management System** as a lab project. The application enables employees to report workplace technical issues and track them through resolution, while enabling support staff to review all tickets, update their statuses, and communicate with employees via comments.

---

## 2. User Roles & Permissions Matrix

The system provides two distinct user roles with strict separation of responsibilities:

| Feature / Action | Employee | Support Staff |
| :--- | :---: | :---: |
| **Create Ticket** | **Yes** | **No** (Only employees create tickets) |
| **View Ticket List** | Own tickets only | All tickets across organization |
| **View Ticket Details** | Own tickets only | All tickets |
| **Edit Ticket Info (Title, Description, Category, Priority)** | Own tickets (if not Closed) | No (Staff updates status & comments) |
| **Change Ticket Status** | **No** | **Yes** |
| **Add Comments** | Yes (Own tickets, even if Closed) | Yes (All tickets, even if Closed) |

### 2.1 Role: Employee
- **Create Support Tickets:** Submit new workplace technical issues specifying title, description, category, and priority. Support staff cannot create tickets.
- **View Own Submitted Tickets:** Access a simple list view showing exclusively tickets submitted by the logged-in employee.
- **View Ticket Details:** Inspect details of their own tickets.
- **Update Ticket Information:** Edit title, description, category, or priority of their own tickets, provided the ticket is not `Closed`.
- **Add Comments:** Add comments to their own tickets (including `Closed` tickets) to communicate with support staff.
- **Track Ticket Status:** Monitor the current lifecycle status (`Open`, `In Progress`, `Resolved`, `Closed`) of their tickets.

### 2.2 Role: Support Staff
- **View All Submitted Tickets:** Access a simple central list view displaying all tickets submitted by all employees across the organization (no complex sorting or filtering required).
- **View Ticket Details:** Inspect details of any ticket.
- **Change Ticket Status:** Exclusively manage and update ticket status transitions (`Open`, `In Progress`, `Resolved`, `Closed`).
- **Add Comments:** Add comments or resolution remarks to any ticket (including `Closed` tickets).

---

## 3. Ticket Data Model & Field Specifications

### 3.1 Ticket Entity

| Field | Data Type | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- |
| `id` | Long (PK) | Auto-increment, Unique | Primary key identifier for the ticket |
| `title` | String | Required, Non-empty, Max 100 characters | Brief title of the issue |
| `description` | Text | Required, Non-empty | Full description of the issue |
| `category` | Enum | Required; Values: `Hardware`, `Software`, `Network`, `Access`, `Other` | Category of the issue |
| `priority` | Enum | Required; Values: `Low`, `Medium`, `High` | Urgency/priority level |
| `status` | Enum | Required; Default: `Open`; Values: `Open`, `In Progress`, `Resolved`, `Closed` | Current status of the ticket |
| `createdBy` | String | Required, System-assigned | Name/identifier of the employee who submitted the ticket |
| `createdAt` | Timestamp | Required, System-assigned, Immutable | Date and time when the ticket was created |
| `updatedAt` | Timestamp | Required, System-updated | Date and time when the ticket was last updated |

### 3.2 Comment Entity

| Field | Data Type | Constraints & Validation | Description |
| :--- | :--- | :--- | :--- |
| `id` | Long (PK) | Auto-increment, Unique | Primary key identifier for the comment |
| `ticketId` | Long (FK) | Required, References `Ticket(id)` | Foreign key linking comment to its parent ticket |
| `author` | String | Required, System-assigned | Name/identifier of the user adding the comment |
| `authorRole` | Enum | Required; Values: `EMPLOYEE`, `SUPPORT_STAFF` | Role of the commenter |
| `content` | Text | Required, Non-empty | Text of the comment or update note |
| `createdAt` | Timestamp | Required, System-assigned | Date and time when the comment was posted |

---

## 4. Mandatory Business Rules

The following four business rules are mandatory and must be strictly enforced:

1. **Only support staff can change ticket status:**
   - Only users logged in as Support Staff have permission to modify a ticket's status.
   - Employees cannot alter ticket status at any time.

2. **Employees can see only their own tickets; support staff can see all tickets:**
   - An employee's ticket list and detail views are strictly scoped to tickets where `createdBy` matches their identity.
   - Support staff have global visibility to view all tickets in the system.

3. **Closed tickets cannot be edited, but comments can still be added:**
   - Once a ticket's status is `Closed`, its core fields (`title`, `description`, `category`, `priority`) cannot be edited by anyone.
   - However, both employees (for their own tickets) and support staff can continue to post comments on `Closed` tickets.

4. **Title and description cannot be empty:**
   - `title` is mandatory, cannot be empty or whitespace-only, and must not exceed 100 characters.
   - `description` is mandatory and cannot be empty or whitespace-only.

---

## 5. Demo Authentication & Role Selection

To keep the application simple and avoid complex security infrastructure:
- **No Complex Authentication:** Do not implement Spring Security, JWT tokens, OAuth, LDAP, password hashing, or multi-factor authentication.
- **Simple Role Selector / Demo Login:**
  - Provide a simple role switcher or demo user selection in the UI (e.g., a header dropdown or simple login toggle).
  - Pre-configured demo personas:
    - **Employee 1:** `alice.employee` (Employee)
    - **Employee 2:** `charlie.employee` (Employee)
    - **Support Staff:** `bob.support` (Support Staff)
  - Selecting a demo persona simulates logging in as that user, automatically scoping ticket creation and list queries to that user's identity and role.

---

## 6. Status Lifecycle

```
       +------------+
       |    Open    | <--- (Default status upon employee creation)
       +------------+
             |
             v  (Support Staff updates status)
       +------------+
       |In Progress |
       +------------+
             |
             v  (Support Staff updates status)
       +------------+
       |  Resolved  |
       +------------+
             |
             v  (Support Staff updates status)
       +------------+
       |   Closed   | <--- (Editing locked; Comments still allowed)
       +------------+
```

---

## 7. Sample Data (Five Company Training Tickets)

The company training material provides strictly the following information for the five sample tickets:

| # | Title | Category | Priority | Status |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Laptop not charging | Hardware | High | Open |
| 2 | Cannot log in to VPN | Network | High | In Progress |
| 3 | Need access to the shared project folder | Access | Medium | Open |
| 4 | Excel keeps crashing on startup | Software | Medium | Resolved |
| 5 | Request a second monitor | Hardware | Low | Closed |

> [!NOTE]
> **Data Handling for Application Requirements:**
> - The company training material specifies **only** Title, Category, Priority, and Status.
> - For any additional fields required by the application data model (such as `description` and `createdBy`), simple demo-generated placeholder values should be used only where necessary.
> - System-generated timestamps (`createdAt`, `updatedAt`) are automatically assigned by the application at runtime.
> - No comments or employee identities are supplied by the training material.

---

## 8. Technology Stack & Basic Layered Architecture

### 8.1 Technology Stack
- **Frontend:** React, TypeScript, Vite.
- **Backend:** Java Spring Boot.
- **Database:** MySQL.
- **Database Access:** Spring Data JPA.

### 8.2 Basic Layered Backend Architecture
The backend follows a standard, clean layered architecture:
- **Controller Layer:** REST endpoints handling HTTP requests and role/user identity parameters.
- **Service Layer:** Business logic implementation, enforcing the four mandatory business rules.
- **Repository Layer:** Spring Data JPA interfaces for data persistence.
- **Entity Layer:** JPA entities mapping to `tickets` and `comments` tables in MySQL.

### 8.3 RESTful API Endpoints (Simplified)

```
GET    /api/tickets                   - Get tickets (returns own tickets for employee; all tickets for support staff)
POST   /api/tickets                   - Create ticket (Employee only)
GET    /api/tickets/{id}              - Get ticket details (subject to ownership/role check)
PUT    /api/tickets/{id}              - Update ticket info (Employee only; blocked if status is Closed)
PATCH  /api/tickets/{id}/status       - Change ticket status (Support Staff only)
GET    /api/tickets/{id}/comments     - Get comments for a ticket
POST   /api/tickets/{id}/comments     - Add comment (Employee on own ticket or Support Staff on any ticket)
```

---

## 9. Project Scope & Constraints

- **Keep the application simple:** Focus strictly on the core problem statement.
- **No sorting or filtering:** Ticket views display simple lists without complex search, filtering, or sorting logic.
- **No support staff ticket creation:** Only employees can create support tickets.
- **No complex security/infrastructure:** No Docker, Kubernetes, blockchain, OAuth, Spring Security, or external message queues.
- **No unnecessary features:** Omit file attachments, email notifications, analytics dashboards, or third-party integrations.
- **Strict Execution Rules:** No application code or project folder structures are to be generated at this stage.
