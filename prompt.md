         
         
            //GUIA DE DISEÑOS Y QUE ES CALLES DULCES//

REGLAS:
 -Siempre mirar prompt.md
 -Trabajaremos principalmente en que la pagina sea para dispositivos celulares. Usaremos media queris para computadores y tablets.
 -Antes de hacer cualquier cambio, consulta primero.
 -Solo puedes tocar archivos que esten dentro de la carpeta docs.(Solo hay una excepcion)
 -Siempre me daras un pequeño contexto de los cambios que haras/hiciste.
 -Cada que termines de hacer algo, editaras el apartado de "memoria" de este archivo, con el fin de registrar el progueso mas nuevo, a su vez, eliminaras de la memoria cosas que ya no sean necesarias recordar.
 -Cada estilo, en el archivo debe estar en orden respecto a la pagina(ej: no puede haber un estilo de header justo debajo del codigo de estilo de footer)
 Estos principalmente los separo con /* y que parte de la pagina es*
 -Solo trabajaremos seccion por seccion.(a excepcion de que yo lo pida)
 -Para el desarrolo de js, me explicaras mas a detalle como y que hacer/hiciste, como funciona y el porque.

CONTEXTO:

 Calles dulces es una tienda online con un diseño que combina lo dulce y elegante de una reposteria, con el estilo underground graffiti.
 Calles dulces promete buena atencion y los mejores productos que cualquier persona podria encontrar, a su vez, CD tiene el proposito de que cada compra que se haga, el 10% de esta ira a programas/fundaciones de personas en situacion de calle.
 Para comprar en la pagina de calles dulces no hace falta tener una cuenta, sin embargo, los usuarios que creen una pueden tener beneficios.

 CONTENIDO DE LA PAGINA:

 -Inicio:
   -Bienvenida e introduccion a la pagina
   -Historia de calles dulces
 -tienda:
   -Apartado de favoritos(funciona segun los productos mas vendidos cada semana)
   -tienda principal con la opcion de usar filtros(ej: galletas, dulces japoneses, gelatinas, sin leche, con chocolate, etc...)
   -apartado de recomendaciones(si una persona no encuentra lo que busca, puede enviarnos la sugerencia, esto debe tener filtro de malas palabras)
   -recomendacion(te muestra un postre al azar del catalogo, tambien se le puede poner filtros)
   -todo postre solo mostrara solo su imagen, precio, opcion de añadir al carrito y opcion de agregar a favoritos; sin embargo, al darle click a cualquier postre se mostrara su descripcion entera(ingredientes, gramos, etc...)
 -Donaciones:
   -formulario sencillo para donar a la pagina y mostrara un mensaje de agradecimiento.
 -Mi cuenta:    
   -favoritos(incluye tambien filtro)
   -compras hechas
   -recibos de pago
   -promociones personales
   -novedades sobre CD
 -importante:  
 *Todas las secciones vendran con el mismo header, footer, chatbot y formulario de contacto(a excepcion de mi cuenta, que no incluira el chatbot ni el formulario de contacto)*

MEMORIA:

 * Se mejoro la seccion "Que es Calles Dulces" con un encabezado decorado y tarjetas para historia, meta y compromiso.
 * El inicio ahora tiene una presentacion tipo hero con mezcla de reposteria y graffiti, botones de tienda/donacion y detalles decorativos en CSS.
 * El footer ahora incluye botones para Instagram, Facebook, TikTok y WhatsApp. Los enlaces son provisionales y deben reemplazarse por los perfiles reales.
 * Se reorganizo styles.css por flujo de pagina y separadores: extras, header, inicio, introduccion, nosotros, contacto, footer y responsive.
 * Se elimino el espacio superior del inicio y se mejoro el header con botones circulares, borde de marca y menu movil mas claro.
 * Se decoro la tienda con una cabecera visual, tarjetas de productos, herramientas de busqueda/recomendacion y footer consistente con el inicio.
 * Se añadieron filtros funcionales por categoria, ingrediente y opcion especial, combinables con la busqueda de productos.
 * Se añadieron 18 productos de muestra adicionales con imagenes remotas para probar el catalogo completo.
 * Se separaron las animaciones: hover queda dentro de la media query para PC/tablet y active se usa en celular.
 * Se corrigieron los footers de carrito y donaciones usando la misma estructura visual completa del resto de la pagina.
 * Se corrigio el recorte del footer: el estilo de la seccion de contacto ahora solo afecta a elementos dentro de main y no al footer con el mismo id.
 * Se agrego la seccion de contacto al final de main en todas las paginas, con formulario ocultable y acceso desde el footer.
 * El acceso al contacto ahora es un boton flotante fijo abajo a la izquierda: al pulsarlo baja hasta el final, muestra el formulario y enfoca el campo nombre; el formulario permanece oculto inicialmente.
 * Se corrigio el ocultamiento inicial del formulario añadiendo una regla CSS especifica para form-contacto[hidden], evitando que display:grid lo mostrara al recargar.
 * La seccion completa de contacto, incluido su titulo y descripcion, ahora permanece oculta hasta pulsar el boton flotante; los parrafos normales usan la cuarta fuente.
 * Correccion: la fuente de los parrafos normales es var(--fuente-4), no var(--fuente-2).

