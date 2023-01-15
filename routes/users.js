const express = require("express");
const router = express.Router();
const { addUser, getUser, updateUser } = require("../operations/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const updateSubscriptions = require("../utils/updateSubscriptions");
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

router.get("/getUser", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const result = await getUser(user.username);
    if (!result) {
      res
        .status(404)
        .send(JSON.stringify({ status: 404, message: "Not found" }));
    }
    const updatedUserData = updateSubscriptions(result);
    if (updatedUserData) {
      await updateUser(user.username, { subs: updatedUserData.subs });
      const userData = {
        username: updatedUserData.username,
        email: updatedUserData.email,
        isAdmin: updatedUserData.isAdmin,
        subs: updatedUserData.subs,
      };
      res.send(userData);
    } else {
      const userData = {
        username: result.username,
        email: result.email,
        isAdmin: result.isAdmin,
        subs: result.subs,
      };
      res.send(userData);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

router.post("/updateUser/", authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username && !email) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
    }
    const retrievedUser = await getUser(username);
    if (retrievedUser) {
      res
        .status(400)
        .send(
          JSON.stringify({ status: 400, message: "Username is already in use" })
        );
    }
    const user = req.user;
    const result = await updateUser(user.username, { username, email });
    if (!result) {
      res
        .status(404)
        .send(JSON.stringify({ status: 400, message: "Not found" }));
    }
    const userData = {
      username: result.username,
      email: result.email,
      isAdmin: result.isAdmin,
    };
    res.send(userData);
  } catch (err) {
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

router.post("/addSub/", authenticateToken, async (req, res) => {
  try {
    const { sub } = req.body;
    if (!sub) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
    }
    const user = req.user;
    const userData = await getUser(user.username);
    const subs = [...userData.subs, sub];
    const result = await updateUser(user.username, { subs });
    if (!result) {
      res
        .status(404)
        .send(JSON.stringify({ status: 400, message: "Not found" }));
    }
    const newData = {
      username: result.username,
      email: result.email,
      isAdmin: result.isAdmin,
      subs: result.subs,
    };
    res.send(newData);
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

router.post("/deleteSub/", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
    }
    const user = req.user;
    const userData = await getUser(user.username);
    const subWithIdIndex = userData.subs.findIndex(
      (sub) => sub._id.toString() === id
    );
    if (subWithIdIndex > -1) {
      userData.subs.splice(subWithIdIndex, 1);
    }

    const result = await updateUser(user.username, { subs: userData.subs });
    if (!result) {
      res
        .status(404)
        .send(JSON.stringify({ status: 400, message: "Not found" }));
    }
    const newData = {
      username: result.username,
      email: result.email,
      isAdmin: result.isAdmin,
      subs: result.subs,
    };
    res.send(newData);
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify({ status: 500, message: err }));
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
    }
    const user = await addUser({ username, email, password });
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send({ status: 500, message: "Problem has occurred" });
    throw Error(err);
  }
});

router.post("/login/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
      return;
    }

    const user = await getUser(username);
    if (!user) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Invalid data" }));
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Invalid data" }));
      return;
    }
    const data = {
      username: user.username,
    };
    const authToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).send({ authToken: authToken });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(JSON.stringify({ status: 500, message: "Problem has occurred" }));
  }
});

router.post("/register/", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      res
        .status(400)
        .send(JSON.stringify({ status: 400, message: "Missing parameters" }));
    }
    const user = await getUser(username);
    if (user) {
      res
        .status(400)
        .send(
          JSON.stringify({ status: 400, message: "Username is already in use" })
        );
    }
    const newUser = await addUser({ username, password, email });
    if (!newUser) {
      res.status(500).send(
        JSON.stringify({
          status: 500,
          message: "There was a problem while creating account",
        })
      );
    }
    res.status(200).send(newUser);
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/isAuth/", async (req, res) => {
  try {
    res.send(req.session.user);
  } catch (err) {
    res
      .status(500)
      .send(JSON.stringify({ status: 500, message: "Problem has occurred" }));
  }
});

module.exports = router;
