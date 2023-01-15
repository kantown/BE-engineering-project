const userModel = require("../models/user");
const bcrypt = require("bcrypt");

const addUser = async ({ username, email, password }) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    newUser.save();
    return newUser;
  } catch (err) {
    throw Error(err);
  }
};

// fetch record

const getUser = async (username) => {
  try {
    const foundUser = await userModel.findOne({
      username: username,
    });
    return foundUser;
  } catch (err) {
    console.error(err);
    throw Error(err);
  }
};

const getAllUsers = async () => {
  try {
    const foundUsers = await userModel.find();
    return foundUsers;
  } catch (err) {
    console.error(err);
  }
};

const getUsersCustomSubs = async (id) => {
  try {
    const customSubs = await userModel.findById(id);
    return customSubs.customSubscriptions;
  } catch (err) {
    throw Error(err);
  }
};

// update record
const updateUser = async (username, newUserData) => {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      {
        username: username,
      },
      {
        ...newUserData,
      },
      {
        new: true, // return updated document
        runValidators: true, // validate before update
      }
    );
    return updatedUser;
  } catch (err) {
    throw Error(err);
  }
};
module.exports = { addUser, getUser, getAllUsers, updateUser };
