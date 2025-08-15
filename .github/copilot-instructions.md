# Copilot Instructions for AI Coding Agents

## Project Overview

- **SABOR** is a restaurant management system with a Node.js/Express backend and a React/Vite frontend.
- The backend manages orders, users, authentication, and integrates with payment gateways (Wompi, MercadoPago).
- The frontend is a Vite-based React SPA, communicating with the backend via REST API.

## Architecture & Key Directories

- `backend/`
  - `src/config/`: App, DB, security, and upload configs
  - `src/controllers/`: Business logic for each resource (e.g., `productoController.js`)
  - `src/models/`: Data models (no ORM, direct SQL or query builders)
  - `src/routes/`: API route definitions, grouped by resource
  - `public/uploads/`: File uploads (e.g., product images)
  - `logs/`: App, error, and security logs
- `frontend/`
  - `src/components/`: React UI components
  - `src/context/`: React context providers (e.g., Auth, Cart)
  - `src/pages/`: Main app pages
  - `src/services/`: API service wrappers
  - `src/locales/`: i18n translations
  - `public/images/`: Static assets

## Developer Workflows

- **Backend**
  - Install: `cd backend && npm install`
  - Run (dev): `npm run dev` (uses nodemon)
  - Env config: Copy `.env` from README example; required for DB, JWT, etc.
  - Logs: Check `backend/logs/` for runtime issues
  - CORS: Only allows frontend dev port (5173) by default
- **Frontend**
  - Install: `cd frontend && npm install`
  - Run: `npm run dev` (Vite dev server)
  - Main entry: `src/main.jsx`, root component: `App.jsx`

## Patterns & Conventions

- **Controllers**: Each resource has a controller, model, and route file. Example: `productoController.js`, `productoModel.js`, `productoRoutes.js`.
- **Middleware**: Auth, error handling, validation, and file upload logic are in `src/middleware/`.
- **API URLs**: All backend endpoints are prefixed with `/api/`.
- **Authentication**: JWT-based, with session fallback. See `authController.js` and `auth.js` middleware.
- **Uploads**: Handled via Multer config in `src/config/multerConfig.js`.
- **Frontend API Calls**: Use service wrappers in `frontend/src/services/`.
- **State Management**: React Context for auth, cart, categories, etc.

## Integration Points

- **Payments**: Integrations with Wompi and MercadoPago (see `mercadopagoController.js` and related routes).
- **Database**: MySQL, configured via `.env` and `src/config/dbconfig.js`.
- **i18n**: Frontend uses `src/i18n.js` and `src/locales/` for translations.

## Examples

- To add a new resource (e.g., "mesa"/table):
  1. Create model, controller, and route in backend/src
  2. Register route in `index.js`
  3. Add frontend service and UI components as needed

---

**For more details, see:**

- `README.md` (project root)
- `backend/src/controllers/`, `frontend/src/services/`
- Example API endpoints in backend README
