const express = require("express");
const {
  PLAYLIST_ROUTE,
  PLAYLIST_AUDIO_ROUTE,
  GET_PLAYLIST_ROUTE,
  DELETE_PLAYLIST_AUDIO_ROUTE,
  DELETE_PLAYLIST_ROUTE,
  ADD_BULK_PLAYLISTS_ROUTE,
} = require("../config/routes");
const {
  addPlaylist,
  addAudioToPlaylist,
  getPlaylist,
  deletePlaylistAudio,
  deletePlaylist,
  addMultiplePlaylist,
} = require("../controllers/playlistController");
const { playlistValidations } = require("../middlewares/Validations");

const router = express.Router();

router.post(PLAYLIST_ROUTE, playlistValidations.addPlaylist, addPlaylist);
router.post(ADD_BULK_PLAYLISTS_ROUTE, addMultiplePlaylist);

router.post(
  PLAYLIST_AUDIO_ROUTE,
  playlistValidations.addPlaylistAudio,
  addAudioToPlaylist
);

router.get(GET_PLAYLIST_ROUTE, playlistValidations.getPlaylist, getPlaylist);

router.delete(
  DELETE_PLAYLIST_ROUTE,
  playlistValidations.delPlaylist,
  deletePlaylist
);

router.delete(
  DELETE_PLAYLIST_AUDIO_ROUTE,
  playlistValidations.delPlaylistAudio,
  deletePlaylistAudio
);

module.exports = router;
