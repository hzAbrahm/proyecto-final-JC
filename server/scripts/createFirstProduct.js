"use strict";

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const app = require("../app");
const Product = require("../models/Product");
const databaseName = process.env.MONGODB_DATABASE || "Calles-Dulces";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `La API respondió ${response.status}.`);
  return result;
}

async function createFirstProduct() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("El comando solo se ejecuta con NODE_ENV=development.");
  }
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI en .env.");

  await mongoose.connect(process.env.MONGODB_URI, {
    appName: "CallesDulcesProductCheck",
    dbName: databaseName,
    serverSelectionTimeoutMS: 10000
  });
  await mongoose.connection.db.command({ ping: 1 });

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const health = await requestJson(`${baseUrl}/api/health`);
    if (!health.ok) throw new Error("La API no detecta una conexión activa con Atlas.");

    const catalog = await requestJson(`${baseUrl}/api/products`);
    let product = catalog.items.find((item) => item.slug === "tiramisu");
    let insertedNow = false;

    if (!product) {
      const created = await requestJson(`${baseUrl}/api/dev/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: "Tiramisú",
          category: "postres-frios",
          priceCOP: 10000,
          weightGrams: 120,
          description: "Postre cremoso en capas, con café y un toque de cacao.",
          ingredients: "bizcocho, café, queso mascarpone, crema y cacao.",
          imageUrl: "/assets/img/productos/tiramisu.jpg"
        })
      });
      product = created.item;
      insertedNow = true;
    }

    const verifiedCatalog = await requestJson(`${baseUrl}/api/products`);
    const verifiedProduct = verifiedCatalog.items.find((item) => item.slug === "tiramisu");
    if (!verifiedProduct) throw new Error("El producto no apareció en la consulta posterior al guardado.");

    console.log(JSON.stringify({
      connection: "connected",
      database: health.database.name,
      collection: "products",
      product: verifiedProduct.name,
      productId: String(verifiedProduct._id),
      priceCOP: verifiedProduct.priceCOP,
      totalProducts: verifiedCatalog.items.length,
      insertedNow
    }));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

createFirstProduct()
  .catch((error) => {
    console.error("No se completó la prueba del producto.");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
