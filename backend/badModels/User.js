import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: [true, "User ID is required"], unique: true, trim: true, uppercase: true, match: [/^[A-Z0-9]{6,20}$/, "User ID must be 6-20 alphanumeric characters"] },
  email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"] },
  passwordHash: { type: String, required: [true, "Password hash is required"], select: false },
  role: { type: String, required: [true, "User role is required"], enum: { values: ["employee", "hr_officer", "insurance_agent", "admin"], message: "Invalid user role" } },
  name: { type: String, required: [true, "Name is required"], trim: true, maxlength: [100, "Name cannot exceed 100 characters"] },
  nic: { type: String, required: [true, "NIC number is required"], unique: true, trim: true, match: [/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, "Please enter a valid NIC number"] },
  phoneNumber: { type: String, required: [true, "Phone number is required"], trim: true, match: [/^(\+94|0)[0-9]{9}$/, "Please enter a valid Sri Lankan phone number"] },
  address: { type: String, required: [true, "Address is required"], trim: true, maxlength: [200, "Address cannot exceed 200 characters"] },
  status: { type: String, default: "active", enum: ["active", "inactive", "suspended", "terminated"] },
  designation: { type: String, trim: true, maxlength: [100, "Designation cannot exceed 100 characters"] },
  dateOfBirth: { type: Date, validate: { validator: function (v) { return !v || v <= new Date(); }, message: "Date of birth cannot be in the future" } },
  salary: { type: Number, min: [0, "Salary cannot be negative"] },
  joinDate: { type: Date, validate: { validator: function (v) { return !v || v <= new Date(); }, message: "Join date cannot be in the future" } },
  permissionLevel: { type: String, enum: ["basic", "standard", "elevated", "admin"] },
  seniorityLevel: { type: String, enum: ["junior", "mid", "senior", "lead", "executive"] },
  insuranceCompany: { type: String, trim: true, maxlength: [100, "Insurance company name cannot exceed 100 characters"] },
  department: {
    name: { type: String, required: [true, "Department name is required"], trim: true, maxlength: [100, "Department name cannot exceed 100 characters"] },
    code: { type: String, trim: true, uppercase: true, maxlength: [20, "Department code cannot exceed 20 characters"] },
    location: { type: String, trim: true, maxlength: [100, "Department location cannot exceed 100 characters"] }
  },
  dependents: [{
    name: { type: String, required: [true, "Dependent name is required"], trim: true, maxlength: [100, "Dependent name cannot exceed 100 characters"] },
    relationship: { type: String, required: [true, "Relationship is required"], enum: ["spouse", "child", "parent", "sibling", "other"] },
    dateOfBirth: { type: Date, validate: { validator: function (v) { return !v || v <= new Date(); }, message: "Date of birth cannot be in the future" } },
    nic: { type: String, trim: true, match: [/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, "Please enter a valid NIC number"] },
    isInsured: { type: Boolean, default: false },
    insurancePolicies: [{ type: String, trim: true }]
  }]
}, { timestamps: true });

UserSchema.index({ userId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ nic: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

const User = mongoose.model("User", UserSchema);
export default User;