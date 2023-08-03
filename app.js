// importing required modules
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();
const { MONGODB_URI } = process.env;

// middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");


mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB server");
  })
  .catch((error) => {
    console.log(error);
  });

// words schema and model
const wordsSchema = new mongoose.Schema({
  spelling: { type: String, required: true, unique: true },
  definition: { type: String, required: true },
});

const Word = mongoose.model("Word", wordsSchema);

// default words
const word1 = new Word({
  spelling: "happy",
  definition: "feeling or showing pleasure or contentment.",
});
const word2 = new Word({
  spelling: "studious",
  definition: "spending a lot of time studying or reading.",
});
const word3 = new Word({
  spelling: "serendipity",
  definition: "the occurrence and development of events by chance in a happy or beneficial way",
});

const defaultWords = [word1, word2, word3];

app.get("/", async (req, res) => {
  try {
    const foundWords = await Word.find();
    if (foundWords.length === 0) {
      await Word.insertMany(defaultWords);
      res.redirect("/");
    } else {
      res.render("home", { words: foundWords });
    }
  } catch (error) {
    console.log(error);
  }
});

app.route("/add").get((req, res) => {
  res.render("add");
}).post(async (req, res) => {
  try {
    const spelling = req.body.spelling;
    const definition = req.body.definition;
    await Word.create({
      spelling: spelling,
      definition: definition,
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.route("/words/:wordID").get(async (req, res) => {
  try {
    const wordID = req.params.wordID;
    const requestedWord = await Word.findById(wordID);
    res.render("edit", {
      wordID: wordID,
      spelling: requestedWord.spelling,
      definition: requestedWord.definition,
    });
  } catch (error) {
    console.log(error);
  }
}).patch(async (req, res) => {
  try {
    await Word.findByIdAndUpdate(req.params.wordID, req.body);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}).delete(async (req, res) => {
  try {
    await Word.findByIdAndDelete(req.params.wordID);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
