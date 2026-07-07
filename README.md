# TaskFlow Board

TaskFlow Board is a full-stack task and project management web application. It helps teams create projects, manage members, assign tasks, track deadlines, update task status, and visualise work using a Kanban board.

The application uses a MERN-based architecture with React on the frontend, Express and Node.js on the backend, and MongoDB Atlas as the database.

---

## Live Application


- **Live Site:** `[https://task-flow-pi-lac.vercel.app/](https://taskflowboardapp.netlify.app/)`
- **Backend API:** [`https://task-flow-pi-lac.vercel.app/`](https://task-flow-pi-lac.vercel.app/)
- **GitHub Repository:** `https://github.com/ipsrepo/TaskFlow_Board`

---

## Main Features

### Authentication and User Management

- User registration and login
- JWT-based authentication
- Password hashing using `bcryptjs`
- Protected routes for authenticated users
- User profile viewing and updating
- Admin user management
- Admin role assignment for users

### Role-Based Access Control

The system has three user roles:

| Role | Permissions |
|---|---|
| Member | View projects, view assigned tasks, update own task status, add comments |
| Lead | Create, edit, and delete projects and tasks; manage project members and status boards |
| Admin | Full system access, including user role management |

### Project Management

- Create projects with name, description, start date, and end date
- View project information and members
- Update project details
- Delete projects
- Add and remove project members
- Project status options: active, on-hold, completed, cancelled

### Task Management

- Create tasks within projects
- Assign tasks to users
- Add task descriptions, priorities, deadlines, and statuses
- Edit and delete tasks
- View personal assigned tasks
- Filter tasks by status and priority
- Mark task progress by updating task status
- Add comments to tasks
- Display overdue task information

### Kanban Board

- Project-specific Kanban board
- Default columns:
    - To Do
    - In Progress
    - Completed
- Create custom status columns
- Edit status board names, colours, and order
- Delete custom status columns
- Drag-and-drop task movement using `@dnd-kit`

### Dashboard

The dashboard changes depending on the logged-in user role:

- **Member dashboard:** Assigned tasks, task deadlines, and personal task overview
- **Lead dashboard:** Project-level task information and project activity
- **Admin dashboard:** User, project, and task-level system overview

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Building the user interface |
| Vite | Frontend build tool and development server |
| React Router DOM | Client-side routing and protected routes |
| Axios | API communication between frontend and backend |
| Tailwind CSS | Responsive styling and UI design |
| `@dnd-kit` | Drag-and-drop Kanban board interactions |
| date-fns | Formatting and handling dates |
| Vitest | Frontend unit testing |
| React Testing Library | Testing React components and user interactions |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Backend web framework |
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose | MongoDB object modelling |
| JSON Web Token | Authentication and authorization |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| Morgan | HTTP request logging |
| Jest | Backend unit testing |
| Nodemon | Automatically restarts backend during development |
| Vercel | Backend cloud deployment |

---

## System Architecture

TaskFlow Board follows a three-layer architecture.

```text
┌──────────────────────────────────────────────┐
│                React Frontend                │
│                                              │
│  Pages, Components, Context API, Services    │
│  React Router, Axios, Tailwind CSS           │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTPS / REST API / JSON
                       ▼
┌──────────────────────────────────────────────┐
│              Node.js + Express API           │
│                                              │
│ Routes → Controllers → Models → Utilities    │
│ JWT Authentication and Role Authorization    │
└──────────────────────┬───────────────────────┘
                       │
                       │ Mongoose
                       ▼
┌──────────────────────────────────────────────┐
│                MongoDB Atlas                 │
│                                              │
│ Users, Projects, Tasks, Comments, Boards     │
└──────────────────────────────────────────────┘
```

---

## Application Flow

```text
User opens the application
        │
        ▼
User registers or logs in
        │
        ▼
Backend validates credentials
        │
        ▼
Backend creates JWT token
        │
        ▼
Frontend stores token in localStorage
        │
        ▼
Axios sends token in Authorization header
        │
        ▼
Backend protects routes using JWT middleware
        │
        ▼
User accesses dashboard, projects, tasks, and Kanban board
```

The frontend sends the JWT in the request header:

```text
Authorization: Bearer <token>
```

---

## Repository Structure

This project uses one repository with separate frontend and backend folders.

```text
TaskFlow_Board/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   ├── handlerFactory.js
│   │   └── errorController.js
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   ├── projectModel.js
│   │   ├── taskModel.js
│   │   └── statusBoardModel.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── mailRoutes.js
│   │
│   ├── utils/
│   │   ├── appError.js
│   │   ├── catchAsync.js
│   │   ├── apiFeatures.js
│   │   └── utils.js
│   │
│   ├── tests/
│   ├── app.js
│   ├── server.js
│   ├── config.env
│   ├── package.json
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Common/
│   │   │   ├── Dashboard/
│   │   │   ├── Kanban/
│   │   │   ├── Projects/
│   │   │   ├── Tasks/
│   │   │   └── UI/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── test/
│   │   ├── index.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## Prerequisites

Install the following before running the project:

- Node.js `20.9.0`
- npm
- MongoDB Atlas account and database cluster
- Git

This project was developed using Node.js `20.9.0`.

Check your current Node.js version:

```bash
node -v
```

If you are using NVM:

```bash
nvm install 20.9.0
nvm use 20.9.0
```

---

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ipsrepo/TaskFlow_Board.git
cd TaskFlow_Board
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a file named `config.env` inside the `backend` folder.

```env
PORT=8000

DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/<DATABASE_NAME>?retryWrites=true&w=majority
DATABASE_PASSWORD=<YOUR_MONGODB_PASSWORD>

JWT_TOKEN=<YOUR_SECRET_JWT_KEY>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

NODE_ENV=development

CLIENT_ORIGIN=http://localhost:5000

GMAIL_USER=<YOUR_EMAIL>
GMAIL_APP_PASSWORD=<YOUR_GMAIL_APP_PASSWORD>
COMPANY_NAME=TaskFlow Board
```

Do not upload `config.env` to GitHub. It contains sensitive information.

### 4. Start the Backend Server

```bash
npm start
```

The backend should run on:

```text
http://localhost:8000
```

The API base URL is:

```text
http://localhost:8000/api/v1
```

### 5. Install Frontend Dependencies

Open another terminal window.

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment Variables

Create or update the `.env` file inside the `frontend` folder.

For local development:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

For production:

```env
VITE_API_URL=https://task-flow-pi-lac.vercel.app/api/v1
```

### 7. Start the Frontend Application

```bash
npm run dev
```

The frontend development server runs on:

```text
http://localhost:5000
```

Open the application in your browser:

```text
http://localhost:5000
```

---

## Available Scripts

### Backend Scripts

Run these commands inside the `backend` directory.

```bash
npm start
```

Starts the backend server using Nodemon.

```bash
npm test
```

Runs backend Jest tests.

```bash
npm run test:watch
```

Runs Jest in watch mode.

```bash
npm run test:coverage
```

Runs backend tests and generates a coverage report.

### Frontend Scripts

Run these commands inside the `frontend` directory.

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates an optimised production build.

```bash
npm run preview
```

Previews the built frontend application locally.

```bash
npm test
```

Runs Vitest in watch mode.

```bash
npm run test:run
```

Runs frontend tests once.

```bash
npm run test:coverage
```

Runs frontend tests and creates a coverage report.

---

## API Endpoints

All endpoints use the following base URL:

```text
/api/v1
```

### Authentication and User Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/users/signup` | Register a new user | Public |
| POST | `/users/login` | Log in and receive a JWT token | Public |
| GET | `/users/profile` | Get current user profile | Authenticated |
| PUT | `/users/profile` | Update current user profile | Authenticated |
| GET | `/users` | Get all users | Authenticated |
| GET | `/users/:id` | Get a user by ID | Authenticated |
| DELETE | `/users/:id` | Delete a user | Authenticated |
| PUT | `/users/:id/role` | Change a user role | Admin only |

### Project Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/projects` | Get all projects | Authenticated |
| POST | `/projects` | Create a new project | Lead/Admin |
| GET | `/projects/:id` | Get one project | Authenticated |
| PUT | `/projects/:id` | Update a project | Lead/Admin |
| DELETE | `/projects/:id` | Delete a project | Lead/Admin |
| POST | `/projects/:id/members` | Add a user to a project | Lead/Admin |
| DELETE | `/projects/:id/members/:userId` | Remove a user from a project | Lead/Admin |
| GET | `/projects/:id/status-boards` | Get project Kanban columns | Authenticated |
| POST | `/projects/:id/status-boards` | Create a custom status board | Lead/Admin |
| PUT | `/projects/:id/status-boards/:boardName` | Update a status board | Lead/Admin |
| DELETE | `/projects/:id/status-boards/:boardName` | Delete a status board | Lead/Admin |

### Task Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/tasks` | Get all tasks | Authenticated |
| POST | `/tasks` | Create a task | Lead/Admin |
| GET | `/tasks/my-tasks` | Get current user's assigned tasks | Authenticated |
| GET | `/tasks/:id` | Get task details | Authenticated |
| PATCH | `/tasks/:id` | Update a task | Lead/Admin |
| DELETE | `/tasks/:id` | Delete a task | Lead/Admin |
| PATCH | `/tasks/:id/status` | Update task status | Assigned user / Creator / Lead / Admin |
| POST | `/tasks/:id/comments` | Add a comment to a task | Authenticated |
| GET | `/tasks/project/:projectId` | Get all tasks for a project | Authenticated |
| GET | `/tasks/project/:projectId/kanban` | Get Kanban board task data | Authenticated |

---

## Example API Request

### User Login

```http
POST /api/v1/users/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Example successful response:

```json
{
  "success": true,
  "token": "jwt-token-value",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "Example User",
      "email": "user@example.com",
      "role": "member"
    }
  }
}
```

---

## Database Models

### User

```text
User
├── name
├── email
├── password
├── avatar
├── role
├── isActive
├── createdAt
└── updatedAt
```

### Project

```text
Project
├── name
├── description
├── leadId
├── members[]
├── status
├── startDate
├── endDate
├── statusBoards[]
├── createdAt
└── updatedAt
```

### Task

```text
Task
├── title
├── description
├── projectId
├── assignedTo
├── createdBy
├── status
├── priority
├── deadline
├── isOverdue
├── comments[]
├── createdAt
└── updatedAt
```

---

## Testing

The project includes frontend and backend unit tests.

### Backend Test Coverage

The backend uses Jest and includes tests for:

- Authentication controller
- Project controller
- Task controller
- User controller
- Generic CRUD handler factory
- Error controller
- API filtering and pagination utility
- Application error utility
- Async error wrapper
- Project status-board helper functions

Latest backend coverage report included in the project:

| Metric | Coverage |
|---|---:|
| Statements | 65.97% |
| Branches | 55.41% |
| Functions | 66.66% |
| Lines | 68.46% |

Run backend coverage:

```bash
cd backend
npm run test:coverage
```

### Frontend Test Coverage

The frontend uses Vitest and React Testing Library.

Tests include:

- Login form behaviour
- Protected route behaviour
- Input component behaviour
- Modal component behaviour
- Authentication context
- Project context
- API service functions
- Token manager utility
- Request and error handler utilities

Latest frontend coverage report included in the project:

| Metric | Coverage |
|---|---:|
| Statements | 89.81% |
| Branches | 77.77% |
| Functions | 86.66% |
| Lines | 89.81% |

Run frontend coverage:

```bash
cd frontend
npm run test:coverage
```

---

## Security Measures Implemented

The current application includes the following security controls:

- JWT authentication for protected API routes
- Password hashing with bcrypt and a cost factor of 12
- Role-based authorization for member, lead, and admin users
- Helmet for HTTP security headers
- CORS middleware for cross-origin requests
- Mongoose schema validation
- Email validation using `validator`
- Password confirmation validation
- Input filtering for profile updates
- Protected frontend routes
- Authorization header handling through Axios interceptors
- `.gitignore` configuration for sensitive environment files

---

## Current Limitations

This project is functional, but it is not yet production-grade. The following limitations should be fixed before treating it as a real commercial application:

- Some API routes rely mainly on role checks and do not fully verify project membership or resource ownership.
- CORS currently allows broad access because `cors()` is used without a strict origin configuration.
- The global error middleware is present in the project but is currently commented out in `app.js`.
- JWT is stored in `localStorage`, which can increase risk if an XSS vulnerability exists.
- There is no refresh-token mechanism or token blacklist.
- There is no password-reset flow.
- Rate-limit and MongoDB sanitisation packages are installed, but they are not currently configured in `app.js`.
- The API does not yet include strong request-level validation middleware for every endpoint.
- Backend integration testing against a separate test database should be added.
- Frontend deployment URL should be added to this README before submission.

These are not minor details. They are the main work needed to make the system safer and closer to production quality.

---

## Challenges Faced and Resolutions

### MongoDB Atlas Was Not Accessible on the DBS Network

During development, MongoDB Atlas could not be accessed reliably through the DBS network. This prevented the backend from connecting to the cloud database.

**Resolution:**  
A personal mobile hotspot was used during development. This provided a stable internet connection and allowed the application to connect to MongoDB Atlas successfully.

### Database Connection Failed Due to Node.js Version Issues

The backend initially had database connection and package compatibility problems. The issue was caused by using an unsupported or unstable Node.js version.

**Resolution:**  
NVM was used to manage Node.js versions. The project was changed to Node.js `20.9.0`, which provided a stable environment for Express, Mongoose, Jest, and the other dependencies.

```bash
nvm install 20.9.0
nvm use 20.9.0
```

### Frontend and Backend Response Shape Differences

Some frontend functions expected data in different response structures, such as:

```js
response.task
```

while other backend routes returned:

```js
response.data.task
```

**Resolution:**  
The frontend context providers were made more defensive by supporting more than one valid response shape.

```js
const getTask = (response) =>
  response?.task || response?.data?.task || response?.data;
```

This reduced runtime errors while the API response formats were being made consistent.

The better long-term solution is to standardise all backend API responses so every endpoint follows the same structure.

---

## Future Improvements

- Add strict project membership checks for every project and task route
- Configure a strict CORS allow-list
- Enable and test the global error middleware
- Move JWT handling to secure HTTP-only cookies
- Add refresh tokens and logout token invalidation
- Add password reset functionality
- Add email notifications for task assignments and approaching deadlines
- Add file attachments to tasks
- Add activity history for projects and tasks
- Add task search and more advanced filtering
- Add frontend end-to-end tests using Cypress or Playwright
- Add backend integration tests using a dedicated MongoDB test database
- Add CI/CD using GitHub Actions
- Add Docker support for easier local setup and deployment

---

## Screens

### Login Page
<img width="2097" height="1712" alt="image" src="https://github.com/user-attachments/assets/cf1da0d7-066f-4332-ba45-9a349ace72a5" />

### Signup Page
<img width="2096" height="1709" alt="image" src="https://github.com/user-attachments/assets/ff1d61cb-07f2-4e2a-bdd8-2aab6d04f97a" />


### Dashboard - Admin
<img width="2097" height="1711" alt="image" src="https://github.com/user-attachments/assets/3a4a683c-fe8b-4adf-b3eb-7e8ce2c388dd" />


### Test Running - FrontEnd
<img width="1308" height="714" alt="Screenshot 2026-07-07 210128" src="https://github.com/user-attachments/assets/4db467ac-d92f-4bcb-9d94-f2a8924c1040" />

### Test Running - Backend
<img width="1318" height="1125" alt="Screenshot 2026-07-07 210256" src="https://github.com/user-attachments/assets/75c9b607-7c33-41ed-ab72-61fb0c13b859" />




---

## Author

**Prakash**  
