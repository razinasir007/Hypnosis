const express = require("express");
const { CATEGORY_ROUTE, GET_CATEGORIES_ROUTE, GET_CATEGORY_AUDIO_ROUTE } = require("../config/routes");
const { categoryValidations } = require("../middlewares/Validations");
const { addCategory, getCategories, getCateoryWithAudios } = require("../controllers/categoryController");


const router = express.Router();

router.post(CATEGORY_ROUTE,categoryValidations.addCategory,addCategory)

router.get(GET_CATEGORIES_ROUTE,getCategories)

router.get(GET_CATEGORY_AUDIO_ROUTE,getCateoryWithAudios)

module.exports = router;
