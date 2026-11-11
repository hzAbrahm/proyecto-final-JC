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
