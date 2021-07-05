const expressJwt = require("express-jwt");

const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

const hotelOwner = async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  let owner = (await hotel.postedBy._id.toString()) === req.user._id.toString();
  if (!owner) {
    return res.status(403).send("Access denied");
  }
  next();
};

const hello = () => {
  console.log("just try");
};

module.exports = { requireSignin, hello, hotelOwner };

// exports.requireSignin = expressJWT({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
// });
