let currentIndex = 1; // Iniciamos en la primera imagen real (índice 1)
const images = document.querySelectorAll('.li_carousel'); // Todas las imágenes (incluye clones)
const dots = document.querySelectorAll('.carousel__dot'); // Dots
const carousel = document.querySelector('.ul_carousel'); // Contenedor del carrusel
const totalImages = images.length; // Total de imágenes (incluye clones)
const realImages = totalImages - 2; // Total de imágenes reales (sin clones)

let autoChangeInterval; // Intervalo automático
let autoChangeTimeout; // Timeout para reactivar automático tras interacción

function goToImage(index) {
    stopAutoChange();
    resetAutoChangeTimer();

    const targetIndex = index + 1;
    const distance = Math.abs(targetIndex - currentIndex);

    if (distance === 1) {
        currentIndex = targetIndex;
        updateCarousel(true);
    } else {
        currentIndex = targetIndex;
        updateCarousel(false, true);
    }
}

function nextImage() {
    currentIndex++;
    updateCarousel(true, false, () => {
        if (currentIndex === totalImages - 1) {
            currentIndex = 1;
            updateCarousel(false);
        }
    });
}

function prevImage() {
    currentIndex--;
    updateCarousel(true, false, () => {
        if (currentIndex === 0) {
            currentIndex = totalImages - 2;
            updateCarousel(false);
        }
    });
}

function updateCarousel(skipAnimation = false, jumpLarge = false, callback) {
    if (skipAnimation && !jumpLarge) {
        carousel.style.transition = 'transform 0.5s ease-in-out';
    } else if (jumpLarge) {
        carousel.style.transition = 'transform 0.7s cubic-bezier(0.42, 0, 0.58, 1)';
    } else {
        carousel.style.transition = 'none';
    }

    carousel.style.transform = `translateX(-${currentIndex * 100}vw)`;

    const realIndex = (currentIndex - 1 + realImages) % realImages;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === realIndex);
    });

    if (callback) {
        setTimeout(callback, 500);
    }
}

function startAutoChange() {
    stopAutoChange();
    autoChangeInterval = setInterval(nextImage, 2500);
}

function stopAutoChange() {
    clearInterval(autoChangeInterval);
}

function resetAutoChangeTimer() {
    clearTimeout(autoChangeTimeout);
    stopAutoChange();
    autoChangeTimeout = setTimeout(startAutoChange, 8000);
}

// Asignar eventos a los dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToImage(index));
});

// Asignar eventos a las flechas
document.querySelector('.carousel__btn--right').addEventListener('click', () => {
    stopAutoChange();
    resetAutoChangeTimer();
    nextImage();
});

document.querySelector('.carousel__btn--left').addEventListener('click', () => {
    stopAutoChange();
    resetAutoChangeTimer();
    prevImage();
});

// Inicializar el carrusel
carousel.style.transform = `translateX(-${currentIndex * 100}vw)`;
startAutoChange();
