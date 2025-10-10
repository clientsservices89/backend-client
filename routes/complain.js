const express = require("express");
const multer = require("multer");
const { createComplain, getAllComplains, getRecentComplaints, getAllComplainsA, deleteComplain, updateComplain } = require("../controllers/complain");
const { getIo } = require("../io"); // Adjust the path to correctly import io.js

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/complain/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await createComplain(req);
    if (result.success) {
      const io = getIo(); // Get the io instance
      io.emit("newComplaint", result.complain); // Emit new complaint event
    }
    res.status(result.success ? 201 : 500).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.put('/complain/update/:id', updateComplain);
router.get('/complaints/recent', getRecentComplaints);
router.route("/complain/getAll").get(getAllComplains);
router.route("/complain/getAllA").get(getAllComplainsA);
router.route("/complain/:id").delete(deleteComplain);

module.exports = router;
