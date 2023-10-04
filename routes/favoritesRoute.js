const express = require("express");
const { favoriteValidations } = require("../middlewares/Validations");
const {
  CREATE_BULK_FAVORITES_ROUTE,
  FAVORITE_ROUTE,
  GET_FAVORITES_ROUTE,
} = require("../config/routes");
const {
  createFavorite,
  addMultipleFavorites,
  deleteFavorite,
  getFavorites,
  findMostFavoritedAudio,
} = require("../controllers/favoritesController");

const router = express.Router();

router.post(
  FAVORITE_ROUTE,
  favoriteValidations.setFavoritesVal,
  createFavorite
);

router.post(
  CREATE_BULK_FAVORITES_ROUTE,
  favoriteValidations.setMultipleFavoritesVal,
  addMultipleFavorites
);

router.delete(
  FAVORITE_ROUTE,
  favoriteValidations.setFavoritesVal,
  deleteFavorite
);

router.get(
  GET_FAVORITES_ROUTE,
  favoriteValidations.getFavoritesVal,
  getFavorites
);

router.get(
  "/topFavorites",
  findMostFavoritedAudio
);

module.exports = router;
