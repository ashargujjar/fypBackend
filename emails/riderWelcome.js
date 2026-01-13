export const riderWelcomeEmailTemplate = ({
  name,
  email,
  phone,
  password,
  assignedCity,
  riderCategory,
  assignedZone,
  supportEmail = "support@shipsmart.com",
}) => {
  const assignedZoneText = assignedZone || "N/A";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Rider Account Details</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f7fb;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      color: #1f2a37;
    }
    .email-container {
      max-width: 640px;
      margin: 32px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #e5edf5;
    }
    .header {
      background: linear-gradient(135deg, #0f4c81, #1d8bd1);
      color: #ffffff;
      padding: 28px 36px;
    }
    .header .brand {
      font-size: 20px;
      letter-spacing: 0.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .header .subtitle {
      margin-top: 6px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 36px 18px;
    }
    .content h1 {
      font-size: 22px;
      margin: 0 0 12px;
      color: #0f2b46;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 16px;
    }
    .details {
      background-color: #f7fbff;
      border: 1px solid #d8e6f7;
      border-radius: 10px;
      padding: 16px 18px;
      margin: 18px 0 22px;
    }
    .details table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .details td {
      padding: 8px 0;
      vertical-align: top;
    }
    .details td.label {
      font-weight: 600;
      width: 40%;
      color: #1f2a37;
    }
    .details td.value {
      color: #334155;
    }
    .note {
      background-color: #fff6e5;
      border-left: 4px solid #f59e0b;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 13px;
      color: #7c4a03;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 16px 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #1d8bd1;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .content {
        padding: 24px 22px 16px;
      }
      .header {
        padding: 22px 22px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand">ShipSmart</div>
      <div class="subtitle">Rider account created</div>
    </div>
    <div class="content">
      <h1>Welcome, ${name}</h1>
      <p>
        Your rider account is ready. Use the details below to sign in and start
        your routes.
      </p>

      <div class="details">
        <table role="presentation">
          <tr>
            <td class="label">Name</td>
            <td class="value">${name}</td>
          </tr>
          <tr>
            <td class="label">Email</td>
            <td class="value">${email}</td>
          </tr>
          <tr>
            <td class="label">Phone</td>
            <td class="value">${phone}</td>
          </tr>
          <tr>
            <td class="label">Password</td>
            <td class="value">${password}</td>
          </tr>
          <tr>
            <td class="label">Assigned City</td>
            <td class="value">${assignedCity}</td>
          </tr>
          <tr>
            <td class="label">Rider Category</td>
            <td class="value">${riderCategory}</td>
          </tr>
          <tr>
            <td class="label">Assigned Zone</td>
            <td class="value">${assignedZoneText}</td>
          </tr>
        </table>
      </div>

      <div class="note">
        For security, please change your password after your first login.
      </div>

      <p>
        If you did not expect this email, contact support at
        <a href="mailto:${supportEmail}">${supportEmail}</a>.
      </p>
    </div>
    <div class="footer">
      Copyright ${new Date().getFullYear()} ShipSmart. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};
