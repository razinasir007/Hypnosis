const express = require("express");
const {
  ADD_BULK_AUDIO_ROUTE,
  AUDIO_ROUTE,
  GET_AUDIO_BY_CATEGORY,
  UPDATE_AUDIO_ROUTE,
} = require("../config/routes");
const {
  addMultipleAudios,
  getAudios,
  getAudiosByCategory,
  addAudio,
  editAudio,
  deleteAudio,
} = require("../controllers/audioController");
const { audioValidations } = require("../middlewares/Validations");

const router = express.Router();

router.post(AUDIO_ROUTE, audioValidations.addAudio, addAudio);
router.put(UPDATE_AUDIO_ROUTE, audioValidations.editAudio, editAudio);
router.delete(UPDATE_AUDIO_ROUTE, audioValidations.delAudio, deleteAudio);

// router.post(ADD_BULK_AUDIO_ROUTE,addMultipleAudios)
router.get(AUDIO_ROUTE, getAudios);
router.get(
  GET_AUDIO_BY_CATEGORY,
  audioValidations.audioCategory,
  getAudiosByCategory
);

module.exports = router;
