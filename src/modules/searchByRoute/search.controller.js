const searchSvc = require("./search.servivce");

const SearchController = async (req, res) => {
  try {
    const data = req.body;
    const trips = await searchSvc.searchByRoute(data);

    res.json({
      data: trips,
      message: "Trips Fetched successfully on this route and date.",
      status: "success",
      option: null,
    });
  } catch (exception) {
    // Log the error for debugging
    console.error("Search Error:", exception);

    // Send the actual error status and message back to the frontend
    res.status(exception.status || 500).json({
      data: null,
      message: exception.message || "Internal Server Error",
      status: exception.data?.status || "ERROR",
    });
  }}
module.exports = SearchController;
