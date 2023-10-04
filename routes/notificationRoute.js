const express = require("express");
const {
  NOTIFICATIONS_ROUTE,
  NOTIFICATIONS_MODAL_ROUTE,
  NOTIFICATION_UPDATE_ROUTE,
} = require("../config/routes");
const {
  addNewNotification,
  getActiveNotification,
  getAllNotifications,
  getFieldsById,
  deleteModal,
  updateModal,
} = require("../controllers/notificationController");
const { notificationValidations } = require("../middlewares/Validations");

const router = express.Router();

router.post(
  NOTIFICATIONS_ROUTE,
  notificationValidations.add,
  addNewNotification
);
router.get(
  NOTIFICATION_UPDATE_ROUTE,
  notificationValidations.getFields,
  getFieldsById
);
router.delete(
  NOTIFICATION_UPDATE_ROUTE,
  notificationValidations.getFields,
  deleteModal
);
router.put(
  NOTIFICATION_UPDATE_ROUTE,
  notificationValidations.updateModal,
  updateModal
);

router.get(NOTIFICATIONS_ROUTE, getActiveNotification);
router.get(NOTIFICATIONS_MODAL_ROUTE, getAllNotifications);

module.exports = router;
