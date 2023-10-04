const { SUCCESS_STATUS_CODE, CREATE_STATUS_CODE } = require("../config/config");

const { Admin } = require("../models/Admin");
const { logger } = require("../logger");

const adminCreate = async (req, res, next) => {
  //   logger.debug("%O", req.body);

  try {
    const data = req.body.data;
    const type = req.body.type;
    let emailAddresses = undefined;
    if (data.email_addresses) {
      emailAddresses = data.email_addresses.map((email) => email.email_address);
    }
    if (type === "user.created") {
      const newAdmin = await Admin.create({
        username: data.username,
        emailAddresses,
        userId: data.id,
        profileImageUrl: data.profile_image_url,
      });
      logger.debug("%O", newAdmin);
      return res
        .status(CREATE_STATUS_CODE)
        .json({ success: true, admin: newAdmin });
    } else if (type === "user.updated") {
      console.log(data);
      const update = await Admin.findOneAndUpdate(
        { userId: data.id },
        {
          username: data.username,
          emailAddresses,
          userId: data.id,
          profileImageUrl: data.profile_image_url,
        }
      );
      return res
        .status(SUCCESS_STATUS_CODE)
        .json({ success: true, admin: update });
    }
    return res.status(SUCCESS_STATUS_CODE).json({ success: true });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

module.exports = { adminCreate };
