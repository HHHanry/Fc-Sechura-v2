document.addEventListener('DOMContentLoaded', () => {
    const sponsorBoxes = document.querySelectorAll('.sponsor-box');

    sponsorBoxes.forEach((box, index) => {
        setTimeout(() => {
            box.style.opacity = 1;
            box.style.transform = 'translateY(0)';
        }, index * 200); // Adds a staggered effect
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
