const mongoose = require("mongoose");
const { MONGO_URL } = require("../config/config.js");
const { logger } = require("../logger.js");
const {secondsToTime} = require("../utils/helpers.js")
const uri = MONGO_URL;

const connectDb = async () => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      logger.info("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB", error);
    });

  // mongoose.connection.once('open', async () => {
  //   const collections = await mongoose.connection.db.listCollections().toArray();
  //   const collectionNames = collections.map((collection) => collection.name);
  //   console.log(collectionNames);

  //   // Close the Mongoose connection
  //   mongoose.connection.close();
  // });
  // mongoose.connection.once("open", async () => {
  //   try {
  //     const Audio = mongoose.model("Audio"); // Assuming you have defined the Audio model

  //     const audios = await Audio.find({ type: "podcast",isPremium:true });

  //     const updatePromises = audios.map(async (audio) => {
  //       const newImage = parseInt(audio.length);

  //       return Audio.updateOne({ _id: audio._id }, { length: secondsToTime(newImage) });

  //     });

  //     // Wait for all updates to complete
  //     await Promise.all(updatePromises);
  //     // console.log(audios[0])
  //     // Close the Mongoose connection
  //     console.log("closed")
  //     mongoose.connection.close();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });
};

module.exports = { connectDb };
