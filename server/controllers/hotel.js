const Hotel = require("../models/hotel");
const Order = require("../models/order");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let hotel = new Hotel(fields);
    hotel.postedBy = req.user._id;
    if (files.image) {
      hotel.image.data = fs.readFileSync(files.image.path);
      hotel.image.contentType = files.image.type;
    }
    await hotel.save((err, result) => {
      if (err) {
        res.status(401).send("error saving" + err);
      }
      res.json(result);
    });
  } catch (error) {
    res.status(401).json({
      err: error.message,
    });
  }
};

exports.hotels = async (req, res) => {
  let all = await Hotel.find({})
    .limit(24)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  res.json(all);
};

exports.image = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  if (hotel && hotel.image && hotel.image.data !== null) {
    res.set("Content-Type", hotel.image.contentType);
    return res.send(hotel.image.data);
  }
};

exports.sellerHotel = async (req, res) => {
  let all = await Hotel.find({ postedBy: req.user._id })
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();

  res.json(all);
};

exports.remove = async (req, res) => {
  let remove = await Hotel.findByIdAndRemove(req.params.hotelId)
    .select("-image.data")
    .exec();
  res.json(remove);
};

exports.read = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  res.json(hotel);
};

exports.update = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };

    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = file.image.type;
      data.image = image;
    }
    let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
      new: true,
    })
      .select("-image.data")
      .exec();
    res.json(updated);
  } catch (error) {
    res.status(401).json({
      err: error.message,
    });
  }
};

exports.userHotelBookings = async (req, res) => {
  const all = await Order.find({ orderedBy: req.user._id })
    .select("session")
    .populate("hotel", "-image.data")
    .populate("orderedBy", "_id name")
    .exec();
  res.json(all);
};

exports.isAlreadyBooked = async (req, res) => {
  const { hotelId } = req.params;
  const userOrder = await Order.find({ orderedBy: req.user._id })
    .select("hotel")
    .exec();
  //checking hotel id
  let ids = [];
  for (let i = 0; i < userOrder.length; i++) {
    ids.push(userOrder[i].hotel.toString());
  }
  res.json({
    ok: ids.includes(hotelId),
  });
};

exports.searchListings = async (req, res) => {
  const { location, date, bed } = req.body;

  const fromDate = date.split(",");
  let result = await Hotel.find({
    from: { $gte: new Date(fromDate[0]) },
    location,
  })
    .select("-image.data")
    .exec();
  res.json(result);
};
