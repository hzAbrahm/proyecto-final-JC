/**
 * cuenta.js — Mi cuenta: acceso, registro, sesión de demostración, foto de perfil y menú.
 *
 * Se carga en: cuenta.html.
 * Requiere cargar antes: shared.js y tienda.js (actualizarFavoritosCuenta se pasa como
 * manejador del filtro de favoritos al cargar este archivo).
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Mi cuenta: filtro de favoritos y menú de secciones (options.js L463–L495) ──
const filtrosFavoritosCuenta = document.querySelector("#filtros-favoritos-cuenta");
if (filtrosFavoritosCuenta) {
  filtrosFavoritosCuenta.addEventListener("input", actualizarFavoritosCuenta);
  filtrosFavoritosCuenta.addEventListener("reset", () => window.setTimeout(actualizarFavoritosCuenta, 0));
}

const botonMenuCuenta = document.querySelector("#cuenta-menu-toggle");
const menuSeccionesCuenta = document.querySelector("#cuenta-menu-secciones");
const botonesSeccionCuenta = document.querySelectorAll("[data-seccion-cuenta]");
const vistasCuenta = document.querySelectorAll(".cuenta-vista");

if (botonMenuCuenta && menuSeccionesCuenta) {
  botonMenuCuenta.addEventListener("click", () => {
    menuSeccionesCuenta.hidden = !menuSeccionesCuenta.hidden;
    botonMenuCuenta.setAttribute("aria-expanded", String(!menuSeccionesCuenta.hidden));
  });
}

botonesSeccionCuenta.forEach((boton) => {
  boton.addEventListener("click", () => {
    const seccionActiva = boton.dataset.seccionCuenta;
    vistasCuenta.forEach((vista) => {
      vista.hidden = vista.id !== seccionActiva;
    });
    botonesSeccionCuenta.forEach((opcion) => {
      if (opcion === boton) opcion.setAttribute("aria-current", "page");
      else opcion.removeAttribute("aria-current");
    });
    menuSeccionesCuenta.hidden = true;
    botonMenuCuenta.setAttribute("aria-expanded", "false");
    document.getElementById(seccionActiva)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── Mi cuenta: acceso, registro, sesión de demostración y foto de perfil (options.js L1218–L1369) ──
const formularioCuentaAcceso = document.querySelector("#form-cuenta-acceso");
const botonesModoCuenta = document.querySelectorAll("[data-modo-cuenta]");
const seccionSesionCuenta = document.querySelector("#cuenta-sesion-activa");
const textoSaludoCuenta = document.querySelector("#saludo-cuenta");
const estadoCuentaAcceso = document.querySelector("#estado-cuenta-acceso");
const etiquetaNombreCuenta = document.querySelector("#campo-nombre-cuenta");
const etiquetaConfirmarCuenta = document.querySelector("#campo-confirmar-cuenta");
const etiquetaFotoCuenta = document.querySelector("#campo-foto-cuenta");
const imagenAvatarCuenta = document.querySelector("#cuenta-avatar-imagen");
const siluetaAvatarCuenta = document.querySelector("#cuenta-avatar-silueta");
const tituloAccesoCuenta = document.querySelector("#titulo-acceso-cuenta");
let modoCuentaDemo = "registro";

// El perfil guardado localmente no demuestra que el token siga vigente.
// Ocultar el contenido privado hasta validar la sesión contra el backend.
const contenidoPrivadoCuenta = document.querySelector("#cuenta-contenido-privado");
const perfilLocalPrevioCuenta = perfilSesionDemo;
perfilSesionDemo = null;
if (contenidoPrivadoCuenta) contenidoPrivadoCuenta.hidden = true;


function cambiarModoAccesoCuenta(modo) {
  modoCuentaDemo = modo;
  const esRegistro = modo === "registro";
  if (!formularioCuentaAcceso) return;

  const campoNombre = formularioCuentaAcceso.elements.nombre;
  const campoContrasena = formularioCuentaAcceso.elements.contrasena;
  const campoConfirmar = formularioCuentaAcceso.elements.confirmar;
  const campoFoto = formularioCuentaAcceso.elements.foto;
  etiquetaNombreCuenta.hidden = !esRegistro;
  etiquetaConfirmarCuenta.hidden = !esRegistro;
  etiquetaFotoCuenta.hidden = !esRegistro;
  campoNombre.disabled = !esRegistro;
  campoNombre.required = esRegistro;
  campoConfirmar.disabled = !esRegistro;
  campoConfirmar.required = esRegistro;
  campoFoto.disabled = !esRegistro;
  campoContrasena.autocomplete = esRegistro ? "new-password" : "current-password";
  formularioCuentaAcceso.querySelector("#enviar-cuenta-acceso").textContent = esRegistro ? "crear cuenta" : "iniciar sesión";
  botonesModoCuenta.forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.dataset.modoCuenta === modo));
  });
  if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = "";
}

async function convertirFotoPerfil(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("El archivo seleccionado no es una imagen.");
  if (file.size > 5 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 5 MB.");

  const dataUrl = await new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => {
      try {
        const maximo = 240;
        const escala = Math.min(maximo / imagen.width, maximo / imagen.height, 1);
        const lienzo = document.createElement("canvas");
        lienzo.width = Math.max(1, Math.round(imagen.width * escala));
        lienzo.height = Math.max(1, Math.round(imagen.height * escala));
        lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
        resolve(lienzo.toDataURL("image/jpeg", 0.82));
      } catch {
        reject(new Error("No se pudo preparar la foto de perfil."));
      }
    };
    imagen.onerror = () => reject(new Error("El archivo no se pudo abrir como imagen."));
    imagen.src = dataUrl;
  });
}

function actualizarVistaSesionCuenta() {
  if (contenidoPrivadoCuenta) contenidoPrivadoCuenta.hidden = !perfilSesionDemo;

  if (formularioCuentaAcceso) formularioCuentaAcceso.hidden = Boolean(perfilSesionDemo);
  if (seccionSesionCuenta) seccionSesionCuenta.hidden = !perfilSesionDemo;
  if (textoSaludoCuenta && perfilSesionDemo) {
    textoSaludoCuenta.textContent = `Hola, ${perfilSesionDemo.nombre || perfilSesionDemo.correo}. Tu sesión está activa.`;
  }
  const foto = perfilSesionDemo?.foto || "";
  if (imagenAvatarCuenta) {
    imagenAvatarCuenta.hidden = !foto;
    if (foto) imagenAvatarCuenta.src = foto;
  }
  if (siluetaAvatarCuenta) siluetaAvatarCuenta.hidden = Boolean(foto);
  if (tituloAccesoCuenta) {
    tituloAccesoCuenta.textContent = perfilSesionDemo
      ? `Hola, ${perfilSesionDemo.nombre || "bienvenido"}`
      : "Accede a tu cuenta";
  }
  actualizarAvataresSesion();
  actualizarRegistrosCuentaDemo();
}

botonesModoCuenta.forEach((boton) => {
  boton.addEventListener("click", () => cambiarModoAccesoCuenta(boton.dataset.modoCuenta));
});

if (formularioCuentaAcceso) {
  cambiarModoAccesoCuenta("registro");
  formularioCuentaAcceso.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const nombre = formularioCuentaAcceso.elements.nombre.value.trim();
    const correo = formularioCuentaAcceso.elements.correo.value.trim().toLowerCase();
    const contrasena = formularioCuentaAcceso.elements.contrasena.value;
    const confirmacion = formularioCuentaAcceso.elements.confirmar;
    const esRegistro = modoCuentaDemo === "registro";

    confirmacion.setCustomValidity(esRegistro && contrasena !== confirmacion.value ? "Las contraseñas no coinciden." : "");
    if (!formularioCuentaAcceso.reportValidity()) return;
    if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = "Conectando con el servidor...";

    try {
      const fotoArchivo = esRegistro ? formularioCuentaAcceso.elements.foto.files?.[0] : null;
      const fotoNueva = fotoArchivo ? await convertirFotoPerfil(fotoArchivo) : "";
      const respuesta = await fetch(window.apiUrl(esRegistro ? "/api/users/register" : "/api/users/login"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(esRegistro ? { name: nombre, email: correo, password: contrasena } : { email: correo, password: contrasena })
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || "No se pudo completar el acceso.");
      const perfil = { nombre: datos.user.nombre, correo: datos.user.correo, foto: fotoNueva };
      localStorage.setItem("calles-dulces-user-token", datos.token);
      guardarObjetoDemo(clavePerfilUsuarioDemo, perfil);
      guardarObjetoDemo(claveSesionUsuarioDemo, perfil);
      perfilSesionDemo = perfil;
      formularioCuentaAcceso.reset();
      actualizarVistaSesionCuenta();
      if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = esRegistro ? "Cuenta creada correctamente." : "Sesión iniciada correctamente.";
    } catch (error) {
      if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = error.message || "No se pudo conectar con el servidor.";
    }
  });
}

document.querySelector("#cerrar-sesion")?.addEventListener("click", async () => {
  const token = localStorage.getItem("calles-dulces-user-token");
  try {
    if (token) await fetch(window.apiUrl("/api/users/logout"), { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  } catch { /* El cierre local se mantiene aunque no haya conexión. */ }
  localStorage.removeItem("calles-dulces-user-token");
  localStorage.removeItem(claveSesionUsuarioDemo);
  perfilSesionDemo = null;
  actualizarVistaSesionCuenta();
  cambiarModoAccesoCuenta("ingreso");
  if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = "Sesión cerrada correctamente.";
});

// Recuperar y validar la sesión guardada en este navegador.
(async () => {
  const token = localStorage.getItem("calles-dulces-user-token");
  if (!token) return;
  try {
    const respuesta = await fetch(window.apiUrl("/api/users/me"), { headers: { Authorization: `Bearer ${token}` } });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error("Sesión expirada");
    perfilSesionDemo = { nombre: datos.user.nombre, correo: datos.user.correo, foto: perfilSesionDemo?.foto || "" };
    guardarObjetoDemo(claveSesionUsuarioDemo, perfilSesionDemo);
    actualizarVistaSesionCuenta();
  } catch {
    localStorage.removeItem("calles-dulces-user-token");
    localStorage.removeItem(claveSesionUsuarioDemo);
    perfilSesionDemo = null;
    actualizarVistaSesionCuenta();
  }
})();

// ── Mi cuenta: render inicial de la sesión (options.js L1414) ──
actualizarVistaSesionCuenta();
