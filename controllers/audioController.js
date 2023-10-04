const { validationResult } = require("express-validator");
const { Audio } = require("../models/Audio");
const { logger } = require("../logger");
const {
  BAD_REQUEST_STATUS_CODE,
  CREATE_STATUS_CODE,
  SUCCESS_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
} = require("../config/config");
const { Category } = require("../models/Category");

const addMultipleAudios = async (req, res, next) => {
  // logger.debug(req.body);
  try {
    const { audios } = req.body;
    if (audios && audios.length > 0) {
      const audio = await Audio.create(audios);
      return res.status(CREATE_STATUS_CODE).json({ success: true });
    }
    // logger.debug("%o", favs);
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find();
    // logger.debug(audios.length);
    res.status(SUCCESS_STATUS_CODE).json({ success: true, audios });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getAudiosByCategory = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { categoryId } = req.params;
    const { subCategoryId } = req.query;
    console.log(categoryId, subCategoryId);

    const category = await Category.findOne({ path: categoryId });

    if (!category) {
      return next({
        status: NOT_FOUND_STATUS_CODE,
        message: "Category Not found",
      });
    }

    let audios;

    if (subCategoryId) {
      audios = await Audio.find({
        categoryId: category._id,
        subCategoryId,
      });
    } else {
      audios = await Audio.find({
        categoryId: category._id,
      });
    }
    return res.status(200).json({
      success: true,
      audios: audios,
    });
  } catch (error) {
    return next({
      status: NOT_FOUND_STATUS_CODE,
      message: "Category Audios Not found",
    });
  }
};

const addAudio = async (req, res, next) => {
  // console.log(req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const audio = await Audio.create(req.body);
    return res.status(201).json({
      success: true,
      audio: audio,
    });
  } catch (error) {
    return next({
      status: NOT_FOUND_STATUS_CODE,
      message: "Category Audios Not found",
    });
  }
};

const editAudio = async (req, res, next) => {
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
    const { id } = req.params;
    const audio = await Audio.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    return res.status(200).json({ success: true, audio });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Audio not Updated" });
  }
};

const deleteAudio = async (req, res, next) => {
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
    const { id } = req.params;
    const audio = await Audio.findByIdAndDelete({ _id: id });
    return res.status(200).json({ success: true, audio });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Audio not deleted" });
  }
};

module.exports = {
  addMultipleAudios,
  getAudios,
  getAudiosByCategory,
  addAudio,
  editAudio,
  deleteAudio,
};
