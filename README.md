# Endowed Writes

A blog for university students: stories on faith, purpose, relationships, campus life and career.

- **frontend/**: Next.js 16 (React 19) site and admin dashboard. Deploy to **Vercel**.
- **backend/**: Node.js + Express API with MongoDB. Deploy to **Render**.
- **Database**: MongoDB Atlas (free tier is fine). Images are stored in the database too, so nothing is lost when Render restarts.

## What's included

**For readers**
- Home page led by the featured story's opening line, topic filters, most-read list, tags, author card
- Story pages with reading progress bar, reading time, view count, drop cap, related stories, previous/next
- Likes, saved stories (bookmarks), threaded comments (one level of replies)
- Reader accounts (sign up, sign in), search, topics, tags, About page
- Dark mode (follows the phone's setting, with a manual toggle)
- Share to WhatsApp, X, Facebook, LinkedIn, or copy the link; native share sheet on phones
- SEO: per-story titles and descriptions, Open Graph link previews, structured data, sitemap.xml, robots.txt

**For the writer (one admin)**
- Dashboard at `/admin`: reads per day (7/30/90 days, compared with the previous period), all-time reads, readers, likes, comments, most-read stories, latest comments
- Rich text editor: headings, bold, italic, underline, highlight, links, quotes, lists, section breaks, alignment, images (upload, drag in or paste), YouTube videos, undo/redo, word count, Ctrl/Cmd+S to save
- Drafts, publish, unpublish, schedule for a future date, feature on the home page, cover image with description, summary, custom web address, search title and description
- Unsaved work is kept in the browser in case the tab closes
- Topics (name, description, colour), comment moderation (hide or delete), reader list
- Settings: blog name, tagline, author name, photo, bio, About page, social links, password change
- New and edited stories appear on the site immediately

## Deploy (about 20 minutes)

### 1. MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com.
2. **Database Access**: add a user with a password.
3. **Network Access**: add `0.0.0.0/0`. Render's IP addresses change, so this is needed.
4. **Connect > Drivers**: copy the connection string. Put the password in it, and add the database name before the `?`, e.g. `...mongodb.net/endowed-writes?retryWrites=true&w=majority`.

### 2. API on Render
1. Push this folder to GitHub.
2. On Render: **New > Web Service**, pick the repo, and set **Root Directory** to `backend`.
3. Build command `npm install`, start command `npm start`.
4. Add environment variables, using `backend/.env.example` as the guide:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas string |
   | `JWT_SECRET` | a long random string |
   | `CLIENT_URL` | your Vercel URL, e.g. `https://endowed-writes.vercel.app` |
   | `PUBLIC_API_URL` | this service's URL, e.g. `https://endowed-writes-api.onrender.com` |
   | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the writer's login |
   | `NODE_ENV` | `production` |

5. Deploy. On first start, the API creates the admin account and five starter topics.
6. Optional sample stories: in the Render **Shell**, run `npm run seed:demo`. They can be deleted from the dashboard later.

You can also use the included `render.yaml` (Blueprint) instead of steps 2 to 4.

### 3. Site on Vercel
1. **Add New > Project**, pick the repo, and set **Root Directory** to `frontend`.
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = the Render URL (no trailing slash)
   - `NEXT_PUBLIC_SITE_URL` = the Vercel URL
3. Deploy. If you later add a custom domain, update `NEXT_PUBLIC_SITE_URL` on Vercel and `CLIENT_URL` on Render, then redeploy both.

### 4. Hand over
The writer goes to `https://<site>/login`, signs in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, and lands on the dashboard. She can do this from any phone or laptop. She should then:
1. Change her password in **Settings**.
2. Add her photo, bio, social links and About page.

## Important: Render free tier sleeps

A free Render service goes to sleep after 15 minutes without visits. The next visitor then waits about 50 seconds while it wakes. Before judging, either:
- upgrade the API to Render's Starter plan, or
- set up a free monitor (for example UptimeRobot) to open `https://<api>/api/health` every 10 minutes, or
- at least open the site yourself just before the judges do.

## Run locally

```bash
# API
cd backend
cp .env.example .env   # fill in MONGODB_URI etc.
npm install
npm run dev            # http://localhost:5000
npm run seed:demo      # optional sample stories

# Site
cd ../frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

## API overview

| Method | Path | Who |
|---|---|---|
| GET | `/api/posts?page&limit&category&tag&q&sort` | anyone |
| GET | `/api/posts/:slug`, `/api/posts/popular`, `/api/posts/tags` | anyone |
| POST | `/api/posts/:slug/view` | anyone |
| POST | `/api/posts/:id/like`, `/api/posts/:id/bookmark` | readers |
| GET / POST | `/api/comments/post/:postId` | anyone / readers |
| DELETE | `/api/comments/:id` | comment owner or admin |
| POST | `/api/auth/register`, `/api/auth/login` | anyone |
| GET / PUT | `/api/auth/me`, PUT `/api/auth/password` | signed in |
| GET | `/api/me/bookmarks` | readers |
| GET | `/api/categories`, `/api/settings`, `/api/media/:id` | anyone |
| POST | `/api/media` (image upload) | admin |
| * | `/api/admin/stats`, `/api/admin/posts`, `/api/admin/categories`, `/api/admin/comments`, `/api/admin/readers`, `/api/admin/settings` | admin |

## Design notes

- **Palette**: paper `#F6F3FB`, ink `#1E1638`, indigo `#3B2A86`, marigold `#F4B13E`, rose `#C9426A`. Dark mode has its own tuned values in `frontend/src/app/globals.css`.
- **Type**: Bricolage Grotesque for headings and interface, Newsreader for reading. Both are self-hosted from npm, so there's no Google Fonts request.
- **Signature details**: the hero opens with the story's first line; story titles get a marigold highlighter stroke on hover; selected text is highlighted in marigold, like a student's marker.
- Story HTML is sanitised on the server before it is saved.
