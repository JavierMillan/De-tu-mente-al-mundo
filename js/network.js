// ===============================================
// NETWORK ANIMATION WITH NEW COLORS
// ===============================================

class NeuralNetworkAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.neurons = [];
        this.connections = [];
        this.animationId = null;

        this.config = {
            neuronCount: this.isMobile() ? 15 : 25,
            maxConnections: 3,
            connectionDistance: this.isMobile() ? 120 : 180,
            neuronSpeed: 0.2,
            pulseSpeed: 2,
            colors: {
                neuron: '#856bd5',
                connection: '#856bd5',
                pulse: '#77bce2',
                glow: '#6b46c1'
            }
        };

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createCanvas();
        this.createNeurons();
        this.startAnimation();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    opacity: 0.6;
                `;

        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createNeurons() {
        this.neurons = [];
        for (let i = 0; i < this.config.neuronCount; i++) {
            this.neurons.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.neuronSpeed,
                vy: (Math.random() - 0.5) * this.config.neuronSpeed,
                size: 2 + Math.random() * 4,
                activity: Math.random()
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw neurons
        this.neurons.forEach(neuron => {
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;

            if (neuron.x < 0 || neuron.x > this.canvas.width) neuron.vx *= -1;
            if (neuron.y < 0 || neuron.y > this.canvas.height) neuron.vy *= -1;

            neuron.activity += 0.01;

            const opacity = 0.6 + Math.sin(neuron.activity) * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, neuron.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(133, 107, 213, ${opacity})`;
            this.ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                const dx = this.neurons[i].x - this.neurons[j].x;
                const dy = this.neurons[i].y - this.neurons[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.neurons[i].x, this.neurons[i].y);
                    this.ctx.lineTo(this.neurons[j].x, this.neurons[j].y);
                    this.ctx.strokeStyle = `rgba(133, 107, 213, ${opacity})`;
                    this.ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.animate();
    }

    isMobile() {
        return window.innerWidth < 768;
    }
}

// ===============================================
// MAIN FUNCTIONALITY
// ===============================================

class PremiumLanding {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupSmoothScroll();
    }

    setupScrollAnimations() {
        const revealElements = () => {
            const elements = document.querySelectorAll('.reveal-text, .reveal-card');

            elements.forEach((element, index) => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 120;

                if (elementTop < window.innerHeight - elementVisible) {
                    setTimeout(() => {
                        element.classList.add('revealed');
                    }, index * 80);
                }
            });
        };

        revealElements();
        window.addEventListener('scroll', revealElements, { passive: true });

        setTimeout(() => {
            document.querySelectorAll('.reveal-text:not(.revealed), .reveal-card:not(.revealed)').forEach((el, index) => {
                setTimeout(() => el.classList.add('revealed'), index * 40);
            });
        }, 2000);
    }

    setupSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href.length > 1) {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    }
}

// ===============================================
// CHECKOUT FUNCTION
// ===============================================

function checkout() {
    // Mostrar modal de desarrollo
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm';
    modal.innerHTML = `
                <div class="bg-void-medium p-8 rounded-2xl max-w-md mx-4 text-center border border-violet-light/20">
                    <div class="text-4xl mb-4">🚀</div>
                    <h3 class="text-2xl font-bold text-violet-light mb-4">DTMM Bootcamp</h3>
                    <div class="text-left mb-6 space-y-2">
                        <p class="text-white/80"><strong>Fechas:</strong> 25-28 Agosto 2025</p>
                        <p class="text-white/80"><strong>Precio:</strong> $1,000 MXN</p>
                        <p class="text-white/80"><strong>Modalidad:</strong> Online con comunidad</p>
                    </div>
                    <p class="text-white/60 text-sm mb-6">
                        En producción, esto redirigirá a Stripe Checkout con pagos reales.
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="bg-gradient-to-r from-violet-light to-cyan-light text-white px-6 py-3 rounded-lg font-semibold">
                        Cerrar
                    </button>
                </div>
            `;
    document.body.appendChild(modal);
}

// ===============================================
// INITIALIZATION
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    new PremiumLanding();
    new NeuralNetworkAnimation('networkBg');
    console.log('✨ DTMM Premium Landing cargada con nueva paleta!');
});