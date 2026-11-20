"use strict";

const mongoose = require("mongoose");

// Usuarios normales: separados del modelo AdminUser y vinculados a la colección existente users.
// strict:false conserva campos antiguos que puedan existir en documentos previos.
const normalUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { collection: "users", timestamps: true, versionKey: false, strict: false });

module.exports = mongoose.models.NormalUser || mongoose.model("NormalUser", normalUserSchema);
