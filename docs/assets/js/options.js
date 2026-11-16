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
    imagenProducto.append(imagen, precio);
    tarjeta.append(imagenProducto);
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
const formatoCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
let carrito = [];

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
  if (!listaCarrito || !estadoCarrito || !contenidoCarrito) return;

  listaCarrito.replaceChildren(...carrito.map(crearElementoCarrito));
  contenidoCarrito.hidden = carrito.length === 0;
  if (!carrito.length) {
    carritoVacio.hidden = false;
    resumenCarrito.hidden = true;
    return;
  }

  carritoVacio.hidden = true;
  resumenCarrito.hidden = false;
  const unidades = totalUnidadesCarrito();
  resumenCarrito.textContent = `${unidades} producto${unidades === 1 ? "" : "s"} en tu carrito.`;
  subtotalCarrito.textContent = formatoCOP.format(
    carrito.reduce((total, producto) => total + producto.valor * producto.cantidad, 0)
  );
}

function agregarProductoAlCarrito(producto, boton, cantidad = 1) {
  const id = producto.dataset.id;
  if (!id) return;

  const cantidadSolicitada = Math.max(1, Number.parseInt(cantidad, 10) || 1);

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
    if (boton.dataset.accion === "sumar") producto.cantidad += 1;
    if (boton.dataset.accion === "restar") producto.cantidad -= 1;
    if (boton.dataset.accion === "quitar" || producto.cantidad <= 0) {
      carrito = carrito.filter((item) => item.id !== producto.id);
    }

    guardarCarrito();
    actualizarVistaCarrito();
  });
}

botonVaciarCarrito?.addEventListener("click", () => {
  carrito = [];
  guardarCarrito();
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
  if (productoQueAbrioDetalle) agregarProductoAlCarrito(productoQueAbrioDetalle, botonAnadirDetalle);
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
    respuesta.textContent = "Gracias por escribirnos. Pronto nos pondremos en contacto contigo.";
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
    respuesta.textContent = "¡Gracias! Tu sugerencia pasó el filtro. El envío se habilitará al conectar el sistema.";
    formularioRecomendacion.reset();
  });
}

const formularioDonacion = document.querySelector("#form-donacion");
if (formularioDonacion) {
  formularioDonacion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nombre = formularioDonacion.elements.nombre.value.trim();
    const respuesta = document.querySelector("#respuesta-donacion");
    respuesta.textContent = `Gracias, ${nombre}, por querer apoyar esta causa. Esta demostración todavía no procesa pagos.`;
    formularioDonacion.reset();
  });
}

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
