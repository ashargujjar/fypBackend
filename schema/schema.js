import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },

    // Forgot password OTP
    forgotPasswordOtp: {
      type: String,
    },

    forgotPasswordOtpExpiry: {
      type: Date,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const shipmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    pickupCity: {
      type: String,
      required: true,
      trim: true,
    },
    pickupZone: {
      type: String,
      required: true,
      trim: true,
    },
    receiverName: {
      type: String,
      required: true,
      trim: true,
    },
    receiverPhone: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryCity: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryZone: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    packageType: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const paymentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SHIPMENT",
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["COD", "Prepaid"],
      required: true,
    },
    codAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    useWallet: {
      type: Boolean,
      default: false,
    },
    prepaidSource: {
      type: String,
      enum: ["wallet", "card"],
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const cityZoneSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    zones: {
      type: [String],
      required: true,
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shipment = mongoose.model("SHIPMENT", shipmentSchema);
export const Payment = mongoose.model("PAYMENT", paymentSchema);
export const Wallet = mongoose.model("WALLET", walletSchema);
export const CityZone = mongoose.model("CITY_ZONE", cityZoneSchema);
export default mongoose.model("USER", userSchema);
