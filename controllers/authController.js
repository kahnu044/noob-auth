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

    console.log("use, userr",user)
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
      "JWT_SECRET",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });

    return res
      .status(200)
      .json({ status: true, message: "Login successful", clientUrl,accessToken: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { register, login };
