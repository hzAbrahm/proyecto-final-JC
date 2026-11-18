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

const filtros = document.querySelector("#filtros-productos");
const busqueda = document.querySelector("#form-busqueda");
const formularioRecomendacion = document.querySelector("#form-recomendacion");
const listaProductos = document.querySelectorAll("#lista-productos > .producto");
const resultadoFiltros = document.querySelector("#resultado-filtros");
const campoBusqueda = document.querySelector("#buscar-postre");
const listaFavoritos = document.querySelector("#lista-favoritos");
const listaFavoritosCuenta = document.querySelector("#cuenta-lista-favoritos");
const tarjetaVerMas = document.querySelector("#tarjeta-ver-mas");
const botonVerMas = document.querySelector("#boton-ver-mas");
let catalogoExpandido = false;

function limiteProductos() {
  return Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--limite-productos"),
    10
  ) || 20;
}

function actualizarBotonVerMas(mostrarMas) {
  if (!tarjetaVerMas || !botonVerMas) return;

  tarjetaVerMas.hidden = !mostrarMas;
  botonVerMas.setAttribute("aria-expanded", String(catalogoExpandido));
  botonVerMas.querySelector("span").textContent = catalogoExpandido
    ? "ver menos productos"
    : "ver más productos";
  botonVerMas.querySelector("i").className = catalogoExpandido
    ? "bi bi-chevron-up"
    : "bi bi-grid-3x3-gap-fill";
}

function actualizarProductos() {
  if (!filtros || !listaProductos.length) return;

  const categoria = filtros.elements.categoria.value;
  const ingrediente = filtros.elements.ingrediente.value;
  const restriccion = filtros.elements.restriccion.value;
  const texto = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : "";
  const productosCoincidentes = [];

  listaProductos.forEach((producto) => {
    const coincideCategoria = !categoria || producto.dataset.categoria === categoria;
    const coincideIngrediente = !ingrediente || producto.dataset.ingrediente === ingrediente;
    const coincideRestriccion = !restriccion || producto.dataset.restriccion === restriccion;
    const coincideTexto = !texto || producto.textContent.toLowerCase().includes(texto);
    const mostrar = coincideCategoria && coincideIngrediente && coincideRestriccion && coincideTexto;

    producto.hidden = !mostrar;
    if (mostrar) productosCoincidentes.push(producto);
  });

  const limite = limiteProductos();
  productosCoincidentes.forEach((producto, indice) => {
    producto.hidden = !catalogoExpandido && indice >= limite;
  });

  actualizarBotonVerMas(productosCoincidentes.length > limite);

  const totalCoincidencias = productosCoincidentes.length;
  resultadoFiltros.textContent = `${totalCoincidencias} producto${totalCoincidencias === 1 ? "" : "s"} encontrado${totalCoincidencias === 1 ? "" : "s"}.`;
}

if (botonVerMas) {
  botonVerMas.addEventListener("click", () => {
    catalogoExpandido = !catalogoExpandido;
    actualizarProductos();
  });
}

window.addEventListener("resize", actualizarProductos);

if (filtros) {
  filtros.addEventListener("input", actualizarProductos);
  filtros.addEventListener("reset", () => {
    window.setTimeout(actualizarProductos, 0);
  });
}

if (busqueda) {
  busqueda.addEventListener("submit", (evento) => {
    evento.preventDefault();
    actualizarProductos();
  });
}

actualizarProductos();

const dialogoProducto = document.querySelector("#detalle-producto");
let posicionScrollDetalle = null;
let productoQueAbrioDetalle = null;
let cantidadDetalle = 1;

function actualizarCantidadDetalle(cantidad) {
  cantidadDetalle = Math.max(1, cantidad);
  const salida = document.querySelector("#cantidad-detalle");
  if (salida) salida.textContent = String(cantidadDetalle);
}

const controlesCantidadDetalle = document.querySelector("#controles-cantidad-detalle");
controlesCantidadDetalle?.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  actualizarCantidadDetalle(cantidadDetalle + (boton.dataset.accion === "sumar-detalle" ? 1 : -1));
});

const descripcionesProductos = {
  "tiramisu": {
    descripcion: "Postre cremoso en capas, con café y un toque de cacao.",
    ingredientes: "bizcocho, café, queso mascarpone, crema y cacao.",
    peso: "120 g"
  },
  "brownie": {
    descripcion: "Brownie artesanal, húmedo por dentro y con intenso sabor a chocolate.",
    ingredientes: "chocolate, harina, azúcar, huevo y mantequilla.",
    peso: "90 g"
  },
  "pastel-de-vainilla": {
    descripcion: "Porción de pastel suave con aroma de vainilla y cubierta cremosa.",
    ingredientes: "harina, vainilla, huevo, leche y azúcar.",
    peso: "150 g"
  },
  "galletas-con-chocolate": {
    descripcion: "Galletas doradas y crujientes con trozos de chocolate.",
    ingredientes: "harina, chocolate, azúcar y aceite vegetal.",
    peso: "100 g (2 unidades)"
  },
  "parfait-de-frutas": {
    descripcion: "Capas frescas de fruta y crema, servidas en una porción individual.",
    ingredientes: "frutas de temporada, yogur y granola.",
    peso: "180 g"
  },
  "torta-de-fresa": {
    descripcion: "Torta esponjosa con fresas y una suave capa de crema.",
    ingredientes: "fresa, harina, huevo, crema y azúcar.",
    peso: "160 g"
  },
  "caramelos-artesanales": {
    descripcion: "Caramelos hechos a mano, dulces y con un delicado toque acaramelado.",
    ingredientes: "azúcar, glucosa, crema y sabor natural.",
    peso: "80 g"
  },
  "flan-de-vainilla": {
    descripcion: "Flan suave de vainilla con una capa de caramelo.",
    ingredientes: "leche, huevo, vainilla, azúcar y caramelo.",
    peso: "140 g"
  },
  "galletas-de-avena": {
    descripcion: "Galletas horneadas de avena, ideales para un antojo ligero.",
    ingredientes: "avena, harina, banano y azúcar.",
    peso: "100 g (2 unidades)"
  },
  "blondie-de-caramelo": {
    descripcion: "Blondie suave con notas de vainilla y caramelo.",
    ingredientes: "harina, azúcar rubia, vainilla, huevo y caramelo.",
    peso: "90 g"
  },
  "torta-de-chocolate": {
    descripcion: "Porción de torta esponjosa con sabor profundo a chocolate.",
    ingredientes: "chocolate, harina, huevo, leche y azúcar.",
    peso: "160 g"
  },
  "mouse-de-fresa": {
    descripcion: "Mousse ligera de fresa con textura aireada y sabor frutal.",
    ingredientes: "fresa, crema, azúcar y gelatina.",
    peso: "130 g"
  },
  "brochetas-de-fruta": {
    descripcion: "Fruta fresca de temporada preparada en una práctica brocheta.",
    ingredientes: "fresa, uva, piña y banano.",
    peso: "150 g"
  },
  "macarons-de-vainilla": {
    descripcion: "Macarons delicados con cubierta crujiente y relleno de vainilla.",
    ingredientes: "harina de almendra, azúcar, clara de huevo y vainilla.",
    peso: "90 g (3 unidades)"
  },
  "cheesecake-de-caramelo": {
    descripcion: "Cheesecake cremoso con una base crujiente y cubierta de caramelo.",
    ingredientes: "queso crema, galleta, crema y caramelo.",
    peso: "150 g"
  },
  "brownie-de-frutos-rojos": {
    descripcion: "Brownie de chocolate acompañado de frutos rojos.",
    ingredientes: "chocolate, frutos rojos, harina, azúcar y huevo.",
    peso: "100 g"
  },
  "torta-de-frutos-rojos": {
    descripcion: "Torta suave con frutos rojos frescos y cubierta cremosa.",
    ingredientes: "fresa, mora, harina, huevo y crema.",
    peso: "160 g"
  },
  "trufas-de-chocolate": {
    descripcion: "Bocados de chocolate intenso cubiertos con cacao.",
    ingredientes: "chocolate, cacao y crema vegetal.",
    peso: "90 g (3 unidades)"
  },
  "galletas-rellenas-de-fresa": {
    descripcion: "Galletas suaves con un centro dulce de fresa.",
    ingredientes: "harina, fresa, azúcar y mantequilla.",
    peso: "100 g (2 unidades)"
  },
  "panna-cotta-de-chocolate": {
    descripcion: "Postre frío y sedoso con sabor a chocolate.",
    ingredientes: "crema, chocolate, azúcar y gelatina.",
    peso: "140 g"
  }
};

function crearIdProducto(titulo) {
  return titulo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function actualizarCantidadTienda(producto, cantidad) {
  const nuevaCantidad = Math.max(1, cantidad);
  producto.dataset.cantidadSeleccionada = String(nuevaCantidad);
  const salida = producto.querySelector(".controles-tienda output");
  if (salida) salida.textContent = String(nuevaCantidad);
}

function crearControlCantidadTienda(producto) {
  const botonAnadir = producto.querySelector(".añadir-producto");
  if (!botonAnadir) return;

  const controles = document.createElement("div");
  controles.className = "controles-tienda";
  controles.setAttribute("aria-label", "Cantidad a añadir");

  const botonRestar = document.createElement("button");
  botonRestar.type = "button";
  botonRestar.dataset.accion = "restar-tienda";
  botonRestar.setAttribute("aria-label", "Disminuir cantidad");
  botonRestar.textContent = "−";

  const salida = document.createElement("output");
  salida.textContent = "1";
  salida.setAttribute("aria-live", "polite");

  const botonSumar = document.createElement("button");
  botonSumar.type = "button";
  botonSumar.dataset.accion = "sumar-tienda";
  botonSumar.setAttribute("aria-label", "Aumentar cantidad");
  botonSumar.textContent = "+";

  controles.append(botonRestar, salida, botonSumar);
  botonAnadir.before(controles);
}

const productos = Array.from(listaProductos);
const tarjetasTienda = Array.from(document.querySelectorAll("#favoritos .producto, #lista-productos .producto"));
tarjetasTienda.forEach((producto) => {
  const titulo = producto.querySelector("h3, h4")?.textContent.trim() || "postre";
  producto.dataset.id = crearIdProducto(titulo);
  producto.tabIndex = 0;
  producto.setAttribute("aria-label", `Ver descripción de ${titulo}`);
  producto.dataset.cantidadSeleccionada = "1";
  crearControlCantidadTienda(producto);

  const botonFavorito = document.createElement("button");
  botonFavorito.type = "button";
  botonFavorito.className = "boton-favorito";
  botonFavorito.textContent = "✦";
  botonFavorito.setAttribute("aria-pressed", "false");
  producto.prepend(botonFavorito);
});

const claveCatalogoFavoritos = "calles-dulces-catalogo-favoritos-v1";
if (productos.length) {
  const catalogoParaCuenta = productos.map((producto) => ({
    id: producto.dataset.id,
    titulo: producto.querySelector("h3")?.textContent.trim() || "postre",
    imagen: producto.querySelector("img")?.src || "",
    textoAlternativo: producto.querySelector("img")?.alt || "",
    precio: producto.querySelector(".precio")?.textContent.trim() || "",
    categoria: producto.dataset.categoria || ""
  }));

  try {
    localStorage.setItem(claveCatalogoFavoritos, JSON.stringify(catalogoParaCuenta));
  } catch {
    // La tienda sigue funcionando aunque el navegador bloquee el almacenamiento local.
  }
}

const claveFavoritos = "calles-dulces-favoritos-personales-v1";
let favoritosGuardados;
try {
  const favoritosEnAlmacen = localStorage.getItem(claveFavoritos);
  favoritosGuardados = favoritosEnAlmacen === null ? [] : JSON.parse(favoritosEnAlmacen);
  if (!Array.isArray(favoritosGuardados)) favoritosGuardados = [];
} catch {
  favoritosGuardados = [];
}

const idsProductos = new Set(productos.map((producto) => producto.dataset.id));
const favoritos = new Set(favoritosGuardados.filter((id) => !idsProductos.size || idsProductos.has(id)));

function actualizarEstrellas() {
  document.querySelectorAll(".boton-favorito").forEach((boton) => {
    const id = boton.closest(".producto")?.dataset.id;
    const activo = favoritos.has(id);
    boton.classList.toggle("favorito-activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
    boton.setAttribute("aria-label", activo ? "Quitar de favoritos" : "Añadir a favoritos");
    boton.title = activo ? "Quitar de favoritos" : "Añadir a favoritos";
  });
}

function actualizarFavoritosCuenta() {
  if (!listaFavoritosCuenta) return;

  let catalogoGuardado = [];
  try {
    const datosGuardados = JSON.parse(localStorage.getItem(claveCatalogoFavoritos) || "[]");
    if (Array.isArray(datosGuardados)) catalogoGuardado = datosGuardados;
  } catch {
    catalogoGuardado = [];
  }

  const filtrosCuenta = document.querySelector("#filtros-favoritos-cuenta");
  const texto = filtrosCuenta?.elements.busqueda.value.trim() || "";
  const textoNormalizado = crearIdProducto(texto);
  const categoria = filtrosCuenta?.elements.categoria.value || "";
  const coincidencias = catalogoGuardado.filter((producto) => {
    const tituloCoincide = !textoNormalizado || crearIdProducto(producto.titulo).includes(textoNormalizado);
    const categoriaCoincide = !categoria || producto.categoria === categoria;
    return favoritos.has(producto.id) && tituloCoincide && categoriaCoincide;
  });

  listaFavoritosCuenta.replaceChildren();
  coincidencias.forEach((producto) => {
    const tarjeta = document.createElement("li");
    tarjeta.className = "producto";
    tarjeta.dataset.id = producto.id;

    const botonFavorito = document.createElement("button");
    botonFavorito.type = "button";
    botonFavorito.className = "boton-favorito favorito-activo";
    botonFavorito.textContent = "✦";
    botonFavorito.setAttribute("aria-pressed", "true");
    botonFavorito.setAttribute("aria-label", "Quitar de favoritos");
    tarjeta.append(botonFavorito);

    const titulo = document.createElement("h3");
    titulo.textContent = producto.titulo;
    tarjeta.append(titulo);

    const imagenProducto = document.createElement("div");
    imagenProducto.className = "imagenproducto";
    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.textoAlternativo;
    imagen.loading = "lazy";
    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = producto.precio;
    const botonAnadir = document.createElement("button");
    botonAnadir.type = "button";
    botonAnadir.className = "añadir-producto";
    botonAnadir.textContent = "añadir al carrito";
    imagenProducto.append(imagen, botonAnadir, precio);
    tarjeta.append(imagenProducto);
    tarjeta.dataset.cantidadSeleccionada = "1";
    crearControlCantidadTienda(tarjeta);
    listaFavoritosCuenta.append(tarjeta);
  });

  const estado = document.querySelector("#estado-favoritos-cuenta");
  if (estado) {
    if (!favoritos.size) {
      estado.textContent = "Aún no has marcado productos. Usa la estrella en la tienda para guardarlos aquí.";
    } else if (!coincidencias.length) {
      estado.textContent = "No encontramos favoritos con esos filtros.";
    } else {
      estado.textContent = `${coincidencias.length} producto${coincidencias.length === 1 ? "" : "s"} en tus favoritos.`;
    }
  }

  actualizarEstrellas();
}

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

actualizarFavoritosCuenta();

function alternarFavorito(boton) {
  const id = boton.closest(".producto")?.dataset.id;
  if (!id) return;

  if (favoritos.has(id)) favoritos.delete(id);
  else favoritos.add(id);

  try {
    localStorage.setItem(claveFavoritos, JSON.stringify(Array.from(favoritos)));
  } catch {
    // La interacción sigue disponible aunque el navegador bloquee el almacenamiento local.
  }

  if (listaFavoritosCuenta) actualizarFavoritosCuenta();
  else actualizarEstrellas();
}

const claveCarrito = "calles-dulces-carrito-v1";
const estadoCarrito = document.querySelector("#estado-carrito");
const carritoVacio = document.querySelector(".carrito-vacio");
const resumenCarrito = document.querySelector(".estado-carrito-resumen");
const contenidoCarrito = document.querySelector("#contenido-carrito");
const listaCarrito = document.querySelector("#productos-carrito");
const subtotalCarrito = document.querySelector("#subtotal-carrito");
const botonVaciarCarrito = document.querySelector("#vaciar-carrito");
const checkoutPago = document.querySelector("#checkout-pago");
const totalCheckout = document.querySelector("#total-checkout");
const formularioCheckout = document.querySelector("#form-checkout");
const panelEstadoTransaccion = document.querySelector("#estado-transaccion");
const tituloTransaccion = document.querySelector("#titulo-transaccion");
const detalleTransaccion = document.querySelector("#detalle-transaccion");
const iconoTransaccion = document.querySelector("#icono-transaccion i");
const accionesTransaccion = document.querySelector("#acciones-transaccion");
const estadoFormularioCheckout = document.querySelector("#estado-form-checkout");
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

function agregarProductoAlCarrito(producto, boton, cantidad = 1) {
  const id = producto.dataset.id;
  if (!id) return;

  const cantidadSolicitada = Math.max(1, Number.parseInt(cantidad, 10) || 1);
  reiniciarPagoAlCambiarCarrito();

  const imagen = producto.querySelector("img");
  const precio = producto.querySelector(".precio")?.textContent.trim() || "";
  const valor = Number(precio.replace(/[^0-9]/g, "")) || 0;
  const existente = carrito.find((item) => item.id === id);
  if (existente) {
    existente.cantidad += cantidadSolicitada;
  } else {
    carrito.push({
      id,
      titulo: producto.querySelector("h3, h4")?.textContent.trim() || "postre",
      imagen: imagen?.src || "",
      textoAlternativo: imagen?.alt || "Postre",
      precio,
      valor,
      cantidad: cantidadSolicitada
    });
  }

  guardarCarrito();
  actualizarVistaCarrito();
  actualizarCantidadTienda(producto, 1);
  if (boton) {
    const etiquetaOriginal = boton.dataset.etiquetaOriginal || boton.textContent.trim();
    boton.dataset.etiquetaOriginal = etiquetaOriginal;
    boton.textContent = "añadido ✓";
    window.setTimeout(() => {
      if (!document.body.contains(boton)) return;
      boton.textContent = etiquetaOriginal;
    }, 1400);
  }
}

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

actualizarVistaCarrito();

function abrirDescripcion(producto) {
  if (!dialogoProducto) return;

  const titulo = producto.querySelector("h3, h4")?.textContent.trim() || "Postre";
  const imagen = producto.querySelector("img");
  const detalle = descripcionesProductos[producto.dataset.id] || {
    descripcion: "Un postre preparado para disfrutar algo dulce.",
    ingredientes: "información de muestra, pendiente de confirmar.",
    peso: "porción individual"
  };

  document.querySelector("#detalle-titulo").textContent = titulo;
  const imagenDetalle = document.querySelector("#detalle-imagen");
  imagenDetalle.src = imagen?.src || "";
  imagenDetalle.alt = imagen?.alt || titulo;
  document.querySelector("#detalle-descripcion").textContent = detalle.descripcion;
  document.querySelector("#detalle-ingredientes").textContent = detalle.ingredientes;
  document.querySelector("#detalle-peso").textContent = detalle.peso;
  document.querySelector("#detalle-precio").textContent = producto.querySelector(".precio")?.textContent || "";
  actualizarCantidadDetalle(1);

  if (!dialogoProducto.open) {
    posicionScrollDetalle = { x: window.scrollX, y: window.scrollY };
    productoQueAbrioDetalle = producto;
    document.documentElement.classList.add("dialogo-producto-abierto");
    document.body.classList.add("dialogo-producto-abierto");
    dialogoProducto.showModal();

    requestAnimationFrame(() => {
      dialogoProducto.querySelector(".cerrar-detalle")?.focus({ preventScroll: true });
      window.scrollTo(posicionScrollDetalle.x, posicionScrollDetalle.y);
    });
  }
}

let productoRecomendado = null;
const botonRecomendarProducto = document.querySelector("#boton-recomendar-producto");
const resultadoRecomendador = document.querySelector("#resultado-recomendador");
const estadoRecomendador = document.querySelector("#estado-recomendador");
const botonVerRecomendacion = document.querySelector("#ver-recomendador");

if (botonRecomendarProducto && filtros) {
  botonRecomendarProducto.addEventListener("click", () => {
    const categoria = filtros.elements.categoria.value;
    const ingrediente = filtros.elements.ingrediente.value;
    const restriccion = filtros.elements.restriccion.value;
    const texto = campoBusqueda?.value.trim().toLowerCase() || "";
    const candidatos = Array.from(listaProductos).filter((producto) => {
      return (!categoria || producto.dataset.categoria === categoria)
        && (!ingrediente || producto.dataset.ingrediente === ingrediente)
        && (!restriccion || producto.dataset.restriccion === restriccion)
        && (!texto || producto.textContent.toLowerCase().includes(texto));
    });

    if (!candidatos.length) {
      productoRecomendado = null;
      if (resultadoRecomendador) resultadoRecomendador.hidden = true;
      if (estadoRecomendador) estadoRecomendador.textContent = "No encontramos productos con esos filtros. Prueba con otras opciones.";
      return;
    }

    productoRecomendado = candidatos[Math.floor(Math.random() * candidatos.length)];
    const titulo = productoRecomendado.querySelector("h3");
    const imagen = productoRecomendado.querySelector("img");
    document.querySelector("#nombre-recomendador").textContent = titulo?.textContent.trim() || "postre";
    const imagenRecomendador = document.querySelector("#imagen-recomendador");
    imagenRecomendador.src = imagen?.src || "";
    imagenRecomendador.alt = imagen?.alt || "Postre recomendado";
    document.querySelector("#precio-recomendador").textContent = productoRecomendado.querySelector(".precio")?.textContent || "";
    if (estadoRecomendador) estadoRecomendador.textContent = "¡Aquí tienes una idea para tu próximo antojo!";
    if (resultadoRecomendador) resultadoRecomendador.hidden = false;
  });
}

if (botonVerRecomendacion) {
  botonVerRecomendacion.addEventListener("click", () => {
    if (productoRecomendado) abrirDescripcion(productoRecomendado);
  });
}

const listasTienda = [document.querySelector("#lista-productos"), listaFavoritos, listaFavoritosCuenta].filter(Boolean);
listasTienda.forEach((lista) => {
  lista.addEventListener("click", (evento) => {
      const botonCantidad = evento.target.closest(".controles-tienda button[data-accion]");
      if (botonCantidad) {
        const producto = botonCantidad.closest(".producto");
        const cantidadActual = Number.parseInt(producto?.dataset.cantidadSeleccionada || "1", 10) || 1;
        const cambio = botonCantidad.dataset.accion === "sumar-tienda" ? 1 : -1;
        if (producto) actualizarCantidadTienda(producto, cantidadActual + cambio);
        return;
      }

    const botonAnadir = evento.target.closest(".añadir-producto");
    if (botonAnadir) {
      const producto = botonAnadir.closest(".producto");
        const cantidad = Number.parseInt(producto?.dataset.cantidadSeleccionada || "1", 10) || 1;
        if (producto) agregarProductoAlCarrito(producto, botonAnadir, cantidad);
      return;
    }

    const botonFavorito = evento.target.closest(".boton-favorito");
    if (botonFavorito) {
      alternarFavorito(botonFavorito);
      return;
    }

    if (evento.target.closest("button")) return;
    const producto = evento.target.closest(".producto");
    if (producto) abrirDescripcion(producto);
  });

  lista.addEventListener("keydown", (evento) => {
    if (evento.target.closest("button") || !["Enter", " "].includes(evento.key)) return;
    if (evento.target.matches(".producto")) {
      evento.preventDefault();
      abrirDescripcion(evento.target);
    }
  });
});

const botonAnadirDetalle = document.querySelector("#detalle-añadir-carrito");
botonAnadirDetalle?.addEventListener("click", () => {
  if (productoQueAbrioDetalle) {
    agregarProductoAlCarrito(productoQueAbrioDetalle, botonAnadirDetalle, cantidadDetalle);
    actualizarCantidadDetalle(1);
  }
});

actualizarEstrellas();

const cerrarDetalle = document.querySelector(".cerrar-detalle");
if (cerrarDetalle && dialogoProducto) {
  cerrarDetalle.addEventListener("click", () => dialogoProducto.close());
  dialogoProducto.addEventListener("click", (evento) => {
    if (evento.target === dialogoProducto) dialogoProducto.close();
  });
  dialogoProducto.addEventListener("close", () => {
    const posicion = posicionScrollDetalle;
    if (!posicion) return;

    document.documentElement.classList.remove("dialogo-producto-abierto");
    document.body.classList.remove("dialogo-producto-abierto");
    productoQueAbrioDetalle?.focus({ preventScroll: true });
    window.scrollTo(posicion.x, posicion.y);
    requestAnimationFrame(() => window.scrollTo(posicion.x, posicion.y));
    productoQueAbrioDetalle = null;
    posicionScrollDetalle = null;
  });
}

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

const palabrasProhibidas = [
  "puta", "puto", "putas", "putos", "mierda", "pendejo", "pendeja", "malparido",
  "malparida", "gonorrea", "hijueputa", "maricon", "estupido", "estupida", "imbecil"
];
const normalizarTexto = (texto) => texto
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

if (formularioRecomendacion) {
  formularioRecomendacion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = formularioRecomendacion.elements.recomendacion;
    const palabras = normalizarTexto(campo.value).split(/\s+/).filter(Boolean);
    const respuesta = document.querySelector("#recomendacion-respuesta");
    const contieneLenguajeOfensivo = palabras.some((palabra) => palabrasProhibidas.includes(palabra));

    if (contieneLenguajeOfensivo) {
      respuesta.textContent = "No podemos aceptar esa sugerencia. Por favor, usa un lenguaje respetuoso.";
      respuesta.classList.add("respuesta-error");
      return;
    }

    respuesta.classList.remove("respuesta-error");
    const registrada = registrarSolicitudDemo("sugerencia", { producto: campo.value.trim() });
    respuesta.textContent = registrada
      ? "¡Gracias! La sugerencia pasó el filtro y quedó guardada en este navegador."
      : "La sugerencia pasó el filtro, pero no se pudo guardar en este navegador.";
    formularioRecomendacion.reset();
  });
}

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

actualizarVistaSesionCuenta();

const formularioAdminAcceso = document.querySelector("#form-admin-acceso");
const seccionAdminAcceso = document.querySelector("#admin-acceso");
const panelAdmin = document.querySelector("#panel-admin");
const formularioProductoAdmin = document.querySelector("#form-admin-producto");
const estadoProductoAdmin = document.querySelector("#estado-producto-admin");
const listaProductosAdminDB = document.querySelector("#admin-lista-productos-db");
const estadoSinProductosAdminDB = document.querySelector("#admin-sin-productos-db");
const totalProductosAdmin = document.querySelector("#admin-total-productos");
const claveSesionAdminDemo = "calles-dulces-admin-demo-sesion-v1";

function crearRegistroProductoAdmin(producto) {
  const item = document.createElement("li");
  item.className = "admin-registro";

  const titulo = document.createElement("strong");
  titulo.textContent = `${producto.name} · ${formatoCOP.format(producto.priceCOP)}`;

  const detalle = document.createElement("p");
  const peso = producto.weightGrams ? ` · ${producto.weightGrams} g` : "";
  detalle.textContent = `${producto.category}${peso} · guardado en Atlas`;
  item.append(titulo, detalle);
  return item;
}

async function cargarProductosAtlasAdmin(mostrarEstado = true) {
  if (!listaProductosAdminDB) return;

  try {
    const respuesta = await fetch("/api/products", { headers: { Accept: "application/json" } });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "No se pudo consultar Atlas.");

    const items = Array.isArray(resultado.items) ? resultado.items : [];
    totalProductosAdmin.textContent = String(items.length);
    listaProductosAdminDB.replaceChildren(...items.map(crearRegistroProductoAdmin));
    estadoSinProductosAdminDB.hidden = items.length > 0;
    if (mostrarEstado && estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `Atlas respondió: ${items.length} producto${items.length === 1 ? "" : "s"} activo${items.length === 1 ? "" : "s"}.`;
    }
    return items;
  } catch {
    totalProductosAdmin.textContent = "—";
    listaProductosAdminDB.replaceChildren();
    estadoSinProductosAdminDB.hidden = false;
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = "No se pudo leer el catálogo de Atlas. Revisa que el servidor esté iniciado con npm start.";
    }
    return null;
  }
}

function renderizarPanelAdminDemo() {
  if (!panelAdmin) return;
  let sesionActiva = false;
  try {
    sesionActiva = sessionStorage.getItem(claveSesionAdminDemo) === "activa";
  } catch {
    sesionActiva = false;
  }
  panelAdmin.hidden = !sesionActiva;
  if (seccionAdminAcceso) seccionAdminAcceso.hidden = sesionActiva;
  if (!sesionActiva) return;

  const pedidos = leerListaDemo(clavePedidosDemo);
  const pagos = leerListaDemo(clavePagosDemo);
  const solicitudes = leerListaDemo(claveSolicitudesDemo);
  cargarProductosAtlasAdmin();
  document.querySelector("#admin-total-pedidos").textContent = String(pedidos.length);
  document.querySelector("#admin-total-solicitudes").textContent = String(solicitudes.length);

  const listaPedidosAdmin = document.querySelector("#admin-lista-pedidos");
  listaPedidosAdmin.replaceChildren();
  document.querySelector("#admin-sin-pedidos").hidden = pedidos.length > 0;
  pedidos.forEach((pedido) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${pedido.recibo} · ${pedido.nombre}`;
    const detalle = document.createElement("p");
    detalle.textContent = `${pedido.metodo} · ${formatoCOP.format(pedido.total)} · ${pedido.estado}`;
    const etiquetaEstado = document.createElement("label");
    etiquetaEstado.textContent = "estado de preparación";
    const selector = document.createElement("select");
    selector.dataset.pedidoAdmin = pedido.id;
    ["confirmado", "preparando", "listo para entregar", "en camino", "entregado"].forEach((estado) => {
      const opcion = document.createElement("option");
      opcion.value = estado;
      opcion.textContent = estado;
      opcion.selected = (pedido.estadoEntrega || "confirmado") === estado;
      selector.append(opcion);
    });
    etiquetaEstado.append(selector);
    item.append(titulo, detalle, etiquetaEstado);
    listaPedidosAdmin.append(item);
  });

  const listaPagosAdmin = document.querySelector("#admin-lista-pagos");
  listaPagosAdmin.replaceChildren();
  document.querySelector("#admin-sin-pagos").hidden = pagos.length > 0;
  pagos.forEach((pago) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${nombresMetodosPago[pago.metodo] || pago.metodo} · ${pago.estado}`;
    const detalle = document.createElement("p");
    detalle.textContent = `${formatoCOP.format(pago.monto)} · ${new Date(pago.fecha).toLocaleString("es-CO")}`;
    item.append(titulo, detalle);
    listaPagosAdmin.append(item);
  });

  const listaSolicitudesAdmin = document.querySelector("#admin-lista-solicitudes");
  listaSolicitudesAdmin.replaceChildren();
  document.querySelector("#admin-sin-solicitudes").hidden = solicitudes.length > 0;
  solicitudes.forEach((solicitud) => {
    const item = document.createElement("li");
    item.className = "admin-registro";
    const titulo = document.createElement("strong");
    titulo.textContent = `${solicitud.tipo} · ${solicitud.nombre || solicitud.correo || "sin nombre"}`;
    const detalle = document.createElement("p");
    const resumen = Object.entries(solicitud)
      .filter(([clave]) => !["id", "tipo", "fecha"].includes(clave))
      .map(([clave, valor]) => `${clave}: ${valor}`)
      .join(" · ");
    detalle.textContent = `${new Date(solicitud.fecha).toLocaleString("es-CO")} · ${resumen}`;
    item.append(titulo, detalle);
    listaSolicitudesAdmin.append(item);
  });
}

formularioProductoAdmin?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!formularioProductoAdmin.reportValidity()) return;

  const datos = Object.fromEntries(new FormData(formularioProductoAdmin).entries());
  datos.priceCOP = Number(datos.priceCOP);
  datos.weightGrams = datos.weightGrams ? Number(datos.weightGrams) : null;
  if (estadoProductoAdmin) estadoProductoAdmin.textContent = "Enviando el producto al servidor...";

  try {
    const respuesta = await fetch("/api/dev/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error || "El servidor rechazó el producto.");

    formularioProductoAdmin.reset();
    await cargarProductosAtlasAdmin(false);
    if (estadoProductoAdmin) {
      estadoProductoAdmin.textContent = `Guardado en Atlas: ${resultado.item.name} (id ${resultado.item._id}).`;
    }
  } catch (error) {
    if (estadoProductoAdmin) estadoProductoAdmin.textContent = error.message;
  }
});

formularioAdminAcceso?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!formularioAdminAcceso.reportValidity()) return;
  try {
    sessionStorage.setItem(claveSesionAdminDemo, "activa");
  } catch {
    document.querySelector("#estado-admin-acceso").textContent = "El navegador bloqueó la sesión de prueba.";
    return;
  }
  renderizarPanelAdminDemo();
});

document.querySelector("#cerrar-admin")?.addEventListener("click", () => {
  try {
    sessionStorage.removeItem(claveSesionAdminDemo);
  } catch {
    // La página vuelve al formulario aunque el almacenamiento de sesión no esté disponible.
  }
  renderizarPanelAdminDemo();
});

document.querySelector("#admin-lista-pedidos")?.addEventListener("change", (evento) => {
  const selector = evento.target.closest("select[data-pedido-admin]");
  if (!selector) return;
  const pedidos = leerListaDemo(clavePedidosDemo);
  const pedido = pedidos.find((item) => item.id === selector.dataset.pedidoAdmin);
  if (!pedido) return;
  pedido.estadoEntrega = selector.value;
  guardarListaDemo(clavePedidosDemo, pedidos);
  renderizarPanelAdminDemo();
});

renderizarPanelAdminDemo();

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
