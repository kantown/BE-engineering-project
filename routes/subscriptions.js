const express = require("express");
const router = express.Router();
const { getUser } = require("../operations/user.js");
const {
  getAllSubscriptions,
  addNewSubscription,
  getSubscription,
} = require("../operations/subscription.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.get("/getSubs/", authenticateToken, async (req, res) => {
  try {
    const result = await getAllSubscriptions();
    if (!result) {
      res
        .status(404)
        .send(JSON.stringify({ status: 404, message: "Not found" }));
    }
    res.send(result);
  } catch (err) {
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

router.post("/addSub/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const foundUser = await getUser(user.username);
    if (!foundUser || !foundUser.isAdmin) {
      res.sendStatus(403);
      return;
    }
    const { sub } = req.body;
    if (!sub.name || !sub.plan) {
      res.send(JSON.stringify({ status: 400, message: "Bad request" }));
    }

    const retrievedSub = await getSubscription(_id);
    if (retrievedSub) {
      res
        .status(400)
        .send(
          JSON.stringify({ status: 400, message: "Username is already in use" })
        );
    }

    const response = await addNewSubscription(sub.name, sub.plan);
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

module.exports = router;
