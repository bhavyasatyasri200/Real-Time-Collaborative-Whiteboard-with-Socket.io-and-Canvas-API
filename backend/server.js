// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// const authRoutes = require("./routes/authRoutes");
// const boardRoutes = require("./routes/boardRoutes");
// const socketHandler = require("./socket/socketHandler");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/health", (req, res) => {
//   res.json({
//     status: "ok",
//     timestamp: new Date().toISOString()
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/boards", boardRoutes);

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" }
// });

// socketHandler(io);

// const PORT = process.env.PORT || 3001;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const http     = require("http");
const session  = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");

const authRoutes    = require("./routes/authRoutes");
const boardRoutes   = require("./routes/boardRoutes");
const socketHandler = require("./socket/socketHandler");

// ── Passport Google Strategy ───────────────────────────────────────────────
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // You can save user to DB here if needed
      const user = {
        id:    profile.id,
        name:  profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done)   => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── App setup ──────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,   // ← required for session cookies
}));

app.use(express.json());

// ── Session middleware (must be before passport) ───────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || "whiteboard_secret",
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   false,   // set true only if using HTTPS
    httpOnly: true,
    maxAge:   24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
  });
});

// ── Auth routes ────────────────────────────────────────────────────────────
// Google OAuth — redirects user to Google login page
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback — Google redirects here after login
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  }),
  (req, res) => {
    // Success — send user back to frontend
    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
  }
);

// Session check — frontend calls this to get logged-in user
app.get("/api/auth/session", (req, res) => {
  if (req.user) return res.json({ user: req.user });
  res.status(401).json({ error: "Not authenticated" });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.logout(() => res.json({ success: true }));
});

// ── Other routes ───────────────────────────────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/api/boards", boardRoutes);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:      process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

socketHandler(io);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});