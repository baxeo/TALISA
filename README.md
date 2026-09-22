# BAXEO Sales Insight — frontend + backend-ready deployment

## 1. Install

    npm install

## 2. Run the frontend and backend together

Use one command to start both services:

    npm run dev:all

The public frontend is available at `http://localhost:4173` and the backend API is available at `http://localhost:5000`.

Public website-only link:

    http://localhost:5000/website

Internal management dashboard:

    http://localhost:5000/dashboard

Use `/dashboard` for Analysis, Customers, Pricing, and Admin. The public root can remain storefront-only on Render.

This link shows only the BAXEO storefront. The internal sales dashboard remains at the root URL:

    http://localhost:5000/

## Vercel public website deployment

Import this repository into Vercel with these settings:

    Framework preset: Vite
    Build command: npm run build
    Output directory: dist

Add this Vercel environment variable:

    VITE_PUBLIC_SITE_ONLY=true

After deployment, the Vercel domain root opens only the public website:

    https://your-project.vercel.app/

The backend in `server.js` is not deployed by Vercel as a persistent Node server. Deploy it separately on Render, Railway, or another Node host, then add its URL as a frontend environment variable when you are ready to connect production data.

## Render full-stack deployment

This repository also includes `render.yaml`. In Render, choose **New + > Blueprint** and select the GitHub repository. Render will use the blueprint to:

- build the Vite frontend with `npm run build`
- start the Express backend with `npm start`
- serve the public website from the root domain
- expose `/api/health`, `/api/products`, and `/api/customers`
- preserve `data/customers.json` on the attached persistent disk

Add this environment variable in Render with your real WhatsApp number in international format, without `+` or spaces:

    VITE_WHATSAPP_NUMBER=2567XXXXXXXX

The final public website will be at the Render URL, for example:

    https://baxeo-africa.onrender.com/

The storefront uses real cashew photographs from Wikimedia Commons and includes a fallback image if an image host is temporarily rate-limited. Add the real WhatsApp number before launch; never publish the placeholder number.

For Instagram, copy the Render URL into the profile link or post caption. The page includes mobile-first layout, Open Graph metadata, Twitter metadata, product images, prices, stock, buyer categories, and direct WhatsApp order actions.

You can confirm the backend directly at `http://localhost:5000/api/health` or view products at `http://localhost:5000/api/products`.

## Customer database

Customer records are persisted in `data/customers.json` through the backend API:

    GET    /api/customers
    POST   /api/customers
    PUT    /api/customers/:id
    DELETE /api/customers/:id

The Customers tab uses these routes to store names, buyer type, segment, phone, email, follow-up date, priority, and notes. On hosting, use persistent disk storage or replace this file repository with PostgreSQL, MongoDB, or Supabase so records survive deployments.

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
