"use strict";

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    default: "",
    maxlength: 1200
  },
  ingredients: {
    type: String,
    trim: true,
    default: "",
    maxlength: 600
  },
  weightGrams: {
    type: Number,
    min: 1,
    validate: {
      validator: (value) => value == null || Number.isSafeInteger(value),
      message: "El peso debe ser un número entero de gramos."
    }
  },
  priceCOP: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isSafeInteger,
      message: "El precio debe ser un número entero de pesos."
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  imageUrl: {
    type: String,
    trim: true,
    default: "",
    maxlength: 500
  },
  restriction: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    // Valores posibles: "" (ninguna), "sin-leche", "sin-gluten", "vegano"
    // Los productos que no tengan este campo quedan con "" y el filtro los omite correctamente.
    enum: ["", "sin-leche", "sin-gluten", "vegano"]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  collection: "products",
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
