/**
 * shared.js — Código compartido por TODAS las páginas de Calles Dulces.
 *
 * Se carga PRIMERO en cada HTML, antes del script propio de la página.
 * No depende de ningún otro script del proyecto.
 *
 * Contiene lo que usan dos o más páginas o el header/footer común:
 *   - Menú hamburguesa, claves de localStorage, sesión de demostración y avatar del header.
 *   - Carrito (núcleo): estado, persistencia, contador del header, renderizado y estado del
 *     pago. Está aquí porque el header de TODAS las páginas muestra el contador del carrito
 *     y porque tienda.js y carrito.js modifican ese mismo estado.
 *   - Solicitudes de demostración (contacto, sugerencias y donaciones), contacto flotante y chatbot.
 *   - actualizarRegistrosCuentaDemo (la usan carrito.js y cuenta.js).
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Menú de navegación del header (todas las páginas) (options.js L1–L13) ──
const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

if (nav && abrir && cerrar) {
  abrir.addEventListener("click", () => {
    nav.classList.add("visible");
  });

  cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
  });
}

// ── Claves de localStorage, sesión de demostración, avatar del header y utilidades de lectura/escritura (options.js L15–L74) ──
const clavePerfilUsuarioDemo = "calles-dulces-perfil-demo-v1";
const claveSesionUsuarioDemo = "calles-dulces-sesion-demo-v1";
const clavePedidosDemo = "calles-dulces-pedidos-demo-v1";
const clavePagosDemo = "calles-dulces-pagos-demo-v1";
const claveSolicitudesDemo = "calles-dulces-solicitudes-demo-v1";
let perfilSesionDemo = null;

try {
  const datosSesion = JSON.parse(localStorage.getItem(claveSesionUsuarioDemo) || "null");
  if (datosSesion && datosSesion.correo) perfilSesionDemo = datosSesion;
} catch {
  perfilSesionDemo = null;
}

function actualizarAvataresSesion() {
  document.querySelectorAll("[data-avatar-sesion]").forEach((enlace) => {
    enlace.hidden = !perfilSesionDemo;
    if (!perfilSesionDemo) return;

    const imagen = enlace.querySelector("[data-avatar-imagen]");
    const silueta = enlace.querySelector("[data-avatar-silueta]");
    const tieneFoto = Boolean(perfilSesionDemo.foto);
    if (imagen) {
      imagen.hidden = !tieneFoto;
      if (tieneFoto) imagen.src = perfilSesionDemo.foto;
    }
    if (silueta) silueta.hidden = tieneFoto;
    enlace.setAttribute("aria-label", `Perfil de ${perfilSesionDemo.nombre || perfilSesionDemo.correo}`);
    enlace.title = `Perfil de ${perfilSesionDemo.nombre || perfilSesionDemo.correo}`;
  });
}

function leerListaDemo(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarListaDemo(clave, lista) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}

function guardarObjetoDemo(clave, objeto) {
  try {
    localStorage.setItem(clave, JSON.stringify(objeto));
    return true;
  } catch {
    return false;
  }
}

actualizarAvataresSesion();

// ── Carrito (núcleo): estado, persistencia, contador del header, renderizado y estado del pago (options.js L516–L522, L524–L525, L527–L531, L533–L714) ──
const claveCarrito = "calles-dulces-carrito-v1";
const estadoCarrito = document.querySelector("#estado-carrito");
const carritoVacio = document.querySelector(".carrito-vacio");
const resumenCarrito = document.querySelector(".estado-carrito-resumen");
const contenidoCarrito = document.querySelector("#contenido-carrito");
const listaCarrito = document.querySelector("#productos-carrito");
const subtotalCarrito = document.querySelector("#subtotal-carrito");
const checkoutPago = document.querySelector("#checkout-pago");
const totalCheckout = document.querySelector("#total-checkout");
const panelEstadoTransaccion = document.querySelector("#estado-transaccion");
const tituloTransaccion = document.querySelector("#titulo-transaccion");
const detalleTransaccion = document.querySelector("#detalle-transaccion");
const iconoTransaccion = document.querySelector("#icono-transaccion i");
const accionesTransaccion = document.querySelector("#acciones-transaccion");
const formatoCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
let carrito = [];
let pagoActualDemo = null;

try {
  const productosGuardados = JSON.parse(localStorage.getItem(claveCarrito) || "[]");
  if (Array.isArray(productosGuardados)) {
    carrito = productosGuardados
      .filter((producto) => producto && producto.id && producto.titulo)
      .map((producto) => ({
        id: String(producto.id),
        titulo: String(producto.titulo),
        imagen: String(producto.imagen || ""),
        textoAlternativo: String(producto.textoAlternativo || producto.titulo),
        precio: String(producto.precio || ""),
        valor: Math.max(0, Number(producto.valor) || 0),
        cantidad: Math.max(1, Number.parseInt(producto.cantidad, 10) || 1)
      }));
  }
} catch {
  carrito = [];
}

try {
  pagoActualDemo = JSON.parse(localStorage.getItem("calles-dulces-pago-actual-demo-v1") || "null");
} catch {
  pagoActualDemo = null;
}

function guardarCarrito() {
  try {
    localStorage.setItem(claveCarrito, JSON.stringify(carrito));
  } catch {
    // El carrito sigue disponible en esta página aunque el navegador bloquee el almacenamiento local.
  }
}

function totalUnidadesCarrito() {
  return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function actualizarContadorCarrito() {
  const total = totalUnidadesCarrito();
  document.querySelectorAll(".contador-carrito").forEach((contador) => {
    contador.hidden = total === 0;
    contador.textContent = String(total);
    const enlace = contador.closest("a");
    if (enlace) {
      enlace.setAttribute("aria-label", total
        ? `Mi carrito, ${total} producto${total === 1 ? "" : "s"}`
        : "Mi carrito");
    }
  });
}

function crearElementoCarrito(producto) {
  const tarjeta = document.createElement("li");
  tarjeta.className = "producto-carrito";
  tarjeta.dataset.id = producto.id;

  const imagen = document.createElement("img");
  imagen.src = producto.imagen;
  imagen.alt = producto.textoAlternativo;
  imagen.loading = "lazy";

  const detalles = document.createElement("div");
  const titulo = document.createElement("h2");
  titulo.textContent = producto.titulo;
  const precio = document.createElement("p");
  precio.textContent = `${formatoCOP.format(producto.valor)} cada uno`;
  const controles = document.createElement("div");
  controles.className = "controles-cantidad";

  const botonRestar = document.createElement("button");
  botonRestar.type = "button";
  botonRestar.dataset.accion = "restar";
  botonRestar.setAttribute("aria-label", `Quitar una unidad de ${producto.titulo}`);
  botonRestar.textContent = "−";
  const cantidad = document.createElement("output");
  cantidad.setAttribute("aria-label", "Cantidad");
  cantidad.textContent = String(producto.cantidad);
  const botonSumar = document.createElement("button");
  botonSumar.type = "button";
  botonSumar.dataset.accion = "sumar";
  botonSumar.setAttribute("aria-label", `Añadir una unidad de ${producto.titulo}`);
  botonSumar.textContent = "+";
  controles.append(botonRestar, cantidad, botonSumar);

  const subtotal = document.createElement("p");
  subtotal.textContent = `Subtotal: ${formatoCOP.format(producto.valor * producto.cantidad)}`;
  detalles.append(titulo, precio, controles, subtotal);

  const botonQuitar = document.createElement("button");
  botonQuitar.type = "button";
  botonQuitar.className = "quitar-producto";
  botonQuitar.dataset.accion = "quitar";
  botonQuitar.setAttribute("aria-label", `Quitar ${producto.titulo} del carrito`);
  botonQuitar.textContent = "quitar";

  tarjeta.append(imagen, detalles, botonQuitar);
  return tarjeta;
}

function actualizarVistaCarrito() {
  actualizarContadorCarrito();
  if (checkoutPago) checkoutPago.hidden = carrito.length === 0;
  if (!listaCarrito || !estadoCarrito || !contenidoCarrito) return;

  listaCarrito.replaceChildren(...carrito.map(crearElementoCarrito));
  contenidoCarrito.hidden = carrito.length === 0;
  if (!carrito.length) {
    carritoVacio.hidden = false;
    resumenCarrito.hidden = true;
    renderizarEstadoTransaccionDemo(pagoActualDemo);
    return;
  }

  carritoVacio.hidden = true;
  resumenCarrito.hidden = false;
  const unidades = totalUnidadesCarrito();
  resumenCarrito.textContent = `${unidades} producto${unidades === 1 ? "" : "s"} en tu carrito.`;
  subtotalCarrito.textContent = formatoCOP.format(
    carrito.reduce((total, producto) => total + producto.valor * producto.cantidad, 0)
  );
  if (totalCheckout) totalCheckout.textContent = subtotalCarrito.textContent;
  renderizarEstadoTransaccionDemo(pagoActualDemo);
}

const nombresMetodosPago = {
  pse: "PSE",
  nequi: "Nequi",
  daviplata: "Daviplata",
  tarjeta: "Tarjeta Visa/Mastercard",
  "bre-b": "Bre-B",
  contraentrega: "Pago contraentrega"
};

function guardarPagoActualDemo() {
  try {
    localStorage.setItem("calles-dulces-pago-actual-demo-v1", JSON.stringify(pagoActualDemo));
  } catch {
    // El estado sigue visible durante esta visita aunque no se pueda guardar en el navegador.
  }
}

function registrarEstadoPagoDemo(pago) {
  if (!pago) return;
  const historial = leerListaDemo(clavePagosDemo);
  const resumen = {
    id: pago.id,
    metodo: pago.metodo,
    monto: pago.monto,
    estado: pago.estado,
    fecha: new Date().toISOString()
  };
  const indice = historial.findIndex((registro) => registro.id === pago.id);
  if (indice >= 0) historial[indice] = resumen;
  else historial.unshift(resumen);
  guardarListaDemo(clavePagosDemo, historial);
}

function renderizarEstadoTransaccionDemo(pago) {
  if (!panelEstadoTransaccion) return;
  panelEstadoTransaccion.hidden = !pago;
  if (!pago) return;

  const etiquetas = {
    pendiente: ["pago pendiente de verificar", "La orden aún no está confirmada. Revisa la respuesta de prueba de la pasarela.", "bi-hourglass-split"],
    aprobado: ["pago aprobado · pedido confirmado", "El pago de prueba fue aprobado y el pedido quedó registrado.", "bi-check-circle-fill"],
    rechazado: ["pago rechazado", "El pedido no se confirmó y los productos siguen en tu carrito.", "bi-x-circle-fill"],
    cancelado: ["pago cancelado", "El pedido no se confirmó y los productos siguen en tu carrito.", "bi-slash-circle"],
    contraentrega: ["pedido confirmado · contraentrega registrada", "La modalidad contraentrega quedó registrada para este pedido de demostración.", "bi-truck"]
  };
  const [titulo, detalle, icono] = etiquetas[pago.estado] || etiquetas.pendiente;
  if (tituloTransaccion) tituloTransaccion.textContent = titulo;
  if (detalleTransaccion) {
    detalleTransaccion.textContent = `${nombresMetodosPago[pago.metodo] || pago.metodo} · ${formatoCOP.format(pago.monto)}. ${detalle}`;
  }
  if (iconoTransaccion) iconoTransaccion.className = `bi ${icono}`;
  panelEstadoTransaccion.className = `estado-transaccion estado-transaccion-${pago.estado}`;
  if (accionesTransaccion) accionesTransaccion.hidden = pago.estado !== "pendiente";
}

// ── Solicitudes de demostración: crearIdDemo y registrarSolicitudDemo (options.js L764–L778) ──
function crearIdDemo(prefijo) {
  const aleatorio = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefijo}-${aleatorio}`;
}

function registrarSolicitudDemo(tipo, datos) {
  const solicitudes = leerListaDemo(claveSolicitudesDemo);
  solicitudes.unshift({
    id: crearIdDemo("CDS"),
    tipo,
    fecha: new Date().toISOString(),
    ...datos
  });
  return guardarListaDemo(claveSolicitudesDemo, solicitudes);
}

// ── Carrito (núcleo): reiniciarPagoAlCambiarCarrito (options.js L874–L885) ──
function reiniciarPagoAlCambiarCarrito() {
  if (!pagoActualDemo) return;
  if (pagoActualDemo.estado === "pendiente") {
    pagoActualDemo.estado = "cancelado";
    pagoActualDemo.fechaActualizacion = new Date().toISOString();
    registrarEstadoPagoDemo(pagoActualDemo);
  } else {
    pagoActualDemo = null;
  }
  guardarPagoActualDemo();
  renderizarEstadoTransaccionDemo(pagoActualDemo);
}

// ── Carrito (núcleo): render inicial (actualiza el contador del header en todas las páginas) (options.js L990) ──
actualizarVistaCarrito();

// ── Contacto flotante y formulario de contacto (options.js L1142–L1167) ──
const contactoToggle = document.querySelector(".boton-contacto-flotante");
const formularioContacto = document.querySelector("#form-contacto");
const seccionContacto = document.querySelector("#contactanos");

if (contactoToggle && formularioContacto && seccionContacto) {
  contactoToggle.addEventListener("click", () => {
    seccionContacto.hidden = false;
    formularioContacto.hidden = false;
    contactoToggle.setAttribute("aria-expanded", "true");
    seccionContacto.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      formularioContacto.elements.nombre.focus();
    }, 350);
  });

  formularioContacto.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const respuesta = formularioContacto.querySelector(".contacto-respuesta");
    const datos = Object.fromEntries(new FormData(formularioContacto).entries());
    const registrado = registrarSolicitudDemo("contacto", datos);
    respuesta.textContent = registrado
      ? "Gracias por escribirnos. Tu solicitud quedó guardada en este navegador."
      : "Gracias por escribirnos. No se pudo guardar la solicitud en este navegador.";
    formularioContacto.reset();
  });
}

// ── normalizarTexto (la usan el chatbot y el filtro de sugerencias de la tienda) (options.js L1173–L1178) ──
const normalizarTexto = (texto) => texto
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

// ── actualizarRegistrosCuentaDemo (la usan carrito.js y cuenta.js) (options.js L1371–L1412) ──
function actualizarRegistrosCuentaDemo() {
  const listaCompras = document.querySelector("#lista-compras-cuenta");
  const listaRecibos = document.querySelector("#lista-recibos-cuenta");
  if (!listaCompras || !listaRecibos) return;

  const correoActivo = perfilSesionDemo?.correo?.toLowerCase();
  const pedidos = correoActivo
    ? leerListaDemo(clavePedidosDemo).filter((pedido) => pedido.correo?.toLowerCase() === correoActivo)
    : [];
  const estadoCompras = document.querySelector("#estado-compras-cuenta");
  const estadoRecibos = document.querySelector("#estado-recibos-cuenta");
  listaCompras.replaceChildren();
  listaRecibos.replaceChildren();

  pedidos.forEach((pedido) => {
    const compra = document.createElement("li");
    compra.className = "registro-cuenta";
    const nombre = document.createElement("strong");
    nombre.textContent = `Pedido ${pedido.recibo}`;
    const detalle = document.createElement("p");
    const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO");
    detalle.textContent = `${fecha} · ${pedido.productos.reduce((suma, producto) => suma + producto.cantidad, 0)} unidades · ${formatoCOP.format(pedido.total)} · ${pedido.estado}`;
    compra.append(nombre, detalle);
    listaCompras.append(compra);
  });

  const pedidosPagados = pedidos.filter((pedido) => pedido.estado === "confirmado");
  pedidosPagados.forEach((pedido) => {
    const recibo = document.createElement("li");
    recibo.className = "registro-cuenta";
    const numero = document.createElement("strong");
    numero.textContent = `Recibo ${pedido.recibo}`;
    const medio = document.createElement("p");
    const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO");
    medio.textContent = `${pedido.metodo} · ${formatoCOP.format(pedido.total)} · ${fecha}`;
    recibo.append(numero, medio);
    listaRecibos.append(recibo);
  });

  if (estadoCompras) estadoCompras.hidden = pedidos.length > 0;
  if (estadoRecibos) estadoRecibos.hidden = pedidosPagados.length > 0;
}

// ── Chatbot (options.js L1607–L1675) ──
const botonChatbot = document.querySelector("#chatbot-abrir");
const cerrarChatbot = document.querySelector("#chatbot-cerrar");
const panelChatbot = document.querySelector("#chatbot-panel");
const formularioChatbot = document.querySelector("#chatbot-form");
const mensajesChatbot = document.querySelector("#chatbot-mensajes");
const campoChatbot = document.querySelector("#chatbot-pregunta");

function cerrarPanelChatbot() {
  if (!panelChatbot || !botonChatbot) return;
  panelChatbot.hidden = true;
  botonChatbot.setAttribute("aria-expanded", "false");
  botonChatbot.focus();
}

function agregarMensajeChatbot(texto, esUsuario = false) {
  if (!mensajesChatbot) return;
  const mensaje = document.createElement("p");
  mensaje.className = esUsuario
    ? "chatbot-mensaje chatbot-mensaje-usuario"
    : "chatbot-mensaje chatbot-mensaje-asistente";
  mensaje.textContent = texto;
  mensajesChatbot.append(mensaje);
  mensajesChatbot.scrollTop = mensajesChatbot.scrollHeight;
}

function responderChatbot(pregunta) {
  const texto = normalizarTexto(pregunta);
  if (/\b(hola|buenas|saludos)\b/.test(texto)) {
    return "¡Hola! Puedo orientarte sobre productos, pedidos y donaciones.";
  }
  if (/\b(donar|donacion|donaciones|aportar)\b/.test(texto)) {
    return "En la sección ¿Quieres donar? encontrarás el formulario de apoyo. El pago aún no está conectado.";
  }
  if (/\b(pedido|pedidos|carrito|compra|comprar)\b/.test(texto)) {
    return "Puedes revisar tu carrito desde el ícono de la parte superior y explorar los postres en la tienda.";
  }
  if (/\b(favorito|favoritos|cuenta)\b/.test(texto)) {
    return "Marca la estrella de un producto y luego podrás verlo en la sección Mi cuenta de este navegador.";
  }
  if (/\b(producto|productos|postre|postres|catalogo|precio|precios|sabor)\b/.test(texto)) {
    return "Visita la tienda para ver el catálogo y combina los filtros para encontrar un postre.";
  }
  if (/\b(contacto|ayuda|persona|asesor)\b/.test(texto)) {
    return "Pulsa el botón Contactanos de la esquina inferior izquierda para abrir el formulario de contacto.";
  }
  return "Por ahora puedo orientar sobre productos, pedidos, favoritos y donaciones. Para más ayuda, usa el formulario de contacto.";
}

if (botonChatbot && panelChatbot && formularioChatbot && campoChatbot) {
  botonChatbot.addEventListener("click", () => {
    panelChatbot.hidden = false;
    botonChatbot.setAttribute("aria-expanded", "true");
    campoChatbot.focus();
  });

  cerrarChatbot?.addEventListener("click", cerrarPanelChatbot);
  panelChatbot.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarPanelChatbot();
  });

  formularioChatbot.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const pregunta = campoChatbot.value.trim();
    if (!pregunta) return;
    agregarMensajeChatbot(pregunta, true);
    campoChatbot.value = "";
    agregarMensajeChatbot(responderChatbot(pregunta));
  });
}
