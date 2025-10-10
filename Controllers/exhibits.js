const Exhibit = require("../models/exhibits");

exports.addExhibits = async (req, res) => {
  try {
    const newExhibitData = {
      name: req.body.name,
      floor: req.body.floor,
    };
    const exhibit = await Exhibit.create(newExhibitData);
    // await exhibit.save();
    res.status(201).json({
      success: true,
      message: "Exhibit added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeExhibit = async (req, res) => {
  try {
    const exhibit = await Exhibit.findOneAndDelete({ name: req.body.name });
    console.log(req.body.name);

    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: "Exhibit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exhibit deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllExhibitNames = async (req, res) => {
  try {
    const exhibits = await Exhibit.find({}, 'name'); // Fetch only the 'name' field
    const exhibitNames = exhibits.map(exhibit => exhibit.name);
    res.status(200).json({
      success: true,
      exhibitNames,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};