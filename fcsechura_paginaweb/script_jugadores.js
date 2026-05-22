document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const imagenAmpliada = document.getElementById('imagen-ampliada');
    const cerrarOverlay = document.querySelector('.cerrar-overlay');

    // Selecciona todas las imágenes de los jugadores
    const imagenesJugadores = document.querySelectorAll('.imagen-jugador');

    // Función para abrir el overlay
    function abrirOverlay(src) {
        overlay.style.display = 'flex';
        imagenAmpliada.src = src;
    }

    // Función para cerrar el overlay
    function cerrarOverlayFunc() {
        overlay.style.display = 'none';
    }

    // Abrir overlay al hacer clic en una imagen
    imagenesJugadores.forEach(img => {
        img.addEventListener('click', function() {
            abrirOverlay(this.src);
        });
    });

    // Cerrar overlay al hacer clic en el botón de cerrar
    cerrarOverlay.addEventListener('click', cerrarOverlayFunc);

    // Cerrar overlay al hacer clic fuera de la imagen
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            cerrarOverlayFunc();
        }
    });

    // Cerrar overlay al presionar la tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) { // ESC key
            cerrarOverlayFunc();
        }
    });

    // Funcionalidad del carrusel
    const carruseles = document.querySelectorAll('.carrusel');

    carruseles.forEach(carrusel => {
        const contenedor = carrusel.querySelector('.contenedor-jugadores');
        const anterior = carrusel.querySelector('.anterior');
        const siguiente = carrusel.querySelector('.siguiente');
        const jugadores = Array.from(contenedor.querySelectorAll('.jugador'));
        let indiceActual = 0;

        // Detectar si es un dispositivo táctil
        let isTouchDevice = 'ontouchstart' in window;

        // Función para centrar el jugador actual
        function centrarJugador(indice) {
            if (jugadores[indice]) {
                jugadores[indice].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        }

        // Función para mostrar dos imágenes a la vez
        function mostrarDosImagenes(indice) {
            if (jugadores[indice] && jugadores[indice + 1]) {
                jugadores[indice].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
                jugadores[indice + 1].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
            } else if (jugadores[indice]) {
                jugadores[indice].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }

        // Navegar al siguiente jugador
        siguiente.addEventListener('click', () => {
            const mediaQuery900px = window.matchMedia('(max-width: 900px)');
            const mediaQuery480px = window.matchMedia('(max-width: 480px)');

            if (mediaQuery480px.matches) {
                indiceActual = (indiceActual + 1) % jugadores.length;
                centrarJugador(indiceActual);
            } else if (mediaQuery900px.matches) {
                indiceActual = Math.min(indiceActual + 2, jugadores.length - 1);
                mostrarDosImagenes(indiceActual);
            } else {
                indiceActual = (indiceActual + 1) % jugadores.length;
                contenedor.scrollBy({ left: 200, behavior: 'smooth' }); // Desplazamiento normal
            }
        });

        // Navegar al jugador anterior
        anterior.addEventListener('click', () => {
            const mediaQuery900px = window.matchMedia('(max-width: 900px)');
            const mediaQuery480px = window.matchMedia('(max-width: 480px)');

            if (mediaQuery480px.matches) {
                indiceActual = (indiceActual - 1 + jugadores.length) % jugadores.length;
                centrarJugador(indiceActual);
            } else if (mediaQuery900px.matches) {
                indiceActual = Math.max(indiceActual - 2, 0);
                mostrarDosImagenes(indiceActual);
            } else {
                indiceActual = (indiceActual - 1 + jugadores.length) % jugadores.length;
                contenedor.scrollBy({ left: -200, behavior: 'smooth' }); // Desplazamiento normal
            }
        });

        // Deslizar con el tactil
        if (isTouchDevice) {
            let startX = 0;
            let endX = 0;

            contenedor.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            contenedor.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                const diffX = startX - endX;

                if (diffX > 50) { // Deslizar hacia la izquierda
                    siguiente.click();
                } else if (diffX < -50) { // Deslizar hacia la derecha
                    anterior.click();
                }
            });
        }

        // Centrar el primer jugador al cargar la página
        const mediaQuery900px = window.matchMedia('(max-width: 900px)');
        const mediaQuery480px = window.matchMedia('(max-width: 480px)');

        if (mediaQuery480px.matches) {
            centrarJugador(indiceActual);
        } else if (mediaQuery900px.matches) {
            mostrarDosImagenes(indiceActual);
        }
    });
});