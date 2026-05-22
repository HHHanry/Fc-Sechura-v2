  const whatsappIcon = document.getElementById('whatsappIcon');
        const whatsappModal = document.getElementById('whatsappModal');
        const closeModal = document.getElementById('closeModal');

        whatsappIcon.addEventListener('click', () => {
            whatsappModal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            whatsappModal.style.display = 'none';
        });

        // Cerrar el modal si se hace clic fuera de él
        window.addEventListener('click', (event) => {
            if (event.target === whatsappModal) {
                whatsappModal.style.display = 'none';
            }
        });