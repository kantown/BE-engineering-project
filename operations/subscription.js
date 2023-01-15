const subModel = require("../models/subscription");

const addNewSubscription = (name, plan) => {
  try {
    const newSub = new subModel({
      name,
      plan,
    });
    newSub.save();
    return true;
  } catch (err) {
    throw Error(err);
  }
};

const getSubscription = async (id) => {
  try {
    const foundSub = await subModel.findById(id);
    return foundSub;
  } catch (err) {
    throw Error(err);
  }
};

const getAllSubscriptions = async () => {
  try {
    const foundSubs = await subModel.find();
    return foundSubs;
  } catch (err) {
    throw Error(err);
  }
};

module.exports = { addNewSubscription, getSubscription, getAllSubscriptions };
