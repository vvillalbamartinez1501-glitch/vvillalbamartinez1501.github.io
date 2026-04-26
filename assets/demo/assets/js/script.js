document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Efecto Parallax sutil y rastreo del ratón para la Cuadrícula Interactiva (Hero Grid)
    const heroSection = document.getElementById('hero-section');
    const heroContent = document.getElementById('hero-content');

    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            // Calcula las coordenadas relativas a la ventana para la máscara de la cuadrícula
            const x = e.clientX;
            const y = e.clientY;
            
            // Actualiza las variables CSS globales para que el gradiente siga al cursor
            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);

            // Parallax sutil en el texto central
            if (heroContent) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const moveX = (x - centerX) / 50;
                const moveY = (y - centerY) / 50;
                heroContent.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            }
        });

        // Resetear la posición del contenido si el ratón sale de la pantalla
        heroSection.addEventListener('mouseleave', () => {
            if (heroContent) {
                heroContent.style.transform = `translate3d(0, 0, 0)`;
            }
        });
    }
});

// 2. Función global para cambiar el sistema de Temas (Botones top-right)
function setTheme(themeName) {
    // Cambiamos el atributo data-theme del body. 
    // El CSS se encarga automáticamente de remapear todos los brillos y sombras.
    document.body.setAttribute('data-theme', themeName);
}

// Exponer la función globalmente para que el onClick de los botones en el HTML funcione
window.setTheme = setTheme;

document.addEventListener("DOMContentLoaded", () => {
    
    const heroSection = document.getElementById('hero-section');
    const heroContent = document.getElementById('hero-content');
    // Seleccionamos el contenedor de la imagen (capa z-20)
    const heroImageContainer = heroSection.querySelector('.absolute.z-20 img');

    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            
            // 1. Actualizar coordenadas para la máscara del Grid Tron (CSS)
            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);

            // Calcular desplazamiento desde el centro
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (x - centerX);
            const moveY = (y - centerY);

            // 2. Parallax para el texto (se mueve suavemente)
            if (heroContent) {
                const textFactor = 40; // Menor número = más movimiento
                heroContent.style.transform = `translate3d(${moveX / textFactor}px, ${moveY / textFactor}px, 0)`;
            }

            // 3. Parallax para la imagen (se mueve en la misma dirección pero más lento para dar profundidad)
            if (heroImageContainer) {
                const imgFactor = 60; // Mayor número = menos movimiento que el texto
                heroImageContainer.style.transform = `translate3d(${moveX / imgFactor}px, ${moveY / imgFactor}px, 0)`;
            }
        });

        // Resetear la posición si el ratón sale
        heroSection.addEventListener('mouseleave', () => {
            if (heroContent) heroContent.style.transform = `translate3d(0, 0, 0)`;
            if (heroImageContainer) heroImageContainer.style.transform = `translate3d(0, 0, 0)`;
        });
    }
});

// Función global para cambiar el sistema de Temas (se mantiene igual)
function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
}
window.setTheme = setTheme;