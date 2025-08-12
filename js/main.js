
        // ===============================================
        // STRIPE CONFIGURATION
        // ¡ACTUALIZA ESTOS VALORES!
        // ===============================================
        
        const STRIPE_CONFIG = {
            priceId: 'price_TU_PRICE_ID_DTMM',  // 🔥 ACTUALIZAR con tu Price ID real ($1,000 MXN)
            amount: 1000,
            currency: 'MXN',
            name: 'DTMM - De tu Mente al Mundo'
        };
        
        // 🔥 ACTUALIZAR con tu clave pública de Stripe
        const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_PUBLICA_AQUI';
        
        // ===============================================
        // PREMIUM LANDING CLASS
        // ===============================================
        
        class PremiumLanding {
            constructor() {
                this.init();
            }
            
            init() {
                this.setupScrollAnimations();
                this.setupSmoothScroll();
                this.setupInteractions();
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
                
                // Force reveal after 2s
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
            
            setupInteractions() {
                // Enhanced FAQ interactions
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

                // Track scroll depth
                let maxScroll = 0;
                window.addEventListener('scroll', () => {
                    const scrollPercent = Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100);
                    if (scrollPercent > maxScroll) {
                        maxScroll = scrollPercent;
                        
                        if ([25, 50, 75, 90].includes(scrollPercent) && typeof gtag !== 'undefined') {
                            gtag('event', 'scroll_depth', {
                                percent: scrollPercent
                            });
                        }
                    }
                }, { passive: true });
            }
        }
        
        // ===============================================
        // CHECKOUT FUNCTION
        // ===============================================
        
        async function checkout() {
            // Track checkout attempt
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: STRIPE_CONFIG.currency,
                    value: STRIPE_CONFIG.amount,
                    items: [{
                        item_id: 'dtmm',
                        item_name: STRIPE_CONFIG.name,
                        price: STRIPE_CONFIG.amount,
                        quantity: 1
                    }]
                });
            }
            
            // Development mode
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('github.io')) {
                
                showDevModal();
                return;
            }
            
            // Production mode
            if (!STRIPE_PUBLIC_KEY || STRIPE_PUBLIC_KEY.includes('TU_CLAVE')) {
                alert('Error: Configuración de pagos pendiente. Contacta soporte.');
                return;
            }
            
            const stripe = Stripe(STRIPE_PUBLIC_KEY);
            
            try {
                const { error } = await stripe.redirectToCheckout({
                    lineItems: [{
                        price: STRIPE_CONFIG.priceId,
                        quantity: 1,
                    }],
                    mode: 'payment',
                    successUrl: `${window.location.origin}/thanks.html?plan=dtmm&session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${window.location.origin}/#plan`,
                    customerEmail: null,
                    billingAddressCollection: 'auto',
                    locale: 'es',
                });
                
                if (error) {
                    console.error('Error en checkout:', error);
                    alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
                }
            } catch (err) {
                console.error('Error de Stripe:', err);
                // Fallback to Payment Link
                const fallbackUrl = 'https://buy.stripe.com/TU_PAYMENT_LINK_DTMM'; // 🔥 ACTUALIZAR
                if (fallbackUrl.includes('TU_PAYMENT')) {
                    alert('Error de configuración. Contacta soporte: hola@lareddeluz.com');
                } else {
                    window.location.href = fallbackUrl;
                }
            }
        }
        
        function showDevModal() {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="bg-void-medium p-8 rounded-2xl max-w-md mx-4 text-center border border-gold-light/20">
                    <div class="text-4xl mb-4">🚀</div>
                    <h3 class="text-2xl font-bold text-gold-light mb-4">Modo Desarrollo</h3>
                    <div class="text-left mb-6 space-y-2">
                        <p class="text-white/80"><strong>Programa:</strong> ${STRIPE_CONFIG.name}</p>
                        <p class="text-white/80"><strong>Precio:</strong> ${STRIPE_CONFIG.amount} ${STRIPE_CONFIG.currency}</p>
                        <p class="text-white/80"><strong>Price ID:</strong> ${STRIPE_CONFIG.priceId}</p>
                    </div>
                    <p class="text-white/60 text-sm mb-6">
                        En producción, esto redirigirá a Stripe Checkout con pagos reales.
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="glass-button-gold text-void-deep px-6 py-3 rounded-lg font-semibold">
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
            console.log('✨ DTMM Premium Landing cargada!');
            
            // URL tracking
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('utm_source');
            if (source && typeof gtag !== 'undefined') {
                gtag('event', 'page_view_source', {
                    source: source,
                    medium: urlParams.get('utm_medium') || 'unknown'
                });
            }
        });