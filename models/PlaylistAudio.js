const mongoose = require("mongoose");

const playlistAudioSchema = new mongoose.Schema(
  {
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },
    audioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audio",
      required: true,
    },
  },
  { timestamps: true }
);

const PlaylistAudio = mongoose.model("PlaylistAudio", playlistAudioSchema);

module.exports = { PlaylistAudio };
