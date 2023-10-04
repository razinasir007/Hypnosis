const { default: axios } = require("axios");
const { Audio } = require("../models/Audio");
const Parser = require("rss-parser");
const { logger } = require("../logger");
const { secondsToTime } = require("./helpers");
const parser = new Parser();

const checkPodcast = async (url, isPremium) => {
  try {
    //
    const { data } = await axios.get(url);
    const audios = await Audio.find({ type: "podcast", isPremium: isPremium });
    logger.info(
      `Existing ${isPremium ? "premium" : "free"} podcasts ${audios.length}`
    );
    const feed = await parser.parseString(data);

    if (feed && feed.items.length > 0) {
      //   console.log(feed.items[0]);

      const count = feed.items.reduce((count, item) => {
        if (item.enclosure && item.enclosure.type === "audio/mpeg") {
          count += 1;
        }
        return count;
      }, 0);

      logger.info(`Rss ${isPremium ? "premium" : "free"} podcasts ${count}`);

      if (count > audios.length) {
        const updated = feed.items.filter(
          (item) => !audios.some((audio) => audio.productID === item.guid)
        );

        const tracks = [];
        for (let item of updated) {
          if (item.enclosure && item.enclosure.type === "audio/mpeg") {
            const key = item.guid;
            const bytes = item["enclosure"].length;
            const k = 1024;
            const dm = 1;
            const sizes = [
              "Bytes",
              "KB",
              "MB",
              "GB",
              "TB",
              "PB",
              "EB",
              "ZB",
              "YB",
            ];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            const trackSize =
              parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
            const published = item["pubDate"];
            const image = item.itunes.image;
            const regex = /(<([^>]+)>)/gi;
            let desc = " ";
            if (item.content) {
              desc = item.content.replace(regex, "");
            } else {
              desc = item.itunes.subtitle;
            }
            if (desc === "") {
              desc = item.title;
            }

            let audLength;
            if (isPremium) {
              audLength = item.itunes.duration
                ? secondsToTime(parseInt(item.itunes.duration))
                : "00:00";
            } else {
              audLength = item.itunes.duration ? item.itunes.duration : "";
            }
            // console.log("DESCRIPTION ",desc)
            let track = {
              type: "podcast",
              title: item.title ? item.title : "",
              length: audLength,
              size: trackSize,
              url: item["enclosure"].url,
              productID: key,
              googleID: key,
              summary: desc,
              published: published,
              image: image,
              isPremium: isPremium,
              categoryId: "64a7c49055aa5475854a2fbe",
            };

            // counter <= 10 && tracks.push(track);
            tracks.push(track);
          }
        }
        logger.info(
          `New ${isPremium ? "premium" : "free"} podcasts ${audios.length}`
        );

        if (tracks.length !== 0) {
          try {
            const newAudio = await Audio.create(tracks);
            logger.info(
              `${tracks.length} tracks added to the ${
                isPremium ? "premium" : "free"
              } podcasts`
            );
            logger.info("%o", newAudio);
          } catch (error) {
            logger.error(error);
          }
        } else {
          logger.info(
            `No new tracks in ${isPremium ? "premium" : "free"} podcasts`
          );
        }
      } else {
        logger.info(
          `No new tracks in ${isPremium ? "premium" : "free"} podcasts`
        );
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { checkPodcast };
