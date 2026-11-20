"use strict";

const path = require("node:path");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Order = require("./models/order");
const { randomUUID } = require("node:crypto");

const app = express();
const databaseName = process.env.MONGODB_DATABASE || "calles_dulces_dev";
const productCategories = new Set(["postres-frios", "brownies", "tortas", "galletas", "dulces"]);

app.disable("x-powered-by");

// Permitir solicitudes desde el frontend local
app.use((request, response, next) => {
  response.setHeader(
    "Access-Control-Allow-Origin",
    "http://127.0.0.1:3000"
  );

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    ok: connected,
    database: connected ? { name: databaseName, status: "connected" } : { status: "disconnected" }
  });
});

function createProductSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function allowLocalDevelopmentWrites(request, response, next) {
  const address = request.socket.remoteAddress || "";
  const isLoopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address);
  if (process.env.NODE_ENV !== "development" || !isLoopback) {
    return response.status(404).json({ error: "Esta ruta solo está disponible en desarrollo local." });
  }
  next();
}

app.get("/api/products", async (_request, response) => {
  try {
    const items = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    response.json({ items });
  } catch {
    response.status(500).json({ error: "No se pudieron consultar los productos." });
  }
});

app.post("/api/dev/products", allowLocalDevelopmentWrites, async (request, response) => {
  const body = request.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const priceCOP = Number(body.priceCOP);
  const weightGrams = body.weightGrams === "" || body.weightGrams == null
    ? undefined
    : Number(body.weightGrams);
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!name || !productCategories.has(category) || !Number.isSafeInteger(priceCOP) || priceCOP < 1) {
    return response.status(400).json({ error: "Completa el nombre, la categoría y un precio entero mayor que cero." });
  }
  if (weightGrams !== undefined && (!Number.isSafeInteger(weightGrams) || weightGrams < 1)) {
    return response.status(400).json({ error: "El peso debe ser un número entero de gramos." });
  }
  if (imageUrl && !imageUrl.startsWith("/assets/") && !/^https?:\/\//i.test(imageUrl)) {
    return response.status(400).json({ error: "La imagen debe usar una ruta /assets/ o una URL http(s)." });
  }

  try {
    const item = await Product.create({
      name,
      slug: createProductSlug(name),
      description: typeof body.description === "string" ? body.description : "",
      ingredients: typeof body.ingredients === "string" ? body.ingredients : "",
      weightGrams,
      priceCOP,
      category,
      imageUrl
    });
    response.status(201).json({ item });
  } catch (error) { 
     console.error("ERROR REAL AL GUARDAR:", error);


    if (error.code === 11000) {
      return response.status(409).json({ error: "Ya existe un producto con ese nombre." });
    }
    if (error.name === "ValidationError") {
      return response.status(400).json({ error: "Revisa los datos del producto e intenta de nuevo." });
    }
    response.status(500).json({ error: "No se pudo guardar el producto en MongoDB." });
  }
});

app.post("/api/orders", async (request, response) => {
  try {
    const body = request.body || {};
    const customer = body.customer || {};
    const items = body.items;
    const paymentMethod = body.paymentMethod;

    // Validar datos del cliente
    const name = typeof customer.name === "string" ? customer.name.trim() : "";
    const email = typeof customer.email === "string" ? customer.email.trim().toLowerCase() : "";
    const phone = typeof customer.phone === "string" ? customer.phone.trim() : "";
    const city = typeof customer.city === "string" ? customer.city.trim() : "";
    const address = typeof customer.address === "string" ? customer.address.trim() : "";

    if (!name || !email || !phone || !city || !address) {
      return response.status(400).json({
        error: "Completa todos los datos del cliente y la entrega."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({
        error: "El correo electrónico no es válido."
      });
    }

    // Validar productos y cantidades
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return response.status(400).json({
        error: "El pedido debe contener entre 1 y 30 productos."
      });
    }

    const allowedPaymentMethods = ["contraentrega"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return response.status(400).json({
        error: "El método de pago no es válido."
      });
    }

    const productIds = [];

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
      ) {
        return response.status(400).json({
          error: "Hay productos o cantidades inválidas en el pedido."
        });
      }

      if (productIds.includes(item.productId)) {
        return response.status(400).json({
          error: "No repitas productos en el pedido."
        });
      }

      productIds.push(item.productId);
    }

    // Consultar los precios reales en MongoDB
    const products = await Product.find({
      _id: { $in: productIds },
      active: true
    });

    if (products.length !== productIds.length) {
      return response.status(400).json({
        error: "Uno o más productos no existen o ya no están disponibles."
      });
    }

    // Construir los productos del pedido con precios confiables
    const orderItems = products.map((product) => {
      const requestedItem = items.find(
        (item) => item.productId === product._id.toString()
      );

      const unitPriceCOP = product.priceCOP;
      const quantity = requestedItem.quantity;
      const subtotalCOP = unitPriceCOP * quantity;

      if (
        !Number.isSafeInteger(unitPriceCOP) ||
        unitPriceCOP < 1 ||
        !Number.isSafeInteger(subtotalCOP)
      ) {
        throw new Error("Precio de producto inválido.");
      }

      return {
        product: product._id,
        name: product.name,
        unitPriceCOP,
        quantity,
        subtotalCOP
      };
    });

    const totalCOP = orderItems.reduce(
      (total, item) => total + item.subtotalCOP,
      0
    );

    if (!Number.isSafeInteger(totalCOP) || totalCOP < 1) {
      return response.status(400).json({
        error: "No se pudo calcular el total del pedido."
      });
    }

    // Guardar el pedido
    const order = await Order.create({
      receipt: `CD-${randomUUID()}`,
      customer: {
        name,
        email,
        phone,
        city,
        address
      },
      items: orderItems,
      totalCOP,
      paymentMethod,
      status: "cash_on_delivery"
    });

    response.status(201).json({
      message: "Pedido registrado correctamente.",
      order: {
        receipt: order.receipt,
        totalCOP: order.totalCOP,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error("Error al registrar pedido:", error);

    if (error.name === "ValidationError") {
      return response.status(400).json({
        error: "Los datos del pedido no cumplen con los requisitos."
      });
    }

    response.status(500).json({
      error: "No se pudo registrar el pedido."
    });
  }
});

app.use(express.static(path.resolve(__dirname, "../docs")));

module.exports = app;
