const { generateSeats } = require("../../utilities/helper");
const TripModel = require("./tripUpdate.model");

class TripService {
  storeTrip = async (data) => {
    const seats = generateSeats();
    data.seats = seats;

    const trip = await TripModel.create(data);

    const tripDate = new Date(data.date);

    return {
      trip,
      fullDate: {
        year: tripDate.getFullYear(),
        month: tripDate.getMonth() + 1,
        day: tripDate.getDate(),
      },
    };
  };

  updatedTripById = async (id, data) => {
    try {
      const trip = await TripModel.findById(id);
      if (!trip) throw new Error("Trip not found");

      // update basic fields
      trip.bus = data.bus || trip.bus;
      trip.from = data.from || trip.from;
      trip.to = data.to || trip.to;
      trip.departureTime = data.departureTime || trip.departureTime;
      trip.arrivalTime = data.arrivalTime || trip.arrivalTime;
      trip.price = data.price || trip.price;
      trip.status = data.status || trip.status;
      trip.date = data.date || trip.date;

      // update seat bookings
      if (data.seats && Array.isArray(data.seats)) {
        data.seats.forEach((seatInput) => {
          const seat = trip.seats.find(
            (s) => s.seatNumber === seatInput.seatNumber,
          );
          if (seat) {
            seat.isBooked = seatInput.isBooked;
          }
        });
      }

      await trip.save();

      return trip;
    } catch (exception) {
      throw exception;
    }
  };

  searchTripById = async (id) => {
    // Good use of .lean() here! This makes GET requests very fast.
    const trip = await TripModel.findById(id).lean();
    if (!trip) throw { code: 404, message: "Trip Not Found" };
    return trip;
  };

reserveSeat = async (id, data) => {
    try {
        // 1. You must declare "const trip" here!
        const trip = await TripModel.findById(id); 

        // 2. Now line 67 will work because "trip" is defined
        if (!trip) {
            throw { code: 404, message: "Trip not found" };
        }

        // 3. Update the seats based on the incoming data
        if (data.seats && Array.isArray(data.seats)) {
            data.seats.forEach((seatInput) => {
                const seat = trip.seats.find(
                    (s) => s.seatNumber === seatInput.seatNumber
                );
                
                // Only mark as booked if the seat exists and isn't already taken
                if (seat && !seat.isBooked) {
                    seat.isBooked = true;
                }
            });
        }

        // 4. Save the document (Mongoose handles the sub-document update)
        await trip.save();

        return trip;
    } catch (exception) {
        // Log the actual error to your terminal so you can see what went wrong
        console.error("Internal Service Error:", exception);
        throw exception;
    }
};
}

const TripSvc = new TripService();
module.exports = TripSvc;
