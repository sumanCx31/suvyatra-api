const authRouter = require("express").Router();
const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const uploader = require("../../middlewares/uploader.middleware");
const AuthController = require("./auth.controller");
const { RegisterDTO, ResetPasswordRequestDTO, ResetPasswordDataDTO, ChangePasswordDTO } = require("./auth.validator");

const authCtrl = new AuthController()

authRouter.post("/register",uploader().single('image'),bodyValidator(RegisterDTO),authCtrl.registerUser)
authRouter.get("/activate/:token",authCtrl.activateUser )
authRouter.post("/login", authCtrl.loginUser)
authRouter.get("/me",auth(), authCtrl.loggedInUserProfile)
authRouter.get("/logout",auth(USER_ROLES.ADMIN || USER_ROLES.DRIVER), authCtrl.logoutUser)
authRouter.get("/refresh", authCtrl.refreshToken)
authRouter.post("/forget-password",bodyValidator(ResetPasswordRequestDTO),authCtrl.forgetPasswordRequest)
authRouter.get("/forget-password-verify/:token", authCtrl.forgetPasswordTokenVerify);
authRouter.put("/reset-password",bodyValidator(ResetPasswordDataDTO),authCtrl.resetPassword);
authRouter.put("/change-password",auth(),bodyValidator(ChangePasswordDTO),authCtrl.changePassword);
authRouter.get("/user",authCtrl.getAllUsers);


authRouter.put("/user/:id",authCtrl.updateUserById)
module.exports = authRouter