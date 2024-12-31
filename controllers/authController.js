const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Signup route (manual registration)
const register = async (req, res) => {
  const { email, password, firstName, lastName, clientUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ status: false, message: "Email already exist" });
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

module.exports = { register };
