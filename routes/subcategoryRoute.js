const express = require("express");
const {
  SUBCATEGORY_ROUTE,
  EDIT_SUBCATEGORY_ROUTE,
} = require("../config/routes");
const { subcategoryValidations } = require("../middlewares/Validations");
const {
  editSubcategory,
  addSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

const router = express.Router();

router.post(
  SUBCATEGORY_ROUTE,
  subcategoryValidations.addSubCategory,
  addSubcategory
);

router.put(
  EDIT_SUBCATEGORY_ROUTE,
  subcategoryValidations.editsubCategory,
  editSubcategory
);

router.delete(
  EDIT_SUBCATEGORY_ROUTE,
  subcategoryValidations.delSubCategory,
  deleteSubcategory
);

module.exports = router;
