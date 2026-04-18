const { AppConfig } = require("../../config/config");
const { Status } = require("../../config/constants");
const { randomStringGenerator } = require("../../utilities/helper");
const UserModel = require("../user/user.model");
const userSvc = require("../user/user.service");
const authSvc = require("./auth.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthController {
  registerUser = async (req, res, next) => {
    try {
      const {role} = req.body;
      if(role && role === "admin") {
        throw {
          code: 403,
          message: "Admin registration is not allowed.",
          status: "ADMIN_REGISTRATION_FORBIDDEN",
        };
      }
      const data = await authSvc.transformUserCreate(req);
      let user = await userSvc.createUser(data);

      await authSvc.sendActivationNotification(user);

      res.json({
        data: userSvc.getUserPublicProfile(user),
        message:
          "User registration successful. Please check your email to activate your account.",
        status: "Success",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

 // auth.controller.js

activateUser = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw { code: 400, message: "Email and OTP are required." };
        }
        const userDetail = await userSvc.getSingleUserByFilter({
            email: email,
            activationToken: otp,
        });

        if (!userDetail) {
            throw {
                code: 422,
                message: "Invalid OTP or Email. Please try again.",
                status: "VALIDATION_FAILED",
            };
        }

        const updatedUser = await userSvc.updateSingleUserByFilter(
            { _id: userDetail._id },
            {
                status: Status.ACTIVE,
                activationToken: null, 
            }
        );

        await authSvc.newUserWelcomeEmail(updatedUser);

        res.json({
            data: null,
            message: "Account activated successfully.",
            status: "ACTIVATED_SUCCESSFULLY",
        });
    } catch (exception) {
        next(exception);
    }
};

  loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const userDetail = await userSvc.getSingleUserByFilter({
        email: email,
      });
      if (!userDetail) {
        throw {
          code: 422,
          message: "Email is not registered.",
          status: "EMAIL_NOT_rEGISTERED",
        };
      }
      if (!bcrypt.compareSync(password, userDetail.password)) {
        throw {
          code: 422,
          message: "Credentials does not match.",
          status: "CREDENTIAL_DOES_NOT_MATCH",
        };
      }
      if (
        userDetail.status !== Status.ACTIVE ||
        userDetail.activationToken !== null
      ) {
        throw {
          code: 422,
          message: "User not activated.",
          status: "USER_NOT_ACTIVATED",
        };
      }
      const accessToken = jwt.sign(
        {
          sub: userDetail._id,
          typ: "Bearer",
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        },
      );
      const refreshToken = jwt.sign(
        {
          sub: userDetail._id,
          typ: "Refresh",
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1d",
        },
      );

      const maskedAccessToken = randomStringGenerator(150);
      const maskedRefreshToken = randomStringGenerator(150);

      const authData = {
        user: userDetail._id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        maskedAccessToken: maskedAccessToken,
        maskedRefreshToken: maskedRefreshToken,
      };
      await authSvc.createAuthData(authData);
      console.log("Login success");

      res.json({
        data: {
          accessToken: maskedAccessToken,
          refreshToken: maskedRefreshToken,
        },
        message: "Welcome to " + userDetail.role + "Pannel",
        status: "LOGIN_SUCCESS",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };
  refreshToken = async (req, res, next) => {
    try {
      let token = req.headers["authorization"];
      token = token.replace("Refresh ", "");
      if (!token) {
        throw {
          code: 401,
          message: "Token not found",
          status: "TOKEN_NOT_FOUND",
        };
      }
      const authToken = await authSvc.getSingleRowByFilter({
        maskedRefreshToken: token,
      });
      if (!authToken) {
        throw {
          code: 401,
          message: "Invalid token",
          status: "INVALID_TOKEN",
        };
      }
      const data = jwt.verify(authToken.refreshToken, AppConfig.jwtSecret);
      const userDetail = await userSvc.getSingleUserByFilter({
        _id: data.sub,
      });
      if (!userDetail) {
        throw {
          code: 422,
          message: "User not found",
          status: "USER_NOT_FOUND",
        };
      }
      const accessToken = jwt.sign(
        {
          sub: userDetail._id,
          typ: "Bearer",
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        },
      );
      const refreshToken = jwt.sign(
        {
          sub: userDetail._id,
          typ: "Refresh",
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1d",
        },
      );

      const maskedAccessToken = randomStringGenerator(150);
      const maskedRefreshToken = randomStringGenerator(150);

      const authData = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        maskedAccessToken: maskedAccessToken,
        maskedRefreshToken: maskedRefreshToken,
      };
      await authSvc.updateSingleRowByFilter(
        {
          _id: authToken._id,
        },
        authData,
      );
      res.json({
        data: {
          accessToken: authData.maskedAccessToken,
          refreshToken: authData.maskedRefreshToken,
        },
        message: "New access token generated successfully",
        status: "TOKEN_REFRESH_SUCCESS",
        options: null,
      });
    } catch (exception) {
      if (
        exception.hasOwnProperty("name") &&
        exception.name === "TokenExpiredError"
      ) {
        next({
          code: 401,
          message: exception.message,
          status: "TOKEN_EXPIRED",
        });
      } else {
        next(exception);
      }
    }
  };
  forgetPasswordRequest = async (req, res, next) => {
    try {
      const { email } = req.body;
      const userDetail = await userSvc.getSingleUserByFilter({
        email: email,
      });
      if (!userDetail) {
        throw {
          code: 400,
          detail: {
            email: "Email is not registered",
          },
          message: "User not registered",
          status: "USER_NOT_REGISTERED",
        };
      }
      const forgetData = {
        forgetPasswordToken: randomStringGenerator(150),
        expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      };
      const updatedUser = await userSvc.updateSingleUserByFilter(
        {
          _id: userDetail._id,
        },
        forgetData,
      );
      await authSvc.sendPasswordResetRequestEmail(updatedUser);
      res.json({
        dtat: null,
        message:
          "Password reset request email sent successfully. Please check your email.",
        status: "PASSWORD_RESET_REQUEST_SUCCESS",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };
  forgetPasswordTokenVerify = async (req, res, next) => {
    try {
      const token = req.params.token;
      const userDetail = await authSvc.verifyPasswordResetToken(token);
      res.json({
        data: token,
        message: "Token is valid",
        status: "SUCCESS",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };
  resetPassword = async (req, res, next) => {
    try {
      let token = req.headers.authorization;
      token = token.replace("Bearer ","");

      const userDetail = await authSvc.verifyPasswordResetToken(token);
      const password = bcrypt.hashSync(req.body.password, 12);
      await userSvc.updateSingleUserByFilter(
        {
          _id: userDetail._id,
        },
        {
          password: password,
          forgetPasswordToken: null,
          expiryTime: null,
        },
      );
      await authSvc.logoutFromAll({
        user: userDetail._id,
      });
      await authSvc.sendPasswordResetSuccessEmail(userDetail);
      res.json({
        data: null,
        message:
          "Password reset successfully. Please login with your new password.",
        status: "PASSWORD_RESET_SUCCESS",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

  changePassword = async (req, res, next) => {
    try {
        const userId = req.loggedInUser._id;
        const { oldPassword, newPassword } = req.body;

      
        const userDetail = await userSvc.getSingleUserByFilter({ _id: userId });

     
        if (!bcrypt.compareSync(oldPassword, userDetail.password)) {
            throw {
                code: 400,
                message: "Current password does not match.",
                status: "OLD_PASSWORD_ERROR"
            };
        }

      
        const newHashedPassword = bcrypt.hashSync(newPassword, 12);

     
        await userSvc.updateSingleUserByFilter(
            { _id: userId },
            { password: newHashedPassword }
        );

        await authSvc.logoutFromAll({
            user: userId,
        });

        res.json({
            data: null,
            message: "Password changed successfully. Please login with your new password.",
            status: "PASSWORD_CHANGE_SUCCESS",
            options: null,
        });
    } catch (exception) {
        next(exception);
    }
};

  loggedInUserProfile = (req, res, next) => {
    res.json({
      data: req.loggedInUser,
      message: "me route ",
      status: "Sucess",
      options: null,
    });
  };
  logoutUser = async (req, res, next) => {
    try {
      await authSvc.logoutUser(req.headers["authorization"]);
      res.json({
        data: null,
        message: "Logged out successfully",
        status: "LOGOUT_SUCCESS",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };
  updateUserById = (req, res, next) => {
    res.json({
      data: req.params.id,
      message: "user update",
      status: "Sucess",
      options: null,
    });
  };

  getUserDetail =  async(req,res)=>{
    try {
      const _id = req.params._id;
      const detail = await UserModel.find({_id});
      res.json({
        data:detail,
        message:"user detail fetched sucessfully!!",
        status:"USER_DETAIL_FETCHED"
      })
    } catch (exception) {
      throw exception;
    }
  }

  getAllUsers = async (req, res) => {
    try {
      const users = await UserModel.find({
        role: { $in: ["driver", "passenger"] },
      })
        .select("name email role phone address image")
        .lean();
      const [customerCount, driverCount] = await Promise.all([
        UserModel.countDocuments({ role: "driver" }),
        UserModel.countDocuments({ role: "passenger" }),
      ]);

      const totalUsers = customerCount + driverCount;

      res.json({
        success: true,
        data: {
          Driver: customerCount,
          passenger: driverCount,
          TotalUsers: totalUsers,
          Users: users,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };
}

module.exports = AuthController;
