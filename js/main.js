       // ===============================================
        // SIMPLIFIED MAIN SCRIPT
        // Solo funciones esenciales
        // ===============================================
        
        class MinimalLanding {
            constructor() {
                this.init();
            }
            
            init() {
                this.setupScrollAnimations();
                this.setupSmoothScroll();
            }
            
            // Reveal animations simplificadas
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
                
                // Fallback reveal after 2s
                setTimeout(() => {
                    document.querySelectorAll('.reveal-text:not(.revealed), .reveal-card:not(.revealed)').forEach((el, index) => {
                        setTimeout(() => el.classList.add('revealed'), index * 50);
                    });
                }, 2000);
            }
            
            // Smooth scroll para anchors
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
        // STRIPE CHECKOUT
        // ===============================================
        
        const STRIPE_CONFIG = {
            basic: {
                priceId: 'price_XXXXXXXX', // Tu Price ID de Stripe
                amount: 47
            },
            pro: {
                priceId: 'price_YYYYYYYY', // Tu Price ID de Stripe
                amount: 97
            }
        };
        
        async function checkout(plan) {
            const config = STRIPE_CONFIG[plan];
            
            if (!config) {
                console.error('Plan no encontrado:', plan);
                return;
            }
            
            // Track click
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: 'USD',
                    value: config.amount,
                    items: [{
                        item_id: plan,
                        item_name: `DTMM ${plan}`,
                        price: config.amount,
                        quantity: 1
                    }]
                });
            }
            
            // En desarrollo local
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                alert(`Checkout para: ${plan}\nPrecio: $${config.amount} USD\nPrice ID: ${config.priceId}\n\n¡En producción redirigirá a Stripe!`);
                return;
            }
            
            // En producción - redirigir a Stripe Checkout
            const stripe = Stripe('pk_live_TU_PUBLISHABLE_KEY'); // Tu clave pública
            
            try {
                const { error } = await stripe.redirectToCheckout({
                    lineItems: [{
                        price: config.priceId,
                        quantity: 1,
                    }],
                    mode: 'payment',
                    successUrl: `${window.location.origin}/gracias?plan=${plan}`,
                    cancelUrl: `${window.location.origin}/#planes`,
                });
                
                if (error) {
                    console.error('Error:', error);
                    alert('Error al procesar el pago. Inténtalo de nuevo.');
                }
            } catch (err) {
                console.error('Stripe error:', err);
                // Fallback: redirect a URL directa de Stripe
                window.location.href = `https://buy.stripe.com/TU_PAYMENT_LINK_${plan.toUpperCase()}`;
            }
        }
        
        // ===============================================
        // INITIALIZATION
        // ===============================================
        
        document.addEventListener('DOMContentLoaded', () => {
            new MinimalLanding();
            console.log('🚀 DTMM Minimal Landing loaded!');
        });