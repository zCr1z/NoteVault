# NoteVault — Cognifyz Full Stack Internship Project

**Intern:** Chris Thomas Binoj | **ID:** 24MIS0079  
**Program:** Full Stack Development Internship — Cognifyz Technologies  
**Duration:** 25/03/2026 – 25/04/2026  

---

## Task Completion Map

| Level | Task | Feature | Status |
|-------|------|---------|--------|
| L1 | Task 1 | HTML forms + Node/Express server + EJS server-side rendering | ✅ |
| L1 | Task 2 | Inline JS client-side validation + server-side validation + temp storage | ✅ |
| L2 | Task 3 | Bootstrap responsive layout, CSS transitions & animations, multi-section UI | ✅ |
| L2 | Task 4 | Password strength meter, DOM manipulation, client-side filtering/routing | ✅ |
| L3 | Task 5 | RESTful API (GET/POST/PUT/DELETE) + front-end fetch integration | ✅ |
| L3 | Task 6 | MongoDB integration + bcrypt user auth + JWT authorization middleware | ✅ |

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS (server-side rendering)
- **Frontend:** Bootstrap 5, Vanilla JS, Font Awesome
- **Database:** MongoDB + Mongoose (falls back to in-memory if Mongo not available)
- **Auth:** bcryptjs (password hashing) + JWT + express-session
- **Other:** morgan (logging), express-rate-limit, node-cache (server-side caching)

---

## Project Structure

```
cognifyz-fullstack/
├── server.js              # Main server — middleware, routes, DB connection
├── .env.example           # Environment variable template
├── models/
│   ├── User.js            # User schema with bcrypt pre-save hook
│   └── Note.js            # Note schema with userId reference
├── middleware/
│   └── auth.js            # requireAuth (session) + requireJWT (API)
├── routes/
│   ├── pageRoutes.js      # Page routes + contact form handling
│   ├── authRoutes.js      # Register / Login / Logout / Token
│   └── noteRoutes.js      # REST API — /api/notes CRUD
├── views/
│   ├── partials/
│   │   ├── header.ejs     # Navbar, Bootstrap CDN, flash messages
│   │   └── footer.ejs     # Footer + JS CDN
│   ├── index.ejs          # Hero landing page
│   ├── dashboard.ejs      # Notes dashboard (dynamic DOM + REST API)
│   ├── register.ejs       # Register form + password strength meter
│   ├── login.ejs          # Login form
│   ├── contact.ejs        # Contact form (Task 1 & 2)
│   └── 404.ejs            # 404 page
└── public/
    ├── css/style.css      # Custom CSS — animations, transitions, responsive
    └── js/main.js         # Auto-dismiss alerts
```

---

## Setup & Run

### Option A — With MongoDB (full features)
```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Make sure MongoDB is running locally
mongod

# 4. Start server
npm start
```

### Option B — Without MongoDB (in-memory mode)
```bash
npm install
npm start
# App auto-detects no MongoDB and uses in-memory storage
# Note: data resets on server restart
```

Visit: **http://localhost:3000**

---

## API Endpoints (Task 5 & 6)

All `/api/notes` endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes for logged-in user |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create new note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

---

## Key Features Per Task

**Task 1** — `server.js` sets up Express + EJS. `pageRoutes.js` handles server-side rendering. `contact.ejs` has the HTML form.

**Task 2** — `contact.ejs` has inline JS validation. `pageRoutes.js` POST `/contact` does server-side validation and stores to `global.contactSubmissions`.

**Task 3** — `public/css/style.css` has animations (`fadeInUp`, `float`), CSS gradient hero, hover transitions. Bootstrap 5 used throughout for responsive grid.

**Task 4** — `register.ejs` has live password strength meter + rule checklist updating the DOM in real time. `dashboard.ejs` has client-side search/filter that dynamically updates the note grid.

**Task 5** — `routes/noteRoutes.js` exposes a full RESTful CRUD API. `dashboard.ejs` uses `fetch()` to call the API and dynamically renders/updates the UI.

**Task 6** — `models/User.js` uses bcrypt pre-save hook. `middleware/auth.js` has `requireJWT` to protect API routes. Passwords are never stored in plain text.
