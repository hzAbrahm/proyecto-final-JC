
"use strict";

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  unitPriceCOP: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger
  },
  subtotalCOP: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger
  }
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  receipt: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      maxlength: 30
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    }
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length > 0,
      message: "El pedido debe contener al menos un producto."
    }
  },
  totalCOP: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["contraentrega"]
  },
  deliveryStatus: {
    type: String,
    enum: ["confirmado", "preparando", "listo para entregar", "en camino", "entregado"],
    default: "confirmado",
    alias: "estadoEntrega"
  },
  status: {
    type: String,
    required: true,
    enum: ["confirmed", "cash_on_delivery"],
    default: "confirmed"
  }
}, {
  collection: "orders",
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
