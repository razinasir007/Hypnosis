const express = require("express");
const {
  login,
  updateCheckIn,
  getCheckIn,
  getUsers,
  getUsersInformation,
  getUsersCreatedDaily,
  updateSubscriptionInfo,
} = require("../controllers/userController");
const { userValidations } = require("../middlewares/Validations");
const {
  LOGIN_ROUTE,
  GET_CHECK_IN_ROUTE,
  UPDATE_CHECK_IN_ROUTE,
} = require("../config/routes");

const router = express.Router();

router.post(LOGIN_ROUTE, userValidations.loginVal, login);
router.post(
  "/subscription",
  userValidations.addSubscription,
  updateSubscriptionInfo
);

router.get(GET_CHECK_IN_ROUTE, userValidations.getCheckInVal, getCheckIn);
router.get("/users", getUsers);
router.get("/usersInfo", getUsersInformation);
router.get("/usersCreated", getUsersCreatedDaily);

router.patch(
  UPDATE_CHECK_IN_ROUTE,
  userValidations.updateCheckInVal,
  updateCheckIn
);

module.exports = router;
