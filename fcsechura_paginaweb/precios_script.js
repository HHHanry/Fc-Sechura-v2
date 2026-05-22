document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    alert('¡Gracias por seleccionar este plan!');
  });
});
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.pricing-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('active');
      });
    });
  });

