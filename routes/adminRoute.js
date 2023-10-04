const express = require("express");
const { adminCreate } = require("../controllers/adminController");
;


const router = express.Router();

router.post("/admin",adminCreate)

module.exports = router;
