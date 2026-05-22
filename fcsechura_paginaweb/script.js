document.addEventListener("DOMContentLoaded", () => {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const navList = document.querySelector(".lista_nav");
    const overlay = document.querySelector(".overlay");
    const body = document.body;

    // Función para alternar el menú
   const toggleMenu = () => {
        if (navList.classList.contains("active")) {
            navList.classList.remove("active");
            navList.classList.add("closing");

            setTimeout(() => {
                navList.classList.remove("closing");
            }, 500); // Duración de la transición en ms
        } else {
            navList.classList.add("active");
        }

        hamburgerMenu.classList.toggle("active");
        overlay.classList.toggle("active");

        // Bloquea o desbloquea el scroll del cuerpo
        if (navList.classList.contains("active")) {
            body.classList.add("no-scroll");
        } else {
            body.classList.remove("no-scroll");
        }
    };

    // Abrir o cerrar el menú al hacer clic en el botón de hamburguesa
    hamburgerMenu.addEventListener("click", (event) => {
        event.stopPropagation(); // Evita cerrar el menú al hacer clic en el botón
        toggleMenu();
    });

    // Cerrar el menú al hacer clic fuera del mismo (en el overlay)
    overlay.addEventListener("click", toggleMenu);

    // Cerrar el menú al hacer clic fuera del mismo (en el documento)
    document.addEventListener("click", (event) => {
        if (navList.classList.contains("active")) {
            toggleMenu();
        }
    });
    

    // Asegurarse de que el menú no se cierre al hacer clic dentro de él
    navList.addEventListener("click", (event) => {
        event.stopPropagation();
    });
});
