"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const next = require("next");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
const isDevelopment = !isProduction;
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

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      unique: true,
    },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    consentedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

const passwordResetSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

const analyticsCounterSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "page_view",
      "service_view",
      "resource_click",
      "prayer_request",
      "member_registration",
      "member_login",
    ],
  },
  count: { type: Number, required: true, default: 0 },
});
analyticsCounterSchema.index({ date: 1, type: 1 }, { unique: true });
analyticsCounterSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const AnalyticsCounter = mongoose.model("AnalyticsCounter", analyticsCounterSchema);

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
        frameSrc: ["'self'", "https://www.facebook.com"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(
  session({
    name: "wofem.session",
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
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSettingsPresent = Boolean(
  process.env.SMTP_HOST ||
    process.env.SMTP_USER ||
    process.env.SMTP_PASS ||
    process.env.SMTP_FROM
);
const smtpConfigured =
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      isValidPublicBaseUrl(process.env.PUBLIC_BASE_URL)
  ) &&
  Number.isInteger(smtpPort) &&
  smtpPort > 0 &&
  smtpPort <= 65535;
const emailTransport = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;
const googleSettingsPresent = Boolean(
  process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GOOGLE_CALLBACK_URL
);
const googleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
);

if (smtpSettingsPresent && !smtpConfigured) {
  console.error("Password reset email is disabled: configure valid SMTP credentials, port, and PUBLIC_BASE_URL.");
}
if (googleSettingsPresent && !googleOAuthEnabled) {
  console.error("Google sign-in is disabled: configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.");
}

if (googleOAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        done(null, {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          emailVerified: profile._json.email_verified === true,
        });
      }
    )
  );
}

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
const memberAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many account attempts. Please try again later." },
});
const passwordResetLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many password reset attempts. Please try again later." },
});
const analyticsEventLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many analytics events. Please try again later." },
});

function isValidPublicBaseUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.host) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

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

function requireMember(req, res, next) {
  if (req.session?.member) {
    return next();
  }
  return res.status(401).json({ error: "Member sign-in required." });
}

function passwordMatches(candidate) {
  const candidateBuffer = Buffer.from(candidate);
  return (
    candidateBuffer.length === adminPassword.length &&
    crypto.timingSafeEqual(candidateBuffer, adminPassword)
  );
}

function isValidMemberPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 12 &&
    password.length <= 72 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

function trackAnalytics(type) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  AnalyticsCounter.findOneAndUpdate(
    { date, type },
    { $inc: { count: 1 }, $setOnInsert: { date, type } },
    { upsert: true }
  ).catch((error) => {
    console.error(`Could not record analytics event "${type}":`, error);
  });
}

function setMemberSession(req, res, member, next, status = 200) {
  req.session.regenerate((error) => {
    if (error) {
      return next(error);
    }
    req.session.member = {
      id: member.id,
      name: member.name,
      email: member.email,
    };
    req.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }
      return res.status(status).json({ member: req.session.member });
    });
  });
}

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "database unavailable",
  });
});

app.post(
  "/api/analytics/events",
  analyticsEventLimit,
  requireSameOrigin,
  (req, res) => {
    const { type } = req.body || {};
    if (!["page_view", "service_view", "resource_click"].includes(type)) {
      return res.status(400).json({ error: "Choose a valid analytics event." });
    }
    trackAnalytics(type);
    return res.status(202).json({ message: "Event recorded." });
  }
);

app.use(["/api/staff", "/api/members"], (req, res, next) => {
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
      trackAnalytics("prayer_request");

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

app.post(
  "/api/members/register",
  memberAuthLimit,
  requireSameOrigin,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body || {};
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        req.body.consent !== true ||
        name.trim().length < 2 ||
        name.trim().length > 80 ||
        email.trim().length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        password.length < 12 ||
        password.length > 72 ||
        Buffer.byteLength(password, "utf8") > 72
      ) {
        return res.status(400).json({
          error: "Enter a valid name and email, use a password of 12 to 72 characters, and accept the privacy notice.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (await Member.exists({ email: normalizedEmail })) {
        return res.status(409).json({ error: "An account with that email already exists." });
      }

      const member = await Member.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 12),
        consentedAt: new Date(),
      });
      trackAnalytics("member_registration");
      return setMemberSession(req, res, member, next, 201);
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: "An account with that email already exists." });
      }
      return next(error);
    }
  }
);

app.post(
  "/api/members/login",
  memberAuthLimit,
  requireSameOrigin,
  async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        email.trim().length > 120 ||
        password.length > 72 ||
        Buffer.byteLength(password, "utf8") > 72
      ) {
        return res.status(400).json({ error: "Enter your email and password." });
      }

      const member = await Member.findOne({ email: email.trim().toLowerCase() })
        .select("+passwordHash");
      if (!member || !member.passwordHash || !(await bcrypt.compare(password, member.passwordHash))) {
        return res.status(401).json({ error: "Email or password is incorrect." });
      }
      trackAnalytics("member_login");
      return setMemberSession(req, res, member, next);
    } catch (error) {
      return next(error);
    }
  }
);

app.get("/api/members/session", (req, res) => {
  const member = req.session?.member;
  return res.json({
    authenticated: Boolean(member),
    member: member
      ? { id: member.id, name: member.name, email: member.email }
      : null,
  });
});

app.post(
  "/api/members/logout",
  requireSameOrigin,
  requireMember,
  (req, res, next) => {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }
      res.clearCookie("wofem.session", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });
      return res.json({ message: "Signed out." });
    });
  }
);

app.post(
  "/api/members/password/forgot",
  passwordResetLimit,
  requireSameOrigin,
  async (req, res, next) => {
    try {
      if (!emailTransport) {
        return res.status(503).json({
          error: "Password reset email is not configured. Please contact the church.",
        });
      }

      const { email } = req.body || {};
      if (
        typeof email !== "string" ||
        email.trim().length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({ error: "Enter a valid email address." });
      }

      const member = await Member.findOne({ email: email.trim().toLowerCase() });
      if (member) {
        await PasswordReset.deleteMany({ memberId: member._id });
        const token = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await PasswordReset.create({
          memberId: member._id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });
        const resetUrl = new URL("/reset-password", process.env.PUBLIC_BASE_URL);
        resetUrl.searchParams.set("token", token);
        await emailTransport.sendMail({
          from: process.env.SMTP_FROM,
          to: member.email,
          subject: "Reset your WOFEM account password",
          text: `Use this link within 30 minutes to reset your WOFEM password:\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
        });
      }

      return res.json({
        message: "If an account exists for that email, password reset instructions will be sent.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

app.post(
  "/api/members/password/reset",
  passwordResetLimit,
  requireSameOrigin,
  async (req, res, next) => {
    try {
      const { token, password } = req.body || {};
      if (
        typeof token !== "string" ||
        token.length > 100 ||
        !isValidMemberPassword(password)
      ) {
        return res.status(400).json({
          error: "Use a valid reset link and a password of 12 to 72 characters.",
        });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const reset = await PasswordReset.findOneAndDelete({
        tokenHash,
        expiresAt: { $gt: new Date() },
      });
      if (!reset) {
        return res.status(400).json({ error: "This reset link is invalid or has expired." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await Member.updateOne(
        { _id: reset.memberId },
        { $set: { passwordHash } }
      );
      if (result.matchedCount !== 1) {
        return res.status(400).json({ error: "This reset link is invalid or has expired." });
      }
      return res.json({ message: "Password reset. You can now sign in." });
    } catch (error) {
      return next(error);
    }
  }
);

app.post("/auth/google/start", memberAuthLimit, requireSameOrigin, (req, res, next) => {
  if (!googleOAuthEnabled) {
    const destination = req.body?.consent === "true" ? "/register" : "/login";
    return res.redirect(303, `${destination}?error=google-unavailable`);
  }
  const consent = req.body?.consent;
  if (consent !== "true" && consent !== "false") {
    return res.status(400).send("Please accept the account privacy notice to continue.");
  }
  req.session.googleConsent = consent === "true";
  req.session.save((error) => {
    if (error) {
      return next(error);
    }
    return res.redirect(303, "/auth/google");
  });
});

app.get("/auth/google", (req, res, next) => {
  if (!googleOAuthEnabled) {
    const destination = req.session?.googleConsent ? "/register" : "/login";
    return res.redirect(303, `${destination}?error=google-unavailable`);
  }
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    state: true,
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=google",
  }),
  async (req, res, next) => {
    try {
      const identity = req.user;
      if (
        !identity ||
        typeof identity.googleId !== "string" ||
        identity.emailVerified !== true ||
        typeof identity.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)
      ) {
        return res.redirect(303, "/login?error=google-email");
      }

      const email = identity.email.trim().toLowerCase();
      let member = await Member.findOne({
        $or: [{ googleId: identity.googleId }, { email }],
      }).select("+googleId");

      if (!member) {
        if (!req.session.googleConsent) {
          return res.redirect(303, "/register?error=consent");
        }
        const displayName = String(identity.name || email.split("@")[0])
          .trim()
          .slice(0, 80);
        member = await Member.create({
          name: displayName.length >= 2 ? displayName : "WOFEM Member",
          email,
          googleId: identity.googleId,
          consentedAt: new Date(),
        });
        trackAnalytics("member_registration");
      } else if (member.googleId && member.googleId !== identity.googleId) {
        return res.redirect(303, "/login?error=google-linked");
      } else if (!member.googleId) {
        await Member.updateOne(
          { _id: member._id },
          { $set: { googleId: identity.googleId } }
        );
      }

      trackAnalytics("member_login");
      req.session.regenerate((error) => {
        if (error) {
          return next(error);
        }
        req.session.member = {
          id: member.id,
          name: member.name,
          email: member.email,
        };
        req.session.save((saveError) => {
          if (saveError) {
            return next(saveError);
          }
          return res.redirect(303, "/account");
        });
      });
    } catch (error) {
      return next(error);
    }
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
    res.clearCookie("wofem.session", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
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

app.get("/api/staff/analytics", requireStaff, async (req, res, next) => {
  try {
    const firstDay = new Date();
    firstDay.setUTCHours(0, 0, 0, 0);
    firstDay.setUTCDate(firstDay.getUTCDate() - 29);

    const [memberCount, prayerCount, prayerStatuses, eventRows] = await Promise.all([
      Member.countDocuments(),
      PrayerRequest.countDocuments(),
      PrayerRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      AnalyticsCounter.find({ date: { $gte: firstDay } })
        .sort({ date: 1 })
        .lean(),
    ]);

    const dailyByDate = new Map();
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date(firstDay);
      date.setUTCDate(firstDay.getUTCDate() + offset);
      const key = date.toISOString().slice(0, 10);
      dailyByDate.set(key, {
        date: key,
        pageViews: 0,
        serviceViews: 0,
        resourceClicks: 0,
        memberRegistrations: 0,
        prayerRequests: 0,
      });
    }

    const eventTotals = {
      pageViews: 0,
      serviceViews: 0,
      resourceClicks: 0,
      memberRegistrations: 0,
      memberLogins: 0,
      prayerRequests: 0,
    };
    const dailyKeys = {
      page_view: "pageViews",
      service_view: "serviceViews",
      resource_click: "resourceClicks",
      member_registration: "memberRegistrations",
      member_login: "memberLogins",
      prayer_request: "prayerRequests",
    };
    for (const row of eventRows) {
      const key = row.date.toISOString().slice(0, 10);
      const metric = dailyKeys[row.type];
      if (!metric) continue;
      eventTotals[metric] += row.count;
      const daily = dailyByDate.get(key);
      if (daily && metric in daily) {
        daily[metric] += row.count;
      }
    }

    const statuses = { new: 0, prayed: 0, contacted: 0 };
    for (const status of prayerStatuses) {
      if (Object.hasOwn(statuses, status._id)) {
        statuses[status._id] = status.count;
      }
    }

    return res.json({
      members: memberCount,
      prayerRequests: prayerCount,
      prayerStatuses: statuses,
      last30Days: eventTotals,
      daily: Array.from(dailyByDate.values()),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/robots.txt", (req, res) => {
  const baseUrl = new URL(`${req.protocol}://${req.get("host")}`).origin;
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /admin/analytics\nDisallow: /account\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\nSitemap: ${baseUrl}/sitemap.xml\n`
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
  ["/style.css", "style.css"],
  ["/script.js", "script.js"],
  ["/admin.html", "admin.html"],
  ["/admin.css", "admin.css"],
  ["/admin.js", "admin.js"],
]);

app.get("/index.html", (req, res) => res.redirect(301, "/"));

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

app.use("/assets", express.static(path.join(__dirname, "assets"), {
  fallthrough: true,
  maxAge: isProduction ? "1d" : 0,
}));

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: "The request could not be completed. Please try again." });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  const nextApp = next({ dev: isDevelopment, hostname: "127.0.0.1", port });
  await nextApp.prepare();
  const handleNextRequest = nextApp.getRequestHandler();

  app.all("*", (req, res) => {
    const nonce = crypto.randomBytes(16).toString("base64");
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'self' https://www.facebook.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");
    req.headers["content-security-policy"] = contentSecurityPolicy;
    res.setHeader("Content-Security-Policy", contentSecurityPolicy);
    handleNextRequest(req, res);
  });

  app.listen(port, () => {
    console.log(`WOFEM website listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Could not start WOFEM website:", error);
  process.exit(1);
});
