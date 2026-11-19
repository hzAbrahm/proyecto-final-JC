/**
 * donaciones.js — Formulario de donación.
 *
 * Se carga en: donaciones.html.
 * Requiere cargar antes: shared.js (registrarSolicitudDemo).
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Formulario de donación (options.js L1203–L1216) ──
const formularioDonacion = document.querySelector("#form-donacion");
if (formularioDonacion) {
  formularioDonacion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nombre = formularioDonacion.elements.nombre.value.trim();
    const respuesta = document.querySelector("#respuesta-donacion");
    const datos = Object.fromEntries(new FormData(formularioDonacion).entries());
    const registrada = registrarSolicitudDemo("donacion", datos);
    respuesta.textContent = registrada
      ? `Gracias, ${nombre}, por querer apoyar esta causa. Tu intención quedó guardada localmente; no se realizó ningún cobro.`
      : `Gracias, ${nombre}. No se pudo guardar la intención y no se realizó ningún cobro.`;
    formularioDonacion.reset();
  });
}
