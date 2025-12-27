export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
export const otpEmailTemplate = ({
  userName,
  otp,
  validityMinutes = 5,
  supportEmail = "support@shipsmart.com",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ShipSmart OTP Verification</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f2f6fb;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 74, 173, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #004aad, #007bff);
      padding: 28px;
      text-align: center;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 26px;
      letter-spacing: 0.5px;
    }

    .header p {
      margin-top: 6px;
      font-size: 13px;
      opacity: 0.9;
    }

    .content {
      padding: 35px 38px;
      color: #333333;
    }

    .content h2 {
      font-size: 21px;
      color: #004aad;
      margin-bottom: 12px;
    }

    .content p {
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .otp-box {
      margin: 30px auto;
      text-align: center;
    }

    .otp-code {
      display: inline-block;
      background-color: #f0f6ff;
      color: #004aad;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: 700;
      padding: 16px 28px;
      border-radius: 8px;
      border: 2px dashed #007bff;
    }

    .note-box {
      background-color: #fff4e5;
      border-left: 4px solid #ff9800;
      padding: 14px 18px;
      border-radius: 6px;
      font-size: 14px;
      margin-top: 25px;
    }

    .footer {
      background-color: #f7f9fc;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #777777;
    }

    .footer a {
      color: #007bff;
      text-decoration: none;
    }

    .divider {
      height: 1px;
      background-color: #e6ebf2;
      margin: 30px 0;
    }

    @media (max-width: 600px) {
      .content {
        padding: 25px 22px;
      }

      .otp-code {
        font-size: 24px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>

<body>

  <div class="email-container">

    <!-- Header -->
    <div class="header">
      <h1>ShipSmart</h1>
      <p>Smart Logistics & Courier Platform</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Hello ${userName} 👋</h2>

      <p>
        We received a request to verify your identity on <strong>ShipSmart</strong>.
        Please use the One-Time Password (OTP) below to continue.
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>

      <p>
        This OTP is valid for <strong>${validityMinutes} minutes</strong>.
        Do not share this code with anyone for security reasons.
      </p>

      <div class="note-box">
        ⚠️ If you did not request this OTP, please ignore this email or contact our support team immediately.
      </div>

      <div class="divider"></div>

      <p>
        Need help? Contact us at  
        📧 <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © ${new Date().getFullYear()} ShipSmart. All rights reserved.<br/>
      Secure • Reliable • Smart Deliveries
    </div>

  </div>

</body>
</html>
`;
