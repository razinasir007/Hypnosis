const { validationResult } = require("express-validator");
const {
  BAD_REQUEST_STATUS_CODE,
  CREATE_STATUS_CODE,
  SUCCESS_STATUS_CODE,
  ACCEPTED_STATUS_CODE,
} = require("../config/config");
const { Playlist } = require("../models/Playlist");
const { PlaylistAudio } = require("../models/PlaylistAudio");
const { default: mongoose } = require("mongoose");
const { logger } = require("../logger");

const addPlaylist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { userId, name, audioId } = req.body;

    const playlist = await Playlist.create({ userId, name });

    if (audioId !== undefined) {
      try {
        const playlistAudio = await PlaylistAudio.create({
          playlistId: playlist._id,
          audioId: audioId,
        });
        return res
          .status(CREATE_STATUS_CODE)
          .json({ success: true, playlist, playlistAudio });
      } catch (error) {
        logger.error("%O", error);
        return next({ message: "Playlist created. Error Creating Audio" });
      }
    }

    return res.status(CREATE_STATUS_CODE).json({ success: true, playlist });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const addMultiplePlaylist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { userId, playlists } = req.body;
    const playlistData = playlists.map((playlist) => {
      return {
        name: playlist.title,
        userId: userId,
      };
    });
    const newPlaylists = await Playlist.create(playlistData);

    const audios = [];

    playlists.forEach((playlist) => {
      newPlaylists.forEach((item) => {
        if (playlist.title === item.name) {
          playlist._id = item._id;
        }
      });

      playlist.tracks.forEach((audio) => {
        if (playlist._id) {
          let tempAudio = {
            audioId: audio._id,
            playlistId: playlist._id,
          };
          audios.push(tempAudio);
        }
      });
    });

    if (audios.length !== 0) {
      try {
        for (let i = 0; i < audios.length; i += 25) {
          let aud = audios.slice(i, i + 25);
          // console.log(aud);
          await PlaylistAudio.create(aud);
        }
      } catch (error) {
        logger.error("%O", error);
        return next({ message: "Playlist created. Error Creating Audios" });
      }
    }

    return res.status(CREATE_STATUS_CODE).json({ success: true, playlists });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const addAudioToPlaylist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { audioId } = req.body;
    const { playlistId } = req.params;

    const playlistAudio = await PlaylistAudio.create({
      playlistId: playlistId,
      audioId: audioId,
    });
    return res
      .status(CREATE_STATUS_CODE)
      .json({ success: true, playlistAudio });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getPlaylist = async (req, res, next) => {
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
    // console.log(userId);
    // const playlist = await Playlist.find({userId})

    const playlists = await Playlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "playlistaudios",
          localField: "_id",
          pipeline: [{ $project: { audioId: "$audioId" } }],
          foreignField: "playlistId",
          as: "audio",
        },
      },
      {
        $unwind: {
          path: "$audio",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "audios",
          localField: "audio.audioId",
          foreignField: "_id",
          as: "audio.audio",
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          audios: { $push: "$audio.audio" },
        },
      },
      {
        $project: {
          name: "$name",
          audios: {
            $reduce: {
              input: "$audios",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]).exec();

    return res.status(SUCCESS_STATUS_CODE).json({ success: true, playlists });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const deletePlaylistAudio = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { audioId, playlistId } = req.params;

    const playlistAudio = await PlaylistAudio.findOneAndDelete({
      playlistId: playlistId,
      audioId: audioId,
    });
    return res
      .status(ACCEPTED_STATUS_CODE)
      .json({ success: true, playlistAudio });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const deletePlaylist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findByIdAndDelete({
      _id: playlistId,
    });

    const audios = await PlaylistAudio.deleteMany({ playlistId: playlistId });

    return res
      .status(ACCEPTED_STATUS_CODE)
      .json({ success: true, audios, playlist });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

module.exports = {
  addPlaylist,
  addMultiplePlaylist,
  addAudioToPlaylist,
  getPlaylist,
  deletePlaylistAudio,
  deletePlaylist,
};
