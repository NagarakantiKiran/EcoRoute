# Deploy 001 — Deploy EcoRoute to Vercel (Free)
*Get a live URL in under 10 minutes*

**Estimated time**: 5–10 minutes  
**Cost**: Free (Vercel Hobby plan)  
**Result**: `https://ecoroute.vercel.app` (or your custom name)

---

## Prerequisites

- Your project is in a GitHub repository (or we'll create one)
- You have a Vercel account (free at vercel.com)
- Your `.env.local` has `ORS_API_KEY` set

---

## Step 1 — Push to GitHub (if not already)

In your project root, run:

```bash
# Initialize git if not done yet
git init
git add .
git commit -m "EcoRoute v1 — mobile-ready eco route finder"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ecoroute.git
git branch -M main
git push -u origin main
```

> If you already have a GitHub repo, just make sure all changes are committed and pushed:
> ```bash
> git add .
> git commit -m "Add mobile responsive layout + advanced dashboard"
> git push
> ```

---

## Step 2 — Deploy on Vercel

### Option A — Via Vercel Website (Easiest)

1. Go to **vercel.com** → Sign in (use GitHub account)
2. Click **"Add New Project"**
3. Click **"Import"** next to your `ecoroute` repository
4. Vercel auto-detects Next.js — no framework config needed
5. **Before clicking Deploy** → go to **"Environment Variables"**
6. Add your environment variable:
   - **Key**: `ORS_API_KEY`
   - **Value**: your actual OpenRouteService key
7. Click **"Deploy"**
8. Wait ~60 seconds → your app is live! 🎉

### Option B — Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# In your project root:
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? (your account)
# ? Link to existing project? No
# ? Project name: ecoroute
# ? Directory: ./
# Auto-detected Next.js ✓

# Add your env variable:
vercel env add ORS_API_KEY
# Paste your ORS key when prompted
# Select: Production, Preview, Development

# Deploy to production:
vercel --prod
```

---

## Step 3 — Set Your Custom URL (Optional)

On the Vercel dashboard after deploy:
1. Go to your project → **Settings** → **Domains**
2. Your default URL will be something like `ecoroute-xyz.vercel.app`
3. To get `ecoroute.vercel.app` — click "Edit" and type your preferred name
   (available on a first-come basis)
4. Or connect a custom domain you own (e.g. `ecoroute.app`)

---

## Step 4 — Verify Live Deployment

Visit your URL and check:
- [ ] Page loads with map visible
- [ ] Type a city in origin → geocoding works
- [ ] Type a destination → route cards appear
- [ ] Switch vehicles → CO₂ updates
- [ ] Advanced Dashboard opens + features work
- [ ] Mobile view works (open on your phone!)
- [ ] No console errors in browser DevTools

---

## Step 5 — Auto-Deploy on Every Push (Already Set Up!)

Vercel automatically redeploys whenever you push to `main`.
So as you add new features (dashboard, weather), just:

```bash
git add .
git commit -m "Add carbon dashboard"
git push
```

Vercel picks it up in ~30 seconds. No manual redeploy needed.

---

## Environment Variables Reference

| Key | Where to get it | Required |
|---|---|---|
| `ORS_API_KEY` | openrouteservice.org/sign-up | ✅ Yes |

> The Positionstack key (if you added autocomplete) goes in Vercel too:
> **Key**: `POSITION_KEY` — but check if it's `NEXT_PUBLIC_POSITION_KEY` 
> (public) or server-side in your code. Add whichever matches.

---

## Troubleshooting

**Build fails on Vercel:**
- Run `npm run build` locally first — fix any errors before pushing
- Check the Vercel build log for the specific error

**Routes not working (API 500 error):**
- `ORS_API_KEY` env variable is missing or wrong in Vercel dashboard
- Go to Project → Settings → Environment Variables → verify it's there

**Map doesn't load:**
- OpenFreeMap tiles are public, no key needed — should just work
- Check browser console for any Content Security Policy errors

**"Module not found" on build:**
- Run `npm install` locally, commit the updated `package-lock.json`, push again

---

## Done!

Your app is live. Share the URL and keep building — 
next up: Carbon Dashboard + Weather features (see feature task files).
