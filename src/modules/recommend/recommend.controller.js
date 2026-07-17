const Place = require("./../places/place.model");
const haversineDistance = require("../../utilities/distance");

exports.recommendPlaces = async (req, res) => {
    try {

        const { latitude, longitude } = req.body;

        // Validate input
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required."
            });
        }

        // Fetch only travel destinations
        const places = await Place.find({
            isTravelDestination: true
        });

        // Calculate distance
        const recommendations = places.map((place) => {

            const distance = haversineDistance(
                latitude,
                longitude,
                place.latitude,
                place.longitude
            );

            return {
                ...place.toObject(),
                distance
            };

        });

        // Sort nearest first
        recommendations.sort((a, b) => a.distance - b.distance);

        // Return top 5
        res.status(200).json({
            success: true,
            count: Math.min(5, recommendations.length),
            data: recommendations.slice(0, 5)
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};