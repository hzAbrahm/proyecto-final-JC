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
const listaProductos = document.querySelectorAll("#lista-productos .producto");
const resultadoFiltros = document.querySelector("#resultado-filtros");
const campoBusqueda = document.querySelector("#buscar-postre");
const listaFavoritos = document.querySelector("#lista-favoritos");

function actualizarProductos() {
  if (!filtros || !listaProductos.length) return;

  const categoria = filtros.elements.categoria.value;
  const ingrediente = filtros.elements.ingrediente.value;
  const restriccion = filtros.elements.restriccion.value;
  const texto = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : "";
  let visibles = 0;

  listaProductos.forEach((producto) => {
    const coincideCategoria = !categoria || producto.dataset.categoria === categoria;
    const coincideIngrediente = !ingrediente || producto.dataset.ingrediente === ingrediente;
    const coincideRestriccion = !restriccion || producto.dataset.restriccion === restriccion;
    const coincideTexto = !texto || producto.textContent.toLowerCase().includes(texto);
    const mostrar = coincideCategoria && coincideIngrediente && coincideRestriccion && coincideTexto;

    producto.hidden = !mostrar;
    if (mostrar) visibles += 1;
  });

  resultadoFiltros.textContent = `${visibles} producto${visibles === 1 ? "" : "s"} encontrado${visibles === 1 ? "" : "s"}.`;
}

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

const productos = Array.from(listaProductos);
const tarjetasTienda = Array.from(document.querySelectorAll("#favoritos .producto, #lista-productos .producto"));
tarjetasTienda.forEach((producto) => {
  const titulo = producto.querySelector("h3, h4")?.textContent.trim() || "postre";
  producto.dataset.id = crearIdProducto(titulo);
  producto.tabIndex = 0;
  producto.setAttribute("aria-label", `Ver descripción de ${titulo}`);

  const botonFavorito = document.createElement("button");
  botonFavorito.type = "button";
  botonFavorito.className = "boton-favorito";
  botonFavorito.textContent = "✦";
  botonFavorito.setAttribute("aria-pressed", "false");
  producto.prepend(botonFavorito);
});

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
const favoritos = new Set(favoritosGuardados.filter((id) => idsProductos.has(id)));

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

  actualizarEstrellas();
}

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

const listasTienda = [document.querySelector("#lista-productos"), listaFavoritos].filter(Boolean);
listasTienda.forEach((lista) => {
  lista.addEventListener("click", (evento) => {
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
