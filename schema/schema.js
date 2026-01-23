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
  },
);

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    assignedCity: {
      type: String,
      required: true,
      trim: true,
    },
    riderCategory: {
      type: String,
      required: true,
      enum: ["pickup", "linehaul", "delivery"],
    },
    assignedZone: {
      type: String,
      trim: true,
      required: function () {
        return (
          this.riderCategory === "pickup" || this.riderCategory === "delivery"
        );
      },
    },
  },
  {
    timestamps: true,
  },
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
    codAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    useWallet: {
      type: Boolean,
      default: false,
    },
    delieveryCharges: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      default: "pending",
    },
    riderStatus: {
      type: String,
      default: "unassigned",
      enum: ["assigned", "unassigned"],
    },
  },
  {
    timestamps: true,
  },
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

    deliveryCharges: {
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
      default: "Pending",
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
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
  },
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
  },
);

const rateSchema = new mongoose.Schema(
  {
    perKgRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    intercityFixedRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    cityToCityRates: {
      type: [
        {
          fromCity: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          toCity: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          rate: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
const complaintSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SHIPMENT",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    complaintText: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      default: "pending",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
const riderTasksSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SHIPMENT",
      required: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RIDER",
      required: true,
    },
    assignedTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "assigned",
    },
  },
  {
    timestamps: true,
  },
);
// ----- for getting the admin key -----
//
const dynamicSchema = new mongoose.Schema({}, { strict: false });

// connect model to EXISTING collection
export const getAdminKey = mongoose.model(
  "DynamicModel",
  dynamicSchema,
  "Adminkey",
);
export const RIDER = mongoose.model("RIDER", riderSchema);
export const SHIPMENT = mongoose.model("SHIPMENT", shipmentSchema);
export const PAYMENT = mongoose.model("PAYMENT", paymentSchema);
export const Wallet = mongoose.model("WALLET", walletSchema);
export const CityZone = mongoose.model("CITY_ZONE", cityZoneSchema);
export const RATE = mongoose.model("RATE", rateSchema);
export const COMPLAINT = mongoose.model("COMPLAINT", complaintSchema);
export const RiderTasks = mongoose.model("RIDER_TASKS", riderTasksSchema);
export default mongoose.model("USER", userSchema);
