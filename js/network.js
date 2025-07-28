// ===============================================
// NETWORK ANIMATION - Background Effect
// Crea la red de nodos animados del héroe
// ===============================================

class NetworkAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.nodes = [];
        this.lines = [];
        this.nodeCount = 25;
        this.lineCount = 12;
        
        if (this.container) {
            this.init();
            this.setupResizeListener();
        }
    }
    
    init() {
        this.createNodes();
        this.createLines();
        this.startAnimation();
    }
    
    createNodes() {
        // Limpiar nodos existentes
        this.container.innerHTML = '';
        this.nodes = [];
        
        for (let i = 0; i < this.nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'network-node';
            
            // Posición aleatoria pero centrada (evitar bordes)
            const x = 15 + Math.random() * 70; // 15% a 85%
            const y = 15 + Math.random() * 70; // 15% a 85%
            
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
            node.style.animationDelay = `${Math.random() * 3}s`;
            
            // Diferentes tamaños para variedad
            const size = 3 + Math.random() * 3;
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            
            this.container.appendChild(node);
            this.nodes.push({
                element: node,
                x: x,
                y: y,
                size: size
            });
        }
    }
    
    createLines() {
        for (let i = 0; i < this.lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'network-line';
            
            // Posición y orientación aleatoria
            const x = 10 + Math.random() * 80;
            const y = 10 + Math.random() * 80;
            const width = 50 + Math.random() * 150;
            const rotation = Math.random() * 360;
            
            line.style.left = `${x}%`;
            line.style.top = `${y}%`;
            line.style.width = `${width}px`;
            line.style.transform = `rotate(${rotation}deg)`;
            line.style.animationDelay = `${Math.random() * 4}s`;
            
            this.container.appendChild(line);
            this.lines.push(line);
        }
    }
    
    startAnimation() {
        // Animación de paralaje suave en scroll
        let ticking = false;
        
        const updateParallax = () => {
            if (!this.container) return;
            
            const scrollY = window.pageYOffset;
            const rate = scrollY * -0.2; // Velocidad de paralaje
            
            this.container.style.transform = `translateY(${rate}px)`;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
    
    setupResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.init(); // Reinicializar en resize
            }, 300);
        });
    }
    
    // Método para agregar interacción con mouse
    addMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 100;
            mouseY = (e.clientY / window.innerHeight) * 100;
            
            // Efecto sutil de atracción a los nodos cercanos
            this.nodes.forEach((node, index) => {
                const dx = mouseX - node.x;
                const dy = mouseY - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) { // Radio de influencia
                    const force = (20 - distance) / 20;
                    const offsetX = dx * force * 0.1;
                    const offsetY = dy * force * 0.1;
                    
                    node.element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 + force * 0.3})`;
                    node.element.style.opacity = 0.7 + (force * 0.3);
                } else {
                    node.element.style.transform = 'translate(0px, 0px) scale(1)';
                    node.element.style.opacity = 0.7;
                }
            });
        });
    }
    
    // Destructor para limpiar event listeners
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        // Los event listeners se limpian automáticamente cuando se remueve el DOM
    }
}

// Inicialización automática cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Crear animación de red para el héroe
    const heroNetwork = new NetworkAnimation('networkBg');
    
    // Agregar interacción con mouse en dispositivos de escritorio
    if (window.innerWidth > 768) {
        heroNetwork.addMouseInteraction();
    }
    
    // Exponer globalmente para uso en otros scripts si es necesario
    window.NetworkAnimation = NetworkAnimation;
});

// Optimización para dispositivos móviles
if ('ontouchstart' in window) {
    // Reducir cantidad de nodos en móviles para mejor rendimiento
    document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = `
            .network-node {
                animation-duration: 4s !important;
            }
            .network-line {
                animation-duration: 6s !important;
            }
        `;
        document.head.appendChild(style);
    });
}