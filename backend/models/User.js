import mongoose from "mongoose";
import {
  hashPasswordMiddleware,
  comparePassword,
} from "../middleware/password-middleware.js";

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      // Will be auto-generated based on role
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
          /^([0-9]{9}[vVxX]|[0-9]{12})$/,
          "Please enter a valid NIC number (9 digits + V/X or 12 digits)",
        ],
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        // Will be normalized to +94 format in middleware
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
    },
    // Employment details - only for employees
    employment: {
      department: {
        type: String,
        trim: true,
        maxlength: [100, "Department name cannot exceed 100 characters"],
        required: function () {
          return this.role === "employee";
        },
      },
      designation: {
        type: String,
        trim: true,
        maxlength: [100, "Designation cannot exceed 100 characters"],
        required: function () {
          return this.role === "employee";
        },
      },
      employmentType: {
        type: String,
        enum: ["permanent", "contract", "probation", "executive"],
        required: function () {
          return this.role === "employee";
        },
      },
      joinDate: {
        type: Date,
        required: function () {
          return this.role === "employee";
        },
        validate: {
          validator: function (v) {
            return !v || v <= new Date();
          },
          message: "Join date cannot be in the future",
        },
      },
      salary: {
        type: Number,
        min: [0, "Salary cannot be negative"],
        required: function () {
          return this.role === "employee";
        },
      },
    },
    // Dependent information - only for employees
    dependents: [
      {
        name: {
          type: String,
          required: [true, "Dependent name is required"],
          trim: true,
          maxlength: [100, "Dependent name cannot exceed 100 characters"],
        },
        relationship: {
          type: String,
          required: [true, "Relationship is required"],
          enum: ["spouse", "child"],
        },
        dateOfBirth: {
          type: Date,
          required: [true, "Dependent date of birth is required"],
          validate: {
            validator: function (v) {
              return v <= new Date();
            },
            message: "Date of birth cannot be in the future",
          },
        },
        nic: {
          type: String,
          trim: true,
          match: [
            /^([0-9]{9}[vVxX]|[0-9]{12})$/,
            "Please enter a valid NIC number",
          ],
        },
      },
    ],
    // Bank details - only for employees
    bankDetails: {
      accountHolderName: {
        type: String,
        trim: true,
        maxlength: [100, "Account holder name cannot exceed 100 characters"],
        required: function () {
          return this.role === "employee";
        },
      },
      bankName: {
        type: String,
        trim: true,
        maxlength: [100, "Bank name cannot exceed 100 characters"],
        required: function () {
          return this.role === "employee";
        },
      },
      branchName: {
        type: String,
        trim: true,
        maxlength: [100, "Branch name cannot exceed 100 characters"],
        required: function () {
          return this.role === "employee";
        },
      },
      accountNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{8,20}$/, "Account number must be 8-20 digits"],
        required: function () {
          return this.role === "employee";
        },
      },
    },
    // Insurance provider details - only for insurance agents
    insuranceProvider: {
      companyName: {
        type: String,
        trim: true,
        maxlength: [100, "Company name cannot exceed 100 characters"],
        required: function () {
          return this.role === "insurance_agent";
        },
      },
      agentId: {
        type: String,
        trim: true,
        maxlength: [50, "Agent ID cannot exceed 50 characters"],
        required: function () {
          return this.role === "insurance_agent";
        },
      },
      licenseNumber: {
        type: String,
        trim: true,
        maxlength: [50, "License number cannot exceed 50 characters"],
        required: function () {
          return this.role === "insurance_agent";
        },
      },
      contactEmail: {
        type: String,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
        required: function () {
          return this.role === "insurance_agent";
        },
      },
      contactPhone: {
        type: String,
        trim: true,
        required: function () {
          return this.role === "insurance_agent";
        },
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

//Implicit Indexes so commented out
//UserSchema.index({ userId: 1 });
//UserSchema.index({ email: 1 });
//UserSchema.index({ "profile.nic": 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ "employment.department": 1 });

UserSchema.pre("save", hashPasswordMiddleware);
UserSchema.methods.comparePassword = comparePassword;

// Auto-generate userId based on role
UserSchema.pre("save", async function (next) {
  if (this.isNew && !this.userId) {
    try {
      const rolePrefix = {
        employee: "E",
        hr_officer: "H",
        insurance_agent: "I",
        admin: "A",
      };

      const prefix = rolePrefix[this.role];
      if (!prefix) {
        return next(new Error("Invalid role for userId generation"));
      }

      // Find the highest existing userId for this role
      const lastUser = await this.constructor
        .findOne({ userId: new RegExp(`^${prefix}`) })
        .sort({ userId: -1 })
        .select("userId");

      let nextNumber = 1;
      if (lastUser && lastUser.userId) {
        const currentNumber = parseInt(lastUser.userId.substring(1));
        nextNumber = currentNumber + 1;
      }

      this.userId = `${prefix}${nextNumber.toString().padStart(5, "0")}`;
    } catch (error) {
      return next(error);
    }
  }

  // Normalize phone number to +94 format
  if (this.profile && this.profile.phoneNumber) {
    let phone = this.profile.phoneNumber.replace(/\s+/g, "");
    if (phone.startsWith("0")) {
      phone = "+94" + phone.substring(1);
    } else if (!phone.startsWith("+94")) {
      phone = "+94" + phone;
    }
    this.profile.phoneNumber = phone;
  }

  // Normalize insurance agent contact phone
  if (this.insuranceProvider && this.insuranceProvider.contactPhone) {
    let phone = this.insuranceProvider.contactPhone.replace(/\s+/g, "");
    if (phone.startsWith("0")) {
      phone = "+94" + phone.substring(1);
    } else if (!phone.startsWith("+94")) {
      phone = "+94" + phone;
    }
    this.insuranceProvider.contactPhone = phone;
  }

  // Validation for dependents (only 1 spouse allowed)
  if (
    this.role === "employee" &&
    this.dependents &&
    this.dependents.length > 0
  ) {
    const spouseCount = this.dependents.filter(
      (dep) => dep.relationship === "spouse"
    ).length;
    if (spouseCount > 1) {
      return next(new Error("Only one spouse is allowed as a dependent"));
    }
  }

  next();
});

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return "";
});

// Virtual for age
UserSchema.virtual("age").get(function () {
  if (this.profile && this.profile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
  return null;
});

// Virtual for account locked status
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Ensure virtuals are included in JSON output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", UserSchema);
export default User;
