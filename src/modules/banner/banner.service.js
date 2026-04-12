const cloudinarySvc = require("../../services/cloudinary.service");
const BannerModel = require("./banner.model");

class BannerService {
  transformBannerCreate = async (req) => {
  try {
    let data = req.body;

    if (req.file && req.file.path) {
      data.image = await cloudinarySvc.fileUpload(req.file.path, "/banner/");
    } else {
      data.image = null; // or keep old/default image if needed
    }

    return data;
  } catch (exception) {
    throw exception;
  }
};

  storeBanner = async (data) => {
    try {
      const banner = await BannerModel.create(data);
      return banner;
    } catch (exception) {
      throw exception;
    }
  };

  getSingleRowById = async (id) => {
    try {
      const bannerData = await BannerModel.findOne({ _id: id });
      if (!bannerData) {
        throw {
          code: 404,
          message: "Banner not found with the provided id.",
          status: "NOT_FOUND",
        };
      }
      return bannerData;
    } catch (exception) {
      throw exception;
    }
  };

  getAllBanner = async () => {
    try {
      const bannerData = await BannerModel.find();
      return bannerData;
    } catch (exception) {
      throw exception;
    }
  };

  getById = async (id) => {
    try {
      const bannerData = await BannerModel.findOne({ _id: id });
      if (!bannerData) {
        throw {
          code: 404,
          message: "Banner not found with the provided id.",
          status: "NOT_FOUND",
        };
      }
      return bannerData;
    } catch (exception) {
      throw exception;
    }
  };

 updateBanner = async (req,udata) => {
  try {
    const { title, description, link, isActive } = req.body;

    udata.title = title;
    udata.description = description;
    udata.link = link;
    udata.isActive = isActive;

    await udata.save();  // ✅ Persist changes
    return udata;
  } catch (exception) {
    throw exception;
  }
};

  // transformBannerUpdate = async (req, oldData) => {
  //   try {
  //     let data = req.body;

  //     if (req.file) {
  //       data.image = await cloudinarySvc.uploadFile(req.file.path, "banner");
  //     } else {
  //       data.image = oldData.image;
  //     }

  //     return data;
  //   } catch (exception) {
  //     throw exception;
  //   }
  // };

  // updateByFilter = async (filter, update) => {
  //   try {
  //     console.log("Filter:", filter);

  //     const updateData = await BannerModel.findOneAndUpdate(filter, update, {
  //       returnDocument: "after",
  //       projection: "_id title link isActive image createdAt updatedAt",
  //     });

  //     return updateData;
  //   } catch (exception) {
  //     throw exception;
  //   }
  // };

  deleteById = async (id) => {
    try {
      const data = await BannerModel.deleteOne({ _id: id });
      return data;
    } catch (exception) {
      throw exception;
    }
  };
}
const bannerSvc = new BannerService();

module.exports = bannerSvc;
