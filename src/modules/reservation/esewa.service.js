const axios = require("axios");

class EsewaService {

  // 🔹 Generate eSewa payment URL
  generatePaymentURL({ amount, token }) {
    const params = new URLSearchParams({
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: token, // 🔥 use token as product id
      scd: "EPAYTEST",
      su: "http://localhost:3000/payment-success",
      fu: "http://localhost:3000/payment-failure"
    });

    return `https://uat.esewa.com.np/epay/main?${params.toString()}`;
  }

  // 🔹 Verify Payment
  async verifyPayment({ amount, refId, token }) {
    try {
      const response = await axios.get(
        `https://uat.esewa.com.np/epay/transrec`,
        {
          params: {
            amt: amount,
            rid: refId,
            pid: token,
            scd: "EPAYTEST"
          }
        }
      );

      return response.data.includes("Success");

    } catch (error) {
      console.error("eSewa verify error:", error.message);
      return false;
    }
  }
}

module.exports = new EsewaService();