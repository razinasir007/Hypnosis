const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { APP_PORT } = require("./config/config");
const { connectDb } = require("./config/connectDb");
const { ErrorHandler } = require("./middlewares/ErrorHandler");
const { logger } = require("./logger");
const cronJob = require("./cron/cronJob");
const userRouter = require("./routes/userRoute");
const favoriteRouter = require("./routes/favoritesRoute");
const categoryRouter = require("./routes/categoryRoute");
const audioRouter = require("./routes/audioRoute");
const playlistRouter = require("./routes/playlistRoute");
const notificationRouter = require("./routes/notificationRoute");
const adminRouter = require("./routes/adminRoute");
const subcategoryRouter = require("./routes/subcategoryRoute");
const statsRouter = require("./routes/statsRoute");
const cronRouter = require("./routes/cronRoute");


connectDb();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", userRouter);
app.use("/api", favoriteRouter);
app.use("/api", categoryRouter);
app.use("/api", audioRouter);
app.use("/api", playlistRouter);
app.use("/api", notificationRouter);
app.use("/api", subcategoryRouter);
app.use("/auth", adminRouter);
app.use("/api", statsRouter);
app.use("/api", cronRouter);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(ErrorHandler);

app.listen(APP_PORT | 8080, () => {
  logger.info("Server Listening on http://localhost:8080/");
});
