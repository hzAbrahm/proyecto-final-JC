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
  if (formularioCuentaAcceso) formularioCuentaAcceso.hidden = Boolean(perfilSesionDemo);
  if (seccionSesionCuenta) seccionSesionCuenta.hidden = !perfilSesionDemo;
  if (textoSaludoCuenta && perfilSesionDemo) {
    textoSaludoCuenta.textContent = `Hola, ${perfilSesionDemo.nombre || perfilSesionDemo.correo}. Tu sesión de demostración está activa.`;
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

    confirmacion.setCustomValidity(modoCuentaDemo === "registro" && contrasena !== confirmacion.value
      ? "Las contraseñas no coinciden."
      : "");
    if (!formularioCuentaAcceso.reportValidity()) return;

    let perfilGuardado = null;
    try {
      perfilGuardado = JSON.parse(localStorage.getItem(clavePerfilUsuarioDemo) || "null");
    } catch {
      perfilGuardado = null;
    }

    try {
      const fotoArchivo = modoCuentaDemo === "registro" ? formularioCuentaAcceso.elements.foto.files?.[0] : null;
      const fotoNueva = fotoArchivo ? await convertirFotoPerfil(fotoArchivo) : "";
      const perfil = modoCuentaDemo === "registro"
        ? { nombre, correo, foto: fotoNueva }
        : perfilGuardado?.correo === correo
          ? perfilGuardado
          : { nombre: correo.split("@")[0], correo, foto: "" };

      if (modoCuentaDemo === "registro") guardarObjetoDemo(clavePerfilUsuarioDemo, perfil);
      perfilSesionDemo = perfil;
      const guardada = guardarObjetoDemo(claveSesionUsuarioDemo, perfilSesionDemo);
      formularioCuentaAcceso.reset();
      actualizarVistaSesionCuenta();
      if (estadoCuentaAcceso) {
        estadoCuentaAcceso.textContent = guardada
          ? "Sesión de demostración iniciada en este navegador."
          : "Sesión iniciada en esta página; el navegador no permitió guardarla.";
      }
    } catch (error) {
      if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = error.message;
    }
  });
}

document.querySelector("#cerrar-sesion")?.addEventListener("click", () => {
  perfilSesionDemo = null;
  try {
    localStorage.removeItem(claveSesionUsuarioDemo);
  } catch {
    // El control de cierre también actualiza la vista durante esta visita.
  }
  actualizarVistaSesionCuenta();
  cambiarModoAccesoCuenta("ingreso");
  if (estadoCuentaAcceso) estadoCuentaAcceso.textContent = "Sesión cerrada en este navegador.";
});

// ── Mi cuenta: render inicial de la sesión (options.js L1414) ──
actualizarVistaSesionCuenta();
