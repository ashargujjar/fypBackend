export const passwordChangedEmailTemplate = ({
  userName,
  supportEmail = "support@shipsmart.com",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Changed Successfully</title>
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

    .success-box {
      background-color: #e8f5e9;
      border-left: 4px solid #2e7d32;
      padding: 15px 18px;
      border-radius: 6px;
      font-size: 14px;
      margin: 25px 0;
      color: #2e7d32;
      font-weight: 600;
    }

    .warning-box {
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
        This is a confirmation that your <strong>ShipSmart account password has been changed successfully</strong>.
      </p>

      <div class="success-box">
        ✅ Your password was updated successfully.
      </div>

      <p>
        If you made this change, no further action is required.
      </p>

      <div class="warning-box">
        ⚠️ If you did NOT change your password, please contact our support team immediately
        to secure your account.
      </div>

      <div class="divider"></div>

      <p>
        Need help? Reach us at  
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
