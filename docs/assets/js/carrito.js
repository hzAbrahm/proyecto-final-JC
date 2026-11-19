/**
 * carrito.js — Página del carrito: checkout, métodos de pago y eventos de la lista.
 *
 * Se carga en: carrito.html.
 * Requiere cargar antes: shared.js (estado del carrito, pago actual, renderizado y utilidades).
 *
 * El núcleo del carrito (estado, contador del header, renderizado y estado del pago) vive
 * en shared.js porque lo necesitan todas las páginas. agregarProductoAlCarrito vive en
 * tienda.js porque trabaja sobre las tarjetas de producto.
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Checkout: referencias del DOM exclusivas de la página del carrito (options.js L523, L526, L532) ──
const botonVaciarCarrito = document.querySelector("#vaciar-carrito");
const formularioCheckout = document.querySelector("#form-checkout");
const estadoFormularioCheckout = document.querySelector("#estado-form-checkout");

// ── Checkout: validación, confirmación del pedido, pago de demostración y métodos de pago (options.js L716–L762, L780–L872, L887–L920) ──
function validarNumeroLuhn(numero) {
  let suma = 0;
  let duplicar = false;
  for (let indice = numero.length - 1; indice >= 0; indice -= 1) {
    let digito = Number(numero[indice]);
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return numero.length === 16 && suma % 10 === 0;
}

function validarDatosMetodoPago() {
  if (!formularioCheckout) return true;
  const metodo = formularioCheckout.querySelector('input[name="metodo-pago"]:checked')?.value;
  if (metodo !== "tarjeta") return true;

  const numero = formularioCheckout.elements["numero-tarjeta"];
  const franquicia = formularioCheckout.elements.franquicia.value;
  const digitos = numero.value.replace(/\D/g, "");
  const esVisa = digitos.startsWith("4");
  const prefijoMastercard = Number(digitos.slice(0, 2));
  const rangoMastercard = Number(digitos.slice(0, 4));
  const esMastercard = (prefijoMastercard >= 51 && prefijoMastercard <= 55)
    || (rangoMastercard >= 2221 && rangoMastercard <= 2720);

  numero.setCustomValidity("");
  if (!validarNumeroLuhn(digitos)) {
    numero.setCustomValidity("Escribe un número de tarjeta de prueba válido de 16 dígitos.");
  } else if ((franquicia === "Visa" && !esVisa) || (franquicia === "Mastercard" && !esMastercard)) {
    numero.setCustomValidity("El número no coincide con la franquicia seleccionada.");
  }

  const vencimiento = formularioCheckout.elements["vencimiento-tarjeta"];
  vencimiento.setCustomValidity("");
  if (vencimiento.value) {
    const [anio, mes] = vencimiento.value.split("-").map(Number);
    const hoy = new Date();
    if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
      vencimiento.setCustomValidity("La tarjeta de prueba no puede estar vencida.");
    }
  }
  return formularioCheckout.reportValidity();
}

function confirmarPedidoDemo(pago, modalidad) {
  const datos = pago.pedido;
  const pedido = {
    id: pago.id,
    recibo: `CD-${pago.id.slice(-8).toUpperCase()}`,
    nombre: datos.nombre,
    correo: datos.correo,
    telefono: datos.telefono,
    ciudad: datos.ciudad,
    direccion: datos.direccion,
    productos: datos.productos,
    total: pago.monto,
    metodo: nombresMetodosPago[pago.metodo] || pago.metodo,
    estado: modalidad === "contraentrega" ? "contraentrega registrada" : "confirmado",
    fecha: new Date().toISOString()
  };
  const pedidos = leerListaDemo(clavePedidosDemo);
  if (!pedidos.some((existente) => existente.id === pedido.id)) pedidos.unshift(pedido);
  guardarListaDemo(clavePedidosDemo, pedidos);

  pago.estado = modalidad === "contraentrega" ? "contraentrega" : "aprobado";
  pago.pedidoConfirmado = true;
  pago.fechaActualizacion = new Date().toISOString();
  pagoActualDemo = pago;
  guardarPagoActualDemo();
  registrarEstadoPagoDemo(pago);

  carrito = [];
  guardarCarrito();
  restablecerCheckoutDemo();
  actualizarVistaCarrito();
  actualizarRegistrosCuentaDemo();
}

function iniciarPagoDemo(evento) {
  evento.preventDefault();
  if (!formularioCheckout || !carrito.length) return;
  if (!validarDatosMetodoPago() || !formularioCheckout.reportValidity()) return;

  const datos = new FormData(formularioCheckout);
  const metodo = datos.get("metodo-pago");
  const monto = carrito.reduce((total, producto) => total + producto.valor * producto.cantidad, 0);
  const pago = {
    id: crearIdDemo("CDP"),
    metodo,
    monto,
    estado: metodo === "contraentrega" ? "contraentrega" : "pendiente",
    fechaCreacion: new Date().toISOString(),
    pedido: {
      nombre: String(datos.get("nombre")).trim(),
      correo: String(datos.get("correo")).trim().toLowerCase(),
      telefono: String(datos.get("telefono")).trim(),
      ciudad: String(datos.get("ciudad")),
      direccion: String(datos.get("direccion")).trim(),
      productos: carrito.map((producto) => ({
        id: producto.id,
        titulo: producto.titulo,
        cantidad: producto.cantidad,
        valorUnitario: producto.valor
      }))
    }
  };

  if (estadoFormularioCheckout) estadoFormularioCheckout.textContent = "";
  if (metodo === "contraentrega") {
    confirmarPedidoDemo(pago, "contraentrega");
    return;
  }

  pagoActualDemo = pago;
  guardarPagoActualDemo();
  registrarEstadoPagoDemo(pago);
  renderizarEstadoTransaccionDemo(pago);
  if (estadoFormularioCheckout) {
    estadoFormularioCheckout.textContent = "Transacción de prueba iniciada. El pedido seguirá pendiente hasta recibir una aprobación.";
  }
}

function actualizarResultadoPagoDemo(estado) {
  if (!pagoActualDemo || pagoActualDemo.estado !== "pendiente") return;
  if (!['aprobado', 'rechazado', 'cancelado'].includes(estado)) return;

  pagoActualDemo.estado = estado;
  pagoActualDemo.fechaActualizacion = new Date().toISOString();
  if (estado === "aprobado") {
    confirmarPedidoDemo(pagoActualDemo, "aprobado");
    return;
  }

  guardarPagoActualDemo();
  registrarEstadoPagoDemo(pagoActualDemo);
  renderizarEstadoTransaccionDemo(pagoActualDemo);
}

const panelesMetodoPago = document.querySelectorAll("[data-metodo-pago]");
const opcionesMetodoPago = formularioCheckout?.querySelectorAll('input[name="metodo-pago"]') || [];
function cambiarMetodoPago(metodo) {
  panelesMetodoPago.forEach((panel) => {
    const activo = panel.dataset.metodoPago === metodo;
    panel.hidden = !activo;
    panel.querySelectorAll("input, select, textarea").forEach((campo) => {
      campo.disabled = !activo;
    });
  });
}

function restablecerCheckoutDemo() {
  if (!formularioCheckout) return;
  formularioCheckout.reset();
  cambiarMetodoPago("");
  if (perfilSesionDemo) {
    formularioCheckout.elements.nombre.value = perfilSesionDemo.nombre || "";
    formularioCheckout.elements.correo.value = perfilSesionDemo.correo || "";
  }
}

opcionesMetodoPago.forEach((opcion) => {
  opcion.addEventListener("change", () => cambiarMetodoPago(opcion.value));
});
formularioCheckout?.addEventListener("submit", iniciarPagoDemo);
panelEstadoTransaccion?.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-resultado-pago]");
  if (boton) actualizarResultadoPagoDemo(boton.dataset.resultadoPago);
});
if (formularioCheckout && perfilSesionDemo) {
  formularioCheckout.elements.nombre.value = perfilSesionDemo.nombre || "";
  formularioCheckout.elements.correo.value = perfilSesionDemo.correo || "";
}

// ── Carrito: eventos de la lista de productos y botón de vaciar (options.js L961–L988) ──
if (listaCarrito) {
  listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    const tarjeta = boton?.closest(".producto-carrito");
    if (!boton || !tarjeta) return;

    const producto = carrito.find((item) => item.id === tarjeta.dataset.id);
    if (!producto) return;
    reiniciarPagoAlCambiarCarrito();
    if (boton.dataset.accion === "sumar") producto.cantidad += 1;
    if (boton.dataset.accion === "restar") producto.cantidad -= 1;
    if (boton.dataset.accion === "quitar" || producto.cantidad <= 0) {
      carrito = carrito.filter((item) => item.id !== producto.id);
    }

    guardarCarrito();
    if (!carrito.length) restablecerCheckoutDemo();
    actualizarVistaCarrito();
  });
}

botonVaciarCarrito?.addEventListener("click", () => {
  reiniciarPagoAlCambiarCarrito();
  carrito = [];
  guardarCarrito();
  restablecerCheckoutDemo();
  actualizarVistaCarrito();
});
