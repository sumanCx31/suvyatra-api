const TripModel = require("./tripUpdate.model");
const TripSvc = require("./tripUpdate.service");

class TripController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const storeData = await TripSvc.storeTrip(data);

      const bookedSeats = storeData.trip.seats.filter(
        (seat) => seat.isBooked,
      ).length;

      const remainingSeats = 32 - bookedSeats;

      res.json({
        data: {
          storeData,
          remainingSeats,
        },
        message: "Trip added successfully",
        status: "success",
        option: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

  updateById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const updatedTrip = await TripSvc.updatedTripById(id, data);

      // Calculate remaining seats
      const bookedSeats = updatedTrip.seats.filter(
        (seat) => seat.isBooked,
      ).length;
      const remainingSeats = 32 - bookedSeats;
      console.log("remainingSeats");

      res.json({
        data: {
          updatedTrip,
          remainingSeats,
        },
        message: "Trip Updated Successfully",
        status: "success",
        option: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

  getTripById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const Trip = await TripSvc.searchTripById(id);

      res.json({
        data: Trip,
        status: "Success",
        messaage: "Trip Data fetched sucessfully!!",
      });
    } catch (exception) {
      throw exception;
    }
  };

  getAllTrips = async (req, res, next) => {
    try {
      const Trips = await TripModel.find();
      res.json({
        data: Trips,
        status: "Success",
        messaage: "All Trip Data fetched sucessfully!!",
        option: null,
      });
    } catch (exception) {
      throw exception;
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const deletedTrip = await TripModel.findByIdAndDelete(id);
      if (!deletedTrip) {
        return res.status(404).json({
          status: "Error",
          message: "Trip not found",
        });
      }

      res.json({
        data: deletedTrip,
        status: "Success",
        message: "Trip deleted successfully!!",
        option: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

  getTripByBusId = async (req, res) => {
    try {
      const busId = req.params.id;
      const trips = await TripModel.find({ bus: busId }).populate("bus");

      // Return 200 OK with an empty array instead of 404
      res.json({
        status: "success",
        data: trips || [], // Send [] if no trips exist
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };

  seatReservation = async (req, res) => {
    try {
      const _id = req.params.id;
      const Seats = req.body;
      const reserveSeat = await TripSvc.reserveSeat(_id, Seats);
      // console.log(reserveSeat);

      res.json({
        data: reserveSeat,
        status: "Sucess",
        message: "Your Seat Reserved!!",
      });
    } catch (exception) {
      throw exception;
    }
  };
}

const TripCltr = new TripController();
module.exports = TripCltr;
