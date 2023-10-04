const { validationResult } = require("express-validator");
const { Category } = require("../models/Category");
const { SubCategory } = require("../models/SubCategory");
const { logger } = require("../logger");
const {
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
} = require("../config/config");
const { Audio } = require("../models/Audio");

const addCategory = async (req, res, next) => {
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
    const { name, desc, path, subCategories } = req.body;

    // Create the category
    const category = new Category({ name, desc, code });

    if (subCategories && subCategories.length > 0) {
      // If subcategories are provided, create and associate them with the category
      const newSubs = subCategories.map((sub) => {
        return {
          ...sub,
          categoryId: category._id,
        };
      });
      const createdSubcategories = await SubCategory.create(newSubs);

      // Extract the IDs of the created subcategories
      const subcategoryIds = createdSubcategories.map(
        (subcategory) => subcategory._id
      );

      // Set the subcategories field of the category
      category.subCategories = subcategoryIds;
    }

    // Save the category
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Category not added" });
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("subCategories");
    res.status(200).json({ success: true, categories });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getCateoryWithAudios = async (req, res, next) => {
  let { path, isPremium } = req.query;
  // console.log(path,isPremium);
  if (isPremium) {
    isPremium = isPremium === "true" ? true : false;
  }
  if (path) {
    try {
      // Find the category and populate its subcategories
      const category = await Category.findOne({ path });

      if (!category) {
        return next({
          status: NOT_FOUND_STATUS_CODE,
          message: "Category Not found",
        });
      }
      // logger.info("%o", category);

      const subcategories = await SubCategory.find({
        categoryId: category._id,
      });
      let audios;
      if (subcategories.length > 0) {
        // If there are subcategories, we group the audios by subcategory
        audios = await SubCategory.aggregate([
          {
            $match: {
              $and: [{ categoryId: category._id }, { status: "active" }],
            },
          },
          {
            $lookup: {
              from: "audios",
              pipeline: [
                {
                  $match: {
                    $and: [{ status: "active" }, { categoryId: category._id }],
                  },
                },
              ],
              localField: "_id",
              foreignField: "subCategoryId",
              as: "tracks",
            },
          },
          {
            $project: {
              _id: "$_id",
              title: "$name",
              tracks: "$tracks",
            },
          },
        ]);
      } else {
        audios = await Audio.find({
          categoryId: category._id,
          status: "active",
          isPremium,
        });
      }
      // console.log(audios.length);
      res.status(200).json({
        success: true,
        audios: audios,
      });
    } catch (error) {
      logger.error("%O", error);
      return next({ message: "Internal Server Error" });
    }
  } else {
    return next({
      status: NOT_FOUND_STATUS_CODE,
      message: "Category Not found",
    });
  }
};

module.exports = { addCategory, getCategories, getCateoryWithAudios };
