const { validationResult } = require("express-validator");
const { logger } = require("../logger");
const { Favorites } = require("../models/Favorites");
const {
  BAD_REQUEST_STATUS_CODE,
  SUCCESS_STATUS_CODE,
  CREATE_STATUS_CODE,
} = require("../config/config");
const { Audio } = require("../models/Audio");

const createFavorite = async (req, res, next) => {
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
    const { userId, productId } = req.body;

    const existingFavorite = await Favorites.findOne({ userId, productId });
    if (existingFavorite) {
      // logger.debug("Already Exists");

      return res
        .status(SUCCESS_STATUS_CODE)
        .json({ success: true, favorite: existingFavorite });
    }

    const newFavorite = await Favorites.create({ userId, productId });
    // logger.debug("%o", newFavorite);
    return res
      .status(CREATE_STATUS_CODE)
      .json({ success: true, favorite: newFavorite });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const addMultipleFavorites = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { userId, productIds } = req.body;
    const favorites = productIds.map((prod) => {
      return {
        userId,
        productId: prod,
      };
    });

    const favs = await Favorites.create(favorites);
    // logger.debug("%o", favs);
    return res
      .status(CREATE_STATUS_CODE)
      .json({ success: true, favorites: favs });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const deleteFavorite = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { userId, productId } = req.body;

    const deleted = await Favorites.findOneAndRemove({ userId, productId });
    // logger.debug("%o", deleted);
    return res.status(SUCCESS_STATUS_CODE).json({ success: true });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getFavorites = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { userId } = req.params;
    const favs = await Favorites.find({ userId });
    // logger.debug("%o", favs);
    if (favs.length !== 0) {
      const favorites = [...new Set(favs.map((fav) => fav.productId))];
      return res.status(SUCCESS_STATUS_CODE).json({ success: true, favorites });
    } else {
      return res
        .status(SUCCESS_STATUS_CODE)
        .json({ success: true, favorites: null });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const findMostFavoritedAudio = async (req, res, next) => {
  try {
    const top10MostFavoritedAudios = await Favorites.aggregate([
      { $group: { _id: "$productId", favoritesCount: { $sum: 1 } } },
      { $sort: { favoritesCount: -1 } },
      { $limit: 10 },
    ]);

    const audioIds = top10MostFavoritedAudios.map((audio) => audio._id);
    const top10Audios = await Audio.find({ productID: { $in: audioIds } });

    const result = top10Audios.map((audio) => ({
      audioname: audio.title,
      favSum: top10MostFavoritedAudios.find(
        (item) => item._id.toString() === audio.productID.toString()
      ).favoritesCount,
    }));
    result.sort((a, b) => b.favSum - a.favSum);

    return res
      .status(SUCCESS_STATUS_CODE)
      .json({ success: true, result });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

module.exports = {
  createFavorite,
  addMultipleFavorites,
  deleteFavorite,
  getFavorites,
  findMostFavoritedAudio,
};
