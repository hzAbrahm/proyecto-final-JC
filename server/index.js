"use strict";

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile !== "function") {
    console.error("Este servidor requiere Node.js 20.12 o posterior para leer .env.");
    process.exit(1);
  }
  process.loadEnvFile(envPath);
}

const expressApp = require("./app");
const port = Number(process.env.PORT) || 3000;
const databaseName = process.env.MONGODB_DATABASE || "calles_dulces_dev";

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes("<usuario>") || mongoUri.includes("<cluster-host>")) {
    throw new Error("Configura MONGODB_URI en .env con la cadena generada por Atlas.");
  }

  await mongoose.connect(mongoUri, {
    appName: "CallesDulcesAPI",
    dbName: databaseName,
    serverSelectionTimeoutMS: 10000
  });
  await mongoose.connection.db.command({ ping: 1 });

  return expressApp.listen(port, () => {
    console.log(`API de Calles Dulces lista en http://localhost:${port}`);
    console.log(`MongoDB conectado a la base ${databaseName}.`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar la API o conectar con MongoDB.");
  console.error("Revisa la URI, el usuario de base de datos y la lista IP de Atlas.");
  console.error(`Tipo de error: ${error.name || "Error"}`);
  process.exitCode = 1;
});
