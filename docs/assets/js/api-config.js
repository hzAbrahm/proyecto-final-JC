/**
 * Configuración central de la API de Calles Dulces.
 * En local usa el backend del puerto 3003. En producción reemplaza
 * la URL indicada por la URL real del servicio creado en Render.
 */
(() => {
  const esLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const apiBase = esLocal
    ? "http://127.0.0.1:3003"
    : "https://calles-dulces.onrender.com"; // Reemplazar al crear el servicio en Render.

  window.apiUrl = (ruta) => {
    if (!esLocal && apiBase.includes("calles-dulces.onrender.com")) {
      throw new Error("Configura la URL real del backend de Render en assets/js/api-config.js.");
    }
    return `${apiBase}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
  };
})();
