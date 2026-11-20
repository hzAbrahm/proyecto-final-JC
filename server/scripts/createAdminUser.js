"use strict";

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const mongoose = require("mongoose");
const AdminUser = require("../models/AdminUser");
const { hashPassword } = require("../auth");

const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const databaseName = process.env.MONGODB_DATABASE || "Calles-Dulces";

async function pedirContrasenaInteractiva(rl, pregunta) {
  output.write(pregunta);

  // Si no es un terminal TTY (ej. ejecución automatizada o tubería)
  if (!input.isTTY) {
    const respuesta = await rl.question("");
    return respuesta.trim();
  }

  // En terminal interactivo enmascaramos con asteriscos para no dejar la contraseña visible
  input.setRawMode(true);
  input.resume();

  return new Promise((resolve) => {
    let password = "";
    function onData(chunk) {
      const char = chunk.toString();
      if (char === "\r" || char === "\n" || char === "\u0004") {
        input.setRawMode(false);
        input.removeListener("data", onData);
        output.write("\n");
        resolve(password.trim());
        return;
      }
      if (char === "\u0003") {
        input.setRawMode(false);
        output.write("\nOperación cancelada.\n");
        process.exit(1);
      }
      if (char === "\u0008" || char === "\x7f") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          output.write("\b \b");
        }
        return;
      }
      password += char;
      output.write("*");
    }
    input.on("data", onData);
  });
}

async function createAdminUser() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("=== Registro / Actualización de Administrador (Calles Dulces) ===");

    let email = (process.argv[2] || "").trim().toLowerCase();
    if (!email) {
      email = (await rl.question("Introduce el correo del administrador: ")).trim().toLowerCase();
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Debes proporcionar un correo electrónico válido.");
    }

    // La contraseña SIEMPRE se solicita de forma interactiva (nunca mediante process.argv)
    const password = await pedirContrasenaInteractiva(rl, "Introduce la contraseña (mínimo 8 caracteres): ");
    if (!password || password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    const confirmacion = await pedirContrasenaInteractiva(rl, "Confirma la contraseña: ");
    if (password !== confirmacion) {
      throw new Error("Las contraseñas no coinciden.");
    }

    rl.close();

    if (!process.env.MONGODB_URI) {
      throw new Error("Falta MONGODB_URI en el archivo .env.");
    }

    console.log("Conectando con MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      appName: "CallesDulcesAdminCreate",
      dbName: databaseName,
      serverSelectionTimeoutMS: 10000
    });

    const { salt, hash } = hashPassword(password);

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      existing.passwordHash = hash;
      existing.salt = salt;
      existing.active = true;
      await existing.save();
      console.log(`✓ Usuario administrador actualizado con éxito: ${email}`);
    } else {
      await AdminUser.create({
        email,
        passwordHash: hash,
        salt,
        role: "admin",
        active: true
      });
      console.log(`✓ Usuario administrador creado con éxito: ${email}`);
    }
  } catch (error) {
    rl.close();
    console.error("✗ Error:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

createAdminUser();
