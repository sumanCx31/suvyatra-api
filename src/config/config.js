require("dotenv").config();
const AppConfig = {
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  nextjsFrontendUrl: process.env.NEXTJS_FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET
};

const SMTPConfig = {
  provider: process.env.SMTP_PROVIDER,
  host: process.env.STMP_HOST || "smtp.gmail.com",
  user: process.env.SMTP_USER,
  password:process.env.SMTP_PASSWORD,
  port: process.env.SMTP_PORT,
  from: process.env.SMTP_FROM,
  resendApiKey:process.env.RESEND_API_KEY
};


const DbConfig = {
  mongoDBUrl: process.env.MONGODB_URL,
  mongoDBName: process.env.MONGODB_DBNAME,
}


const PaymentConfig = {
  khalti:{
    url:process.env.KHALTI_PAYMENT_URL,
    secretKey:process.env.KHALTI_SECRET_KEY
  }
}

module.exports = {
  AppConfig,
  SMTPConfig,
  DbConfig,
  PaymentConfig
};
