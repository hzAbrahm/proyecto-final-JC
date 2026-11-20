"use strict";

const crypto = require("node:crypto");

/**
 * Genera un hash seguro para la contraseña usando scrypt y un salt aleatorio.
 * Nunca almacena ni devuelve la contraseña en texto plano.
 *
 * @param {string} password - Contraseña en texto plano
 * @returns {{ salt: string, hash: string }}
 */
function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

/**
 * Comprueba si la contraseña ingresada coincide con el hash y salt almacenados.
 * Usa timingSafeEqual para evitar ataques de temporización.
 *
 * @param {string} password - Contraseña en texto plano a verificar
 * @param {string} salt - Salt almacenado en la base de datos
 * @param {string} storedHash - Hash almacenado en la base de datos
 * @returns {boolean}
 */
function verifyPassword(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    const hashBuffer = Buffer.from(hash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");
    if (hashBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Genera un token aleatorio criptográficamente seguro para la sesión de administración.
 *
 * @returns {string}
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSessionToken
};
