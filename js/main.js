       // ===============================================
        // STRIPE CHECKOUT CONFIGURATION
        // ¡ACTUALIZA ESTOS VALORES CON TUS DATOS REALES!
        // ===============================================
        
        const STRIPE_CONFIG = {
            basic: {
                priceId: 'price_TU_PRICE_ID_BASICO',  // 🔥 ACTUALIZAR con tu Price ID real
                amount: 55,
                name: 'DTMM Plan Básico'
            },
            pro: {
                priceId: 'price_TU_PRICE_ID_PRO',     // 🔥 ACTUALIZAR con tu Price ID real
                amount: 110,
                name: 'DTMM Plan Pro'
            }
        };
        
        // 🔥 ACTUALIZAR con tu clave pública de Stripe
        const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_PUBLICA_AQUI';
        
        // ===============================================
        // MAIN LANDING CLASS
        // ===============================================
        
        class OptimizedLanding {
            constructor() {
                this.init();
            }
            
            init() {
                this.setupScrollAnimations();
                this.setupSmoothScroll();
                this.setupUrgencyUpdates();
            }
            
            // Reveal animations
            setupScrollAnimations() {
                const revealElements = () => {
                    const elements = document.querySelectorAll('.reveal-text, .reveal-card');
                    
                    elements.forEach((element, index) => {
                        const elementTop = element.getBoundingClientRect().top;
                        const elementVisible = 150;
                        
                        if (elementTop < window.innerHeight - elementVisible) {
                            setTimeout(() => {
                                element.classList.add('revealed');
                            }, index * 100);
                        }
                    });
                };
                
                revealElements();
                window.addEventListener('scroll', revealElements, { passive: true });
                
                // Force reveal after 2s
                setTimeout(() => {
                    document.querySelectorAll('.reveal-text:not(.revealed), .reveal-card:not(.revealed)').forEach((el, index) => {
                        setTimeout(() => el.classList.add('revealed'), index * 50);
                    });
                }, 2000);
            }
            
            // Smooth scroll for anchor links
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
            
            // Update urgency counters
            setupUrgencyUpdates() {
                // Simular countdown de lugares (opcional)
                const updateSpots = () => {
                    const now = new Date();
                    const baseSpots = 40;
                    const daysSinceLaunch = Math.floor((now - new Date('2025-08-12')) / (1000 * 60 * 60 * 24));
                    const spotsLeft = Math.max(0, baseSpots - Math.floor(daysSinceLaunch * 2.3) - Math.floor(Math.random() * 3));
                    
                    const urgencyElements = document.querySelectorAll('[data-update="spots"]');
                    urgencyElements.forEach(el => {
                        el.textContent = `${spotsLeft} lugares restantes`;
                    });
                };
                
                updateSpots();
                setInterval(updateSpots, 300000); // Update every 5 minutes
            }
        }
        
        // ===============================================
        // CHECKOUT FUNCTION
        // ===============================================
        
        async function checkout(plan) {
            const config = STRIPE_CONFIG[plan];
            
            if (!config) {
                console.error('Plan no encontrado:', plan);
                alert('Error: Plan no válido');
                return;
            }
            
            // Track analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: 'USD',
                    value: config.amount,
                    items: [{
                        item_id: plan,
                        item_name: config.name,
                        price: config.amount,
                        quantity: 1
                    }]
                });
            }
            
            // Development mode - show test modal
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('github.io')) {
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-void-medium p-8 rounded-lg max-w-md mx-4 text-center">
                        <h3 class="text-xl font-bold text-gold-light mb-4">🚀 Modo Desarrollo</h3>
                        <p class="text-white/80 mb-4">
                            <strong>Plan:</strong> ${config.name}<br>
                            <strong>Precio:</strong> $${config.amount} USD<br>
                            <strong>Price ID:</strong> ${config.priceId}
                        </p>
                        <p class="text-white/60 text-sm mb-6">
                            En producción, esto redirigirá a Stripe Checkout
                        </p>
                        <button onclick="this.parentElement.parentElement.remove()" 
                                class="btn-primary px-6 py-2 rounded-lg">
                            Cerrar
                        </button>
                    </div>
                `;
                document.body.appendChild(modal);
                return;
            }
            
            // Production mode - redirect to Stripe
            if (!STRIPE_PUBLIC_KEY || STRIPE_PUBLIC_KEY.includes('TU_CLAVE')) {
                alert('Error: Stripe no configurado. Contacta al administrador.');
                return;
            }
            
            const stripe = Stripe(STRIPE_PUBLIC_KEY);
            
            try {
                const { error } = await stripe.redirectToCheckout({
                    lineItems: [{
                        price: config.priceId,
                        quantity: 1,
                    }],
                    mode: 'payment',
                    successUrl: `${window.location.origin}/thanks.html?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${window.location.origin}/#planes`,
                    customerEmail: null,
                    billingAddressCollection: 'auto',
                    allowPromotionCodes: false,
                });
                
                if (error) {
                    console.error('Error en checkout:', error);
                    alert('Error al procesar el pago. Por favor, inténtalo de nuevo o contacta soporte.');
                }
            } catch (err) {
                console.error('Error de Stripe:', err);
                // Fallback: redirect to Payment Link
                const fallbackUrls = {
                    basic: 'https://buy.stripe.com/TU_LINK_BASICO',  // 🔥 ACTUALIZAR
                    pro: 'https://buy.stripe.com/TU_LINK_PRO'       // 🔥 ACTUALIZAR
                };
                
                if (fallbackUrls[plan]) {
                    window.location.href = fallbackUrls[plan];
                } else {
                    alert('Error de conexión. Por favor, inténtalo más tarde o contacta soporte.');
                }
            }
        }
        
        // ===============================================
        // INITIALIZATION
        // ===============================================
        
        document.addEventListener('DOMContentLoaded', () => {
            new OptimizedLanding();
            console.log('🚀 DTMM Landing optimizada cargada!');
            
            // Check if coming from a specific source
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('utm_source');
            const medium = urlParams.get('utm_medium');
            
            if (source && typeof gtag !== 'undefined') {
                gtag('event', 'page_view_source', {
                    source: source,
                    medium: medium || 'unknown'
                });
            }
        });
        
        // ===============================================
        // ADDITIONAL INTERACTIONS
        // ===============================================
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track milestone scrolls
                if ([25, 50, 75, 90].includes(scrollPercent) && typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        percent: scrollPercent
                    });
                }
            }
        }, { passive: true });
        
        // Track FAQ interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('details summary')) {
                const faqText = e.target.textContent.substring(0, 50);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'faq_interaction', {
                        question: faqText
                    });
                }
            }
        });
        
        // Track plan comparisons (hover on pricing cards)
        let planHoverTimer = null;
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.glass-card') && e.target.closest('#planes')) {
                const planType = e.target.textContent.includes('Pro') ? 'pro' : 'basic';
                
                planHoverTimer = setTimeout(() => {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'plan_consideration', {
                            plan: planType,
                            duration: 'long_hover'
                        });
                    }
                }, 3000);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            if (planHoverTimer) {
                clearTimeout(planHoverTimer);
                planHoverTimer = null;
            }
        }, true);