document.addEventListener("DOMContentLoaded", function() {
    // ==========================================
    // 1. APERTURA DE SOBRE Y MÚSICA
    // ==========================================
    const overlaySobre = document.getElementById("overlay-sobre");
    const musicaBoda = document.getElementById("musica-boda");

    if (overlaySobre) {
        document.body.classList.add("bloqueo-scroll");

        overlaySobre.addEventListener("click", function() {
            overlaySobre.classList.add("abrir");
            document.body.classList.remove("bloqueo-scroll");

            if (musicaBoda) {
                musicaBoda.play().catch(error => {
                    console.log("Audio play bloqueado por el navegador:", error);
                });
            }

            setTimeout(function() {
                overlaySobre.classList.add("ocultar");
            }, 2000);
        });
    }

    // ==========================================
    // 2. ANIMACIÓN DE APARICIÓN AL SCROLLEAR
    // ==========================================
    const elementosAnimados = document.querySelectorAll(".animar-scroll, .animar-lateral");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    elementosAnimados.forEach(elemento => {
        observer.observe(elemento);
    });

    // ==========================================
    // 3. ENVÍO Y VALIDACIÓN CON FETCH (GOOGLE APPS SCRIPT)
    // ==========================================
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw3lD0yfTzg1m7tbv8doRIpr_VA6WlgnCbM_PYeB0a1PcOlUTsmDP4jad-gyx5d-vo2/exec'; 
    const formAsistencia = document.getElementById('form-asfistencia');

    const nombreInput = document.getElementById('nombre');
    const asistenciaSelect = document.getElementById('asistencia');
    const cantidadSelect = document.getElementById('cantidad');
    const comentariosInput = document.getElementById('comentarios'); 

    // LÓGICA VISUAL: BLOQUEAR / DESBLOQUEAR CAMPOS SEGÚN ASISTENCIA
    if (asistenciaSelect) {
        asistenciaSelect.addEventListener('change', () => {
            asistenciaSelect.setCustomValidity('');
            const valor = asistenciaSelect.value;

            if (valor === 'no') {
                if (cantidadSelect) {
                    cantidadSelect.value = '';
                    cantidadSelect.disabled = true;
                    cantidadSelect.setCustomValidity('');
                }
                if (comentariosInput) {
                    comentariosInput.value = 'No asiste';
                    comentariosInput.disabled = true;
                }
            } else {
                if (cantidadSelect) {
                    cantidadSelect.disabled = false;
                }
                if (comentariosInput) {
                    comentariosInput.value = '';
                    comentariosInput.disabled = false;
                }
            }
        });
    }

    // LIMPIAR ERRORES AL ESCRIBIR
    if (nombreInput) {
        nombreInput.addEventListener('input', () => {
            nombreInput.setCustomValidity('');
        });
    }
    if (cantidadSelect) {
        cantidadSelect.addEventListener('change', () => {
            cantidadSelect.setCustomValidity('');
        });
    }

    let enviandoFormulario = false;

    if (formAsistencia) {
        formAsistencia.addEventListener('submit', e => {
            e.preventDefault(); 
            if (enviandoFormulario) return;

            nombreInput.setCustomValidity('');
            asistenciaSelect.setCustomValidity('');
            if (cantidadSelect) cantidadSelect.setCustomValidity('');

            const nombre = nombreInput.value.trim();
            const asistencia = asistenciaSelect.value;
            let cantidad = cantidadSelect ? cantidadSelect.value : '';
            let comentarios = comentariosInput ? comentariosInput.value.trim() : '';

            // 1. Validar nombre vacío
            if (nombre === '') {
                nombreInput.setCustomValidity('Completa este campo');
                nombreInput.reportValidity();
                return;
            }

            // 2. Validar letras y espacios
            const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            if (!regexLetras.test(nombre)) {
                nombreInput.setCustomValidity('El nombre solo puede contener letras y espacios');
                nombreInput.reportValidity();
                return;
            }

            // 3. Validar longitud mínima
            if (nombre.length < 3) {
                nombreInput.setCustomValidity('Ingresá un nombre y apellido válido');
                nombreInput.reportValidity();
                return;
            }

            // 4. Validar selección de asistencia
            if (asistencia === '') {
                asistenciaSelect.setCustomValidity('Selecciona una opción');
                asistenciaSelect.reportValidity();
                return;
            }

            // 5. Validar cantidad SOLO si asiste ('si')
            if (asistencia === 'si' && (cantidad === '' || cantidad === '0')) {
                if (cantidadSelect) {
                    cantidadSelect.disabled = false; 
                    cantidadSelect.setCustomValidity('Selecciona una cantidad');
                    cantidadSelect.reportValidity();
                }
                return;
            }

            // Si no asiste, forzamos los valores internos para la base de datos
            if (asistencia === 'no') {
                cantidad = '0';
                comentarios = 'No asiste';
            }

            const btnSubmit = formAsistencia.querySelector('.btn-enviar');
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando confirmación...';
            enviandoFormulario = true;

            // CREACIÓN MANUAL DEL DATOS PARA ASEGURAR QUE VIAJE TODO AUNQUE ESTÉN BLOQUEADOS
            const datosFormulario = new FormData();
            datosFormulario.append('nombre', nombre);
            datosFormulario.append('asistencia', asistencia);
            datosFormulario.append('cantidad', cantidad);
            datosFormulario.append('comentarios', comentarios);

            fetch(scriptURL, {
                method: 'POST',
                body: datosFormulario,
                mode: 'no-cors'
            })
            .then(() => {
                mostrarModalExito();
                formAsistencia.reset();
                if (cantidadSelect) cantidadSelect.disabled = false;
                if (comentariosInput) comentariosInput.disabled = false;
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar Confirmación';
                enviandoFormulario = false;
            })
            .catch(error => {
                console.error('Error en el envío:', error);
                alert('Hubo un error al enviar la confirmación. Intentá nuevamente.');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar Confirmación';
                enviandoFormulario = false;
            });
        });
    }
});

// ==========================================
// FUNCIÓN PARA MOSTRAR EL MENSAJE DE ÉXITO
// ==========================================
function mostrarModalExito() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    modal.style.backdropFilter = 'blur(4px)';

    const contenido = document.createElement('div');
    contenido.style.backgroundColor = '#ffffff';
    contenido.style.padding = '35px 30px';
    contenido.style.borderRadius = '16px';
    contenido.style.textAlign = 'center';
    contenido.style.maxWidth = '380px';
    contenido.style.width = '90%';
    contenido.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
    contenido.style.animation = 'escalaModal 0.3s ease-in-out';

    contenido.innerHTML = `
        <div style="font-size: 45px; margin-bottom: 12px;">💍✨</div>
        <h3 style="margin-bottom: 10px; color: #1a2b4c; font-size: 22px; font-family: inherit;">¡Confirmación enviada!</h3>
        <p style="color: #555; margin-bottom: 24px; font-size: 15px; line-height: 1.4; font-family: inherit;">Muchas gracias por confirmar tu asistencia. ¡Te esperamos en el Gran Día!</p>
        <button id="btn-cerrar-modal" style="background-color: #1a2b4c; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; cursor: pointer; font-family: inherit; font-weight: 500; transition: background 0.2s;">Aceptar</button>
    `;

    modal.appendChild(contenido);
    document.body.appendChild(modal);

    document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
        modal.remove();
    });
}

// ==========================================
// 4. CONTADOR REGRESIVO
// ==========================================
const fechaBoda = new Date('2026-12-20T20:00:00').getTime();
const contadorElemento = document.getElementById('contador');

function actualizarContador() {
    const ahora = new Date().getTime();
    const diferencia = fechaBoda - ahora;

    if (diferencia <= 0) {
        if (contadorElemento) {
            contadorElemento.innerHTML = "¡Llegó el gran día! 💍✨";
        }
        clearInterval(intervalo);
        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    if (contadorElemento) {
        contadorElemento.innerHTML = `${dias} Días • ${horas}h • ${minutos}m • ${segundos}s`;
    }
}

actualizarContador();
const intervalo = setInterval(actualizarContador, 1000);