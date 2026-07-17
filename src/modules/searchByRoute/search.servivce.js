const TripModel = require("../tripUpdation/tripUpdate.model");

class searchService {
  searchByRoute = async (data) => {
  const { date, from, to } = data;

  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    // Define the requested day's range
    const requestedDate = new Date(date);

    const startOfRequestedDay = new Date(requestedDate);
    startOfRequestedDay.setUTCHours(0, 0, 0, 0);

    const endOfRequestedDay = new Date(requestedDate);
    endOfRequestedDay.setUTCHours(23, 59, 59, 999);

    // Prevent searching past dates
    if (startOfRequestedDay < now) {
      throw {
        status: 400,
        message: "Cannot search for trips in the past!",
        data: { status: "PAST_DATE_ERROR" },
      };
    }

    // Fetch trips
    const trips = await TripModel.find({
      from: {
        $regex: new RegExp(`^${from.trim()}$`, "i"),
      },
      to: {
        $regex: new RegExp(`^${to.trim()}$`, "i"),
      },
      status: "scheduled",
      date: {
        $gte: startOfRequestedDay,
        $lte: endOfRequestedDay,
      },
    }).populate("bus", "name busNumber");

    // Check if trips exist
    if (!trips || trips.length === 0) {
      throw {
        status: 404,
        message: "No trips found for this date or route.",
        data: { status: "NOT_FOUND_TRIP" },
      };
    }

    // =====================================
    // Bubble Sort (Ascending by Price)
    // =====================================
    for (let i = 0; i < trips.length - 1; i++) {
      for (let j = 0; j < trips.length - i - 1; j++) {
        if (trips[j].price > trips[j + 1].price) {
          const temp = trips[j];
          trips[j] = trips[j + 1];
          trips[j + 1] = temp;
        }
      }
    }

    // Return sorted trips
    return trips;

  } catch (exception) {
    throw exception;
  }
};
}

const searchSvc = new searchService();
module.exports = searchSvc;