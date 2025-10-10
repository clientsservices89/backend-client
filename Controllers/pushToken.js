const User = require("../models/User"); // Assuming you have a User model

exports.savePushToken = async (req, res) => {
  try {
    const { token, userId } = req.body; // Ensure the frontend sends the userId along with the token

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: "Token and userId are required",
      });
    }

    // Find the user and update their push token
    const user = await User.findByIdAndUpdate(userId, { pushToken: token }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Push token saved successfully",
      user,
    });
  } catch (error) {
    console.error("Error saving push token:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
