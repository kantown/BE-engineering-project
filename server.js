require("dotenv").config;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

DATABASE_URL = "mongodb://127.0.0.1/database";

mongoose.connect(DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const subscriptionsRouter = require("./routes/subscriptions");
app.use("/subscriptions", subscriptionsRouter);

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

app.listen(8080, () => console.log("Server started"));
