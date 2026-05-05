const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { signupSchema, loginSchema } = require("../middleware/validate");

exports.signup = async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) throw { status: 400, message: error.details[0].message };

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw { status: 400, message: "User already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });

    res.json({ message: "User created" });

  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw { status: 400, message: error.details[0].message };

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw { status: 400, message: "User not found" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { status: 400, message: "Wrong password" };

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    next(err);
  }
};