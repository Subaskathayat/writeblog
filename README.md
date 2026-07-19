# Inkwell — A Dynamic Blogging Platform

A full-stack, multi-user blogging platform (like a small Medium). Users sign up,
write and publish blogs, and read, like, and comment on everyone else's posts.
Built with **Node.js + Express + MongoDB** on the backend and **React (Vite)** on
the frontend, with JWT authentication. The UI is styled with a Cohere-inspired
design system (see `DESIGN.md`).

---

## Features

- **Authentication** — email/password signup & login, JWT, sessions persist across refresh, logout.
- **Blog CRUD** — create, read, update, delete. Save as draft or publish.
- **Ownership rules** — users can only edit/delete their own blogs (enforced server-side).
- **Social** — like/unlike any blog (toggle), comment on any blog, delete your own comments.
- **Dashboard** — stats (total / published / drafts / likes received) + manage your blogs.
- **Discovery** — public blog feed with keyword search, category filter, and pagination.
- **Profiles** — edit your own profile; view any author's public profile and their posts.
- **Polish** — toast success/error messages, loading states, responsive (mobile → desktop),
  input validation, password hashing (bcrypt), and HTML sanitization (XSS prevention).

---

## Tech Stack

| Layer     | Tech                                             |
|-----------|--------------------------------------------------|
| Backend   | Node.js, Express, Mongoose, JWT, bcryptjs        |
| Security  | express-validator, sanitize-html                 |
| Frontend  | React 18, React Router, Axios, Vite              |
| Database  | MongoDB (Atlas)                                  |

---

## Project Structure

```
BLOG/
├── DESIGN.md            # design system spec
├── requirements.md      # project brief
├── server/              # Express API
│   ├── config/          # db connection, constants (categories)
│   ├── controllers/     # auth, blog, user logic
│   ├── middleware/      # auth (JWT), validation, error handling
│   ├── models/          # User, Blog (Mongoose schemas)
│   ├── routes/          # /api/auth, /api/blogs, /api/users, /api/categories
│   ├── utils/           # token generation, sanitization
│   ├── .env             # environment (not committed; see .env.example)
│   └── server.js        # entry point
└── client/              # React (Vite) app
    ├── src/
    │   ├── api/         # axios client (auth interceptor)
    │   ├── components/  # Navbar, BlogCard, Avatar, LikeButton, etc.
    │   ├── context/     # AuthContext, ToastContext
    │   ├── pages/       # Home, Blogs, BlogDetail, Dashboard, editor, auth, profiles
    │   ├── utils/       # formatting helpers
    │   ├── styles.css   # design-system tokens + component styles
    │   └── App.jsx      # routes
    └── vite.config.js   # dev server + /api proxy
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- A MongoDB connection string (MongoDB Atlas works out of the box)

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # or: npm start
```

The API runs on **http://localhost:5000**. You should see
`MongoDB connected: …` and `Server running on …` in the console.

> **Note:** `server/.env` already contains a working Atlas URI for this demo.
> For your own deployment, replace `MONGO_URI` and set a strong `JWT_SECRET`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on **http://localhost:5173**. Vite proxies all `/api` requests to
the backend, so no extra CORS config is needed in development.

Open http://localhost:5173 and sign up to start writing.

### Demo accounts

Two accounts already exist for quick testing:

| Email          | Password   |
|----------------|------------|
| alice@test.com | secret123  |
| bob@test.com   | secret123  |

---

## API Reference

Base URL: `/api`

### Auth
| Method | Endpoint          | Auth | Description                    |
|--------|-------------------|------|--------------------------------|
| POST   | `/auth/signup`    | –    | Register (returns token+user)  |
| POST   | `/auth/login`     | –    | Log in (returns token+user)    |
| GET    | `/auth/me`        | ✔    | Current user                   |
| PUT    | `/auth/profile`   | ✔    | Update profile / password      |

### Blogs
| Method | Endpoint                         | Auth | Description                          |
|--------|----------------------------------|------|--------------------------------------|
| GET    | `/blogs`                         | –    | List published (`search`, `category`, `author`, `page`, `limit`, `sort`) |
| GET    | `/blogs/mine`                    | ✔    | Current user's blogs + stats         |
| GET    | `/blogs/:id`                     | ~    | Single blog (drafts: owner only)     |
| POST   | `/blogs`                         | ✔    | Create                               |
| PUT    | `/blogs/:id`                     | ✔    | Update (owner only)                  |
| DELETE | `/blogs/:id`                     | ✔    | Delete (owner or admin)              |
| PUT    | `/blogs/:id/like`                | ✔    | Toggle like                          |
| POST   | `/blogs/:id/comments`            | ✔    | Add comment                          |
| DELETE | `/blogs/:id/comments/:commentId` | ✔    | Delete comment (comment/blog owner)  |

### Users & Meta
| Method | Endpoint          | Auth | Description                 |
|--------|-------------------|------|-----------------------------|
| GET    | `/users/:id`      | –    | Public author profile       |
| GET    | `/categories`     | –    | List of fixed categories    |

(✔ = requires `Authorization: Bearer <token>`, ~ = optional auth)

---

## Security Notes
- Passwords are hashed with **bcrypt** and never returned by the API.
- All protected routes verify a JWT; blog edit/delete additionally verify **ownership**.
- Blog content is sanitized with **sanitize-html** (scripts stripped) to prevent XSS;
  short text fields are stripped of all HTML.
- Inputs are validated with **express-validator** on the server and inline on the client.

---

## Production Build

```bash
cd client
npm run build      # outputs to client/dist
```

Serve `client/dist` from any static host and point it at the deployed API
(update the proxy / base URL accordingly).
