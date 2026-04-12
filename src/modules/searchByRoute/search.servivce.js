const TripModel = require("../tripUpdation/tripUpdate.model");

class searchService {
  searchByRoute = async (data) => {
    const { date, from, to } = data;

    try {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0); // Reset 'now' to midnight for a fair daily comparison

      // 1. Define the 24-hour window for the requested date
      const requestedDate = new Date(date);
      const startOfRequestedDay = new Date(requestedDate);
      startOfRequestedDay.setUTCHours(0, 0, 0, 0);

      const endOfRequestedDay = new Date(requestedDate);
      endOfRequestedDay.setUTCHours(23, 59, 59, 999);

      /**
       * 2. LOGIC: 
       * If the user searches for a date that is BEFORE today, we block it.
       * If the user searches for TODAY or a FUTURE date, we show the full day.
       */
      if (startOfRequestedDay < now) {
        throw {
          status: 400,
          message: "Cannot search for trips in the past!",
          data: { status: "PAST_DATE_ERROR" },
        };
      }

      const trips = await TripModel.find({
        from: { $regex: new RegExp(`^${from.trim()}$`, "i") },
        to: { $regex: new RegExp(`^${to.trim()}$`, "i") },
        status: "scheduled", 
        date: {
          $gte: startOfRequestedDay, // Shows all trips for today, starting from 12:00 AM
          $lte: endOfRequestedDay
        },
      }).populate("bus", "name busNumber");

      if (!trips || trips.length === 0) {
        throw {
          status: 404,
          message: "No trips found for this date or route.",
          data: { status: "NOT_FOUND_TRIP" },
        };
      }

      return trips;
    } catch (exception) {
      throw exception;
    }
  };
}

const searchSvc = new searchService();
module.exports = searchSvc;