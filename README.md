# Shri Shyam Consulting — Resdex & AI Calling ATS

Enterprise domestic and international recruitment platform for **Shri Shyam Consulting** (`www.shrishyamconsulting.in` | `info@shrishyamconsulting.in` | Paras Complex, Durg, CG • Helpline: `8269715615`).

## Features
- **Naukri Resdex Talent Search**: Filter across Durg/CG local, Pan-India, and International (UAE, Saudi Arabia, Singapore, UK, Canada, Germany) candidates.
- **Domestic & International Job Postings**: Publish India and overseas visa-sponsored job mandates with AI job description drafting and candidate matching.
- **ShyamAI Calling Agent & ATS Pipeline**: Outbound voice screening simulator, automated qualification checklist, Kanban ATS, and interview scheduling.
- **Encrypted Workspace & Google Auth**: Sign In / Sign Up with Google via Firebase Auth, AES-256-GCM client-side PII encryption, and hardened Firestore security rules (`firestore.rules`).
- **Installable PWA**: Works on Android, iOS Safari, and Desktop via `vite-plugin-pwa` with offline support.

---

## Deploying to GitHub & GitHub Pages

### 1. Push Code to GitHub
If pushing from a local terminal:
```bash
git init
git add .
git commit -m "Deploy Shri Shyam Consulting ATS"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

### 2. Enable GitHub Pages (Automated CI/CD)
This repository includes `.github/workflows/deploy.yml`, which automatically builds and deploys the app on every push to `main`:
1. Open your GitHub repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The workflow runs automatically and publishes your live site at:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/`

### 3. Optional: Connect Custom Domain (`www.shrishyamconsulting.in`)
1. In GitHub repository **Settings → Pages → Custom domain**, enter `www.shrishyamconsulting.in`.
2. Add a `public/CNAME` file containing `www.shrishyamconsulting.in` (this automatically tells the build workflow to use root base path `/`).
3. Configure your DNS `CNAME` record for `www` to point to `<YOUR_USERNAME>.github.io`.

### 4. Authorize Your GitHub Domain in Firebase Authentication (Required)
For **Sign In / Sign Up with Google** to work on your GitHub Pages URL:
1. Open [Firebase Console](https://console.firebase.google.com/) → select project `rich-philosophy-mgt36`.
2. Go to **Authentication → Settings → Authorized domains**.
3. Click **Add domain** and add:
   - `<YOUR_USERNAME>.github.io`
   - `www.shrishyamconsulting.in` (if using custom domain)

### 5. Optional: Full-Stack Backend (`server.ts`)
GitHub Pages hosts the frontend SPA, PWA, Firebase Auth, and encrypted Firestore sync. If you also want live server-side Gemini API calls (`/api/ai/*`), deploy `server.ts` (`npm run build && npm start`) to Cloud Run, Render, or Railway with `GEMINI_API_KEY` set in environment variables.
