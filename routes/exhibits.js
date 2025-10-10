const express = require("express");
const { addExhibits, removeExhibit, getAllExhibitNames } = require("../controllers/exhibits");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const router = express.Router();
router.route("/exhibit/upload").post(addExhibits);
// router.route("/exhibit/upload").post(isAuthenticated, addExhibits);
router.route("/exhibit/remove").delete(removeExhibit);
router.route("/exhibit/getAll").get(getAllExhibitNames);
// router.route("/exhibit/remove").delete(isAuthenticated, removeExhibit);


module.exports = router;
