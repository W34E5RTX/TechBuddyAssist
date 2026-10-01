# Techbuddyassist

## Local development

Create a `.env` file with a reachable `MONGODB_URL`, then run:

```bash
npm run dev
```

This starts both the Vite frontend and the Express API. The frontend is available at `http://localhost:5173`.

## Production build

```bash
npm run build
npm start
```

The API serves the built frontend and listens on port `5000` by default.

## Admin on Vercel

The `/admin` page is available after deployment. In Vercel, open **Project Settings > Environment Variables** and set:

- `ADMIN_PASSWORD`: the password used to sign in to the admin page. Keep it private and do not commit it.
- `ADMIN_EMAIL`: the email address used with the admin password to sign in.
- `JWT_SECRET`: a random secret with at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and store it as a Vercel environment variable; do not commit it.

Apply the variables to the Production environment, save them, then redeploy the project. The admin API deliberately refuses login when either variable is missing or invalid.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
