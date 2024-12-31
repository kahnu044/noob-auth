const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Signup route (manual registration)
const register = async (req, res) => {
  const { email, password, firstName, lastName, clientUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ status: false, message: "Email already exist" });
    }

    const newUser = new User({
      email,
      firstName,
      lastName,
      clientApps: [
        {
          clientUrl,
          authType: "password",
          password,
        },
      ],
    });

    await newUser.save();

    res
      .status(201)
      .json({ status: true, message: "User signed up successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Manual login route (email/password)
const login = async (req, res) => {
  const { email, password, clientUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User not found. Please sign up." });
    }

    const clientApp = user.clientApps.find(
      (app) => app.clientUrl === clientUrl
    );

    if (!clientApp) {
      user.clientApps.push({ clientUrl, authType: "password", password });
      await user.save();
      return res.status(200).json({
        status: true,
        message: "Logged in from new client",
        clientUrl,
      });
    }

    if (clientApp.authType === "google") {
      return res.status(400).json({
        status: false,
        message: "You have already logged in with Google for this client.",
      });
    }

    const isMatch = await user.comparePassword(password, clientUrl);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials for this client",
      });
    }

    const token = jwt.sign(
      { email: user.email, clientUrl: user.clientApps },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      clientUrl,
      accessToken: token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Google OAuth URL
const googleOAuth = (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(googleAuthUrl);
};

// Google OAuth callback
const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    // Retrieve user info using the access token
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userData = await userResponse.json();

    if (!userData.email) {
      return res.status(400).send("Email is required to complete login");
    }

    const clientUrl = req?.cookies?.clientUrl || "http://example.com";

    // Check if the user already exists in the database
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        email: userData.email,
        firstName: userData.given_name || "Unknown",
        lastName: userData.family_name || "User",
        googleId: userData.sub,
        clientApps: [
          {
            clientUrl,
            authType: "google",
          },
        ],
      });
    } else {
      // If user exists, update the clientApps array
      const existingApp = user.clientApps.find(
        (app) => app.clientUrl === clientUrl
      );

      if (existingApp) {
        // Update authType if necessary
        existingApp.authType = "google";
      } else {
        // Add a new entry for the client app
        user.clientApps.push({
          clientUrl,
          authType: "google",
        });
      }

      // Update googleId if not already set
      if (!user.googleId) {
        user.googleId = userData.sub;
      }
    }

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, clientUrl },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Set the token as a cookie and redirect back to the client app
    res.cookie("token", token, { httpOnly: true, secure: false });
    return res.redirect(`${clientUrl}?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(500).send("Authentication failed");
  }
};

module.exports = { register, login, googleOAuth, googleOAuthCallback };
