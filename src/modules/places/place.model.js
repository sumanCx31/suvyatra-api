const { default: mongoose } = require("mongoose");

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String,

    city: String,

    province: String,

    latitude: Number,

    longitude: Number,

    image: {
      publicId: String,
      secureUrl: String,
      optimizedUrl: String,
    },

    category: {
        type: String,
        enum: [
            "Lake",
            "Temple",
            "Hill",
            "National Park",
            "Heritage",
            "Adventure",
            "Waterfall",
            "Museum"
        ]
    },

    isTravelDestination: {
        type: Boolean,
        default: true
    },

    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Place", placeSchema);
