# Implementation Plan
## Employee Support Ticket Management System

This document outlines the step-by-step implementation plan for the **Employee Support Ticket Management System**, based strictly on the approved [product-prompt.md](file:///c:/Users/pinap/OneDrive/Desktop/employee-support-ticket-app/product-prompt.md) and [specification.md](file:///c:/Users/pinap/OneDrive/Desktop/employee-support-ticket-app/specification.md).

---

## Technical Stack & Architectural Guidelines
- **Frontend:** React 18+, TypeScript, Vite.
- **Backend:** Java 17+, Spring Boot 3.x (Spring Web, Spring Data JPA, Jakarta Validation).
- **Database:** MySQL 8.x.
- **Architecture:** Layered Architecture (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`).
- **Simplicity Constraints:** No Spring Security, no JWT, no OAuth, no Docker, no search/sorting/filtering complexity.

---

## Phase Overview

| Phase | Title | Focus Area |
| :---: | :--- | :--- |
| **1** | Project Scaffolding & Directory Setup | Workspace initialization for backend and frontend |
| **2** | MySQL Database Configuration & JPA Entity Modeling | Database connectivity, Enums, Converters, Entities |
| **3** | Database Seeding (Company Training Tickets) | Pre-populating the 5 sample training tickets |
| **4** | Demo Identity Validation & Interceptor Layer | `X-User-Id` / `X-User-Role` validation and error handling |
| **5** | Backend Repositories, Services, and REST Controllers | Core business rules, CRUD, sequential status updates, comments |
| **6** | Frontend Setup & Demo Persona Context | Vite setup, Axios client with interceptors, Persona switcher |
| **7** | Frontend Ticket List & Ticket Details Views | Scoped ticket list rendering, detail view, comment feed |
| **8** | Frontend Ticket Creation & Editing Workflows | Employee ticket form, validation, closure immutability |
| **9** | Frontend Status Management Workflow | Support Staff sequential transition controls |
| **10** | Frontend Commenting Feature | Comment submission and rendering for both roles |
| **11** | End-to-End Acceptance Verification | Acceptance criteria validation across all test scenarios |

---

## Detailed Implementation Phases

### Phase 1: Project Scaffolding & Directory Setup

#### 1. Objective
Establish the project workspace containing two distinct, lightweight projects: a Java Spring Boot backend managed with Maven and a React TypeScript Vite frontend using standard CSS.

#### 2. Expected Files & Structure
```
employee-support-ticket-app/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/company/ticketsystem/TicketApplication.java
│       └── main/resources/application.properties
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        └── index.css
```

#### 3. Backend Tasks
- Initialize Spring Boot 3.x project using Java 17+ with Maven.
- Include dependencies in `pom.xml`: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `mysql-connector-j`, `spring-boot-starter-validation`.
- Create the primary entry point `TicketApplication.java`.

#### 4. Frontend Tasks
- Initialize Vite project using the `react-ts` template.
- Keep dependencies minimal: install only `axios` for HTTP communication.
- Use standard CSS (`index.css` / CSS modules); do not install external CSS frameworks or UI component libraries.

#### 5. Database Tasks
- Verify local MySQL 8.x service is active and create database schema:
  ```sql
  CREATE DATABASE IF NOT EXISTS ticket_db;
  ```

#### 6. Dependencies
- None.

#### 7. Verification Method
- **Backend:** Run `./mvnw spring-boot:run` and verify application boots on port `8080`.
- **Frontend:** Run `npm install` and `npm run dev` and verify Vite dev server starts on port `5173`.

---

### Phase 2: MySQL Database Configuration & JPA Entity Modeling

#### 1. Objective
Establish MySQL connectivity and define data models, Java Enums with exact display mapping, JPA converters, and Hibernate entity mappings for `Ticket` and `Comment`.

#### 2. Expected Files to Create/Modify
- `backend/src/main/resources/application.properties`
- `backend/src/main/java/com/company/ticketsystem/model/Category.java`
- `backend/src/main/java/com/company/ticketsystem/model/Priority.java`
- `backend/src/main/java/com/company/ticketsystem/model/Status.java`
- `backend/src/main/java/com/company/ticketsystem/model/Role.java`
- `backend/src/main/java/com/company/ticketsystem/model/StatusConverter.java`
- `backend/src/main/java/com/company/ticketsystem/entity/Ticket.java`
- `backend/src/main/java/com/company/ticketsystem/entity/Comment.java`

#### 3. Backend Tasks
- Configure `application.properties`:
  - `spring.datasource.url=jdbc:mysql://localhost:3306/ticket_db?createDatabaseIfNotExist=true&useSSL=false`
  - `spring.datasource.username=root` (or local user)
  - `spring.datasource.password=...`
  - `spring.jpa.hibernate.ddl-auto=update`
  - `spring.jpa.show-sql=true`
- Define Enum `Status` with valid Java constants `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` mapped to display strings (`"Open"`, `"In Progress"`, `"Resolved"`, `"Closed"`) via `@JsonValue` and `@JsonCreator`.
- Implement `StatusConverter` implementing `AttributeConverter<Status, String>` with `@Converter(autoApply = true)`.
- Define Enums `Category`, `Priority`, and `Role`.
- Implement `Ticket` entity with validation annotations (`@NotBlank`, `@Size(max=100)`, `@NotNull`) and automatic timestamps (`@PrePersist`, `@PreUpdate`).
- Implement `Comment` entity with foreign key relationship to `Ticket`.

#### 4. Frontend Tasks
- None.

#### 5. Database Tasks
- Verify JPA generates `tickets` and `comments` tables in MySQL with correct column constraints, types, and foreign keys.

#### 6. Dependencies
- Phase 1 must be complete.

#### 7. Verification Method
- Start the Spring Boot application.
- Inspect MySQL CLI / Workbench: `DESCRIBE tickets;` and `DESCRIBE comments;` to verify columns and data types.

---

### Phase 3: Database Seeding (Company Training Tickets)

#### 1. Objective
Automatically seed the exact five company training tickets into the MySQL database at application startup, using simple demo placeholders for required non-supplied fields.

#### 2. Expected Files to Create/Modify
- `backend/src/main/java/com/company/ticketsystem/config/DatabaseSeeder.java` (or `src/main/resources/data.sql`)

#### 3. Backend Tasks
- Implement a `CommandLineRunner` or SQL seed script checking if `Ticket` table is empty.
- Insert the exact 5 tickets:
  1. Title: `Laptop not charging`, Category: `Hardware`, Priority: `High`, Status: `OPEN`, CreatedBy: `alice.employee`
  2. Title: `Cannot log in to VPN`, Category: `Network`, Priority: `High`, Status: `IN_PROGRESS`, CreatedBy: `alice.employee`
  3. Title: `Need access to the shared project folder`, Category: `Access`, Priority: `Medium`, Status: `OPEN`, CreatedBy: `charlie.employee`
  4. Title: `Excel keeps crashing on startup`, Category: `Software`, Priority: `Medium`, Status: `RESOLVED`, CreatedBy: `charlie.employee`
  5. Title: `Request a second monitor`, Category: `Hardware`, Priority: `Low`, Status: `CLOSED`, CreatedBy: `alice.employee`

#### 4. Frontend Tasks
- None.

#### 5. Database Tasks
- Verify 5 rows exist in `tickets` table upon startup with exact categories, priorities, statuses, and demo values.

#### 6. Dependencies
- Phase 2 must be complete.

#### 7. Verification Method
- Execute MySQL query:
  ```sql
  SELECT id, title, category, priority, status, created_by FROM tickets;
  ```
- Confirm all 5 training tickets are present with their exact attributes.

---

### Phase 4: Demo Identity Validation & Interceptor Layer

#### 1. Objective
Implement a lightweight identity validation mechanism that verifies `X-User-Id` and `X-User-Role` against the three predefined demo personas, rejecting invalid or missing headers with HTTP `400 Bad Request`.

#### 2. Expected Files to Create/Modify
- `backend/src/main/java/com/company/ticketsystem/config/DemoUserInterceptor.java`
- `backend/src/main/java/com/company/ticketsystem/config/WebMvcConfig.java`
- `backend/src/main/java/com/company/ticketsystem/dto/UserContext.java`
- `backend/src/main/java/com/company/ticketsystem/dto/ErrorResponse.java`
- `backend/src/main/java/com/company/ticketsystem/exception/GlobalExceptionHandler.java`

#### 3. Backend Tasks
- Define demo personas in `DemoUserInterceptor`:
  - `alice.employee` $\rightarrow$ `EMPLOYEE`
  - `charlie.employee` $\rightarrow$ `EMPLOYEE`
  - `bob.support` $\rightarrow$ `SUPPORT_STAFF`
- In `preHandle()`:
  - **Exclude OPTIONS Preflight:** Check if the HTTP method is `OPTIONS` (CORS preflight); if so, return `true` immediately to permit preflight requests without requiring headers.
  - **Identity Validation for Actual Requests:** For all actual API requests (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`):
    - Check for presence of `X-User-Id` and `X-User-Role`. If missing or blank $\rightarrow$ throw exception returning HTTP `400 Bad Request`.
    - Validate username exists in predefined map. If unknown $\rightarrow$ throw exception returning HTTP `400 Bad Request`.
    - Validate role matches predefined role for that user. If mismatched $\rightarrow$ throw exception returning HTTP `400 Bad Request`.
    - Attach validated identity to request attributes for downstream controller/service access.
- Implement `GlobalExceptionHandler` with `@RestControllerAdvice` to format all errors uniformly (`timestamp`, `status`, `error`, `message`, `path`).

#### 4. Frontend Tasks
- None.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 2 must be complete.

#### 7. Verification Method
- Test endpoint via curl or PowerShell:
  - OPTIONS preflight without headers: `curl -i -X OPTIONS http://localhost:8080/api/tickets` $\rightarrow$ HTTP `200 OK` (preflight allowed).
  - Missing headers on actual request: `curl -i http://localhost:8080/api/tickets` $\rightarrow$ HTTP `400 Bad Request`.
  - Unknown user: `curl -i -H "X-User-Id: unknown" -H "X-User-Role: EMPLOYEE" http://localhost:8080/api/tickets` $\rightarrow$ HTTP `400 Bad Request`.
  - Mismatched role: `curl -i -H "X-User-Id: alice.employee" -H "X-User-Role: SUPPORT_STAFF" http://localhost:8080/api/tickets` $\rightarrow$ HTTP `400 Bad Request`.
  - Valid headers: `curl -i -H "X-User-Id: alice.employee" -H "X-User-Role: EMPLOYEE" http://localhost:8080/api/tickets` $\rightarrow$ HTTP `200 OK`.

---

### Phase 5: Backend Repositories, Services, and REST Controllers

#### 1. Objective
Implement data access, core business logic, and REST controllers for tickets and comments, enforcing all four mandatory business rules and the sequential status workflow.

#### 2. Expected Files to Create/Modify
- `backend/src/main/java/com/company/ticketsystem/repository/TicketRepository.java`
- `backend/src/main/java/com/company/ticketsystem/repository/CommentRepository.java`
- `backend/src/main/java/com/company/ticketsystem/dto/TicketRequestDto.java`
- `backend/src/main/java/com/company/ticketsystem/dto/StatusUpdateDto.java`
- `backend/src/main/java/com/company/ticketsystem/dto/CommentRequestDto.java`
- `backend/src/main/java/com/company/ticketsystem/service/TicketService.java`
- `backend/src/main/java/com/company/ticketsystem/controller/TicketController.java`
- `backend/src/main/java/com/company/ticketsystem/controller/CommentController.java`

#### 3. Backend Tasks
- **Repositories:**
  - `TicketRepository`: `findAllByOrderByCreatedAtDesc()`, `findByCreatedByOrderByCreatedAtDesc(String createdBy)`.
  - `CommentRepository`: `findByTicketIdOrderByCreatedAtAsc(Long ticketId)`.
- **TicketService Business Rules Implementation:**
  - `getTickets(user, role)`: Returns own tickets if `EMPLOYEE`; returns all if `SUPPORT_STAFF` (**BR-02**).
  - `createTicket(dto, user, role)`: Rejects with `403 Forbidden` if role is `SUPPORT_STAFF`. Validates non-empty title ($\le 100$) and description (**BR-04**). Sets status to `OPEN`.
  - `getTicketById(id, user, role)`: Validates ownership for employees; returns `403 Forbidden` if employee views another's ticket (**BR-02**).
  - `updateTicket(id, dto, user, role)`: Only employees can edit own ticket. Rejects with `400 Bad Request` if ticket status is `CLOSED` (**BR-03**).
  - `updateStatus(id, newStatus, user, role)`: Rejects with `403 Forbidden` if role is not `SUPPORT_STAFF` (**BR-01**). Validates sequential transition:
    - `OPEN` $\rightarrow$ `IN_PROGRESS`
    - `IN_PROGRESS` $\rightarrow$ `RESOLVED`
    - `RESOLVED` $\rightarrow$ `CLOSED`
    - Any skip or backward move rejects with `400 Bad Request`.
  - `getComments(ticketId, user, role)`: Validates ticket existence (else `404 Not Found`). Enforces ticket ownership authorization: employees can retrieve comments only for their own tickets (`ticket.createdBy == user`); support staff can retrieve comments for all tickets. Unauthorized employee access returns HTTP `403 Forbidden` (**BR-02**).
  - `addComment(ticketId, dto, user, role)`: Validates ticket existence (else `404 Not Found`). Permits comments on any ticket for Support Staff, and on own tickets for Employees (unauthorized employee access returns `403 Forbidden`). Explicitly permits comments when ticket is `CLOSED` (**BR-03**). Rejects blank content with `400 Bad Request`.
- **Controllers:**
  - `TicketController`: Expose `GET /api/tickets`, `POST /api/tickets`, `GET /api/tickets/{id}`, `PUT /api/tickets/{id}`, `PATCH /api/tickets/{id}/status`.
  - `CommentController`: Expose `GET /api/tickets/{id}/comments`, `POST /api/tickets/{id}/comments`.

#### 4. Frontend Tasks
- None.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 4 must be complete.

#### 7. Verification Method
- Execute curl / automated requests testing:
  - `POST /api/tickets` as `alice.employee` $\rightarrow$ `201 Created`.
  - `POST /api/tickets` as `bob.support` $\rightarrow$ `403 Forbidden`.
  - `PATCH /api/tickets/1/status` with `{"status": "Closed"}` (jumping from Open) $\rightarrow$ `400 Bad Request`.
  - `PATCH /api/tickets/1/status` with `{"status": "In Progress"}` by `bob.support` $\rightarrow$ `200 OK`.
  - `PUT /api/tickets/5` (Closed ticket) by `alice.employee` $\rightarrow$ `400 Bad Request`.
  - `GET /api/tickets/1/comments` by `charlie.employee` (ticket created by Alice) $\rightarrow$ `403 Forbidden`.
  - `GET /api/tickets/1/comments` by `bob.support` $\rightarrow$ `200 OK`.
  - `POST /api/tickets/5/comments` on closed ticket $\rightarrow$ `201 Created`.

---

### Phase 6: Frontend Setup & Demo Persona Context

#### 1. Objective
Establish the React TypeScript frontend application, configure global demo persona state, and set up an Axios HTTP client that attaches `X-User-Id` and `X-User-Role` headers automatically.

#### 2. Expected Files to Create/Modify
- `frontend/src/types/index.ts`
- `frontend/src/context/UserContext.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/components/Header.tsx`
- `frontend/src/App.tsx`

#### 3. Backend Tasks
- Enable CORS in Spring Boot configuration (`@CrossOrigin` or `WebMvcConfigurer`) allowing requests from `http://localhost:5173`.

#### 4. Frontend Tasks
- Define TypeScript types: `Ticket`, `Comment`, `Category`, `Priority`, `Status`, `Role`, `UserPersona`.
- Create `UserContext` providing:
  - Current persona (defaults to `alice.employee`).
  - Available personas list (`alice.employee`, `charlie.employee`, `bob.support`).
  - Function to switch active persona.
- Configure Axios instance in `api.ts` with request interceptor attaching current `X-User-Id` and `X-User-Role` from active context.
- Create `Header` component with:
  - System title: "Employee Support Ticket Management System".
  - Dropdown/switcher to toggle between the 3 demo personas with current role badge.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 1 and Phase 4 must be complete.

#### 7. Verification Method
- Run frontend; observe header showing active persona dropdown.
- Switch persona to `bob.support`; inspect browser developer console network tab to confirm headers update to `X-User-Id: bob.support` and `X-User-Role: SUPPORT_STAFF`.

---

### Phase 7: Frontend Ticket List & Ticket Details Views

#### 1. Objective
Build the simple ticket list view and ticket details modal/page, strictly observing role-based scoping (employees see only their own tickets; support staff see all tickets).

#### 2. Expected Files to Create/Modify
- `frontend/src/components/TicketList.tsx`
- `frontend/src/components/TicketDetails.tsx`
- `frontend/src/components/StatusBadge.tsx`
- `frontend/src/App.tsx`

#### 3. Backend Tasks
- None.

#### 4. Frontend Tasks
- **TicketList Component:**
  - Calls `GET /api/tickets`.
  - Renders a clean table/list: ID, Title, Category, Priority, Status, Created By, Created Date.
  - No search bar, no filters, no sorting controls.
  - Clicking a ticket opens its detail view.
- **TicketDetails Component:**
  - Displays complete ticket metadata: Title, Description, Category, Priority, Status, Created By, Created At, Updated At.
  - Automatically re-fetches when active persona switches in `Header`.
- **StatusBadge Component:**
  - Visual status pill styled according to `Open`, `In Progress`, `Resolved`, `Closed`.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 5 and Phase 6 must be complete.

#### 7. Verification Method
- Select `alice.employee`: List displays only tickets created by Alice.
- Select `charlie.employee`: List displays only tickets created by Charlie.
- Select `bob.support`: List displays all 5 tickets from all employees.
- Click any ticket: Complete details render accurately.

---

### Phase 8: Frontend Ticket Creation & Editing Workflows

#### 1. Objective
Implement ticket creation for employees and ticket editing for non-closed tickets, disabling creation for support staff and disabling editing on closed tickets.

#### 2. Expected Files to Create/Modify
- `frontend/src/components/TicketCreateModal.tsx`
- `frontend/src/components/TicketEditModal.tsx`
- `frontend/src/components/TicketDetails.tsx`

#### 3. Backend Tasks
- None.

#### 4. Frontend Tasks
- **TicketCreateModal:**
  - Button "New Ticket" visible strictly when active persona is an `EMPLOYEE`.
  - Form fields: Title (with 100 character max counter), Description, Category dropdown, Priority dropdown.
  - Client-side validation: Blocks submission if title or description is empty.
  - On submit: Calls `POST /api/tickets`, refreshes ticket list, closes modal.
- **TicketEditModal / Edit Mode:**
  - "Edit Ticket" button displayed in `TicketDetails` only if active user is the creator AND status is not `Closed`.
  - If status is `Closed`, UI displays a locked indicator: "Closed tickets cannot be edited".
  - Submits updates via `PUT /api/tickets/{id}`.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 7 must be complete.

#### 7. Verification Method
- As `alice.employee`:
  - Create a new ticket $\rightarrow$ appears immediately in list with `Open` status.
  - Open ticket #1 $\rightarrow$ edit description $\rightarrow$ changes save and update UI.
  - Open closed ticket #5 $\rightarrow$ edit button is disabled/hidden.
- Switch to `bob.support`:
  - "New Ticket" button is not rendered.

---

### Phase 9: Frontend Status Management Workflow

#### 1. Objective
Provide Support Staff with the exclusive ability to update ticket status strictly along the sequential path (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`).

#### 2. Expected Files to Create/Modify
- `frontend/src/components/StatusTransitionControl.tsx`
- `frontend/src/components/TicketDetails.tsx`

#### 3. Backend Tasks
- None.

#### 4. Frontend Tasks
- Create `StatusTransitionControl` embedded in `TicketDetails`:
  - Completely hidden or omitted when active persona is `EMPLOYEE`.
  - Visible only when active persona is `SUPPORT_STAFF`.
  - Renders a button to advance to the next valid sequential state:
    - If `Open` $\rightarrow$ Action: "Mark In Progress"
    - If `In Progress` $\rightarrow$ Action: "Mark Resolved"
    - If `Resolved` $\rightarrow$ Action: "Close Ticket"
    - If `Closed` $\rightarrow$ No actions available (ticket is finalized).
  - Triggers `PATCH /api/tickets/{id}/status` with the designated next status.
  - Displays error banner if backend rejects transition.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 7 must be complete.

#### 7. Verification Method
- Login as `bob.support`:
  - Open Ticket #1 (`Open`) $\rightarrow$ Click "Mark In Progress" $\rightarrow$ Status updates to `In Progress`.
  - Open Ticket #2 (`In Progress`) $\rightarrow$ Click "Mark Resolved" $\rightarrow$ Status updates to `Resolved`.
  - Open Ticket #4 (`Resolved`) $\rightarrow$ Click "Close Ticket" $\rightarrow$ Status updates to `Closed`.
  - Open Ticket #5 (`Closed`) $\rightarrow$ Verify no status transition actions are rendered.
- Switch to `alice.employee`:
  - Inspect Ticket #1 $\rightarrow$ Verify status transition controls are not visible.

---

### Phase 10: Frontend Commenting Feature

#### 1. Objective
Implement the commenting system in the ticket detail view, allowing employees to comment on their own tickets and support staff to comment on any ticket, including when the ticket is closed.

#### 2. Expected Files to Create/Modify
- `frontend/src/components/CommentSection.tsx`
- `frontend/src/components/TicketDetails.tsx`

#### 3. Backend Tasks
- None.

#### 4. Frontend Tasks
- **CommentSection Component:**
  - Displays comments in chronological order with author name, role badge (`EMPLOYEE` vs `SUPPORT_STAFF`), and timestamp.
  - Comment input box with "Add Comment" button.
  - Validates non-empty input before sending `POST /api/tickets/{id}/comments`.
  - Fully enabled on all tickets including `Closed` tickets.

#### 5. Database Tasks
- None.

#### 6. Dependencies
- Phase 7 must be complete.

#### 7. Verification Method
- As `bob.support`: Post a comment on Ticket #1 $\rightarrow$ Comment appears immediately with `SUPPORT_STAFF` badge.
- As `alice.employee`: Open closed Ticket #5 $\rightarrow$ Post a comment $\rightarrow$ Comment saves and appears with `EMPLOYEE` badge.
- Attempt to post a blank comment $\rightarrow$ UI blocks submission with validation prompt.

---

### Phase 11: End-to-End Acceptance Verification

#### 1. Objective
Execute comprehensive system verification against all acceptance criteria defined in [specification.md](file:///c:/Users/pinap/OneDrive/Desktop/employee-support-ticket-app/specification.md) to ensure 100% compliance with business rules and constraints.

#### 2. Verification Checklist Matrix

| Test ID | Test Scenario | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :---: |
| **TC-01** | Header persona switching | Toggles active identity between `alice.employee`, `charlie.employee`, and `bob.support`. | Pending |
| **TC-02** | Missing / invalid headers | Direct API calls without headers or with unknown user return HTTP `400 Bad Request`. | Pending |
| **TC-03** | Employee ticket scoping | `alice.employee` sees only Alice's tickets; `charlie.employee` sees only Charlie's. | Pending |
| **TC-04** | Support Staff queue visibility | `bob.support` sees all tickets submitted by all employees. | Pending |
| **TC-05** | Employee creates ticket | Ticket created with status `Open`, creator set to employee, HTTP `201 Created`. | Pending |
| **TC-06** | Support Staff ticket creation block | Support staff has no UI to create tickets; API call returns HTTP `403 Forbidden`. | Pending |
| **TC-07** | Mandatory title/description check | Empty title or description rejected with HTTP `400 Bad Request`. | Pending |
| **TC-08** | Title length validation | Title exceeding 100 characters rejected with HTTP `400 Bad Request`. | Pending |
| **TC-09** | Closed ticket editing immutability | Editing closed ticket #5 is blocked in UI; API call returns HTTP `400 Bad Request`. | Pending |
| **TC-10** | Employee status update block | Status controls hidden for employees; API call returns HTTP `403 Forbidden`. | Pending |
| **TC-11** | Sequential status transitions | Transitions advance strictly: `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`. | Pending |
| **TC-12** | Non-sequential status transition block | Attempting to transition `OPEN` directly to `CLOSED` returns HTTP `400 Bad Request`. | Pending |
| **TC-13** | Comments on closed tickets | Comments successfully posted and displayed on closed ticket #5. | Pending |
| **TC-14** | Cross-employee comment block | Employee cannot view or comment on another employee's ticket (returns `403 Forbidden`). | Pending |
| **TC-15** | Valid user ID with invalid role | Calling API with `X-User-Id: alice.employee` and `X-User-Role: ADMIN` returns HTTP `400 Bad Request`. | Pending |

#### 3. Dependencies
- All prior phases (Phases 1 through 10) must be complete.

#### 4. Verification Method
- Execute the 15 test scenarios systematically in a live browser session and automated API checks, and record verification results.

