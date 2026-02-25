## Family Tree Visualization & Exploration System

Node.js + Express backend, MySQL database, and Vue 3 + Vite frontend. Visualizes family trees with D3 and provides a simple admin backend for saving data that users can explore.

### Stack
- Backend: Node.js + Express
- Database: MySQL (running on port 3306, database name: `family tree`)
- Frontend: Vue 3 (Vite) in `frontend/`
- Visualization: D3.js

### Project Structure
```
backend/
  package.json
  src/
    server.js
    db.js
    middleware/auth.js
    routes/
      people.js
      families.js
      person.js
      admin.js
frontend/
  index.html
  vite.config.js
  package.json
  src/
    main.js
    App.vue
    router/index.js
    components/FamilyTree.vue
    views/
      SearchPage.vue
      TreePage.vue
      AdminLogin.vue
      AdminDashboard.vue
```

---

## Prerequisites
- Node.js 18+ and npm
- MySQL running on `localhost:3306` with a database named `family tree`
  - Ensure your MySQL user has privileges to read/write this database

## Environment Variables (Backend)
Create `backend/.env` with the following (adjust as needed):
```
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change-this-secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=family tree
ADMIN_USER=admin
ADMIN_PASS=123456
```

Notes:
- The database name contains a space: `family tree`. The backend already quotes table names in SQL. Keep the exact name in `DB_NAME`.
- Change `JWT_SECRET`, `ADMIN_USER`, and `ADMIN_PASS` for production.

---

## Install & Run

### 1) Backend
Windows PowerShell (run each line separately):
```
cd backend
npm install
npm run dev
```

Bash (macOS/Linux):
```
cd backend && npm install && npm run dev
```

The backend starts on `http://localhost:3000`.

### 2) Frontend
Open a new terminal:

Windows PowerShell:
```
cd frontend
npm install
npm run dev
```

Bash:
```
cd frontend && npm install && npm run dev
```

The frontend starts on `http://localhost:5173` and proxies `/api` to the backend.

---

## APIs

Base URL: `http://localhost:3000`

- GET `/api/health` → simple health check
- GET `/api/people` → all rows from `familytree_people`
- GET `/api/families` → all rows from `familytree_families`
- GET `/api/person/:id` → details of a person and related people
  - Assumes columns on `familytree_people` for relations: `parent_ids`, `spouse_ids`, `child_ids` as comma-separated ID strings

Admin (JWT-protected):
- POST `/api/admin/login`
  - Body: `{ "username": "admin", "password": "123456" }`
  - Returns: `{ token: "<JWT>" }`
- POST `/api/admin/people` (Bearer token required)
  - Body fields (adjust to your schema): `name, gender, birth_date, death_date, parent_ids, spouse_ids, child_ids`
  - Returns: `{ id: <insertId> }`
- POST `/api/admin/families` (Bearer token required)
  - Body fields: `husband_id, wife_id, marriage_date, divorce_date, children_ids, notes`
  - Returns: `{ id: <insertId> }`

---

## Postman Testing Guide

### A) Create a Collection and Environment
1. Open Postman → Create a new Collection: "Family Tree APIs".
2. Create a new Environment: "Local" with variables:
   - `baseUrl` = `http://localhost:3000`
   - `token` = (leave blank for now)
3. Select the "Local" environment in the top-right environment dropdown.

### B) Add Requests to the Collection
Add the following requests under the collection (set the method and URL as shown):

1) Health
- Method: GET
- URL: `{{baseUrl}}/api/health`

2) Get People
- Method: GET
- URL: `{{baseUrl}}/api/people`

3) Get Families
- Method: GET
- URL: `{{baseUrl}}/api/families`

4) Get Person By ID
- Method: GET
- URL: `{{baseUrl}}/api/person/1`
  - Replace `1` with a valid person ID in your database.

5) Admin Login
- Method: POST
- URL: `{{baseUrl}}/api/admin/login`
- Body → raw → JSON:
```
{
  "username": "admin",
  "password": "123456"
}
```
- Tests tab (store token to environment automatically):
```
if (pm.response.code === 200) {
  const json = pm.response.json();
  if (json.token) {
    pm.environment.set('token', json.token);
  }
}
```

6) Admin: Create Person
- Method: POST
- URL: `{{baseUrl}}/api/admin/people`
- Authorization tab: Type = Bearer Token, Token = `{{token}}`
- Body → raw → JSON (example):
```
{
  "name": "John Doe",
  "gender": "M",
  "birth_date": "1970-01-10",
  "death_date": null,
  "parent_ids": "2,3",
  "spouse_ids": "4",
  "child_ids": "5,6"
}
```

7) Admin: Create Family
- Method: POST
- URL: `{{baseUrl}}/api/admin/families`
- Authorization tab: Type = Bearer Token, Token = `{{token}}`
- Body → raw → JSON (example):
```
{
  "husband_id": 1,
  "wife_id": 4,
  "marriage_date": "1995-06-15",
  "divorce_date": null,
  "children_ids": "5,6",
  "notes": "Sample family"
}
```

Tip: After creating a person/family, re-run the GET requests to verify data presence. Ensure IDs you reference actually exist.

### C) Common Issues in Postman
- 401 Unauthorized on admin endpoints: ensure you called login and that the Bearer token is set as `{{token}}` (or paste the token directly).
- 500 Database error: check `backend/.env` database credentials and that the tables exist.
- Empty results: verify your database has data in `familytree_people` and `familytree_families`.

---

## Frontend Usage
1. Visit `http://localhost:5173`.
2. Search page:
   - Search by name or ID → click a person → navigates to the tree.
3. Tree page:
   - Interactive D3-based tree (simple parent/child demo layout) with side panel showing selected person details (birth, death, parents, spouses, children).
4. Admin:
   - Go to `http://localhost:5173/admin` → login with the default account.
   - After login, use the dashboard to create people and families; the backend saves to MySQL. Data will appear on the user-facing pages once present in the DB.

---

## Notes on Database Schema
- The code assumes comma-separated relations in `familytree_people`:
  - `parent_ids`, `spouse_ids`, `child_ids` (e.g., "2,3")
- If your schema differs, adjust the backend queries and insert fields in:
  - `backend/src/routes/person.js`
  - `backend/src/routes/admin.js`

---

## Troubleshooting
- MySQL connection refused: verify MySQL is running and accepting connections on `localhost:3306`.
- Authentication errors: update `ADMIN_USER`, `ADMIN_PASS`, and `JWT_SECRET` in `.env`.
- CORS errors: verify `CORS_ORIGIN` matches the frontend URL (default `http://localhost:5173`).
- Windows PowerShell chaining: run commands on separate lines instead of `&&`.

---

## License
This project is a scaffold created for demonstration and can be adapted as needed.


