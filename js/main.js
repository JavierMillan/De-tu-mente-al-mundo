// ===============================================
// MAIN SCRIPT - Funcionalidades principales
// Maneja animaciones de scroll, smooth scroll y efectos generales
// ===============================================

class BootcampLanding {
    constructor() {
        this.isLoaded = false;
        this.observers = [];
        
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupSmoothScroll();
        this.setupScrollEffects();
        this.setupLazyEffects();
        
        // Debug: Log reveal elements
        const revealElements = document.querySelectorAll('.reveal-text, .reveal-card');
        console.log(`Found ${revealElements.length} elements to reveal`);
        
        // Mark as loaded
        this.isLoaded = true;
        document.body.classList.add('loaded');
    }
    
    // ===============================================
    // SCROLL ANIMATIONS - Reveal elements on scroll
    // ===============================================
    setupScrollAnimations() {
        // Simple and reliable reveal function
        const revealElements = () => {
            const elements = document.querySelectorAll('.reveal-text, .reveal-card');
            
            elements.forEach((element, index) => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    // Add stagger delay
                    setTimeout(() => {
                        element.classList.add('revealed');
                    }, index * 100);
                }
            });
        };
        
        // Initial check
        revealElements();
        
        // Check on scroll
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    revealElements();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Fallback: Force reveal all elements after 2 seconds if nothing happened
        setTimeout(() => {
            const hiddenElements = document.querySelectorAll('.reveal-text:not(.revealed), .reveal-card:not(.revealed)');
            if (hiddenElements.length > 0) {
                console.log(`Force revealing ${hiddenElements.length} elements`);
                hiddenElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, index * 50);
                });
            }
        }, 2000);
    }
    
    // ===============================================
    // SMOOTH SCROLL - Para navigation anchors
    // ===============================================
    setupSmoothScroll() {
        document.addEventListener('click', (e) => {
            // Handle anchor links
            if (e.target.matches('a[href^="#"]') || e.target.closest('a[href^="#"]')) {
                const link = e.target.matches('a[href^="#"]') ? e.target : e.target.closest('a[href^="#"]');
                const href = link.getAttribute('href');
                
                if (href && href.length > 1) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                }
            }
        });
    }
    
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for any fixed header
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
    
    // ===============================================
    // SCROLL EFFECTS - Parallax and other effects
    // ===============================================
    setupScrollEffects() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // Hero parallax effect
            const hero = document.querySelector('section:first-of-type');
            if (hero) {
                const heroRect = hero.getBoundingClientRect();
                if (heroRect.bottom > 0) {
                    const parallaxSpeed = scrollY * 0.3;
                    const networkBg = document.getElementById('networkBg');
                    if (networkBg) {
                        networkBg.style.transform = `translateY(${parallaxSpeed}px)`;
                    }
                }
            }
            
            // Update navigation highlight
            this.updateActiveNavigation();
            
            // Add scroll classes for styling
            if (scrollY > 100) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
            
            ticking = false;
        };
        
        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    }
    
    // ===============================================
    // LAZY EFFECTS - Performance optimizations
    // ===============================================
    setupLazyEffects() {
        // Intersection observer for heavy animations
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Enable heavy animations only when visible
                    entry.target.classList.add('animate-enabled');
                } else {
                    // Disable when not visible to save resources
                    entry.target.classList.remove('animate-enabled');
                }
            });
        }, {
            threshold: 0,
            rootMargin: '100px'
        });
        
        // Apply to elements with heavy animations
        document.querySelectorAll('.glass-card-hover, .package-card').forEach(el => {
            lazyObserver.observe(el);
        });
        
        this.observers.push(lazyObserver);
    }
    
    // ===============================================
    // NAVIGATION HIGHLIGHTING
    // ===============================================
    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 200;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos <= bottom) {
                // Update any navigation highlights here
                document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
                    link.classList.add('active');
                });
            } else {
                document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
                    link.classList.remove('active');
                });
            }
        });
    }
    
    // ===============================================
    // UTILITY METHODS
    // ===============================================
    
    // Add magical sparkle effect to elements
    addSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.style.position = 'absolute';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#e4cd85';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'sparkle 1.5s ease-out forwards';
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1500);
    }
    
    // Throttle function for performance
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Clean up observers (useful for SPA navigation)
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
    }
}

// ===============================================
// PACKAGE INTERACTIONS
// ===============================================
class PackageInteractions {
    constructor() {
        this.setupPackageHovers();
        this.setupPackageClicks();
    }
    
    setupPackageHovers() {
        document.querySelectorAll('.package-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightPackage(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.unhighlightPackage(card);
            });
        });
    }
    
    setupPackageClicks() {
        document.querySelectorAll('.package-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.package-card');
                const packageName = card.querySelector('h3').textContent;
                
                // Scroll to form
                document.querySelector('#descubrir').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Add some visual feedback
                this.addSparkleToButton(e.target);
            });
        });
    }
    
    highlightPackage(card) {
        // Add sparkle effects to popular package
        if (card.classList.contains('package-popular')) {
            const sparkleCount = 3;
            for (let i = 0; i < sparkleCount; i++) {
                setTimeout(() => {
                    this.addSparkleEffect(card);
                }, i * 200);
            }
        }
    }
    
    unhighlightPackage(card) {
        // Remove any temporary effects
        card.querySelectorAll('.sparkle-effect').forEach(sparkle => {
            sparkle.remove();
        });
    }
    
    addSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, #e4cd85 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
            animation: sparkleFloat 2s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
    }
    
    addSparkleToButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 0;
            height: 0;
            background: rgba(228, 205, 133, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
}

// ===============================================
// CSS ANIMATIONS - Add to head
// ===============================================
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkle {
            0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) rotate(360deg);
            }
        }
        
        @keyframes sparkleFloat {
            0% {
                opacity: 0;
                transform: translateY(0) scale(0);
            }
            20% {
                opacity: 1;
                transform: translateY(-10px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-30px) scale(0);
            }
        }
        
        @keyframes ripple {
            0% {
                width: 0;
                height: 0;
                opacity: 0.5;
            }
            100% {
                width: 100px;
                height: 100px;
                opacity: 0;
            }
        }
        
        .loaded .animate-fadeInUp {
            animation-play-state: running;
        }
        
        .scrolled .glass-card {
            backdrop-filter: blur(25px);
        }
    `;
    
    document.head.appendChild(style);
}

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // Add custom animations
    addCustomAnimations();
    
    // Initialize main functionality
    const bootcampLanding = new BootcampLanding();
    const packageInteractions = new PackageInteractions();
    
    // Expose globally for debugging
    window.BootcampLanding = bootcampLanding;
    window.PackageInteractions = packageInteractions;
    
    // Initialize any additional features
    initializeCountdown();
    initializeTypewriter();
});

// ===============================================
// ADDITIONAL FEATURES
// ===============================================

// Countdown timer for urgency
function initializeCountdown() {
    const countdownElements = document.querySelectorAll('[data-countdown]');
    
    countdownElements.forEach(element => {
        const endTime = new Date().getTime() + (48 * 60 * 60 * 1000); // 48 hours from now
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            if (distance > 0) {
                element.textContent = `${hours}h ${minutes}m restantes`;
            } else {
                element.textContent = 'Oferta expirada';
                element.classList.add('text-red-400');
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    });
}

// Typewriter effect for hero subtitle
function initializeTypewriter() {
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        const speed = parseInt(element.dataset.typewriter) || 50;
        
        element.textContent = '';
        element.style.borderRight = '2px solid #e4cd85';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Remove cursor after typing
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Start typing after a delay
        setTimeout(typeWriter, 1000);
    });
}

// ===============================================
// PERFORMANCE OPTIMIZATION
// ===============================================

// Lazy load images when they enter viewport
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'css/styles.css',
        // Add other critical resources
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// ===============================================
// ERROR HANDLING & FALLBACKS
// ===============================================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // You could send this to your analytics
    // sendErrorToAnalytics(e.error);
});

// Fallback for older browsers
function checkBrowserSupport() {
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        customProperties: CSS.supports('color', 'var(--test)'),
        gridLayout: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex')
    };
    
    const unsupportedFeatures = Object.entries(features)
        .filter(([feature, supported]) => !supported)
        .map(([feature]) => feature);
    
    if (unsupportedFeatures.length > 0) {
        console.warn('Unsupported features:', unsupportedFeatures);
        document.body.classList.add('legacy-browser');
        
        // Add fallback styles
        const fallbackStyle = document.createElement('style');
        fallbackStyle.textContent = `
            .legacy-browser .glass-card {
                background: rgba(22, 51, 132, 0.8);
                border: 1px solid rgba(228, 205, 133, 0.3);
            }
            .legacy-browser .reveal-text,
            .legacy-browser .reveal-card {
                opacity: 1;
                transform: none;
            }
        `;
        document.head.appendChild(fallbackStyle);
    }
}

// ===============================================
// ANALYTICS & TRACKING
// ===============================================

// Track user interactions for optimization
function trackUserBehavior() {
    // Track scroll depth
    let maxScroll = 0;
    const trackScrollDepth = () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestones
            if ([25, 50, 75, 90].includes(scrollPercent)) {
                // Send to analytics
                console.log(`Scroll depth: ${scrollPercent}%`);
            }
        }
    };
    
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    // Track form interactions
    document.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            console.log(`Form interaction: ${e.target.name} = ${e.target.value}`);
        }
    });
    
    // Track button clicks
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .cta-button, .glass-button-gold')) {
            const buttonText = e.target.textContent.trim();
            console.log(`Button clicked: ${buttonText}`);
        }
    });
}

// ===============================================
// ACCESSIBILITY IMPROVEMENTS
// ===============================================

function setupAccessibility() {
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#descubrir';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gold-light text-void-deep px-4 py-2 rounded';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Improve focus management
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('#resultsSection:not(.hidden)');
            if (modal) {
                document.getElementById('closeResults')?.click();
            }
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            document.body.classList.add('using-keyboard');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('using-keyboard');
    });
    
    // Add ARIA labels to interactive elements
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
        const text = button.textContent.trim();
        if (text) {
            button.setAttribute('aria-label', text);
        }
    });
}

// ===============================================
// MOBILE OPTIMIZATIONS
// ===============================================

function setupMobileOptimizations() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // Reduce animation intensity on mobile
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device .glass-card:hover {
                transform: translateY(-2px);
            }
            .mobile-device .package-card:hover {
                transform: translateY(-4px) scale(1.01);
            }
            .mobile-device .network-node {
                animation-duration: 4s;
            }
        `;
        document.head.appendChild(style);
        
        // Optimize touch interactions
        document.addEventListener('touchstart', () => {}, { passive: true });
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
}

// Make functions global for onclick handlers (definir antes del DOMContentLoaded)
window.openModal = function(type) {
    const modal = document.getElementById('legalModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    if (legalContent[type]) {
        title.textContent = legalContent[type].title;
        content.innerHTML = legalContent[type].content;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeLegalModal = function() {
    const modal = document.getElementById('legalModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// ===============================================
// FINAL INITIALIZATION
// ===============================================

// Wait for everything to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check browser support
    checkBrowserSupport();
    
    // Setup additional features
    setupLazyLoading();
    setupAccessibility();
    setupMobileOptimizations();
    
    // Start tracking (in production, you'd check for consent first)
    if (location.hostname !== 'localhost') {
        trackUserBehavior();
    }
    
    // Preload resources
    preloadCriticalResources();
    
    console.log('🚀 Bootcamp landing page initialized successfully!');
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for use in other modules
export { BootcampLanding, PackageInteractions };

// ===============================================
// LEGAL MODALS SYSTEM
// ===============================================

const legalContent = {
    terms: {
        title: "Términos y Condiciones",
        content: `
            <h4 class="text-lg font-semibold text-gold-light mb-3">1. Aceptación de Términos</h4>
            <p class="mb-4">Al inscribirte al bootcamp "De tu mente al mundo", aceptas estos términos y condiciones en su totalidad.</p>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">2. Naturaleza del Servicio</h4>
            <p class="mb-4">Este es un bootcamp educativo que enseña habilidades técnicas para crear páginas web. <strong>No garantizamos resultados económicos específicos</strong>, ya que estos dependen de múltiples factores incluyendo:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Tu nivel de implementación de lo aprendido</li>
                <li>Tu esfuerzo personal en promocionar tus servicios</li>
                <li>Las condiciones del mercado en tu área</li>
                <li>Tu capacidad para aplicar estrategias de marketing</li>
                <li>Factores externos fuera de nuestro control</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">3. Responsabilidades del Estudiante</h4>
            <p class="mb-4">Para obtener el máximo beneficio:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Debes asistir a las sesiones programadas o ver las grabaciones</li>
                <li>Completar los ejercicios y proyectos asignados</li>
                <li>Implementar activamente lo aprendido</li>
                <li>Hacer preguntas cuando tengas dudas</li>
                <li>Promocionar tus servicios una vez creada tu web</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">4. Política de Reembolsos</h4>
            <p class="mb-4">Ofrecemos reembolso completo durante los primeros 7 días calendario desde la compra, sin preguntas. Después de este período, no hay reembolsos disponibles.</p>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">5. Garantía del Plan Profesional</h4>
            <p class="mb-4">La garantía de mentoría adicional aplica únicamente si demuestras que has:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Completado el 100% del bootcamp</li>
                <li>Creado y publicado tu sitio web</li>
                <li>Implementado las estrategias de captación enseñadas</li>
                <li>Promocionado activamente tus servicios por al menos 60 días</li>
                <li>Proporcionado evidencia documentada de tus esfuerzos</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">6. Limitación de Responsabilidad</h4>
            <p class="mb-4"><strong>La Red de Luz no se hace responsable por:</strong></p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Falta de resultados debido a no implementar lo enseñado</li>
                <li>Pérdidas económicas por decisiones de negocio del estudiante</li>
                <li>Factores del mercado fuera de nuestro control</li>
                <li>Problemas técnicos en plataformas de terceros</li>
            </ul>
            
            <p class="text-sm text-white/60 mt-6">Última actualización: Enero 2025</p>
        `
    },
    privacy: {
        title: "Aviso de Privacidad",
        content: `
            <h4 class="text-lg font-semibold text-gold-light mb-3">Recopilación de Información</h4>
            <p class="mb-4">Recopilamos la siguiente información:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li><strong>Información de contacto:</strong> Nombre, email, WhatsApp</li>
                <li><strong>Información del formulario:</strong> Respuestas a preguntas de calificación</li>
                <li><strong>Información técnica:</strong> Dirección IP, navegador, dispositivo</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Uso de la Información</h4>
            <p class="mb-4">Utilizamos tu información para:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Proporcionar el servicio educativo contratado</li>
                <li>Enviar comunicaciones relacionadas con el bootcamp</li>
                <li>Ofrecer soporte técnico y educativo</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Compartir Información</h4>
            <p class="mb-4">No vendemos, alquilamos o compartimos tu información personal con terceros para fines comerciales.</p>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Tus Derechos</h4>
            <p class="mb-4">Puedes solicitar:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Acceso a tu información personal</li>
                <li>Corrección de datos inexactos</li>
                <li>Eliminación de tu información</li>
                <li>Portabilidad de tus datos</li>
            </ul>
            
            <p class="mb-4">Para ejercer estos derechos, contacta: <a href="mailto:hola@lareddeluz.com" class="text-gold-light hover:underline">hola@lareddeluz.com</a></p>
            
            <p class="text-sm text-white/60 mt-6">Última actualización: Enero 2025</p>
        `
    },
    guarantee: {
        title: "Política de Garantías",
        content: `
            <h4 class="text-lg font-semibold text-gold-light mb-3">Garantía de Satisfacción (7 días)</h4>
            <p class="mb-4">Todos los planes incluyen garantía de reembolso completo durante los primeros <strong>7 días calendario</strong> desde la compra.</p>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Garantía Especial del Plan Profesional</h4>
            <p class="mb-4">Ofrecemos mentoría adicional si no recuperas $5,000 MXN en 90 días, <strong>únicamente si cumples todos estos requisitos:</strong></p>
            
            <div class="bg-gold-light/10 border border-gold-light/20 rounded-lg p-4 mb-4">
                <h5 class="font-semibold text-gold-light mb-2">Requisitos Obligatorios:</h5>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Asistir al 100% de las sesiones o ver todas las grabaciones</li>
                    <li>Completar todos los ejercicios y proyectos asignados</li>
                    <li>Crear y publicar tu sitio web funcional</li>
                    <li>Implementar todas las estrategias de captación enseñadas</li>
                    <li>Promocionar activamente tus servicios por mínimo 60 días continuos</li>
                    <li>Documentar tus esfuerzos de marketing con evidencia</li>
                    <li>Participar en al menos 8 de las 12 mentorías grupales mensuales</li>
                </ul>
            </div>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Evidencia Requerida</h4>
            <p class="mb-4">Para aplicar a la garantía debes proporcionar:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Screenshots de tu sitio web publicado y funcionando</li>
                <li>Registro de actividades de marketing realizadas</li>
                <li>Capturas de promociones en redes sociales, emails, etc.</li>
                <li>Evidencia de contactos comerciales realizados</li>
                <li>Cualquier feedback de clientes potenciales</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-gold-light mb-3">Exclusiones de la Garantía</h4>
            <p class="mb-4"><strong>La garantía NO aplica si:</strong></p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>No completas el bootcamp</li>
                <li>No implementas las estrategias enseñadas</li>
                <li>No promocionas activamente tus servicios</li>
                <li>Factores del mercado fuera de nuestro control afectan tus resultados</li>
                <li>No proporcionas la evidencia requerida</li>
                <li>Has solicitado reembolso previamente</li>
            </ul>
            
            <div class="bg-red-900/20 border border-red-400/20 rounded-lg p-4 mt-6">
                <h5 class="font-semibold text-red-300 mb-2">⚠️ Advertencia Importante</h5>
                <p class="text-sm">Los resultados económicos dependen de múltiples factores incluyendo tu esfuerzo, mercado local, competencia, y factores económicos externos. <strong>No podemos garantizar resultados si no hay implementación activa de tu parte.</strong></p>
            </div>
            
            <p class="text-sm text-white/60 mt-6">Para más información: <a href="mailto:hola@lareddeluz.com" class="text-gold-light hover:underline">hola@lareddeluz.com</a></p>
        `
    }
};

// Export for use in other modules
export { BootcampLanding, PackageInteractions };