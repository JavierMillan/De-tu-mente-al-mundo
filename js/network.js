// ===============================================
// NEURAL NETWORK ANIMATION - Advanced Background Effect
// Crea una red neuronal realista con conexiones dinámicas
// ===============================================

class NeuralNetworkAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.neurons = [];
        this.connections = [];
        this.animationId = null;
        
        // Configuración de la red
        this.config = {
            neuronCount: this.isMobile() ? 15 : 25,
            maxConnections: 3,
            connectionDistance: this.isMobile() ? 120 : 180,
            neuronSpeed: 0.2,
            pulseSpeed: 2,
            colors: {
                neuron: '#e4cd85',
                connection: '#e4cd85',
                pulse: '#ffffff',
                glow: '#c08a2d'
            },
            sizes: {
                neuron: { min: 2, max: 6 },
                connection: 1,
                pulse: 3
            }
        };
        
        if (this.container) {
            this.init();
            this.setupEventListeners();
        }
    }
    
    init() {
        this.createCanvas();
        this.createNeurons();
        this.createConnections();
        this.startAnimation();
    }
    
    createCanvas() {
        // Crear canvas para mejor rendimiento
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
            const neuron = {
                id: i,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.neuronSpeed,
                vy: (Math.random() - 0.5) * this.config.neuronSpeed,
                size: this.config.sizes.neuron.min + Math.random() * (this.config.sizes.neuron.max - this.config.sizes.neuron.min),
                activity: Math.random(),
                activitySpeed: 0.01 + Math.random() * 0.02,
                pulseTime: Math.random() * Math.PI * 2,
                connections: [],
                lastPulse: 0
            };
            
            this.neurons.push(neuron);
        }
    }
    
    createConnections() {
        this.connections = [];
        
        this.neurons.forEach(neuron => {
            neuron.connections = [];
            
            // Encontrar neuronas cercanas
            const nearbyNeurons = this.neurons
                .filter(other => other.id !== neuron.id)
                .map(other => ({
                    neuron: other,
                    distance: this.getDistance(neuron, other)
                }))
                .filter(item => item.distance < this.config.connectionDistance)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, this.config.maxConnections);
            
            nearbyNeurons.forEach(({ neuron: other, distance }) => {
                // Evitar conexiones duplicadas
                const connectionExists = this.connections.some(conn => 
                    (conn.from.id === neuron.id && conn.to.id === other.id) ||
                    (conn.from.id === other.id && conn.to.id === neuron.id)
                );
                
                if (!connectionExists) {
                    const connection = {
                        from: neuron,
                        to: other,
                        strength: 1 - (distance / this.config.connectionDistance),
                        pulses: [],
                        lastActivity: 0
                    };
                    
                    this.connections.push(connection);
                    neuron.connections.push(connection);
                    other.connections.push(connection);
                }
            });
        });
    }
    
    updateNeurons(deltaTime) {
        this.neurons.forEach(neuron => {
            // Movimiento suave
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;
            
            // Rebote en los bordes con margen
            const margin = 50;
            if (neuron.x < margin || neuron.x > this.canvas.width - margin) {
                neuron.vx *= -1;
                neuron.x = Math.max(margin, Math.min(this.canvas.width - margin, neuron.x));
            }
            if (neuron.y < margin || neuron.y > this.canvas.height - margin) {
                neuron.vy *= -1;
                neuron.y = Math.max(margin, Math.min(this.canvas.height - margin, neuron.y));
            }
            
            // Actividad neuronal
            neuron.activity += neuron.activitySpeed;
            neuron.pulseTime += 0.1;
            
            // Generar pulsos aleatorios
            if (Math.random() < 0.003 && neuron.connections.length > 0) {
                this.triggerNeuronPulse(neuron);
            }
        });
    }
    
    triggerNeuronPulse(neuron) {
        neuron.lastPulse = Date.now();
        
        // Enviar pulsos por las conexiones
        neuron.connections.forEach(connection => {
            if (connection.from.id === neuron.id) {
                const pulse = {
                    position: 0,
                    speed: 0.02 + Math.random() * 0.01,
                    intensity: 0.5 + Math.random() * 0.5,
                    startTime: Date.now()
                };
                connection.pulses.push(pulse);
            }
        });
    }
    
    updateConnections(deltaTime) {
        this.connections.forEach(connection => {
            // Actualizar distancia dinámicamente
            connection.distance = this.getDistance(connection.from, connection.to);
            connection.strength = Math.max(0, 1 - (connection.distance / this.config.connectionDistance));
            
            // Actualizar pulsos
            connection.pulses = connection.pulses.filter(pulse => {
                pulse.position += pulse.speed;
                
                // Cuando el pulso llega al destino
                if (pulse.position >= 1) {
                    // Activar la neurona destino
                    connection.to.activity = Math.min(1, connection.to.activity + 0.3);
                    
                    // Posibilidad de propagar el pulso
                    if (Math.random() < 0.4) {
                        setTimeout(() => this.triggerNeuronPulse(connection.to), 100);
                    }
                    
                    return false; // Remover pulso
                }
                
                return pulse.position < 1;
            });
        });
    }
    
    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar conexiones
        this.renderConnections();
        
        // Renderizar neuronas
        this.renderNeurons();
        
        // Renderizar pulsos
        this.renderPulses();
    }
    
    renderConnections() {
        this.connections.forEach(connection => {
            if (connection.strength <= 0) return;
            
            const opacity = connection.strength * 0.6;
            const gradient = this.ctx.createLinearGradient(
                connection.from.x, connection.from.y,
                connection.to.x, connection.to.y
            );
            
            gradient.addColorStop(0, `rgba(228, 205, 133, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(228, 205, 133, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(228, 205, 133, ${opacity})`);
            
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = this.config.sizes.connection * connection.strength;
            this.ctx.stroke();
        });
    }
    
    renderNeurons() {
        this.neurons.forEach(neuron => {
            const now = Date.now();
            const timeSincePulse = now - neuron.lastPulse;
            const pulseGlow = Math.max(0, 1 - (timeSincePulse / 1000)) * 0.5;
            
            // Actividad base + glow por pulso
            const activity = Math.sin(neuron.activity) * 0.3 + 0.7 + pulseGlow;
            const size = neuron.size * (0.8 + activity * 0.4);
            const opacity = 0.6 + activity * 0.4;
            
            // Glow exterior
            const glowGradient = this.ctx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, size * 3
            );
            glowGradient.addColorStop(0, `rgba(228, 205, 133, ${opacity * 0.8})`);
            glowGradient.addColorStop(0.3, `rgba(228, 205, 133, ${opacity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(228, 205, 133, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            // Núcleo de la neurona
            const coreGradient = this.ctx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, size
            );
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            coreGradient.addColorStop(0.5, `rgba(228, 205, 133, ${opacity})`);
            coreGradient.addColorStop(1, `rgba(192, 138, 45, ${opacity * 0.8})`);
            
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = coreGradient;
            this.ctx.fill();
            
            // Borde brillante
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }
    
    renderPulses() {
        this.connections.forEach(connection => {
            connection.pulses.forEach(pulse => {
                const x = connection.from.x + (connection.to.x - connection.from.x) * pulse.position;
                const y = connection.from.y + (connection.to.y - connection.from.y) * pulse.position;
                
                // Efecto de estela
                const trailLength = 0.1;
                const trailStart = Math.max(0, pulse.position - trailLength);
                
                for (let i = 0; i < 5; i++) {
                    const trailPos = trailStart + (pulse.position - trailStart) * (i / 4);
                    const trailX = connection.from.x + (connection.to.x - connection.from.x) * trailPos;
                    const trailY = connection.from.y + (connection.to.y - connection.from.y) * trailPos;
                    const trailOpacity = pulse.intensity * (i / 4) * 0.3;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(trailX, trailY, this.config.sizes.pulse * (i / 4), 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity})`;
                    this.ctx.fill();
                }
                
                // Pulso principal
                const pulseGradient = this.ctx.createRadialGradient(
                    x, y, 0,
                    x, y, this.config.sizes.pulse * 2
                );
                pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${pulse.intensity})`);
                pulseGradient.addColorStop(0.5, `rgba(228, 205, 133, ${pulse.intensity * 0.7})`);
                pulseGradient.addColorStop(1, 'rgba(228, 205, 133, 0)');
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.config.sizes.pulse * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = pulseGradient;
                this.ctx.fill();
                
                // Núcleo brillante
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.config.sizes.pulse, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse.intensity})`;
                this.ctx.fill();
            });
        });
    }
    
    animate() {
        const deltaTime = 16; // ~60 FPS
        
        this.updateNeurons(deltaTime);
        this.updateConnections(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        this.animate();
        
        // Regenerar conexiones periódicamente
        setInterval(() => {
            this.createConnections();
        }, 10000);
        
        // Pulsos aleatorios para mantener actividad
        setInterval(() => {
            if (Math.random() < 0.3) {
                const randomNeuron = this.neurons[Math.floor(Math.random() * this.neurons.length)];
                this.triggerNeuronPulse(randomNeuron);
            }
        }, 2000);
    }
    
    setupEventListeners() {
        // Redimensionar canvas
        const resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
            this.createConnections(); // Recalcular conexiones
        });
        resizeObserver.observe(this.container);
        
        // Interacción con mouse
        if (!this.isMobile()) {
            this.setupMouseInteraction();
        }
        
        // Pausar animación cuando no está visible
        this.setupVisibilityControl();
    }
    
    setupMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;
        let isMouseNear = false;
        
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseNear = true;
            
            // Activar neuronas cercanas al mouse
            this.neurons.forEach(neuron => {
                const distance = Math.sqrt(
                    Math.pow(mouseX - neuron.x, 2) + Math.pow(mouseY - neuron.y, 2)
                );
                
                if (distance < 100) {
                    neuron.activity = Math.min(1, neuron.activity + 0.05);
                    
                    // Activar pulsos ocasionalmente
                    if (Math.random() < 0.02) {
                        this.triggerNeuronPulse(neuron);
                    }
                }
            });
        });
        
        this.container.addEventListener('mouseleave', () => {
            isMouseNear = false;
        });
    }
    
    setupVisibilityControl() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!this.animationId) {
                        this.startAnimation();
                    }
                } else {
                    if (this.animationId) {
                        cancelAnimationFrame(this.animationId);
                        this.animationId = null;
                    }
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(this.container);
    }
    
    // Métodos auxiliares
    getDistance(neuron1, neuron2) {
        return Math.sqrt(
            Math.pow(neuron2.x - neuron1.x, 2) + 
            Math.pow(neuron2.y - neuron1.y, 2)
        );
    }
    
    isMobile() {
        return window.innerWidth < 768;
    }
    
    // Controles públicos
    increaseActivity() {
        this.neurons.forEach(neuron => {
            neuron.activity = Math.min(1, neuron.activity + 0.2);
        });
        
        // Disparar varios pulsos
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const randomNeuron = this.neurons[Math.floor(Math.random() * this.neurons.length)];
                this.triggerNeuronPulse(randomNeuron);
            }, i * 200);
        }
    }
    
    setIntensity(intensity) {
        this.config.neuronSpeed = 0.2 * intensity;
        this.config.pulseSpeed = 2 * intensity;
        
        this.neurons.forEach(neuron => {
            neuron.activitySpeed = (0.01 + Math.random() * 0.02) * intensity;
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const heroNetwork = new NeuralNetworkAnimation('networkBg');
    
    // Controlar intensidad basada en scroll
    let lastScrollY = 0;
    const handleScroll = () => {
        const scrollY = window.pageYOffset;
        const scrollSpeed = Math.abs(scrollY - lastScrollY);
        
        if (scrollSpeed > 5) {
            heroNetwork.increaseActivity();
        }
        
        lastScrollY = scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Aumentar actividad en elementos importantes
    document.addEventListener('click', (e) => {
        if (e.target.matches('.glass-button-gold, .cta-button')) {
            heroNetwork.increaseActivity();
        }
    });
    
    // Exponer globalmente
    window.NeuralNetworkAnimation = NeuralNetworkAnimation;
    window.heroNetwork = heroNetwork;
});

// Optimizaciones para rendimiento
if ('requestIdleCallback' in window) {
    // Usar tiempo idle para optimizaciones no críticas
    requestIdleCallback(() => {
        console.log('🧠 Neural network optimized for performance');
    });
}