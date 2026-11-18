# Software Specification Document
## Employee Support Ticket Management System

---

## 1. System Overview & Context

### 1.1 Purpose
The **Employee Support Ticket Management System** is a lightweight web application designed for a lab project. It provides workplace employees with a direct channel to report technical issues, monitor ticket progress, and communicate with support staff. Concurrently, it provides IT support staff with a centralized queue to triage, update status, and communicate resolution steps.

### 1.2 Technology Architecture
- **Frontend:** React (v18+) with TypeScript, built with Vite.
- **Backend:** Java (v17+) with Spring Boot (v3.x), following a standard layered architecture (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`).
- **Database Access:** Spring Data JPA with Hibernate ORM.
- **Database:** MySQL (v8.x).
- **Communication Protocol:** RESTful JSON APIs over HTTP.

---

## 2. Demo User Management & Role-Selection Specification

To adhere strictly to project constraints, no complex security infrastructure (such as Spring Security, JWT, OAuth, or password hashing) will be introduced. User authentication is replaced by a lightweight **demo role-selection mechanism**.

> [!WARNING]
> **Lab Demonstration Only — No Production Security:**
> The `X-User-Id` and `X-User-Role` headers are intended exclusively for local lab demonstration and simulated role-switching. They do **not** provide real authentication, cryptographic verification, or production-grade security.

### 2.1 Predefined Demo Personas

The system recognizes strictly the following three demo personas:

| Username / Identifier | Display Name | Role | Scope of Access |
| :--- | :--- | :--- | :--- |
| `alice.employee` | Alice Walker | `EMPLOYEE` | Can create tickets; can view/edit/comment only on own tickets. |
| `charlie.employee` | Charlie Davis | `EMPLOYEE` | Can create tickets; can view/edit/comment only on own tickets. |
| `bob.support` | Bob Tech | `SUPPORT_STAFF` | Cannot create tickets; can view all tickets, update statuses, and comment on any ticket. |

### 2.2 Role-Selection Behavior
- The frontend UI features a persistent user/role switcher (e.g., a dropdown in the top navigation bar).
- Switching the active persona immediately updates the active user context in frontend state.
- **HTTP Header Protocol:** For every backend API request, the frontend transmits two standardized HTTP headers representing the active demo identity:
  - `X-User-Id`: Current username (`alice.employee`, `charlie.employee`, or `bob.support`).
  - `X-User-Role`: Current role enum (`EMPLOYEE` or `SUPPORT_STAFF`).

### 2.3 Demo Identity Validation & Missing/Invalid Header Handling
The backend validates these headers on every incoming API request (using a simple Spring `HandlerInterceptor` or controller check, without any security frameworks) against the predefined demo personas:

1. **Missing Headers:** If `X-User-Id` or `X-User-Role` is absent, null, or blank, the backend rejects the request with HTTP `400 Bad Request` (`"Missing required demo identity headers: X-User-Id and X-User-Role"`).
2. **Unknown User ID:** If `X-User-Id` is not one of the three predefined usernames (`alice.employee`, `charlie.employee`, `bob.support`), the backend rejects the request with HTTP `400 Bad Request` (`"Unknown demo user ID"`).
3. **Invalid Role:** If `X-User-Role` does not match `EMPLOYEE` or `SUPPORT_STAFF`, the backend rejects the request with HTTP `400 Bad Request` (`"Invalid role specified"`).
4. **Mismatched User-Role Pair:** If the provided role does not match the predefined role for that user ID (e.g., `X-User-Id: alice.employee` sent with `X-User-Role: SUPPORT_STAFF`, or `bob.support` sent with `EMPLOYEE`), the backend rejects the request with HTTP `400 Bad Request` (`"Mismatched user and role for demo persona"`).

---

## 3. Functional Requirements

### 3.1 Employee Role Requirements
- **FR-EMP-01 (Create Ticket):** An employee can submit a new ticket by providing a Title, Description, Category, and Priority. Status defaults to `Open`.
- **FR-EMP-02 (View Own Tickets):** An employee can view a simple list of tickets where `createdBy == X-User-Id`.
- **FR-EMP-03 (View Ticket Details):** An employee can view the complete details of any ticket they created.
- **FR-EMP-04 (Edit Ticket):** An employee can update the Title, Description, Category, or Priority of their own ticket, provided the ticket is not in `Closed` status.
- **FR-EMP-05 (Add Comments):** An employee can post comments on their own tickets at any time, including when the ticket is `Closed`.
- **FR-EMP-06 (Track Status):** An employee can view the current lifecycle status (`Open`, `In Progress`, `Resolved`, `Closed`) of their tickets.
- **FR-EMP-07 (Status Immutability):** An employee **cannot** change the status of any ticket.

### 3.2 Support Staff Role Requirements
- **FR-STF-01 (View All Tickets):** Support staff can view a simple central list of all submitted tickets across all employees.
- **FR-STF-02 (View Ticket Details):** Support staff can view the full details of any ticket.
- **FR-STF-03 (Change Ticket Status):** Support staff have exclusive authority to transition ticket statuses between `Open`, `In Progress`, `Resolved`, and `Closed`.
- **FR-STF-04 (Add Comments):** Support staff can add comments or resolution notes to any ticket at any time, including when the ticket is `Closed`.
- **FR-STF-05 (No Ticket Creation):** Support staff **cannot** create tickets.
- **FR-STF-06 (No Core Info Editing):** Support staff **cannot** edit the original Title, Description, Category, or Priority of an employee's ticket (updates are communicated via status changes and comments).

---

## 4. Mandatory Business Rules & Enforcement

| Rule ID | Rule Statement | Enforcement Layer | Violation Response |
| :--- | :--- | :--- | :--- |
| **BR-01** | **Only support staff can change ticket status, following strict sequential workflow (OPEN $\rightarrow$ IN_PROGRESS $\rightarrow$ RESOLVED $\rightarrow$ CLOSED).** | Backend Service & UI | Return HTTP `403 Forbidden` if `X-User-Role != SUPPORT_STAFF`. If status transition is non-sequential (e.g. `OPEN` directly to `CLOSED` or any backward transition), reject with HTTP `400 Bad Request` ("Invalid status transition from {currentStatus} to {requestedStatus}"). Status dropdown is hidden/disabled for employees in UI. |
| **BR-02** | **Employees can see only their own tickets; support staff can see all tickets.** | Backend Repository Query & Service | Query filters tickets by `createdBy = :userId` when `X-User-Role == EMPLOYEE`. Attempt to access unauthorized ticket details returns HTTP `403 Forbidden`. Support staff query retrieves all records without user filter. |
| **BR-03** | **Closed tickets cannot be edited, but comments can still be added.** | Backend Service & UI | If ticket status is `Closed`, updates to Title, Description, Category, or Priority return HTTP `400 Bad Request` ("Closed tickets cannot be edited"). Comment creation endpoint remains accessible and valid for Closed tickets. |
| **BR-04** | **Title and description cannot be empty.** | Backend Entity Validation & Frontend Form | If `title` or `description` is null, empty string, or whitespace-only, return HTTP `400 Bad Request`. Title exceeding 100 characters returns HTTP `400 Bad Request`. Form submit is prevented on client-side. |

---

## 5. Detailed System Workflows

### 5.1 Ticket Creation Workflow (Employee Only)
1. Employee navigates to "Create Ticket" form.
2. Employee fills in:
   - `Title` (Required, $\le 100$ characters)
   - `Description` (Required)
   - `Category` (Dropdown: `Hardware`, `Software`, `Network`, `Access`, `Other`)
   - `Priority` (Dropdown: `Low`, `Medium`, `High`)
3. Frontend validates non-empty inputs and sends `POST /api/tickets` with headers `X-User-Id` and `X-User-Role: EMPLOYEE`.
4. Backend verifies headers and confirms `X-User-Role == EMPLOYEE`.
5. Backend sets `status = OPEN` (display: `"Open"`), `createdBy = X-User-Id`, `createdAt = now()`, `updatedAt = now()`.
6. Record is persisted in MySQL; backend returns HTTP `201 Created` with created ticket object.
7. Frontend redirects to employee's ticket list view.

### 5.2 Ticket Viewing Workflow
- **Employee View:**
  1. Frontend calls `GET /api/tickets` with `X-User-Id: alice.employee` and `X-User-Role: EMPLOYEE`.
  2. Backend executes `findByCreatedByOrderByCreatedAtDesc("alice.employee")`.
  3. Returns a simple list of tickets owned by Alice.
- **Support Staff View:**
  1. Frontend calls `GET /api/tickets` with `X-User-Id: bob.support` and `X-User-Role: SUPPORT_STAFF`.
  2. Backend executes `findAllByOrderByCreatedAtDesc()`.
  3. Returns a simple list of all tickets across the organization.

### 5.3 Ticket Editing Workflow (Employee Only)
1. Employee opens details of their own ticket.
2. If ticket status is `Closed` (`CLOSED`), edit controls are disabled in the UI.
3. If ticket status is not `Closed`, employee modifies Title, Description, Category, or Priority and clicks "Save".
4. Frontend sends `PUT /api/tickets/{id}`.
5. Backend validates:
   - Ticket exists (else `404 Not Found`).
   - `ticket.createdBy == X-User-Id` (else `403 Forbidden`).
   - `ticket.status != Status.CLOSED` (else `400 Bad Request`).
   - `title` and `description` are valid and non-empty (else `400 Bad Request`).
6. Backend updates fields and sets `updatedAt = now()`.
7. Backend returns HTTP `200 OK` with updated ticket.

### 5.4 Ticket Status-Update Workflow (Support Staff Only)
1. Support Staff views ticket details.
2. UI displays status update controls, presenting only the valid next sequential status or validating selection.
3. Support Staff triggers the status update.
4. Frontend sends `PATCH /api/tickets/{id}/status` with payload (e.g., `{"status": "In Progress"}`) and headers `X-User-Id: bob.support`, `X-User-Role: SUPPORT_STAFF`.
5. Backend validates:
   - `X-User-Role == SUPPORT_STAFF` (else HTTP `403 Forbidden`).
   - Ticket exists (else HTTP `404 Not Found`).
   - Requested status matches a valid Status enum/value (else HTTP `400 Bad Request`).
   - **Strict Sequential Transition Validation:**
     - `OPEN` $\rightarrow$ `IN_PROGRESS`
     - `IN_PROGRESS` $\rightarrow$ `RESOLVED`
     - `RESOLVED` $\rightarrow$ `CLOSED`
     - Tickets in `CLOSED` status cannot undergo further status transitions.
     - Any non-sequential transition (e.g., attempting `OPEN` $\rightarrow$ `CLOSED`, `OPEN` $\rightarrow$ `RESOLVED`, or reverting backwards) is rejected with HTTP `400 Bad Request` (`"Invalid status transition from {currentStatus} to {requestedStatus}. Allowed sequential transitions: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED"`).
6. Backend updates `status` and sets `updatedAt = now()`.
7. Backend returns HTTP `200 OK` with updated ticket.

### 5.5 Commenting Workflow
1. User (Employee on own ticket, or Support Staff on any ticket) enters comment text in the Comment box.
2. User submits comment.
3. Frontend sends `POST /api/tickets/{id}/comments` with payload `{"content": "..."}`.
4. Backend validates:
   - Ticket exists (else `404 Not Found`).
   - If user is Employee, verifies `ticket.createdBy == X-User-Id` (else `403 Forbidden`).
   - `content` is not null or whitespace-only (else `400 Bad Request`).
   - **Note:** Commenting is explicitly permitted even if `ticket.status == Status.CLOSED`.
5. Backend creates comment with `author = X-User-Id`, `authorRole = X-User-Role`, `createdAt = now()`.
6. Backend returns HTTP `201 Created` with saved comment object.

### 5.6 Status State Machine Diagram

```
      +-------------+
      |    OPEN     | ("Open")  <--- Initial state upon Employee creation
      +-------------+
             |
             |  (Support Staff only: strictly next step)
             v
      +-------------+
      | IN_PROGRESS | ("In Progress")
      +-------------+
             |
             |  (Support Staff only: strictly next step)
             v
      +-------------+
      |  RESOLVED   | ("Resolved")
      +-------------+
             |
             |  (Support Staff only: strictly next step)
             v
      +-------------+
      |   CLOSED    | ("Closed") <--- Final state: No further status changes,
      +-------------+                 editing locked, comments still allowed

*Note: Any skipping (e.g., OPEN -> CLOSED) or backward transition is rejected with HTTP 400 Bad Request.*
```

---

## 6. Data Models & Database Specifications

### 6.1 Enumerations

#### `Category`
```java
public enum Category {
    Hardware,
    Software,
    Network,
    Access,
    Other
}
```

#### `Priority`
```java
public enum Priority {
    Low,
    Medium,
    High
}
```

#### `Status`
The Java enum uses valid Java uppercase identifiers (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), while maintaining the exact required display and persistence strings (`"Open"`, `"In Progress"`, `"Resolved"`, `"Closed"`) across the REST API and MySQL database.

```java
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String value;

    Status(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Status fromValue(String text) {
        if (text == null) {
            throw new IllegalArgumentException("Status value cannot be null");
        }
        for (Status s : Status.values()) {
            if (s.value.equalsIgnoreCase(text.trim()) || s.name().equalsIgnoreCase(text.trim())) {
                return s;
            }
        }
        throw new IllegalArgumentException("Invalid status: " + text);
    }
}
```

##### Status Enum Mapping Specification:
1. **REST API Serialization / Deserialization (Jackson):**
   - `@JsonValue` ensures that outgoing JSON payloads serialize the exact display strings: `"Open"`, `"In Progress"`, `"Resolved"`, `"Closed"`.
   - `@JsonCreator` accepts incoming JSON strings matching display values (e.g., `"In Progress"`) or enum constants (`"IN_PROGRESS"`) and deserializes them into the corresponding enum instance.
2. **Database Persistence (JPA AttributeConverter):**
   - A JPA `@Converter(autoApply = true)` maps `Status.OPEN` $\leftrightarrow$ `'Open'`, `Status.IN_PROGRESS` $\leftrightarrow$ `'In Progress'`, `Status.RESOLVED` $\leftrightarrow$ `'Resolved'`, and `Status.CLOSED` $\leftrightarrow$ `'Closed'`.
   - The MySQL database column `status VARCHAR(20)` directly stores the exact strings: `'Open'`, `'In Progress'`, `'Resolved'`, `'Closed'`.
3. **Sequential Transition Helper Method:**
   - The enum or service encapsulates the allowed sequential transition logic:
     - `OPEN` $\rightarrow$ `IN_PROGRESS`
     - `IN_PROGRESS` $\rightarrow$ `RESOLVED`
     - `RESOLVED` $\rightarrow$ `CLOSED`
     - Any other transition is disallowed and rejected with HTTP `400 Bad Request`.

#### `Role`
```java
public enum Role {
    EMPLOYEE,
    SUPPORT_STAFF
}
```

---

### 6.2 Entity: `Ticket` (`tickets` table)

| Column Name | SQL Type | Nullable | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGINT` | No | Auto-Increment (PK) | Unique ticket identifier |
| `title` | `VARCHAR(100)` | No | None | Brief title of issue (max 100 chars, non-blank) |
| `description` | `TEXT` | No | None | Detailed description of issue (non-blank) |
| `category` | `VARCHAR(20)` | No | None | Enum: `Hardware`, `Software`, `Network`, `Access`, `Other` |
| `priority` | `VARCHAR(20)` | No | None | Enum: `Low`, `Medium`, `High` |
| `status` | `VARCHAR(20)` | No | `'Open'` | Enum: `Open`, `In Progress`, `Resolved`, `Closed` |
| `created_by` | `VARCHAR(50)` | No | None | Username of the reporting employee |
| `created_at` | `DATETIME(6)` | No | `CURRENT_TIMESTAMP(6)` | Creation timestamp (immutable) |
| `updated_at` | `DATETIME(6)` | No | `CURRENT_TIMESTAMP(6)` | Last modification timestamp |

---

### 6.3 Entity: `Comment` (`comments` table)

| Column Name | SQL Type | Nullable | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGINT` | No | Auto-Increment (PK) | Unique comment identifier |
| `ticket_id` | `BIGINT` | No | None | FK referencing `tickets(id)` with CASCADE delete |
| `author` | `VARCHAR(50)` | No | None | Username of commenter |
| `author_role` | `VARCHAR(20)` | No | None | Enum: `EMPLOYEE`, `SUPPORT_STAFF` |
| `content` | `TEXT` | No | None | Comment text content (non-blank) |
| `created_at` | `DATETIME(6)` | No | `CURRENT_TIMESTAMP(6)` | Creation timestamp |

---

### 6.4 Sample Data Seeding Specification

The database seed will populate the five sample tickets from the company training material. As established in the PRD, the training material provides strictly **Title, Category, Priority, and Status**. Additional required entity fields use simple demo placeholders assigned at seed time:

| ID | Title | Category | Priority | Status | Demo `description` Placeholder | Demo `createdBy` |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Laptop not charging | `Hardware` | `High` | `Open` | "Laptop not charging issue reported during training." | `alice.employee` |
| 2 | Cannot log in to VPN | `Network` | `High` | `In Progress` | "Cannot log in to VPN issue reported during training." | `alice.employee` |
| 3 | Need access to the shared project folder | `Access` | `Medium` | `Open` | "Need access to the shared project folder issue reported during training." | `charlie.employee` |
| 4 | Excel keeps crashing on startup | `Software` | `Medium` | `Resolved` | "Excel keeps crashing on startup issue reported during training." | `charlie.employee` |
| 5 | Request a second monitor | `Hardware` | `Low` | `Closed` | "Request a second monitor issue reported during training." | `alice.employee` |

*Timestamps (`created_at`, `updated_at`) are automatically set by the application at database seed time. No pre-seeded comments are required.*

---

## 7. REST API Specifications

### 7.1 Common Headers & Demo Identity Protocol
All API requests must include headers representing the active demo identity. As specified in Section 2, these headers are strictly for lab simulation and do not constitute real production security:
- `X-User-Id`: One of `alice.employee`, `charlie.employee`, `bob.support`
- `X-User-Role`: Corresponding role enum (`EMPLOYEE` or `SUPPORT_STAFF`)

*Header Validation:* If either header is missing, unknown, or mismatched with the predefined persona, the backend immediately rejects the request with HTTP `400 Bad Request`.

---

### 7.2 Endpoints Summary

```
GET    /api/tickets                   - Retrieve ticket list (scoped by role)
POST   /api/tickets                   - Create a new ticket (Employee only)
GET    /api/tickets/{id}              - Get ticket details by ID
PUT    /api/tickets/{id}              - Edit ticket core info (Employee only, non-closed)
PATCH  /api/tickets/{id}/status       - Update ticket status (Support Staff only)
GET    /api/tickets/{id}/comments     - Get all comments for a ticket
POST   /api/tickets/{id}/comments     - Post a comment to a ticket
```

---

### 7.3 Detailed Endpoint Contracts

#### 1. `GET /api/tickets`
- **Description:** Retrieve ticket list based on user role.
- **Access:** Employee (returns own tickets) | Support Staff (returns all tickets).
- **Request Parameters:** None (no sorting/filtering).
- **Responses:**
  - `200 OK`: Array of ticket objects.
    ```json
    [
      {
        "id": 1,
        "title": "Laptop not charging",
        "description": "Laptop not charging issue reported during training.",
        "category": "Hardware",
        "priority": "High",
        "status": "Open",
        "createdBy": "alice.employee",
        "createdAt": "2026-11-18T10:00:00",
        "updatedAt": "2026-11-18T10:00:00"
      }
    ]
    ```

---

#### 2. `POST /api/tickets`
- **Description:** Create a new support ticket.
- **Access:** Employee only. If called by `SUPPORT_STAFF`, returns `403 Forbidden`.
- **Request Body:**
  ```json
  {
    "title": "Laptop screen flickering",
    "description": "Screen flickers when external display is connected.",
    "category": "Hardware",
    "priority": "High"
  }
  ```
- **Responses:**
  - `201 Created`: The newly created ticket object (including system-assigned `id`, `status: "Open"`, `createdBy`, `createdAt`, `updatedAt`).
  - `400 Bad Request`: Validation failure (empty title/description, title > 100 chars, invalid category/priority).
  - `403 Forbidden`: Called with `X-User-Role: SUPPORT_STAFF` ("Only employees can create tickets").

---

#### 3. `GET /api/tickets/{id}`
- **Description:** Retrieve details of a specific ticket.
- **Access:** Employee (only if `createdBy == X-User-Id`) | Support Staff (any ticket).
- **Responses:**
  - `200 OK`: Ticket object.
  - `403 Forbidden`: Employee attempting to view another user's ticket.
  - `404 Not Found`: Ticket with `{id}` does not exist.

---

#### 4. `PUT /api/tickets/{id}`
- **Description:** Update core ticket fields.
- **Access:** Employee only (for own ticket). Support Staff cannot edit ticket details.
- **Request Body:**
  ```json
  {
    "title": "Laptop screen flickering intermittently",
    "description": "Updated details: flickers only over HDMI port.",
    "category": "Hardware",
    "priority": "Medium"
  }
  ```
- **Responses:**
  - `200 OK`: Updated ticket object.
  - `400 Bad Request`: Validation error OR ticket status is `Closed` ("Closed tickets cannot be edited").
  - `403 Forbidden`: `X-User-Role != EMPLOYEE` or ticket does not belong to the user.
  - `404 Not Found`: Ticket with `{id}` does not exist.

---

#### 5. `PATCH /api/tickets/{id}/status`
- **Description:** Update ticket status following the strict sequential workflow (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`).
- **Access:** Support Staff only (`X-User-Role: SUPPORT_STAFF`).
- **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Responses:**
  - `200 OK`: Updated ticket object with new status and updated timestamp.
  - `400 Bad Request`: Invalid status value OR invalid non-sequential status transition (e.g. attempting to jump from `Open` directly to `Closed` or `Resolved`, or transition backwards).
  - `403 Forbidden`: Called with `X-User-Role: EMPLOYEE` ("Only support staff can change ticket status").
  - `404 Not Found`: Ticket with `{id}` does not exist.

---

#### 6. `GET /api/tickets/{id}/comments`
- **Description:** Retrieve all comments associated with a ticket in chronological order.
- **Access:** Employee (if own ticket) | Support Staff (all tickets).
- **Responses:**
  - `200 OK`: Array of comment objects.
    ```json
    [
      {
        "id": 1,
        "ticketId": 2,
        "author": "bob.support",
        "authorRole": "SUPPORT_STAFF",
        "content": "Investigating server logs.",
        "createdAt": "2026-11-18T10:15:00"
      }
    ]
    ```
  - `403 Forbidden`: Employee requesting comments of another user's ticket.
  - `404 Not Found`: Ticket does not exist.

---

#### 7. `POST /api/tickets/{id}/comments`
- **Description:** Add a new comment to a ticket.
- **Access:** Employee (own ticket) | Support Staff (any ticket). Allowed even if ticket is `Closed`.
- **Request Body:**
  ```json
  {
    "content": "Additional update regarding the issue."
  }
  ```
- **Responses:**
  - `201 Created`: The saved comment object.
  - `400 Bad Request`: `content` is empty or blank.
  - `403 Forbidden`: Employee attempting to comment on another user's ticket.
  - `404 Not Found`: Ticket does not exist.

---

## 8. Validation Rules & Error Handling

### 8.1 Input Validation Matrix

| Field / Target | Target Endpoints | Validation Rules | Error Response |
| :--- | :--- | :--- | :--- |
| `X-User-Id` (Header) | All endpoints | Required, non-blank; must match one of predefined demo users (`alice.employee`, `charlie.employee`, `bob.support`) | `400 Bad Request` ("Missing required demo identity headers" or "Unknown demo user ID") |
| `X-User-Role` (Header) | All endpoints | Required, non-blank; must match enum (`EMPLOYEE`, `SUPPORT_STAFF`) and match the persona's predefined role | `400 Bad Request` ("Invalid role specified" or "Mismatched user and role for demo persona") |
| `title` | `POST /api/tickets`, `PUT /api/tickets/{id}` | Not null, not blank, length $\le 100$ characters | `400 Bad Request` ("Title is required and must not exceed 100 characters") |
| `description` | `POST /api/tickets`, `PUT /api/tickets/{id}` | Not null, not blank | `400 Bad Request` ("Description is required") |
| `category` | `POST /api/tickets`, `PUT /api/tickets/{id}` | Must match enum: `Hardware`, `Software`, `Network`, `Access`, `Other` | `400 Bad Request` ("Invalid category") |
| `priority` | `POST /api/tickets`, `PUT /api/tickets/{id}` | Must match enum: `Low`, `Medium`, `High` | `400 Bad Request` ("Invalid priority") |
| `status` | `PATCH /api/tickets/{id}/status` | Must match valid status value AND follow strict sequential transition: `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED` | `400 Bad Request` ("Invalid status value" or "Invalid status transition from {current} to {target}") |
| `content` | `POST /api/tickets/{id}/comments` | Not null, not blank | `400 Bad Request` ("Comment content cannot be empty") |

### 8.2 Standard Error Response Payload
When any validation or business rule fails, the backend returns a uniform JSON error structure:

```json
{
  "timestamp": "2026-11-18T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Closed tickets cannot be edited",
  "path": "/api/tickets/5"
}
```

---

## 9. Acceptance Criteria

### Feature 1: Demo Login & Persona Selection
- **AC-1.1:** Given a user accesses the web application, when they inspect the header, then a role/persona selector displays the available demo accounts (`alice.employee`, `charlie.employee`, `bob.support`).
- **AC-1.2:** Given the persona is changed to `bob.support`, when ticket lists are loaded, then the application sends `X-User-Role: SUPPORT_STAFF` and displays all tickets.
- **AC-1.3:** Given the persona is changed to `alice.employee`, when ticket lists are loaded, then the application sends `X-User-Role: EMPLOYEE` and displays only Alice's tickets.
- **AC-1.4:** Given an API request with missing `X-User-Id` or `X-User-Role` headers, then the backend rejects the request with HTTP `400 Bad Request`.
- **AC-1.5:** Given an API request with an unknown user ID or a mismatched user-role pair (e.g., `X-User-Id: alice.employee` with `X-User-Role: SUPPORT_STAFF`), then the backend rejects the request with HTTP `400 Bad Request`.

### Feature 2: Ticket Creation
- **AC-2.1:** Given an employee with persona `alice.employee`, when submitting a ticket with title "Mouse not working", description "Optical sensor died", category `Hardware`, priority `Low`, then the ticket is saved with status `Open`, `createdBy = alice.employee`, and status code `201 Created`.
- **AC-2.2:** Given an employee attempts to submit a ticket with an empty title or description, then submission is rejected with status code `400 Bad Request`.
- **AC-2.3:** Given a support staff persona (`bob.support`), when inspecting the UI, then the "Create Ticket" option is not available; if `POST /api/tickets` is invoked by support staff, then the server returns `403 Forbidden`.

### Feature 3: Ticket Scoping & Viewing
- **AC-3.1:** Given employee `alice.employee`, when viewing the ticket list, then only tickets created by `alice.employee` are returned.
- **AC-3.2:** Given support staff `bob.support`, when viewing the ticket list, then all tickets across all employees are returned.
- **AC-3.3:** Given employee `charlie.employee`, when attempting to view `GET /api/tickets/1` (created by `alice.employee`), then the server returns `403 Forbidden`.

### Feature 4: Ticket Editing & Closed Immutability
- **AC-4.1:** Given an employee `alice.employee` and ticket #1 with status `Open`, when updating the title and description, then the changes are saved and `200 OK` is returned.
- **AC-4.2:** Given an employee `alice.employee` and ticket #5 with status `Closed`, when inspecting the ticket in UI, then edit buttons and fields are disabled.
- **AC-4.3:** Given an attempt to send `PUT /api/tickets/5` for a closed ticket, then the server rejects the request with `400 Bad Request` ("Closed tickets cannot be edited").

### Feature 5: Status Updates
- **AC-5.1:** Given support staff `bob.support`, when changing status of ticket #1 from `Open` to `In Progress`, then the update succeeds with `200 OK`.
- **AC-5.2:** Given an employee `alice.employee`, when inspecting ticket details, then status change controls are not rendered.
- **AC-5.3:** Given an employee invokes `PATCH /api/tickets/1/status`, then the server rejects the request with `403 Forbidden` ("Only support staff can change ticket status").
- **AC-5.4:** Given support staff `bob.support` attempting an invalid or non-sequential status transition (such as jumping from `Open` directly to `Closed` or `Resolved`, or moving backwards), then the server rejects the request with HTTP `400 Bad Request` ("Invalid status transition from {current} to {target}. Allowed sequential transitions: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED").

### Feature 6: Commenting
- **AC-6.1:** Given support staff `bob.support`, when adding a comment to ticket #1, then the comment is saved with author `bob.support`, role `SUPPORT_STAFF`, and code `201 Created`.
- **AC-6.2:** Given an employee `alice.employee`, when adding a comment to their closed ticket #5, then the comment is successfully added with code `201 Created`.
- **AC-6.3:** Given an employee `charlie.employee`, when attempting to comment on ticket #1 (owned by Alice), then the server rejects the request with `403 Forbidden`.
- **AC-6.4:** Given any user submitting a blank comment, then the server rejects the request with `400 Bad Request`.

---

## 10. Architectural Boundaries & Simplicity Constraints

- **No Code Generation:** No application source code or project folders are generated at this phase.
- **No Complex Frameworks:** No Spring Security, no JWT, no OAuth, no password hashing.
- **No Advanced Querying:** No search bar, no sorting controls, no category/priority filters.
- **No Infrastructure Overhead:** No Docker, Docker Compose, or Kubernetes configurations. Standard local execution with Vite dev server, Spring Boot Gradle/Maven runner, and standard local MySQL.

