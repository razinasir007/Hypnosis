const { body, param, query } = require("express-validator");

const userValidations = {
  loginVal: [
    body("email")
      .notEmpty()
      .withMessage("Email can't be blank")
      .isEmail()
      .withMessage("Email is invalid"),
    body("name")
      .notEmpty()
      .withMessage("Name can't be blank")
      .isString()
      .withMessage("Name is Invalid"),
    body("emailOptIn")
      .optional()
      .notEmpty()
      .withMessage("emailOptIn can't be blank")
      .isBoolean()
      .withMessage("emailOptIn is Invalid"),
  ],
  getCheckInVal: [
    body("email")
      .notEmpty()
      .withMessage("Email can't be blank")
      .isEmail()
      .withMessage("Email is invalid"),
  ],
  updateCheckInVal: [
    body("email")
      .notEmpty()
      .withMessage("Email can't be blank")
      .isEmail()
      .withMessage("Email is invalid"),
    body("lastCheckInDate")
      .notEmpty()
      .withMessage("Date can't be blank")
      .isISO8601()
      .withMessage("Last Check in must be a Date"),
    body("streak")
      .notEmpty()
      .withMessage("Streak can't be blank")
      .isNumeric()
      .withMessage("Streak must be a number"),
  ],
  addSubscription: [
    body("userId").notEmpty().isMongoId(),
    body("subscriptionType").notEmpty().isString(),
    body("subscriptionReceipt").optional().isString(),
    body("subscriptionStartDate").optional().notEmpty().isISO8601(),
  ],
};

const favoriteValidations = {
  setFavoritesVal: [
    body("userId")
      .notEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Invalid userId"),
    body("productId")
      .notEmpty()
      .withMessage("Product Id is required")
      .isString()
      .withMessage("Product id must be a string"),
  ],
  setMultipleFavoritesVal: [
    body("userId")
      .notEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Invalid userId"),
    body("productIds")
      .notEmpty()
      .withMessage("Product Id are required")
      .isArray({ min: 1 })
      .withMessage("At least one favorite is required"),
  ],
  getFavoritesVal: [param("userId").isMongoId().withMessage("Invalid userId")],
};

const categoryValidations = {
  addCategory: [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("desc")
      .notEmpty()
      .withMessage("Description is required is required")
      .trim(),
    body("path")
      .notEmpty()
      .withMessage("Code id is required is required")
      .trim(),
    body("subCategories.*.name")
      .optional()
      .notEmpty()
      .withMessage("SubCategory name is required")
      .trim(),
  ],
};

const playlistValidations = {
  addPlaylist: [
    body("userId")
      .notEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("Invalid userId"),
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("audioId")
      .optional()
      .notEmpty()
      .withMessage("Audio id is required")
      .isMongoId()
      .withMessage("Invalid audioId"),
  ],
  addPlaylistAudio: [
    param("playlistId").isMongoId().withMessage("Invalid playlistId"),
    body("audioId")
      .notEmpty()
      .withMessage("Audio id is required")
      .isMongoId()
      .withMessage("Invalid audioId"),
  ],
  getPlaylist: [param("userId").isMongoId().withMessage("Invalid userId")],
  delPlaylistAudio: [
    param("playlistId").isMongoId().withMessage("Invalid playlistId"),
    param("audioId").isMongoId().withMessage("Invalid audioId"),
  ],
  delPlaylist: [
    param("playlistId").isMongoId().withMessage("Invalid playlistId"),
  ],
};

const fieldValidations = [
  body("data").notEmpty().isString(),
  body("type").notEmpty().isString(),
  body("isBold").optional().isBoolean(),
  body("align").optional().isIn(["center", "auto", "left", "right", "justify"]),
  body("color").optional().isHexColor(),
  body("fontSize").optional().isInt({ min: 1, max: 30 }),
];

const notificationValidations = {
  add: [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title be a string")
      .trim(),
    body("backgroundColor")
      .notEmpty()
      .withMessage("backgroundColor is required")
      .isHexColor()
      .withMessage("backgroundColor be a hexColor"),
    body("textColor")
      .notEmpty()
      .withMessage("textColor is required")
      .isHexColor()
      .withMessage("textColor must be a hexColor"),
    body("status")
      .optional()
      .notEmpty()
      .isIn(["active", "inactive"])

      .withMessage("active is empty"),
    body("modalFor")
      .isIn(["subscribers", "non-subscribers", "all"])
      .withMessage("Invalid alignment value"),
    body("fields")
      .isArray({ min: 1 })
      .withMessage("Fields must be an array with atleast one field"),
    body("fields.*.data").notEmpty().withMessage("Field data is required"),
    body("fields.*.type")
      .notEmpty()
      .withMessage("Field type is required")
      .isIn(["text", "image"])
      .withMessage("Invalid type value"),

    // Validate optional fields
    body("fields.*.isBold")
      .optional()
      .isBoolean()
      .withMessage("isBold must be a boolean"),
    body("fields.*.align")
      .optional()
      .isIn(["center", "auto", "left", "right", "justify"])
      .withMessage("Invalid alignment value"),
    body("fields.*.color")
      .optional()
      .isHexColor()
      .withMessage("Invalid color code"),
    body("fields.*.fontSize")
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage("Invalid font size"),
  ],
  getFields: [param("id").isMongoId().withMessage("Invalid id")],
  updateModal: [
    param("id").isMongoId().withMessage("Invalid id"),
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title be a string")
      .trim(),
    body("backgroundColor")
      .notEmpty()
      .withMessage("backgroundColor is required")
      .isHexColor()
      .withMessage("backgroundColor be a hexColor"),
    body("textColor")
      .notEmpty()
      .withMessage("textColor is required")
      .isHexColor()
      .withMessage("textColor must be a hexColor"),
    body("status")
      .optional()
      .notEmpty()
      .isIn(["active", "inactive"])

      .withMessage("active is empty"),
    body("modalFor")
      .isIn(["subscribers", "non-subscribers", "all"])
      .withMessage("Invalid alignment value"),
  ],
};

const audioValidations = {
  audioCategory: [
    param("categoryId").isString().withMessage("Invalid categoryId"),
    query("subCategoryId")
      .optional()
      .notEmpty()
      .isMongoId()
      .withMessage("Invalid subcategoryId"),
  ],
  addAudio: [
    body("title").notEmpty().isString().withMessage("Title is required"),
    body("type").notEmpty().isString().withMessage("Type is required"),
    body("summary").notEmpty().isString().withMessage("Summary is required"),
    body("length").notEmpty().isString().withMessage("Length is required"),
    body("size").notEmpty().isString().withMessage("Size is required"),
    body("productID")
      .notEmpty()
      .isString()
      .withMessage("Product ID is required"),
    body("image").notEmpty().isString().withMessage("Image is required"),
    body("url").optional().isString(),
    body("night").optional().isBoolean(),
    body("googleID").optional().isString(),
    body("categoryId")
      .notEmpty()
      .isMongoId()
      .withMessage("Category ID is required"),
    body("subCategoryId").optional().notEmpty().isMongoId(),
    body("status").notEmpty().withMessage("Status is required"),
  ],
  editAudio: [
    param("id").isMongoId().withMessage("Invalid id"),
    body("title").notEmpty().isString().withMessage("Title is required"),
    body("summary").notEmpty().isString().withMessage("Summary is required"),
    body("length").notEmpty().isString().withMessage("Length is required"),
    body("size").notEmpty().isString().withMessage("Size is required"),
    body("productID")
      .notEmpty()
      .isString()
      .withMessage("Product ID is required"),
    body("image").notEmpty().isString().withMessage("Image is required"),
    body("url").notEmpty().isString().withMessage("Url is required"),
    body("night").optional().isBoolean(),
    body("status").notEmpty().withMessage("Status is required"),
  ],
  delAudio: [param("id").isMongoId().withMessage("Invalid id")],
};

const subcategoryValidations = {
  editsubCategory: [
    param("id").isMongoId().withMessage("Invalid id"),
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name be a string")
      .trim(),
    body("status")
      .isString()
      .withMessage("Status be a string")
      .isIn(["active", "inactive"])
      .withMessage("Invalid alignment value"),
  ],
  addSubCategory: [
    body("categoryId").isMongoId().withMessage("Invalid id"),
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name be a string")
      .trim(),
    body("status")
      .isString()
      .withMessage("Status be a string")
      .isIn(["active", "inactive"])
      .withMessage("Invalid alignment value"),
  ],
  delSubCategory: [param("id").isMongoId().withMessage("Invalid id")],
};

module.exports = {
  userValidations,
  favoriteValidations,
  categoryValidations,
  playlistValidations,
  notificationValidations,
  audioValidations,
  subcategoryValidations,
};
