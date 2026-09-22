# BAXEO Sales Insight — frontend + backend-ready deployment

## 1. Install

    npm install

## 2. Run the frontend and backend together

Use one command to start both services:

    npm run dev:all

The public frontend is available at `http://localhost:4173` and the backend API is available at `http://localhost:5000`.

You can confirm the backend directly at `http://localhost:5000/api/health` or view products at `http://localhost:5000/api/products`.

Start the Vite frontend:

    npm run dev

Start the backend API separately:

    npm run server

The frontend calls backend routes such as `/api/products` and `/api/customers`, and the backend falls back to the same demo data if the API is unavailable.

## 3. Production build for deployment

    npm run build
    npm run start

The app serves the built frontend from the `dist/` folder and exposes the API at `/api/*` on the same server, which makes deployment much easier on a single Node hosting environment.

## 4. Admin login

Use the default admin credentials:

    username: admin
    password: baxeo123

## 5. Deploy to hosting

Upload the project to a Node-capable host or deploy with a single service that runs `npm run start`.

If you are hosting a static site only, use the built `dist/` folder, but the backend-ready setup here is designed to work better for a full production deployment.
