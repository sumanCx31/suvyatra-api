const bannerSvc = require("./banner.service");
const bnnsvc = require("./banner.service");
const transformBanner = require("./banner.service");

class BannerController {
  createBanner = async (req, res, next) => {
    const payload = await bannerSvc.transformBannerCreate(req);
    const bannerData = await bannerSvc.storeBanner(payload);
    console.log("Banner Created Sucessfully!!");

    res.json({
      data: bannerData,
      message: "Banner created successfully",
      status: "Success",
      options: null,
    });
  };

  getAllBanner = async (req, res) => {
    try {
      const bannerData = await bannerSvc.getAllBanner();
      res.json({
        data: bannerData,
        message: "Banner fetched successfully",
        status: "Success",
        options: null,
      });
      console.log("Banner Fetched Sucessfully!!");
    } catch (exception) {
      throw exception;
    }
  };

  updateBanner = async(req,res)=>{
    try {
      const id = req.params.id;
      const checkedData=await bannerSvc.getById(id);
      const updatedData = await bannerSvc.updateBanner(req,checkedData);
      res.json({
        data:updatedData,
        message:"Banner Sucessfully Updated!!"
      })
    } catch (exception) {
      throw exception
    }
  }

  getBannerById = async (req, res) => {
    const id = req.params.id
    console.log(id);
    
    try {
      const data = await bannerSvc.getById(id);
      if (!data) {
        throw {
          status: 404,
          message: "Banner Not found!!",
          option:null
        };
      }
      res.json({
           data:data
      })
    } catch (exception) {
      throw exception;
    }
  };

  deleteBannerById = async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);

      await bannerSvc.getSingleRowById(id);
      await bannerSvc.deleteById(id);
      res.json({
        message: "Banner deleted successfully",
        status: "Success",
        options: null,
      });
    } catch (exception) {
      throw exception;
    }
  };
}

const bannerCtrl = new BannerController();
module.exports = bannerCtrl;
