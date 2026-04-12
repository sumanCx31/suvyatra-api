const cloudinarySvc = require("../../services/cloudinary.service");
const BusModel = require("./bus.model");

class busService {
  transformBus = async (req) => {
    try {
      let data = req.body;
      data.image = await cloudinarySvc.fileUpload(req.file.path, "/bus/");
      return data;
    } catch (exception) {
      throw exception;
    }
  };
  createBus = async (data) => {
  try {
    const bus = await BusModel.create(data);
    return await bus.save();
  } catch (exception) {
    throw exception;
  }
};

getAllBus = async() => {
  try {
    const data = await BusModel.find();
    return data;
  } catch (exception) {
    throw exception
  }
}

getById = async (id) => {
    try {
      const busData = await BusModel.findOne({ _id: id });
      if (!busData) {
        throw {
          code: 404,
          message: "Bus not found with the provided id.",
          status: "NOT_FOUND",
        };
      }
      return busData;
    } catch (exception) {
      throw exception;
    }
  };

deleteById = async (id) => {
    try {
      const data = await BusModel.deleteOne({ _id: id });
      return data;
    } catch (exception) {
      throw exception;
    }
  };

}



const BusSvc = new busService();
module.exports = BusSvc;
