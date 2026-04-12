const UserModel = require("./user.model");

class UserService {
  getUserPublicProfile(user) {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      address: user.address,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      image: user.image,
      _id: user._id,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      updatedBy: user.updatedBy,
    };
  }
  async createUser(data) {
    try {
      const user = new UserModel(data)
      return await user.save()
    } catch (exception) {
      throw exception
    }
  }

  getSingleUserByFilter = async (filter) => {
    try {
      const userData = await UserModel.findOne(filter);
      return userData;
    } catch (exception) {
      throw exception;
    }
  };
  getRoleByFilter = async (filter) => {
    try {
      const userData = await UserModel.find({_id:filter});
      // console.log(userData);
      
      const role = userData[0].role;
      // console.log("role=",role);
      
      return role;
    } catch (exception) {
      throw exception;
    }
  };
  async updateSingleUserByFilter (filter, data) {
    try {
        const userData = await UserModel.findOneAndUpdate(filter, {$set: data}, {new:true})
        return userData;
    } catch (exception) {
        throw exception;
    }
  }
}

const userSvc = new UserService();
module.exports = userSvc;
