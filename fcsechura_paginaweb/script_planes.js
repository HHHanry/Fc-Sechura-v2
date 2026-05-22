 function sendWhatsAppMessage(planName) {
    const phoneNumber = "51947300694";
    const message = `Buen día FC SECHYRA. ¡Estoy interesado en adquirir el plan ${planName} ! ¿Me podría brindra más información?`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }