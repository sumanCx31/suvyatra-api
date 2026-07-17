const cloudinarySvc = require("../../services/cloudinary.service");
const Place = require("./place.model");

// Create Place
exports.createPlace = async (req, res) => {
    try {

        const data = { ...req.body };

        // Upload image if provided
        if (req.file && req.file.path) {
            data.image = await cloudinarySvc.fileUpload(
                req.file.path,
                "/places/"
            );
        }

        const place = await Place.create(data);

        res.status(201).json({
            success: true,
            message: "Place created successfully.",
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Places
exports.getAllPlaces = async (req, res) => {
    try {

        const places = await Place.find();

        res.status(200).json({
            success: true,
            count: places.length,
            data: places
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Single Place
exports.getPlaceById = async (req, res) => {

    try {

        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found."
            });
        }

        res.status(200).json({
            success: true,
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getTravelDestinations = async (req, res) => {
    try {

        const places = await Place.find({
            isTravelDestination: true
        });

        res.status(200).json({
            success: true,
            count: places.length,
            data: places
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Place
exports.updatePlace = async (req, res) => {

    try {

        const place = await Place.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Place updated successfully.",
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Place
exports.deletePlace = async (req, res) => {

    try {

        const place = await Place.findByIdAndDelete(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Place deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Recommend Places
exports.recommendPlaces = async (req, res) => {

    try {

        const { latitude, longitude } = req.body;

        // You'll implement this next
        // 1. Fetch tourist places
        // 2. Calculate distance using Haversine
        // 3. Sort by distance
        // 4. Return nearest places

        res.status(200).json({
            success: true,
            message: "Recommendation API is ready."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};