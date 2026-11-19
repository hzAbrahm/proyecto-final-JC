"use strict";

const path = require("node:path");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
const databaseName = process.env.MONGODB_DATABASE || "calles_dulces_dev";
const productCategories = new Set(["postres-frios", "brownies", "tortas", "galletas", "dulces"]);

app.disable("x-powered-by");
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

app.use(express.static(path.resolve(__dirname, "../docs")));

module.exports = app;
