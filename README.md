# Final Year Project - Backend (ExamPro)

This is the backend service for **ExamPro**, our final year project focused on building an online examination system.  
The project is structured in a modular and scalable way, following best practices in Node.js application architecture.  

---

## 🚀 Features Implemented (as of current commit)

- **Basic Node.js Project Structure**
  - Config (`/src/config`)
  - Controllers (`/src/controllers`)
  - Middlewares (`/src/middlewares`)
  - Models (`/src/models`)
  - Repositories (`/src/repositories`)
  - Routes (`/src/routes`)
  - Services (`/src/services`)
  - Utils (`/src/utils`)
  - Entry point: `server.js`

- **Logger Configuration**
  - Integrated **Winston** for structured logging.
  - Logger setup: `src/config/logger-config.js`.
  - Handles different logging levels for better debugging and monitoring.

- **Test API Setup**
  - Added a **test route** in `/routes`.
  - Connected with a **test controller** in `/controllers`.
  - Used for verifying the API setup is working correctly.

---

## 📂 Project Structure

```
final_year_project-backend/
├── src/
│   ├── config/                    # Project configuration files
│   │   ├── index.js               # Export all configs
│   │   └── logger-config.js       # Winston logger configuration
│   │   └── server-config.js       # Server configuration
│   ├── controllers/               # Controllers (handle incoming requests)
│   │   ├── index.js               # Export all controllers
│   │   └── testController.js      # Example test controller
│   ├── middlewares/               # Express middlewares
│   │   └── index.js               # Export all middlewares
│   ├── models/                    # Database models
│   │   └── index.js               # Export all models
│   ├── repositories/              # Data access layer
│   │   └── index.js               # Export all repositories
│   ├── routes/                    # API routes
│   │   ├── v1/                    # Versioned API routes
│   │   │   └── testRoutes.js      # Example test route (v1)
│   │   └── index.js               # Export all routes
│   ├── services/                  # Business logic
│   │   └── index.js               # Export all services
│   ├── utils/                     # Utility/helper functions
│   │   └── index.js               # Export all utils
│   └── server.js                  # Application entry point
├── package.json
├── .env                           # Environment variables (not committed)
└── README.md
```

---

## 🛠️ Tech Stack

- **Node.js** (Runtime)
- **Express.js** (Web framework)
- **Winston** (Logging)
- **dotenv** (Environment variable management)
- **http-status-codes** (Clean and readable HTTP status handling)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mostakin5290/Final_Year_Project-Backend.git
cd Final_Year_Project-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add required environment variables (example below):

```env
PORT=5000
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on:  
👉 http://localhost:3000 or your define port(e.g. 5000)

---

## 📡 API Testing

A **test route** has been created for initial verification.  

**Example request:**
```http
GET /api/v1/test
```

**Example response:**
```json
{
    "success": true,
    "message": "Hello World!",
    "error": {},
    "data": { "info": "API is live" }
}
```

---

## 📝 Logging

All logs are handled by **Winston**.  

- Logs include timestamps and log levels.  (NOT USED YET)

**Example logs:**
```
2025-08-28 16:45:04 : info : Server running at PORT: 3000
```

---

## 📌 Notes

This is the **initial project setup commit**.  

Upcoming commits will or may include:
- Database integration (models + repositories).
- Authentication & authorization.
- Core eAPIs (exam creation, participation, results).
- Error handling middleware.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**WE**

