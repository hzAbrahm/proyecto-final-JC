"use strict";

const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 150
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "superadmin"]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  collection: "admin-users",
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
