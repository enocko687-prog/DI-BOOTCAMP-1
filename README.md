# WOFEM Website

The site is served by the same Node.js app as its MongoDB API. Keeping the
frontend and API on one origin lets the staff dashboard use secure session
cookies without exposing database credentials to a browser.

The WOFEM logo is cropped from the church's public Facebook image:
https://www.facebook.com/photo.php?fbid=1272618521532302&set=pb.100063524978682.-2207520000&type=3

Church photo gallery and media sources:

- Public photos from the WOFEM Facebook page: https://www.facebook.com/Polamonz/photos
- Offering message: https://www.facebook.com/Polamonz/videos/offering/1602081188053251/
- Understanding the Gospel: https://www.facebook.com/Polamonz/videos/understanding-the-gospel/1383476860229229/
- Sunday service: https://www.facebook.com/Polamonz/videos/sunday-service/1616706506564184/

The photos are stored locally under `assets/church/`. The Sunday Worship and
Church Events cards embed public videos from the WOFEM Facebook page; visitors
can also open each video directly on Facebook. Playback, ownership, and
availability remain with Facebook.

The homepage presents WOFEM's core values: a heart of gratitude, a heart of
generosity, and a heart of the love of God.

## Run locally

Requirements: Node.js 20 or later and a MongoDB database (MongoDB Atlas works).

1. Create a MongoDB Atlas cluster and database user. Keep the database user
   password separate from the WOFEM staff password.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `SESSION_SECRET`,
   `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Do not commit `.env`.
3. Generate a session secret with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

4. In Atlas Network Access, allow connections from your development computer.
   Never put the MongoDB URI in frontend JavaScript or share it publicly.
5. Install dependencies and start the app:

   ```powershell
   npm install
   npm start
   ```

6. Visit `http://localhost:3000`. Staff can sign in at
   `http://localhost:3000/admin.html`.

## Public deployment on Render

The included `render.yaml` configures a Node web service. Create a new Blueprint
from this repository in Render, then set the secret values for `MONGODB_URI`,
`ADMIN_USERNAME`, and `ADMIN_PASSWORD` in the service environment. Render
generates `SESSION_SECRET`; verify that it is at least 32 characters. Use a
unique staff password of at least 16 characters. Configure Atlas Network
Access for the service's outbound IP addresses (or a suitably restricted
network rule for your deployment). Do not open database access to the public
internet unless there is no safer hosting option.

The site and API must remain on the same origin. Do not deploy the HTML as a
static-only site while pointing it at a separately exposed MongoDB instance.

After deployment, open the public Render URL once and confirm the homepage
loads. The site publishes `/robots.txt` and `/sitemap.xml` using its current
public hostname. To request Google indexing:

1. Open [Google Search Console](https://search.google.com/search-console/),
   sign in with the church's Google account, and add the Render URL as a URL
   prefix property.
2. Verify ownership using one of the verification methods Google offers for
   that URL. Keep any verification token private and follow Google's
   instructions before adding it to the site.
3. In Search Console, submit `https://YOUR-RENDER-HOSTNAME.onrender.com/sitemap.xml`
   under **Sitemaps**, replacing the example hostname with the actual Render
   address.
4. Use **URL inspection** to request indexing of the homepage. Google decides
   independently whether and when to index or show the site in search results.

## Prayer request privacy

- Public visitors can submit a prayer request; submissions are not displayed
  publicly.
- Only a signed-in staff session can list, update, or delete submissions.
- Pastors, elders, deacons, and the church secretary can use the authorized
  staff login. Share its credentials privately, not on the public website.
- The private Prayer Care Dashboard highlights new requests and lets
  authorized leaders record whether a request has been prayed for or needs
  follow-up.
- The staff dashboard checks for new requests every 15 seconds while open and
  visible, and refreshes when staff return to the page. The dashboard must be
  open in a signed-in browser for requests to appear automatically.
- The form records when consent to share the request was given.
- Staff sessions expire after eight hours. Login and submission endpoints are
  rate-limited, and cookies are HttpOnly and SameSite=Strict.
- Staff can mark a request as new, prayed, or contacted, and permanently delete
  it. The dashboard displays the most recent 100 requests.
- The form asks for consent and does not require a name or email. Staff should
  only collect what they need and delete requests when they are no longer
  needed. The church should set a retention policy before inviting submissions.
- Do not submit emergency requests through this form. It is not an emergency
  service.

The backend needs valid environment settings and a reachable MongoDB instance
to start. `/api/health` reports whether the database connection is ready.
# WOFEM-CHURCH
