"use strict";

const mongoose = require("mongoose");

// Se conserva el nombre de la colección existente: suggestions.
// strict:false permite mantener campos previos que no estén declarados aquí.
const suggestionSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180
  }
}, {
  collection: "suggestions",
  timestamps: true,
  versionKey: false,
  strict: false
});

module.exports = mongoose.models.Suggestion || mongoose.model("Suggestion", suggestionSchema);
