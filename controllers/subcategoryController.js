const { validationResult } = require("express-validator");
const { Category } = require("../models/Category");
const { SubCategory } = require("../models/SubCategory");
const { logger } = require("../logger");
const {
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
} = require("../config/config");

const editSubcategory = async (req, res, next) => {
  // logger.debug("%O", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { name, status } = req.body;
    const { id } = req.params;

    const subcategory = await SubCategory.findByIdAndUpdate(
      { _id: id },
      { name: name, status: status },
      { new: true }
    );

    if (subcategory) {
      return res.status(200).json({ success: true, subcategory });
    } else {
      return next({
        message: "Subcategory not Found",
        status: NOT_FOUND_STATUS_CODE,
      });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Subcategory not Updated" });
  }
};

const addSubcategory = async (req, res, next) => {
  logger.debug("%O", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { name, status, categoryId } = req.body;
    const category = await Category.findById({ _id: categoryId });
    if (category) {
      const subcategory = await SubCategory.create({
        name: name,
        status: status,
        categoryId: categoryId,
      });

      category.subCategories.push(subcategory._id);
      await category.save();

      return res.status(201).json({ success: true, subcategory });
    } else {
      return next({ message: "Subcategory not Added" });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Subcategory not Added" });
  }
};

const deleteSubcategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const subcategory = await SubCategory.findByIdAndDelete({ _id: id });
    if (subcategory) {
      console.log(subcategory);
      const category = await Category.findById({ _id: subcategory.categoryId });
      console.log(category, "before");
      category.subCategories = category.subCategories.filter((sub) => {
        if (sub.toString() === subcategory._id.toString()) {
          return false;
        }
        return true;
      });
      console.log(category, "after");

        await category.save();
    }

    return res.status(200).json({ success: true, subcategory });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Subcategory not deleted" });
  }
};

module.exports = { editSubcategory, addSubcategory, deleteSubcategory };
