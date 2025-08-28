import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9]{6,20}$/,
        "Employee ID must be 6-20 alphanumeric characters",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      required: [true, "User role is required"],
      enum: {
        values: ["employee", "hr_officer", "insurance_agent", "admin"],
        message: "Invalid user role",
      },
    },
    profile: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxlength: [50, "Last name cannot exceed 50 characters"],
      },
      fullName: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"],
        validate: {
          validator: function (v) {
            return v <= new Date();
          },
          message: "Date of birth cannot be in the future",
        },
      },
      nic: {
        type: String,
        required: [true, "NIC number is required"],
        unique: true,
        trim: true,
        match: [
          /^[0-9]{9}[vVxX]$|^[0-9]{12}$/,
          "Please enter a valid NIC number",
        ],
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [
          /^(\+94|0)[0-9]{9}$/,
          "Please enter a valid Sri Lankan phone number",
        ],
      },
      address: {
        street: {
          type: String,
          required: [true, "Street address is required"],
          trim: true,
          maxlength: [100, "Street address cannot exceed 100 characters"],
        },
        city: {
          type: String,
          required: [true, "City is required"],
          trim: true,
          maxlength: [50, "City name cannot exceed 50 characters"],
        },
        province: {
          type: String,
          required: [true, "Province is required"],
          enum: {
            values: [
              "Western",
              "Central",
              "Southern",
              "Northern",
              "Eastern",
              "North Western",
              "North Central",
              "Uva",
              "Sabaragamuwa",
            ],
            message: "Invalid province",
          },
        },
        postalCode: {
          type: String,
          required: [true, "Postal code is required"],
          trim: true,
          match: [/^[0-9]{5}$/, "Postal code must be 5 digits"],
        },
      },
      emergencyContact: {
        name: {
          type: String,
          required: [true, "Emergency contact name is required"],
          trim: true,
          maxlength: [
            100,
            "Emergency contact name cannot exceed 100 characters",
          ],
        },
        relationship: {
          type: String,
          required: [true, "Emergency contact relationship is required"],
          enum: ["spouse", "parent", "sibling", "child", "friend", "other"],
        },
        phoneNumber: {
          type: String,
          required: [true, "Emergency contact phone is required"],
          trim: true,
          match: [/^(\+94|0)[0-9]{9}$/, "Please enter a valid phone number"],
        },
      },
    },
    employment: {
      department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
        maxlength: [100, "Department name cannot exceed 100 characters"],
      },
      designation: {
        type: String,
        required: [true, "Designation is required"],
        trim: true,
        maxlength: [100, "Designation cannot exceed 100 characters"],
      },
      employmentType: {
        type: String,
        required: [true, "Employment type is required"],
        enum: ["permanent", "contract", "probation", "executive"],
      },
      joinDate: {
        type: Date,
        required: [true, "Join date is required"],
        validate: {
          validator: function (v) {
            return v <= new Date();
          },
          message: "Join date cannot be in the future",
        },
      },
      salary: {
        type: Number,
        required: [true, "Salary is required"],
        min: [0, "Salary cannot be negative"],
      },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: {
        type: Date,
      },
      documents: {
        nicVerified: { type: Boolean, default: false },
        passportVerified: { type: Boolean, default: false },
      },
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "suspended", "terminated"],
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ employeeId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ "profile.nic": 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ "employment.department": 1 });

// Virtual for full name
UserSchema.pre("save", function (next) {
  if (this.profile.firstName && this.profile.lastName) {
    this.profile.fullName = `${this.profile.firstName} ${this.profile.lastName}`;
  }
  next();
});

// Virtual for account locked status
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model("User", UserSchema);
export default User;
