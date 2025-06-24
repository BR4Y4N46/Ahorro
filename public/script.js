
const limite = 5000000;

const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');

let accionPendiente = null;

document.querySelectorAll('.valor-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const valor = parseInt(btn.dataset.valor);
    const estaSeleccionado = btn.classList.contains('seleccionado');

    modalText.textContent = estaSeleccionado
      ? `¿Deseas quitar $${valor.toLocaleString()} de tu ahorro?`
      : `¿Deseas agregar $${valor.toLocaleString()} a tu ahorro?`;

    // Guardamos lo que debe pasar si el usuario confirma
    accionPendiente = () => {
      if (estaSeleccionado) {
        total -= valor;
        btn.classList.remove('seleccionado');
      } else {
        total += valor;
        btn.classList.add('seleccionado');
      }
      actualizarTotal();
    };

    // Mostramos el modal
    modal.classList.remove('hidden');
  });
});

confirmBtn.addEventListener('click', () => {
  if (accionPendiente) accionPendiente();
  cerrarModal();
});

cancelBtn.addEventListener('click', cerrarModal);

function cerrarModal() {
  modal.classList.add('hidden');
  accionPendiente = null;
}

function actualizarTotal() {
  document.getElementById('total').textContent = total.toLocaleString();

  const mensaje = document.getElementById('mensajeFinal');
  const mensajeTotal = document.getElementById('mensajeTotal');

  if (total >= limite) {
    mensaje.textContent = "🎉 ¡Meta alcanzada de $5.000.000!";
    mensaje.style.color = "#00ffcc";
    if (mensajeTotal) mensajeTotal.textContent = "";
  } else {
    mensaje.textContent = "";
    if (mensajeTotal) {
      mensajeTotal.textContent = `Llevas acumulado: $${total.toLocaleString()} / $${limite.toLocaleString()}`;
    }
  }

  // Enviar el total actualizado al servidor
  fetch('/guardar-total', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ total })
  });
}
