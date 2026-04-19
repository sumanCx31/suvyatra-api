const userSvc = require("../user/user.service");
const BusModel = require("./bus.model");
const BusSvc = require("./bus.service");

class BusController {
  Create = async (req, res, next) => {
    try {
      const data = req.body;
      // console.log(data);
      const userId = data.driverId;
      const findRole = await userSvc.getRoleByFilter(userId);
      // console.log(findRole);
      
      if(findRole!=='driver'){
        throw({
          code:403,
          message:"Role must be a driver!!!",
          status:"Driver Needed!"
        })
      }
      const transformData = await BusSvc.transformBus(req);
      const createBus1 = await BusSvc.createBus(transformData);

      res.json({
        data: createBus1,
        message: "Bus Added SucessFully!!",
        option: null,
      });
    } catch (exception) {
      throw exception;
    }
  };

  getAllBus = async (req, res) => {
    try {
      const busData = await BusSvc.getAllBus();
      let len = busData.length;
      
      
      
      res.json({
        data: busData,
        message: "Buses fetched successfully",
        status: "Success",
        options: null,
      });
      console.log("Buses Fetched Sucessfully!!");
    } catch (exception) {
      throw exception;
    }
  };

  getBusById = async (req, res) => {
    try {
      let id = req.params.id;
      const data = await BusSvc.getById(id);

      res.json({
        data: data,
        message: `Bus Fetched with ${id} successfully`,
      });
    } catch (exception) {
      throw exception;
    }
  };



updateBus = async (req, res) => {
  try {
    const updatedBus = await BusModel.findByIdAndUpdate(
      req.params._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBus);

  } catch(err) {
    console.log(err);
  }
}


  deleteBusById = async(req,res)=>{
    try {
        let id = req.params.id;
        const data = await BusSvc.getById;
        await BusSvc.deleteById(id);

        res.json({
            data:{
                id:data.id,
                name:data.name,
            },
            message:"Bus Deleted Successfully!!",
            status:"success"
        })
    } catch (exception) {
        throw exception
    }
  };

  getBusByDriverId = async(req,res)=>{
    try {
      const _id = req.params.id;
      const getBus = await BusModel.find({driverId:_id});
      if(!getBus){
        throw({
          data:404,
          message:"Bus with this provided driverId is not found!!"
        })
      }
      res.json({
        data:getBus,
        status:"success",
        message:"Bus Fetched based on this driver id!!"
      })
    } catch (exception) {
      throw exception
    }
  };
}
const BusCltr = new BusController();
module.exports = BusCltr;
