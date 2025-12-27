export const welcomeEmailTemplate = ({
  userName,
  email,
  loginUrl,
  supportEmail = "support@shipsmart.com",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to ShipSmart</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f2f6fb;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }

    .email-container {
      max-width: 620px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 74, 173, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #004aad, #007bff);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.5px;
    }

    .header p {
      margin-top: 8px;
      font-size: 14px;
      opacity: 0.9;
    }

    .content {
      padding: 35px 40px;
      color: #333333;
    }

    .content h2 {
      font-size: 22px;
      margin-bottom: 10px;
      color: #004aad;
    }

    .content p {
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 18px;
    }

    .highlight-box {
      background-color: #f0f6ff;
      border-left: 4px solid #007bff;
      padding: 15px 18px;
      border-radius: 6px;
      margin: 25px 0;
      font-size: 14px;
    }

    .button-wrapper {
      text-align: center;
      margin: 35px 0;
    }

    .login-button {
      background-color: #007bff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      display: inline-block;
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
      <h2>Welcome, ${userName} 👋</h2>

      <p>
        We’re excited to let you know that your
        <strong>ShipSmart account has been successfully created</strong>.
        You can now manage shipments, track deliveries, and experience
        smart logistics in one place.
      </p>

      <div class="highlight-box">
        🚚 Real-time shipment tracking<br/>
        📦 Secure & transparent deliveries<br/>
        📊 Smart logistics dashboard
      </div>

      <p>
        You can log in using your registered email:
        <strong>${email}</strong>
      </p>

      <div class="button-wrapper">
        <a href="${loginUrl}" class="login-button">
          Login to ShipSmart
        </a>
      </div>

      <div class="divider"></div>

      <p>
        Need help or have questions? Our support team is always here for you.
      </p>

      <p>
        📧 <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © ${new Date().getFullYear()} ShipSmart. All rights reserved.<br/>
      Built for modern courier & logistics solutions.
    </div>

  </div>

</body>
</html>
`;
