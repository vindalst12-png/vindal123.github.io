# Lal Ji Clinic Deploy Guide

## 1. Frontend deploy on Netlify

- Put these frontend files in your repo root:
  - `index.html`
  - `style.css`
  - `script.js`
  - `config.js`
  - `netlify.toml`
- Push the repo to GitHub.
- In Netlify, choose **Add new project** -> **Import from Git**.
- Select the repo.
- Build command: leave blank
- Publish directory: `.`
- Deploy the site.

Netlify will give you a public URL like:
`https://your-site-name.netlify.app`

## 2. Backend deploy on Render

- Keep these backend files in the same repo:
  - `clinic-ai-server.mjs`
  - `package.json`
  - `render.yaml`
- In Render, choose **New** -> **Blueprint** or **Web Service**.
- Connect the same GitHub repo.
- If using Blueprint, Render can read `render.yaml`.
- Set env var:
  - `OPENAI_API_KEY` = your real OpenAI API key

Render will give you a public backend URL like:
`https://lal-ji-clinic-ai.onrender.com`

## 3. Connect frontend to backend

- Open `config.js`
- Replace:
  `http://localhost:3000/api/clinic-assistant`
- With:
  `https://your-render-service.onrender.com/api/clinic-assistant`

- Push the updated `config.js` to GitHub.
- Netlify will auto-deploy again.

## 4. Share with customers

- Send the Netlify URL directly on WhatsApp.
- If you buy a domain later, connect it in Netlify Domain management.

## 5. Important

- Never commit `.env`
- Keep API key only on Render env vars
- If OpenAI quota finishes, website will still show fallback clinic replies
