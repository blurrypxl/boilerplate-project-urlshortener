require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// DB Configuration
mongoose
  .connect("mongodb+srv://admin:admin@fcc-back-end-developmen.s6ppozo.mongodb.net/?retryWrites=true&w=majority")
  .then(function () {
    console.log("DB Connected");
  })
  .catch(function (err) {
    if (err) console.error(err);
  });

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true })); // Get input from client

app.use(bodyParser.json()); // Parse JSON

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Schema's DB
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
});
const urlModel = mongoose.model("urlModel", urlSchema);

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Url-shortener API
app.post("/api/shorturl", async function (req, res) {
  const url = req.body.url;

  if (validUrl.isHttpsUri(url)) {
    const short_url = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const newUrl = new urlModel({ original_url: url, short_url: short_url });

    await newUrl.save();

    res.json({ original_url: url, short_url: short_url });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url?", async function (req, res) {
  const getShortUrl = req.params.short_url;
  const getUrl = await urlModel.findOne({ short_url: getShortUrl }).exec();

  console.log(getUrl);

  res.redirect(getUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
