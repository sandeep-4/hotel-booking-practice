const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");

//app middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.json());

const port = process.env.PORT || 8000;

// app.get("/api", (req, res) => {
//   res.json({
//     msg: "Welcome api",
//   });
// });

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to mongo " + err);
  });

//routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));
