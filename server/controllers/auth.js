const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  //error handle
  if (!name) {
    return res.status(400).send("Name is required");
  }
  if (!password && password.length < 8) {
    return res
      .status(400)
      .send("Password is required and should be min 8 characters long");
  }
  let userExist = await User.findOne({ email }).exec();
  if (userExist) return res.status(401).send("Email already taken");
  //saving user
  const user = new User(req.body);
  try {
    await user.save();
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.send("Error Registering");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("Invalid credintials");

    user.comparePassword(password, (err, match) => {
      if (!match || err) {
        return res.status(401).send("invalid credinatilas");
      }
      let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updtaedAt: user.upudatedAt,
          stripe_account_id: user.stripe_account_id,
          stripe_seller: user.stripe_seller,
          stripeSession: user.stripeSession,
        },
      });
    });
  } catch (error) {
    console.log(error);
    return res.send("Error Login");
  }
};
