export const verifyAccountEmailTemplate = ({ userName, verifyUrl }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your ShipSmart Account</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .email-wrapper {
      width: 100%;
      padding: 40px 0;
    }

    .email-container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #0f4c75, #3282b8);
      padding: 32px;
      text-align: center;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.5px;
    }

    .content {
      padding: 32px;
      color: #333333;
      line-height: 1.7;
    }

    .content h2 {
      margin-top: 0;
      color: #0f4c75;
      font-size: 22px;
    }

    .content p {
      font-size: 15px;
      margin: 14px 0;
    }

    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }

    .verify-btn {
      display: inline-block;
      padding: 15px 36px;
      background-color: #0f4c75;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 18px rgba(15, 76, 117, 0.2);
    }

    .verify-btn:hover {
      background-color: #0b3a5a;
    }

    .link-box {
      background-color: #f1f7fc;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
      word-break: break-all;
      margin-top: 20px;
    }

    .link-box a {
      color: #0f4c75;
      text-decoration: none;
    }

    .warning {
      background-color: #fff3cd;
      color: #856404;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 24px;
    }

    .footer {
      background-color: #fafafa;
      padding: 22px;
      text-align: center;
      font-size: 12px;
      color: #777777;
    }

    @media (max-width: 600px) {
      .content {
        padding: 22px;
      }

      .verify-btn {
        padding: 14px 28px;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="header">
        <h1>ShipSmart</h1>
        <p>Email Verification Required</p>
      </div>

      <!-- Content -->
      <div class="content">
        <h2>Hello ${userName},</h2>

        <p>
          Thank you for registering with <strong>ShipSmart</strong>.
          To activate your account, please verify your email address by clicking the button below.
        </p>

        <div class="button-wrapper">
          <a
            href="${verifyUrl}"
            class="verify-btn"
            style="display: inline-block; padding: 15px 36px; background-color: #0f4c75; color: #ffffff; text-decoration: none; border-radius: 30px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;"
          >
            Verify Email Address
          </a>
        </div>

        <p>
          This verification link will expire in <strong>10 minutes</strong>.
          If the button does not work, copy and paste the link below into your browser:
        </p>

        <div class="link-box">
          <a href="${verifyUrl}" class="verify-link">${verifyUrl}</a>
        </div>

        <div class="warning">
          If you did not create this account, please ignore this email.
          No further action is required.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        © ${new Date().getFullYear()} ShipSmart. All rights reserved.<br />
        This is an automated message. Please do not reply.
      </div>

    </div>
  </div>
</body>
</html>
`;
};
