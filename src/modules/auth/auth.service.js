const bcrypt = require("bcryptjs");
const cloudinarySvc = require("../../services/cloudinary.service");
const { Status } = require("../../config/constants");
const { AppConfig } = require("../../config/config");
const emailSvc = require("../../services/email.service");
const AuthModel = require("./auth.model");
const userSvc = require("../user/user.service");

class AuthService {
  generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  async transformUserCreate(req) {
    try {
      const data = req.body;
      if (req.file) {
        data.image = await cloudinarySvc.fileUpload(req.file.path, "/user/");
      }
      data.password = bcrypt.hashSync(data.password, 12);
      data.status = Status.INACTIVE;

      data.activationToken = this.generateOTP();

      const { confirmPassword, ...mappedData } = data;
      return mappedData;
    } catch (exception) {
      throw exception;
    }
  }

  async sendActivationNotification(user) {
    try {
      await emailSvc.sendEmail({
        to: user.email,
        sub: "Account Activation OTP",
        msg: `
<div style="background-color: #f9fafb; padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🚌 SuvYatra</h1>
        </div>

        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">Verify your account</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 30px 0;">
                Hi ${user.name}, <br>
                Thank you for choosing SuvYatra. Use the code below to complete your registration and start booking.
            </p>

            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; border: 1px dashed #d1d5db; display: inline-block; min-width: 200px;">
                <span style="display: block; color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Verification Code</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4338ca; letter-spacing: 10px;">${user.activationToken}</span>
            </div>

            <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">
                This code is valid for <strong>15 minutes</strong>. <br>
                For your security, do not share this code with anyone.
            </p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 SuvYatra Transportation System <br>
                Kathmandu, Nepal
            </p>
        </div>
    </div>
</div>
`,
      });
    } catch (exception) {
      throw exception;
    }
  }

  async newUserWelcomeEmail(user) {
    try {
      return emailSvc.sendEmail({
        to: user.email,
        sub: "Welcome to BusTicket",
        msg: `<div><h1>Account Successfully Activated</h1>
<p>Welcome, <strong>${user.name}</strong>. Your account is now fully verified and ready for use.</p>
<p>You can now browse our services and manage your bookings through your personalized dashboard.</p></div>`,
      });
    } catch (exception) {
      throw exception;
    }
  }

  // Existing Auth Data methods...
  createAuthData = async (data) => {
    try {
      const auth = new AuthModel(data);
      return await auth.save();
    } catch (exception) {
      throw exception;
    }
  };

  getSingleRowByFilter = async (filter) => {
    try {
      return await AuthModel.findOne(filter);
    } catch (exception) {
      throw exception;
    }
  };

  logoutFromAll = async (filter) => {
    try {
      return await AuthModel.deleteMany(filter);
    } catch (exception) {
      throw exception;
    }
  };

  updateSingleRowByFilter = async (filter, data) => {
    try {
      return await AuthModel.findOneAndUpdate(
        filter,
        { $set: data },
        { new: true },
      );
    } catch (exception) {
      throw exception;
    }
  };
}

const authSvc = new AuthService();
module.exports = authSvc;
