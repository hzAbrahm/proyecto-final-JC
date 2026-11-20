/**
 * tienda.js — Catálogo, filtros, búsqueda, favoritos, detalle de producto y sugerencias.
 *
 * Se carga en: tienda.html y cuenta.html.
 * Requiere cargar antes: shared.js.
 *
 * cuenta.html también lo carga porque la lista de favoritos de Mi cuenta reutiliza
 * las tarjetas de producto, las estrellas de favorito, los controles de cantidad y el
 * botón de añadir al carrito definidos aquí (actualizarFavoritosCuenta, alternarFavorito,
 * crearControlCantidadTienda, agregarProductoAlCarrito, etc.). En Mi cuenta, las partes
 * del catálogo se saltan solas porque sus elementos no existen en esa página.
 *
 * Origen: fragmentos de docs/assets/js/options.js (se conserva intacto como respaldo).
 * Cada bloque indica con "// ── ... ──" de qué líneas de options.js proviene;
 * el código de dentro es una copia exacta de esas líneas.
 */

// ── Catálogo: referencias del DOM, límite de productos, filtros y búsqueda (options.js L76–L162) ──
const filtros = document.querySelector("#filtros-productos");
const busqueda = document.querySelector("#form-busqueda");
const formularioRecomendacion = document.querySelector("#form-recomendacion");
let listaProductos = [];
const resultadoFiltros = document.querySelector("#resultado-filtros");
const campoBusqueda = document.querySelector("#buscar-postre");
const listaFavoritos = document.querySelector("#lista-favoritos");
const listaFavoritosCuenta = document.querySelector("#cuenta-lista-favoritos");
const tarjetaVerMas = document.querySelector("#tarjeta-ver-mas");
const botonVerMas = document.querySelector("#boton-ver-mas");
let catalogoExpandido = false;

async function cargarProductos() {
  const contenedor = document.querySelector("#lista-productos");

  if (!contenedor) return;

  try {
    const respuesta = await fetch("http://localhost:3003/api/products");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los productos.");
    }

    const datos = await respuesta.json();
    const productosActivos = datos.items.filter(
      (producto) => producto.active
    );

    contenedor.replaceChildren(
      ...productosActivos.map(crearTarjetaProducto)
    );

    listaProductos = Array.from(
      contenedor.querySelectorAll(".producto")
    );

    prepararTarjetasTienda();

    actualizarProductos();

    console.log("Productos mostrados:", productosActivos);

    console.log("Productos recibidos:", datos.items);

  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
  }
}

cargarProductos();

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
    const coincideCategoria =
      !categoria || producto.dataset.categoria === categoria;

    const coincideIngrediente =
      !ingrediente || producto.dataset.ingrediente.includes(
        ingrediente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      );

    const coincideRestriccion =
      !restriccion || producto.dataset.restriccion === restriccion;
    const contenidoProducto = (
      producto.textContent + " " +
      producto.dataset.descripcion + " " +
      producto.dataset.ingrediente
    ).toLowerCase();

    const coincideTexto = !texto || contenidoProducto.includes(texto);
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

// ── Detalle de producto: diálogo, cantidad y descripciones de muestra (options.js L164–L283) ──
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

// ── Tarjetas de producto, catálogo para Mi cuenta y estado de favoritos (options.js L285–L377) ──
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

function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("li");
  tarjeta.className = "producto";
  tarjeta.dataset.id = producto.slug;
  tarjeta.dataset.productId = producto._id;
  tarjeta.dataset.categoria = producto.category || "";
  tarjeta.dataset.ingrediente = (producto.ingredients || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  tarjeta.dataset.descripcion = producto.description || "";
  tarjeta.dataset.detalleIngredientes = producto.ingredients || "";
  tarjeta.dataset.peso = producto.weightGrams || "";
  tarjeta.dataset.restriccion = "";

  const titulo = document.createElement("h3");
  titulo.textContent = producto.name;

  const contenedorImagen = document.createElement("div");
  contenedorImagen.className = "imagenproducto";

  const imagen = document.createElement("img");
  imagen.src = producto.imageUrl || "";
  imagen.alt = producto.name;
  imagen.loading = "lazy";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "añadir-producto";
  boton.textContent = "añadir al carrito";

  const precio = document.createElement("p");
  precio.className = "precio";
  precio.textContent = `${Number(producto.priceCOP).toLocaleString("es-CO")} COP`;

  contenedorImagen.append(imagen, boton, precio);
  tarjeta.append(titulo, contenedorImagen);

  return tarjeta;
}

let productos = [];
let favoritos = new Set();

const claveCatalogoFavoritos = "calles-dulces-catalogo-favoritos-v1";
const claveFavoritos = "calles-dulces-favoritos-personales-v1";

function prepararTarjetasTienda() {
  const tarjetasTienda = Array.from(
    document.querySelectorAll("#favoritos .producto, #lista-productos .producto")
  );

  tarjetasTienda.forEach((producto) => {
    const titulo = producto.querySelector("h3, h4")?.textContent.trim() || "postre";

    producto.dataset.id = producto.dataset.id || crearIdProducto(titulo);
    producto.tabIndex = 0;
    producto.setAttribute("aria-label", `Ver descripción de ${titulo}`);
    producto.dataset.cantidadSeleccionada = "1";

    crearControlCantidadTienda(producto);

    if (!producto.querySelector(".boton-favorito")) {
      const botonFavorito = document.createElement("button");
      botonFavorito.type = "button";
      botonFavorito.className = "boton-favorito";
      botonFavorito.textContent = "✦";
      botonFavorito.setAttribute("aria-pressed", "false");
      producto.prepend(botonFavorito);
    }
  });

  productos = Array.from(listaProductos);

  const catalogoParaCuenta = productos.map((producto) => ({
    id: producto.dataset.id,
    titulo: producto.querySelector("h3")?.textContent.trim() || "postre",
    imagen: producto.querySelector("img")?.src || "",
    textoAlternativo: producto.querySelector("img")?.alt || "",
    precio: producto.querySelector(".precio")?.textContent.trim() || "",
    categoria: producto.dataset.categoria || "",
    productId: producto.dataset.productId,
  }));

  try {
    localStorage.setItem(
      claveCatalogoFavoritos,
      JSON.stringify(catalogoParaCuenta)
    );

    const guardados = JSON.parse(
      localStorage.getItem(claveFavoritos) || "[]"
    );

    const idsProductos = new Set(productos.map((producto) => producto.dataset.id));

    favoritos = new Set(
      Array.isArray(guardados)
        ? guardados.filter((id) => idsProductos.has(id))
        : []
    );
  } catch {
    favoritos = new Set();
  }

  actualizarEstrellas();
}

// ── Favoritos: estrellas y lista de favoritos de Mi cuenta (options.js L379–L461) ──
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
    tarjeta.dataset.productId = producto.productId;

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

// ── Favoritos: render inicial de Mi cuenta y alternarFavorito (options.js L497–L514) ──

try {
  const guardados = JSON.parse(
    localStorage.getItem(claveFavoritos) || "[]"
  );

  favoritos = new Set(
    Array.isArray(guardados)
      ? guardados.filter((id) => typeof id === "string")
      : []
  );
} catch {
  favoritos = new Set();
}

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

// ── Añadir al carrito desde una tarjeta de producto (tienda y favoritos de Mi cuenta) (options.js L922–L959) ──
function agregarProductoAlCarrito(producto, boton, cantidad = 1) {
  const id = producto.dataset.id;
  if (!id) return;

  const cantidadSolicitada = Math.max(1, Number.parseInt(cantidad, 10) || 1);
  reiniciarPagoAlCambiarCarrito();

  const imagen = producto.querySelector("img");
  const precio = producto.querySelector(".precio")?.textContent.trim() || "";
  const valor = Number(precio.replace(/[^0-9]/g, "")) || 0;
  console.log("ID de MongoDB:", producto.dataset.productId);
  const existente = carrito.find((item) => item.id === id);
  if (existente) {
  existente.productId = producto.dataset.productId;
  existente.cantidad += cantidadSolicitada;
  } else {
    carrito.push({
      id,
      titulo: producto.querySelector("h3, h4")?.textContent.trim() || "postre",
      imagen: imagen?.src || "",
      textoAlternativo: imagen?.alt || "Postre",
      precio,
      valor,
      cantidad: cantidadSolicitada,
      productId: producto.dataset.productId,
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

// ── Detalle de producto: abrirDescripcion y recomendador aleatorio (options.js L992–L1070) ──
function abrirDescripcion(producto) {
  if (!dialogoProducto) return;

  const titulo = producto.querySelector("h3, h4")?.textContent.trim() || "Postre";
  const imagen = producto.querySelector("img");
  const detalle = {
    descripcion: producto.dataset.descripcion || "Descripción no disponible.",
    ingredientes: producto.dataset.detalleIngredientes || "Ingredientes no especificados.",
    peso: producto.dataset.peso
      ? `${producto.dataset.peso} g`
      : "Peso no especificado."
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
        && (!ingrediente || producto.dataset.ingrediente.includes(
          ingrediente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        ))
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

// ── Eventos de tarjetas (tienda y favoritos de Mi cuenta), botón del detalle y cierre del diálogo (options.js L1072–L1140) ──
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

// ── Sugerencias de productos: filtro de lenguaje ofensivo y formulario (options.js L1169–L1172, L1180–L1201) ──
const palabrasProhibidas = [
  "puta", "puto", "putas", "putos", "mierda", "pendejo", "pendeja", "malparido",
  "malparida", "gonorrea", "hijueputa", "maricon", "estupido", "estupida", "imbecil"
];

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
