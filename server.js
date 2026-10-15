"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");

const requiredEnvironment = [
  "MONGODB_URI",
  "SESSION_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
];
const missingEnvironment = requiredEnvironment.filter(
  (key) => !process.env[key]?.trim()
);

if (missingEnvironment.length) {
  console.error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
  process.exit(1);
}

if (
  process.env.NODE_ENV === "production" &&
  (process.env.ADMIN_PASSWORD.length < 16 ||
    process.env.SESSION_SECRET.length < 32)
) {
  console.error(
    "Production requires an ADMIN_PASSWORD of at least 16 characters and a SESSION_SECRET of at least 32 characters."
  );
  process.exit(1);
}

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 3000;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = Buffer.from(process.env.ADMIN_PASSWORD);

const prayerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80, default: "" },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: "" },
    category: {
      type: String,
      required: true,
      enum: [
        "Family",
        "Faith and spiritual growth",
        "Education and work",
        "Thanksgiving",
        "Other",
      ],
    },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    consentedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["new", "prayed", "contacted"],
      default: "new",
    },
  },
  { timestamps: true }
);

const PrayerRequest = mongoose.model("PrayerRequest", prayerRequestSchema);

app.disable("x-powered-by");
if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(
  session({
    name: "wofem.staff",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "staff_sessions",
      ttl: 60 * 60 * 8,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

const publicSubmissionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

function requireSameOrigin(req, res, next) {
  const origin = req.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.get("host")) {
        return res.status(403).json({ error: "Request origin is not allowed." });
      }
    } catch {
      return res.status(403).json({ error: "Request origin is not allowed." });
    }
  }
  next();
}

function requireStaff(req, res, next) {
  if (req.session?.isStaff) {
    return next();
  }
  return res.status(401).json({ error: "Staff sign-in required." });
}

function passwordMatches(candidate) {
  const candidateBuffer = Buffer.from(candidate);
  return (
    candidateBuffer.length === adminPassword.length &&
    crypto.timingSafeEqual(candidateBuffer, adminPassword)
  );
}

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "database unavailable",
  });
});

app.use("/api/staff", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.post(
  "/api/prayer-requests",
  publicSubmissionLimit,
  requireSameOrigin,
  async (req, res, next) => {
    try {
      const { name = "", email = "", category, message, consent } = req.body || {};
      const allowedCategories = prayerRequestSchema.path("category").enumValues;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof category !== "string" ||
        typeof message !== "string" ||
        consent !== true ||
        name.trim().length > 80 ||
        email.trim().length > 120 ||
        !allowedCategories.includes(category) ||
        message.trim().length < 5 ||
        message.trim().length > 1000 ||
        (email.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      ) {
        return res.status(400).json({ error: "Please check the request details and try again." });
      }

      const prayerRequest = await PrayerRequest.create({
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim(),
        consentedAt: new Date(),
      });

      return res.status(201).json({
        message: "Your prayer request was sent privately to the church team.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

app.post(
  "/api/staff/login",
  loginLimit,
  requireSameOrigin,
  (req, res, next) => {
    const { username, password } = req.body || {};
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== adminUsername ||
      !passwordMatches(password)
    ) {
      return res.status(401).json({ error: "Username or password is incorrect." });
    }

    req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }
      req.session.isStaff = true;
      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }
        return res.json({ message: "Signed in." });
      });
    });
  }
);

app.get("/api/staff/session", (req, res) => {
  res.json({ authenticated: Boolean(req.session?.isStaff) });
});

app.post("/api/staff/logout", requireSameOrigin, requireStaff, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }
    res.clearCookie("wofem.staff", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    });
    return res.json({ message: "Signed out." });
  });
});

app.get("/api/staff/prayer-requests", requireStaff, async (req, res, next) => {
  try {
    const requests = await PrayerRequest.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ requests });
  } catch (error) {
    return next(error);
  }
});

app.patch(
  "/api/staff/prayer-requests/:id",
  requireSameOrigin,
  requireStaff,
  async (req, res, next) => {
    try {
      const { status } = req.body || {};
      if (!["new", "prayed", "contacted"].includes(status)) {
        return res.status(400).json({ error: "Choose a valid request status." });
      }
      const request = await PrayerRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      ).lean();
      if (!request) {
        return res.status(404).json({ error: "Prayer request not found." });
      }
      return res.json({ request });
    } catch (error) {
      return next(error);
    }
  }
);

app.delete(
  "/api/staff/prayer-requests/:id",
  requireSameOrigin,
  requireStaff,
  async (req, res, next) => {
    try {
      const request = await PrayerRequest.findByIdAndDelete(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Prayer request not found." });
      }
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  }
);

app.get("/robots.txt", (req, res) => {
  const baseUrl = new URL(`${req.protocol}://${req.get("host")}`).origin;
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = new URL(`${req.protocol}://${req.get("host")}`).origin;
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      `<url><loc>${baseUrl}/</loc></url></urlset>\n`
  );
});

const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/style.css", "style.css"],
  ["/script.js", "script.js"],
  ["/admin.html", "admin.html"],
  ["/admin.css", "admin.css"],
  ["/admin.js", "admin.js"],
  ["/assets/wofem-logo.png", "assets/wofem-logo.png"],
  ["/assets/church/youth-prayer.jpg", "assets/church/youth-prayer.jpg"],
  ["/assets/church/church-prayer.jpg", "assets/church/church-prayer.jpg"],
  ["/assets/church/bible-study.jpg", "assets/church/bible-study.jpg"],
]);

app.get([...publicFiles.keys()], (req, res, next) => {
  if (req.path === "/admin.html") {
    res.set("Cache-Control", "no-store");
  }
  res.sendFile(publicFiles.get(req.path), { root: __dirname }, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Page not found." });
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: "The request could not be completed. Please try again." });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`WOFEM website listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Could not start WOFEM website:", error);
  process.exit(1);
});
