"use strict";

const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    alias: "nombre"
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
    alias: "numero"
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 150,
    alias: "correo"
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
    alias: "mensaje"
  }
}, {
  collection: "helprequest",
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.HelpRequest || mongoose.model("HelpRequest", helpRequestSchema);
