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
        .json({ success: false, message: "Email already exist" });
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
      .json({ success: true, message: "User signed up successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
        .json({ success: false, message: "User not found. Please sign up." });
    }

    const clientApp = user.clientApps.find(
      (app) => app.clientUrl === clientUrl
    );

    if (!clientApp) {
      user.clientApps.push({ clientUrl, authType: "password", password });
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Logged in from new client",
        clientUrl,
      });
    }

    if (clientApp.authType === "google") {
      return res.status(400).json({
        success: false,
        message: "You have already logged in with Google for this client.",
      });
    }

    const isMatch = await user.comparePassword(password, clientUrl);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials for this client",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        googleId: user?.googleId,
        clientUrl: clientApp.clientUrl,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      clientUrl,
      accessToken: token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
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

    const clientUrl = req?.cookies?.clientUrl;

    if (clientUrl) {
      let user = await User.findOne({ email: userData.email });

      if (!user) {
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
        const existingClient = user.clientApps.find(
          (app) => app.clientUrl === clientUrl && app.authType === "google"
        );

        if (!existingClient) {
          user.clientApps.push({ clientUrl, authType: "google" });
        }
      }

      // Update googleId if not already set
      if (!user.googleId) {
        user.googleId = userData.sub;
      }

      await user.save();

      // Generate a JWT token
      const payload = {
        id: user._id,
        email: user.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        googleId: user?.googleId,
        clientUrl,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.clearCookie("clientUrl");
      res.cookie("token", token, { httpOnly: true, secure: false });
      return res.redirect(`${clientUrl}?token=${token}`);
    }

    // No clientUrl
    const token = jwt.sign({ email: userData.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, secure: false });
    return res.send(
      `Hello: ${userData?.name}, Login successful! You can now close this tab.`
    );
  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(500).send("Authentication failed");
  }
};

// Validate the user by token
const validateToken = async (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ success: false, message: "Invalid token" }); // 401 for authentication issues
  }

  try {
    // Retrieve user by email
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" }); // 404 for missing user
    }

    // Check if the clientUrl in headers matches
    const clientUrl = req.headers.clienturl;
    if (!clientUrl || clientUrl !== req.user.clientUrl) {
      return res.status(403).json({
        success: false,
        message: "Invalid clientUrl",
      });
    }

    // Verify user access to the client app
    const clientApp = user.clientApps.find(
      (app) => app.clientUrl === clientUrl
    );
    if (!clientApp) {
      return res.status(403).json({
        success: false,
        message: "This user has no access to the specified client app",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token validated successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        clientUrl: clientApp.clientUrl,
      },
    });
  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(500).json({ success: false, message: "Server error" }); // 500 for unexpected errors
  }
};

const logout = async (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const clientUrl = req.headers.clienturl;
  if (!clientUrl || clientUrl !== req.user.clientUrl) {
    return res.status(403).json({
      success: false,
      message: "Invalid clientUrl",
    });
  }

  try {
    res.clearCookie("token");
    res.clearCookie("clientUrl");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = {
  register,
  login,
  googleOAuth,
  googleOAuthCallback,
  validateToken,
  logout
};
