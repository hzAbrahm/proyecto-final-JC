"use strict";

const path = require("node:path");
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Order = require("./models/order");
const HelpRequest = require("./models/HelpRequest");
const Suggestion = require("./models/Suggestion");
const AdminUser = require("./models/AdminUser");
const NormalUser = require("./models/normalusers");
const { hashPassword, verifyPassword, generateSessionToken } = require("./auth");
const { randomUUID } = require("node:crypto");

const app = express();
const databaseName = process.env.MONGODB_DATABASE || "Calles-Dulces";
const productCategories = new Set(["postres-frios", "brownies", "tortas", "galletas", "dulces"]);
const productRestrictions = new Set(["", "sin-leche", "sin-gluten", "vegano"]);

app.disable("x-powered-by");

// CORS: permite el frontend local y los dominios declarados para producción.
const frontendOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://hzabrahm.github.io",
  ...(process.env.FRONTEND_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)
]);

app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin && frontendOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization");

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

async function handleCreateProduct(request, response) {
  const body = request.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const priceCOP = Number(body.priceCOP);
  const weightGrams = body.weightGrams === "" || body.weightGrams == null
    ? undefined
    : Number(body.weightGrams);
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const restriction = typeof body.restriction === "string" && productRestrictions.has(body.restriction.trim().toLowerCase())
    ? body.restriction.trim().toLowerCase()
    : "";

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
      restriction,
      imageUrl
    });
    response.status(201).json({ item });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ error: "Ya existe un producto con ese nombre." });
    }
    if (error.name === "ValidationError") {
      return response.status(400).json({ error: "Revisa los datos del producto e intenta de nuevo." });
    }
    response.status(500).json({ error: "No se pudo guardar el producto en MongoDB." });
  }
}

app.post("/api/dev/products", allowLocalDevelopmentWrites, handleCreateProduct);

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

async function handleContactRequest(request, response) {
  try {
    const body = request.body || {};

    const name = typeof body.name === "string" ? body.name.trim() : (typeof body.nombre === "string" ? body.nombre.trim() : "");
    const phone = typeof body.phone === "string" ? body.phone.trim() : (typeof body.numero === "string" ? body.numero.trim() : "");
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : (typeof body.correo === "string" ? body.correo.trim().toLowerCase() : "");
    const message = typeof body.message === "string" ? body.message.trim() : (typeof body.mensaje === "string" ? body.mensaje.trim() : "");

    if (!name || !phone || !email || !message) {
      return response.status(400).json({
        error: "Completa todos los campos obligatorios del formulario."
      });
    }

    if (name.length > 100) {
      return response.status(400).json({
        error: "El nombre no puede superar los 100 caracteres."
      });
    }

    if (phone.length > 30) {
      return response.status(400).json({
        error: "El número de teléfono no puede superar los 30 caracteres."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
      return response.status(400).json({
        error: "El correo electrónico no es válido."
      });
    }

    if (message.length > 2000) {
      return response.status(400).json({
        error: "El mensaje no puede superar los 2000 caracteres."
      });
    }

    const helpRequest = await HelpRequest.create({
      name,
      phone,
      email,
      message
    });

    response.status(201).json({
      ok: true,
      message: "¡Gracias por contactarnos! Tu mensaje ha sido recibido.",
      id: helpRequest._id
    });
  } catch (error) {
    console.error("Error al registrar solicitud de contacto:", error);

    if (error.name === "ValidationError") {
      return response.status(400).json({
        error: "Los datos enviados no cumplen con los requisitos de validación."
      });
    }

    response.status(500).json({
      error: "No se pudo registrar la solicitud de contacto. Inténtalo de nuevo más tarde."
    });
  }
}

app.post("/api/contact", handleContactRequest);
app.post("/api/helprequest", handleContactRequest);

// Registrar recomendaciones de productos en la colección suggestions.
app.post("/api/suggestions", async (request, response) => {
  const product = typeof request.body?.product === "string"
    ? request.body.product.trim()
    : "";

  if (!product) {
    return response.status(400).json({ error: "Escribe el producto que te gustaría encontrar." });
  }
  if (product.length > 180) {
    return response.status(400).json({ error: "La recomendación no puede superar los 180 caracteres." });
  }

  try {
    const suggestion = await Suggestion.create({ product });
    return response.status(201).json({
      ok: true,
      message: "¡Gracias! Tu recomendación fue recibida.",
      id: suggestion._id
    });
  } catch (error) {
    console.error("Error al guardar recomendación:", error);
    return response.status(500).json({ error: "No se pudo guardar la recomendación. Inténtalo de nuevo." });
  }
});

// ── CUENTAS DE USUARIO NORMAL (colección existente users) ──
const userSessions = new Map();

function requireUserAuth(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const session = userSessions.get(token);
  if (!token || !session || Date.now() > session.expiresAt) {
    if (token) userSessions.delete(token);
    return response.status(401).json({ error: "Sesión inválida o expirada. Inicia sesión nuevamente." });
  }
  request.normalUser = session;
  next();
}

function publicUser(user) {
  return { id: String(user._id), nombre: user.name, correo: user.email };
}

app.post("/api/users/register", async (request, response) => {
  const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: "Revisa el nombre, correo y contraseña (mínimo 8 caracteres)." });
  }
  try {
    const existing = await NormalUser.findOne({ email }).lean();
    if (existing) return response.status(409).json({ error: "Ya existe una cuenta con ese correo." });
    const credentials = hashPassword(password);
    const user = await NormalUser.create({ name, email, passwordHash: credentials.hash, salt: credentials.salt, active: true });
    const token = generateSessionToken();
    userSessions.set(token, { id: String(user._id), email, name, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    return response.status(201).json({ ok: true, token, user: publicUser(user) });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return response.status(500).json({ error: "No se pudo crear la cuenta." });
  }
});

app.post("/api/users/login", async (request, response) => {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!email || !password) return response.status(400).json({ error: "Ingresa correo y contraseña." });
  try {
    const user = await NormalUser.findOne({ email, active: { $ne: false } });
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    }
    const token = generateSessionToken();
    userSessions.set(token, { id: String(user._id), email: user.email, name: user.name, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    return response.json({ ok: true, token, user: publicUser(user) });
  } catch (error) {
    console.error("Error en login de usuario:", error);
    return response.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

app.get("/api/users/me", requireUserAuth, async (request, response) => {
  try {
    const user = await NormalUser.findById(request.normalUser.id).lean();
    if (!user || user.active === false) return response.status(401).json({ error: "La cuenta no está disponible." });
    return response.json({ ok: true, user: publicUser(user) });
  } catch { return response.status(500).json({ error: "No se pudo consultar la cuenta." }); }
});

app.post("/api/users/logout", requireUserAuth, (request, response) => {
  const token = (request.headers.authorization || "").slice(7).trim();
  userSessions.delete(token);
  return response.json({ ok: true });
});

// ── AUTENTICACIÓN Y GESTIÓN ADMINISTRATIVA ──

/**
 * GESTIÓN DE SESIONES EN MEMORIA:
 *
 * Las sesiones de los administradores se almacenan temporalmente en memoria mediante un `Map`
 * en el proceso activo de Node.js.
 *
 * Características clave:
 * 1. Cada token generado es una cadena criptográficamente aleatoria de 64 caracteres hexadecimales.
 * 2. Las sesiones expiran automáticamente tras 12 horas.
 * 3. Al reiniciar el servidor o detener el proceso de Node.js, todas las sesiones en memoria
 *    se invalidan de forma inmediata y automática, requiriendo que los administradores vuelvan
 *    a autenticarse con sus credenciales.
 * 4. Esta decisión de diseño mantiene el proyecto simple, comprensible y seguro sin necesidad
 *    de agregar dependencias de terceros ni bases de datos de caché adicionales (como Redis).
 */
const adminSessions = new Map();

function requireAdminAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const tokenHeader = request.headers["x-admin-token"] || "";
  let token = "";

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (tokenHeader) {
    token = String(tokenHeader).trim();
  }

  if (!token) {
    return response.status(401).json({
      error: "Acceso no autorizado. Inicia sesión como administrador."
    });
  }

  const session = adminSessions.get(token);
  if (!session) {
    return response.status(401).json({
      error: "Sesión inválida o expirada. Inicia sesión nuevamente."
    });
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return response.status(401).json({
      error: "Tu sesión ha expirado. Inicia sesión de nuevo."
    });
  }

  request.adminUser = session;
  next();
}

// Iniciar sesión administrativa
app.post("/api/admin/login", async (request, response) => {
  try {
    const body = request.body || {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : (typeof body.correo === "string" ? body.correo.trim().toLowerCase() : "");
    const password = typeof body.password === "string" ? body.password : (typeof body.contrasena === "string" ? body.contrasena : "");

    if (!email || !password) {
      return response.status(400).json({ error: "Ingresa correo y contraseña." });
    }

    const admin = await AdminUser.findOne({ email, active: true });
    if (!admin) {
      return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const isValid = verifyPassword(password, admin.salt, admin.passwordHash);
    if (!isValid) {
      return response.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const token = generateSessionToken();
    adminSessions.set(token, {
      id: String(admin._id),
      email: admin.email,
      role: admin.role,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000 // 12 horas
    });

    response.json({
      ok: true,
      token,
      user: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Error en login de administrador:", error);
    response.status(500).json({ error: "No se pudo procesar el inicio de sesión." });
  }
});

// Cerrar sesión
app.post("/api/admin/logout", requireAdminAuth, (request, response) => {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : (request.headers["x-admin-token"] || "");
  if (token) {
    adminSessions.delete(token);
  }
  response.json({ ok: true, message: "Sesión cerrada correctamente." });
});

// Verificar sesión activa
app.get("/api/admin/me", requireAdminAuth, (request, response) => {
  response.json({ ok: true, user: request.adminUser });
});

// Consultar pedidos de MongoDB (protegido)
app.get("/api/admin/orders", requireAdminAuth, async (_request, response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    response.json({ ok: true, orders });
  } catch (error) {
    console.error("Error al consultar pedidos:", error);
    response.status(500).json({ error: "No se pudieron obtener los pedidos." });
  }
});

// Actualizar estado de preparación/entrega de un pedido (protegido)
app.patch("/api/admin/orders/:id", requireAdminAuth, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: "ID de pedido inválido." });
  }

  const body = request.body || {};
  const deliveryStatus = typeof body.deliveryStatus === "string" ? body.deliveryStatus.trim() : (typeof body.estadoEntrega === "string" ? body.estadoEntrega.trim() : "");
  const validStatuses = new Set(["confirmado", "preparando", "listo para entregar", "en camino", "entregado"]);

  if (!validStatuses.has(deliveryStatus)) {
    return response.status(400).json({ error: "Estado de entrega inválido." });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    ).lean();

    if (!order) {
      return response.status(404).json({ error: "Pedido no encontrado." });
    }

    response.json({ ok: true, order });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    response.status(500).json({ error: "No se pudo actualizar el estado del pedido." });
  }
});

// Consultar solicitudes de contacto guardadas en helprequest (protegido)
app.get("/api/admin/helprequests", requireAdminAuth, async (_request, response) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 }).lean();
    response.json({ ok: true, items: requests });
  } catch (error) {
    console.error("Error al consultar solicitudes de contacto:", error);
    response.status(500).json({ error: "No se pudieron obtener las solicitudes de contacto." });
  }
});

// Consultar recomendaciones de productos (protegido).
app.get("/api/admin/suggestions", requireAdminAuth, async (_request, response) => {
  try {
    const items = await Suggestion.find().sort({ createdAt: -1 }).limit(100).lean();
    response.json({ ok: true, items });
  } catch (error) {
    console.error("Error al consultar recomendaciones:", error);
    response.status(500).json({ error: "No se pudieron obtener las recomendaciones." });
  }
});

// Crear producto desde el panel administrativo (protegido)
app.post("/api/admin/products", requireAdminAuth, handleCreateProduct);

// Activar o desactivar producto (protegido)
app.patch("/api/admin/products/:id", requireAdminAuth, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: "ID de producto inválido." });
  }

  const { active } = request.body || {};
  if (typeof active !== "boolean") {
    return response.status(400).json({ error: "El campo 'active' debe ser un valor booleano." });
  }

  try {
    const item = await Product.findByIdAndUpdate(
      id,
      { active },
      { new: true }
    ).lean();

    if (!item) {
      return response.status(404).json({ error: "Producto no encontrado." });
    }

    response.json({ ok: true, item });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    response.status(500).json({ error: "No se pudo actualizar el producto." });
  }
});

app.use(express.static(path.resolve(__dirname, "../docs")));

module.exports = app;
