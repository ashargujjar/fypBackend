export const shipmentBookedEmailTemplate = ({
  userName,
  shipmentId,
  pickupLocation,
  dropLocation,
  receiverName,
  receiverPhone,
  packageType,
  weight,
  deliveryCharges,
  codAmount,
  totalAmount,
  bookingDate,
  supportEmail = "support@shipsmart.com",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Shipment Booked Successfully</title>
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
      padding: 28px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 35px 38px;
      color: #333333;
    }
    .content h2 {
      font-size: 21px;
      color: #004aad;
    }
    .success-box {
      background-color: #e3f2fd;
      border-left: 4px solid #007bff;
      padding: 15px 18px;
      border-radius: 6px;
      margin: 25px 0;
      font-weight: 600;
      color: #004aad;
    }
    .details-box {
      background-color: #f7f9fc;
      border: 1px solid #e6ebf2;
      padding: 18px 20px;
      border-radius: 8px;
      margin: 25px 0;
      font-size: 14px;
    }
    .details-box p {
      margin: 6px 0;
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
  </style>
</head>

<body>
  <div class="email-container">

    <div class="header">
      <h1>ShipSmart</h1>
      <p>Smart Logistics & Courier Platform</p>
    </div>

    <div class="content">
      <h2>Hello ${userName}</h2>

      <p>Your shipment has been successfully booked.</p>

      <div class="success-box">
        Shipment Booked Successfully
      </div>

      <div class="details-box">
        <p><strong>Shipment ID:</strong> ${shipmentId}</p>
        <p><strong>Pickup:</strong> ${pickupLocation}</p>
        <p><strong>Delivery:</strong> ${dropLocation}</p>
        <p><strong>Receiver:</strong> ${receiverName} (${receiverPhone})</p>
        <p><strong>Package Type:</strong> ${packageType}</p>
        <p><strong>Weight:</strong> ${weight} kg</p>
        <p><strong>Delivery Charges:</strong> PKR ${deliveryCharges}</p>
        <p><strong>COD Amount:</strong> PKR ${codAmount}</p>
        <p><strong>Total Payable:</strong> PKR ${totalAmount}</p>
        <p><strong>Booked On:</strong> ${bookingDate}</p>
      </div>

      <p>
        Need help? <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>

    <div class="footer">
      Copyright ${new Date().getFullYear()} ShipSmart. All rights reserved.
    </div>

  </div>
</body>
</html>
`;




