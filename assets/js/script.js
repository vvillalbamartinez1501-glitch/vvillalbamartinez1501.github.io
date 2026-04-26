// ==========================================
// EFECTOS INTERACTIVOS CON EL RATÓN (HERO)
// ==========================================

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // 1. Mover la linterna global y la cuadrícula TRON
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);

    // 2. Efecto 3D Parallax en el Hero
    const heroContent = document.getElementById('hero-content');
    const heroSection = document.getElementById('hero-section');
    
    // Solo aplicar el efecto 3D si el ratón está dentro del área del Hero
    if(heroContent && heroSection) {
        const rect = heroSection.getBoundingClientRect();
        
        if(y >= rect.top && y <= rect.bottom) {
            // Calcular el centro exacto del Hero
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Ver cuánto se ha alejado el ratón del centro (en porcentaje de -1 a 1)
            const moveX = (x - centerX) / (rect.width / 2);
            const moveY = (y - centerY) / (rect.height / 2);
            
            // Calcular inclinación (Máximo 15 grados)
            const tiltX = moveY * -15; 
            const tiltY = moveX * 15;
            
            // Aplicar la transformación 3D
            heroContent.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
        } else {
            // Si el ratón baja a otras secciones, el hero vuelve a su posición original
            heroContent.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        }
    }
});

// Reiniciar todo si el ratón sale de la pantalla del navegador
document.addEventListener('mouseleave', () => {
    const heroContent = document.getElementById('hero-content');
    if(heroContent) {
        heroContent.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
});

// ==========================================
// ANIMACIÓN DE FONDO: OLA ESTILO JAPONÉS
// ==========================================

const canvas = document.getElementById('wave-canvas');
const ctx = canvas.getContext('2d');
let colorPrimaryRGB = '';

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    updatePrimaryColor();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Inicializar

// Función para obtener el color neón activo actual
function updatePrimaryColor() {
    colorPrimaryRGB = getComputedStyle(document.body).getPropertyValue('--color-primary-rgb').trim();
}

// Configuración de las Olas (Simulando composición de Hokusai: Cresta grande a la izquierda)
// Layer 1: Fondo (más oscura)
const wave1 = {
    height: 0.6, amp: 40, freq: 0.001, phase: 0, speed: 0.015, alpha: 0.08
};
// Layer 2: Media
const wave2 = {
    height: 0.55, amp: 60, freq: 0.0015, phase: 0, speed: 0.01, alpha: 0.15
};
// Layer 3: Primer plano (más brillante y agresiva)
const wave3 = {
    height: 0.5, amp: 80, freq: 0.002, phase: 0, speed: 0.005, alpha: 0.3
};

// Partículas de espuma que saltan de la cresta
let foamParticles = [];
const maxFoam = 40;

class Foam {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5; // Salpicar horizontalmente
        this.vy = Math.random() * -6 - 2; // Salpicar hacia arriba
        this.size = Math.random() * 4 + 1;
        this.life = 1; // De 1 a 0
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravedad suave
        this.vx *= 0.99; // Fricción
        this.life -= this.decay;
        this.size *= 0.97; // Encoger
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.6})`; // Espuma blanca brillante
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Interacción: Aumentar amplitud con la velocidad del ratón
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;

window.addEventListener('mousemove', (e) => {
    // Calcular velocidad del ratón
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    mouseSpeed = Math.sqrt(dx*dx + dy*dy);
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

function drawWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar color base de los temas
    updatePrimaryColor();

    // Dibujar capas
    drawSingleWave(wave1, true); // True = asimétrica
    drawSingleWave(wave2, true);
    drawSingleWave(wave3, true);

    // Dibujar espuma
    foamParticles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            foamParticles.splice(index, 1);
        } else {
            particle.draw();
        }
    });

    // Ralentizar la agitación por ratón poco a poco
    mouseSpeed *= 0.95;

    requestAnimationFrame(drawWaves);
}

function drawSingleWave(wave, asymmetrical) {
    wave.phase += wave.speed;
    
    ctx.beginPath();
    ctx.fillStyle = `rgba(${colorPrimaryRGB}, ${wave.alpha})`;
    
    const baseline = canvas.height * wave.height;
    
    // Iniciar dibujo abajo izquierda
    ctx.moveTo(0, canvas.height);
    
    for (let x = 0; x <= canvas.width; x++) {
        // Fórmula de ola base (sinusoidal)
        let amp = wave.amp + (mouseSpeed * 0.5); // Reacción al ratón
        const baseSin = Math.sin((x * wave.freq) + wave.phase + (wave.height * 10));
        
        let waveY = baseline + baseSin * amp;

        // NUEVO: Efecto Asimétrico de Ola Japonesa (Hokusai)
        // Usamos una función de Gauss o campana para concentrar la amplitud en la izquierda
        // y que baje dramáticamente en la derecha.
        if (asymmetrical) {
            const asymmetricalFactor = Math.exp(-Math.pow((x - canvas.width * 0.1), 2) / (canvas.width * 0.1));
            // Acentuar la cresta solo donde el factor de Gauss es alto
            if (x < canvas.width * 0.5) {
                // Dibujar forma de "gancho" cerca del pico (Bézier simple)
                waveY -= (Math.pow(1 -ymmetricalFactor, 2)) * 15;
            } else {
                // Suavizar la cola de la ola a la derecha
                waveY += (x/canvas.width) * (waveY - baseline) * 0.5;
            }
        }
        
        ctx.lineTo(x, waveY);

        // Generar espuma aleatoriamente cerca del pico principal a la izquierda
        if(asymmetrical && x > canvas.width * 0.1 && x < canvas.width * 0.3 && Math.random() > 0.98 && baseSin < -0.9){
            if(foamParticles.length < maxFoam){
                foamParticles.push(new Foam(x, waveY));
            }
        }
    }

    // Cerrar el dibujo abajo derecha
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

// Iniciar animación
drawWaves();

// Integración: Actualizar color instantáneamente al cambiar de tema
const originalSetTheme = setTheme;
setTheme = function(themeName) {
    originalSetTheme(themeName);
    updatePrimaryColor();
    // Limpiar espuma antigua
    foamParticles = []; 
};

// --- Control de Temas ---
function setTheme(themeName) {
    // Cambiamos el atributo en el body
    document.body.setAttribute('data-theme', themeName);
    // Guardamos la preferencia en el navegador
    localStorage.setItem('selectedTheme', themeName);
}

// Comprobar si hay un tema guardado al cargar la página
const savedTheme = localStorage.getItem('selectedTheme') || 'purple';
setTheme(savedTheme);


// --- Control del Modal de Vídeo ---
const modal = document.getElementById("videoModal");
const iframe = document.getElementById("videoIframe");
const openVideoLinks = document.querySelectorAll(".open-video");
const closeModal = document.querySelector(".close-modal");

// Abrir modal
openVideoLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault(); 
        const videoSrc = this.getAttribute("data-video-src");
        iframe.setAttribute("src", videoSrc);
        // Quitar 'hidden' y añadir 'flex' para centrar usando Tailwind
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    });
});

// Función para cerrar modal
const closeAndStopVideo = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    iframe.setAttribute("src", ""); // Detiene el audio
};

closeModal.addEventListener("click", closeAndStopVideo);

// Cerrar al hacer clic en el fondo oscuro
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeAndStopVideo();
    }
});


// --- Interacciones Dinámicas de Neón ---

// Añadir chispas aleatorias al fondo del Header
const sparkleContainer = document.getElementById('sparkle-container');
const numberOfSparkles = 6;

for (let i = 0; i < numberOfSparkles; i++) {
    const spark = document.createElement('div');
    spark.classList.add('sparkle');
    // Posiciones aleatorias en la parte superior derecha
    spark.style.top = Math.random() * 50 + '%';
    spark.style.right = Math.random() * 40 + '%';
    // Desfase en la animación para que no parpadeen juntas
    spark.style.animationDelay = Math.random() * 4 + 's';
    sparkleContainer.appendChild(spark);
}

// Hacer que el texto principal parpadee si el usuario le pasa el ratón por encima (Efecto "cable flojo")
const titleElement = document.querySelector('h1');
titleElement.addEventListener('mouseenter', () => {
    titleElement.style.animation = 'flicker 0.5s infinite';
});
titleElement.addEventListener('mouseleave', () => {
    titleElement.style.animation = 'none';
    // Reiniciar al estado de brillo por defecto
    titleElement.style.opacity = '1';
});