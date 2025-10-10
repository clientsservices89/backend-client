const Complain = require("../models/Complain");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.createComplain = async (req) => {
  try {
    // Upload the image to Cloudinary
    const myCloud = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "complains" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    // Parse the complainer field from the request body
    const complainer = JSON.parse(req.body.complainer);

    // Prepare the complain data
    const newComplainData = {
      floor: req.body.floor,
      exhibit: req.body.exhibit,
      description: req.body.description || "",
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      status: "Pending",
      technician: null,
      complainer: complainer, // Include the complainer information
    };

    // Save the complain data to MongoDB
    const complain = await Complain.create(newComplainData);

    // Get all users with a pushToken
    const usersWithPushToken = await User.find({ pushToken: { $ne: null } });

    // Create messages for each user with a valid pushToken
    const messages = usersWithPushToken
      .map((user) => {
        if (Expo.isExpoPushToken(user.pushToken)) {
          return {
            to: user.pushToken,
            sound: "default",
            body: "New complain launched",
            data: { withSome: "data" },
          };
        } else {
          console.error(
            `Push token ${user.pushToken} is not a valid Expo push token`
          );
          return null;
        }
      })
      .filter((message) => message !== null);

    // Send the push notifications
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    // Return the result instead of sending the response
    return {
      success: true,
      message: "Complain created and notifications sent",
      complain,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

exports.updateComplain = async (req, res) => {
  try {
    const complainId = req.params.id;
    const { technician, status } = req.body;

    // Find the existing complaint by its ID
    let complain = await Complain.findById(complainId);
    if (!complain) {
      return res.status(404).json({
        success: false,
        message: "Complain not found",
      });
    }

    // Update technician if provided
    if (technician) {
      complain.technician = technician;
    }

    // Update status if provided
    if (status) {
      complain.status = status;
    }

    // Save the updated complaint in the database
    complain = await Complain.findByIdAndUpdate(complainId, complain, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Complain updated successfully",
      complain,
    });
  } catch (error) {
    console.error("Error in updateComplain:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllComplainsA = async (req, res) => {
  try {
    // Fetch all complains from the database and populate technician and complainer details
    const complains = await Complain.find()
      .populate("technician", "name")
      .populate("complainer", "name");

    // Respond with the list of complains
    res.status(200).json({
      success: true,
      complains,
    });
  } catch (error) {
    console.error("Error in getAllComplains:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRecentComplaints = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch complaints less than one month old
    const recentComplaints = await Complain.find({
      createdAt: { $gte: oneMonthAgo }
    });

    // Count complaints by exhibit and include floor information and response times
    const exhibitCounts = recentComplaints.reduce((acc, complaint) => {
      const key = `${complaint.exhibit}_${complaint.floor}`;  // Unique key for each exhibit-floor pair
      if (!acc[key]) {
        acc[key] = {
          exhibit: complaint.exhibit,
          floor: complaint.floor,
          count: 0,
          totalResponseTime: 0,  // Total milliseconds for response time calculation
          averageResponseTime: 0,
          averageResponseTimeUnit: 'minutes'  // Default unit is minutes
        };
      }
      const responseTime = new Date(complaint.updatedAt) - new Date(complaint.createdAt);
      acc[key].count += 1;
      acc[key].totalResponseTime += responseTime;
      return acc;
    }, {});

    // Calculate average response time for each exhibit-floor pair
    Object.values(exhibitCounts).forEach(item => {
      if (item.count > 0) {
        item.averageResponseTime = (item.totalResponseTime / item.count) / 60000;  // Convert milliseconds to minutes
        if (item.averageResponseTime > 60) {
          // Convert to hours if average response time is greater than 60 minutes
          item.averageResponseTime /= 60;
          item.averageResponseTimeUnit = 'hours';  // Update unit to hours
        }
        delete item.totalResponseTime;  // Remove the total response time from the output
      }
    });

    // Prepare data to send to the frontend
    const exhibitsData = Object.values(exhibitCounts);

    res.status(200).json({
      success: true,
      data: exhibitsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};



exports.getAllComplains = async (req, res) => {
  try {
    // Fetch all complains from the database
    const complains = await Complain.find().populate("complainer", "name");

    // Respond with the list of complains
    res.status(200).json({
      success: true,
      complains,
    });
  } catch (error) {
    console.error("Error in getAllComplains:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComplain = async (req, res) => {
  try {
    const complainId = req.params.id;
    console.log(`Deleting complain with ID: ${complainId}`);

    const complain = await Complain.findById(complainId);
    if (!complain) {
      console.log(`Complain with ID ${complainId} not found`);
      return res.status(404).json({
        success: false,
        message: "Complain not found",
      });
    }

    console.log(`Cloudinary public ID to delete: ${complain.image.public_id}`);

    const cloudinaryResponse = await cloudinary.uploader.destroy(
      complain.image.public_id
    );
    console.log(`Cloudinary response:`, cloudinaryResponse);

    await Complain.findByIdAndDelete(complainId);
    console.log(
      `Complain with ID ${complainId} successfully deleted from MongoDB`
    );

    res.status(200).json({
      success: true,
      message: "Complain deleted",
    });
  } catch (error) {
    console.error("Error in deleteComplain:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
