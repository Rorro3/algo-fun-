const primera_parte = document.getElementById('primera_parte');
const segunda_parte = document.getElementById('segunda_parte');
const primer_boton = document.getElementById('primer_boton');
const segundo_boton = document.getElementById('segundo_boton');
const boton_enviar = document.getElementById('boton_enviar');
const input_nombre = document.getElementById('nombre');
const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

let dibujando = false;
let historial = [];

// Al cargar, oculta la segunda parte
segunda_parte.style.display = 'none';

// Mostrar segunda parte al hacer click en cualquiera de los botones
primer_boton.addEventListener('click', () => {
  primera_parte.style.display = 'none';
  segunda_parte.style.display = 'flex';
});
segundo_boton.addEventListener('click', () => {
  primera_parte.style.display = 'none';
  segunda_parte.style.display = 'flex';
});

// Eventos para dibujar en el canvas
canvas.addEventListener("mousedown", (e) => {
  dibujando = true;
  // Guardar estado actual para poder deshacer
  historial.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mouseup", () => {
  dibujando = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (!dibujando) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(x, y);
  ctx.stroke();
});

// Ctrl + Z para deshacer dibujo
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    if (historial.length > 0) {
      const imagenAnterior = historial.pop();
      ctx.putImageData(imagenAnterior, 0, 0);
    }
  }
});

// Enviar dibujo y nombre a Google Sheet
boton_enviar.addEventListener('click', (e) => {
  e.preventDefault();

  if (input_nombre.value.trim() === '') {
    alert('Escribí tu nombre o apodo antes de enviar.');
    input_nombre.focus();
    return;
  }

  const nombre = input_nombre.value.trim();
  // Obtener imagen en base64 sin el prefijo "data:image/png;base64,"
  const base64Image = canvas.toDataURL('image/png').split(',')[1];

  const dataToSend = {
    nombre: nombre,
    dibujo: base64Image,
    fecha: new Date().toISOString(),
  };

  console.log("Datos a enviar:", dataToSend); // Para debug

  const sheetBestUrl = "https://api.sheetbest.com/sheets/7480c758-2eab-4dfb-9758-fd7c83f04d59";

  fetch(sheetBestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  })
  .then(res => {
    if (res.ok) {
      alert(`Gracias, ${nombre}! Tu dibujo fue enviado.`);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      input_nombre.value = '';
      primera_parte.style.display = 'flex';
      segunda_parte.style.display = 'none';
      historial = [];
    } else {
      alert('Hubo un error al enviar. Intentá nuevamente.');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Error de conexión.');
  });
});