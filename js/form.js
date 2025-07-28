// ===============================================
// SMART FORM - Formulario de pre-calificación
// Sistema inteligente de recomendación de paquetes
// ===============================================

class SmartForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6; // 5 preguntas + 1 formulario de contacto
        this.formData = {};
        this.questions = this.getQuestions();
        this.packages = this.getPackages();
        
        this.init();
    }
    
    getQuestions() {
        return [
            {
                id: 'experience',
                title: '¿Cuál es tu nivel de experiencia con tecnología web?',
                options: [
                    {
                        value: 'beginner',
                        title: 'Principiante total',
                        description: 'Nunca he tocado código, solo uso redes sociales',
                        icon: '🌱'
                    },
                    {
                        value: 'basic',
                        title: 'Básico',
                        description: 'He usado WordPress, Wix o herramientas similares',
                        icon: '🔧'
                    },
                    {
                        value: 'intermediate',
                        title: 'Intermedio',
                        description: 'Conozco algo de HTML/CSS pero necesito guía',
                        icon: '💻'
                    }
                ]
            },
            {
                id: 'business',
                title: '¿Cuál es tu situación actual de negocio?',
                options: [
                    {
                        value: 'idea',
                        title: 'Tengo una idea',
                        description: 'Quiero empezar pero aún no tengo clientes',
                        icon: '💡'
                    },
                    {
                        value: 'starting',
                        title: 'Empezando',
                        description: 'Tengo algunos clientes pero de manera informal',
                        icon: '🚀'
                    },
                    {
                        value: 'established',
                        title: 'Negocio establecido',
                        description: 'Tengo clientes regulares pero sin presencia online',
                        icon: '🏢'
                    }
                ]
            },
            {
                id: 'time',
                title: '¿Cuánto tiempo puedes dedicar al bootcamp?',
                options: [
                    {
                        value: 'limited',
                        title: 'Tiempo limitado',
                        description: 'Solo puedo ver las clases grabadas',
                        icon: '⏰'
                    },
                    {
                        value: 'moderate',
                        title: 'Tiempo moderado',
                        description: 'Puedo asistir a algunas sesiones en vivo',
                        icon: '⏳'
                    },
                    {
                        value: 'full',
                        title: 'Tiempo completo',
                        description: 'Puedo asistir a todas las sesiones y participar activamente',
                        icon: '🎯'
                    }
                ]
            },
            {
                id: 'budget',
                title: '¿Cuál es tu presupuesto para invertir en tu presencia online?',
                options: [
                    {
                        value: 'low',
                        title: 'Básico ($47 USD)',
                        description: 'Quiero aprender lo esencial con el mejor precio',
                        icon: '💰'
                    },
                    {
                        value: 'medium',
                        title: 'Profesional ($97 USD)',
                        description: 'Quiero templates, comunidad y soporte adicional',
                        icon: '💎'
                    },
                    {
                        value: 'high',
                        title: 'Premium ($297 USD)',
                        description: 'Quiero mentoría personalizada y garantía de resultados',
                        icon: '👑'
                    }
                ]
            },
            {
                id: 'goal',
                title: '¿Cuál es tu objetivo principal con este bootcamp?',
                options: [
                    {
                        value: 'learn',
                        title: 'Aprender la habilidad',
                        description: 'Quiero saber cómo hacer mi web yo mismo',
                        icon: '📚'
                    },
                    {
                        value: 'business',
                        title: 'Hacer crecer mi negocio',
                        description: 'Necesito más clientes y credibilidad online',
                        icon: '📈'
                    },
                    {
                        value: 'income',
                        title: 'Generar ingresos adicionales',
                        description: 'Quiero ofrecer este servicio a otros',
                        icon: '💸'
                    }
                ]
            }
        ];
    }
    
    getPackages() {
        return {
            fundador: {
                name: "Plan Fundador",
                price: "$47 USD",
                originalPrice: "$67 USD",
                discount: "30% OFF",
                icon: "🥉",
                badge: "ESENCIAL",
                description: "Perfecto para empezar tu transformación digital",
                features: [
                    "5 sesiones en vivo (15 hrs de formación)",
                    "Acceso a grabaciones por 1 año completo",
                    "Hosting gratuito en GitHub Pages para siempre",
                    "2 Ebooks: Fundamentos Web + Layouts CSS",
                    "5 templates HTML/CSS listos para usar",
                    "Material didáctico descargable"
                ],
                suitable: "Ideal si tienes tiempo limitado y presupuesto básico",
                resources: [
                    "📚 Ebook: Fundamentos básicos de la web",
                    "🎨 Ebook: Layouts con CSS",
                    "🗂️ 5 proyectos HTML con diferentes estilos"
                ]
            },
            emprendedor: {
                name: "Plan Emprendedor",
                price: "$97 USD",
                originalPrice: "$139 USD", 
                discount: "30% OFF",
                icon: "🥈",
                badge: "MÁS POPULAR",
                description: "La opción favorita de emprendedores y profesionales",
                features: [
                    "Todo lo del Plan Fundador",
                    "Acceso al GPT especializado en prompts del curso",
                    "Certificado de finalización digital",
                    "Comunidad privada de Discord con roles especiales",
                    "2 sesiones Q&A grupales adicionales",
                    "Soporte prioritario en la comunidad",
                    "Recursos premium descargables"
                ],
                suitable: "Ideal si quieres herramientas avanzadas y soporte de la comunidad",
                resources: [
                    "🤖 GPT especializado para el curso",
                    "🏆 Certificado digital verificable",
                    "👥 Acceso a comunidad premium"
                ]
            },
            profesional: {
                name: "Plan Profesional", 
                price: "$297 USD",
                originalPrice: "$425 USD",
                discount: "30% OFF",
                icon: "🥇",
                badge: "PREMIUM",
                description: "Máximo nivel con mentoría personalizada y soporte 1:1",
                features: [
                    "Todo lo del Plan Emprendedor",
                    "Mentoría grupal mensual por 1 año (12 sesiones)",
                    "1 sesión 1:1 personalizada de 45 minutos para dudas técnicas",
                    "Día 5 INCLUIDO: Configuración de dominio personalizado",
                    "Biblioteca de recursos premium y actualizaciones",
                    "Acceso prioritario a todos mis futuros cursos",
                    "Soporte técnico prioritario en la comunidad"
                ],
                suitable: "Ideal si buscas mentoría personalizada y tienes un negocio establecido",
                resources: [
                    "🎯 Mentoría personalizada 1:1 para aspectos técnicos",
                    "🌐 Configuración de dominio incluida", 
                    "💡 Soporte técnico prioritario"
                ]
            }
        };
    }
    
    init() {
        this.renderForm();
        this.setupEventListeners();
        this.renderCurrentQuestion();
        this.renderPackages();
    }
    
    renderForm() {
        const form = document.getElementById('qualificationForm');
        if (!form) return;
        
        form.innerHTML = `
            <div id="questionsContainer">
                <!-- Questions will be rendered here -->
            </div>
            
            <!-- Contact Info (Step 6) -->
            <div class="question-slide" data-question="6" style="display: none;">
                <h3 class="text-xl font-semibold text-white mb-6">
                    🎯 ¡Último paso! ¿Cómo te contactamos con tu recomendación perfecta?
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gold-light mb-2">Nombre completo *</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 border border-gold-light/30 rounded-lg bg-void-medium/50 text-white focus:ring-2 focus:ring-gold-light focus:border-gold-light backdrop-blur-sm placeholder-white/50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gold-light mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 border border-gold-light/30 rounded-lg bg-void-medium/50 text-white focus:ring-2 focus:ring-gold-light focus:border-gold-light backdrop-blur-sm placeholder-white/50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gold-light mb-2">WhatsApp (opcional)</label>
                        <input type="tel" name="whatsapp" class="w-full px-4 py-3 border border-gold-light/30 rounded-lg bg-void-medium/50 text-white focus:ring-2 focus:ring-gold-light focus:border-gold-light backdrop-blur-sm placeholder-white/50" placeholder="+52 55 1234 5678">
                    </div>
                </div>
            </div>
            
            <!-- Navigation Buttons -->
            <div class="flex justify-between pt-6 border-t border-gold-light/20 mt-8">
                <button type="button" id="prevBtn" class="btn-secondary hidden">
                    ← Anterior
                </button>
                <button type="button" id="nextBtn" class="btn-primary ml-auto">
                    Siguiente →
                </button>
                <button type="submit" id="submitBtn" class="btn-primary ml-auto hidden">
                    🎯 Ver mi recomendación perfecta
                </button>
            </div>
        `;
    }
    
    renderCurrentQuestion() {
        const container = document.getElementById('questionsContainer');
        if (!container) return;
        
        // Clear existing questions
        container.innerHTML = '';
        
        // Render all questions (hidden except current)
        this.questions.forEach((question, index) => {
            const questionIndex = index + 1;
            const isActive = questionIndex === this.currentStep;
            
            const questionDiv = document.createElement('div');
            questionDiv.className = `question-slide ${isActive ? 'active' : ''}`;
            questionDiv.setAttribute('data-question', questionIndex);
            
            questionDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-white mb-6">
                    ${question.title}
                </h3>
                <div class="space-y-3">
                    ${question.options.map(option => `
                        <label class="form-option">
                            <input type="radio" name="${question.id}" value="${option.value}" class="sr-only">
                            <div class="flex items-center">
                                <div class="radio-custom mr-4"></div>
                                <div class="flex items-center flex-1">
                                    <span class="text-2xl mr-3">${option.icon}</span>
                                    <div>
                                        <div class="font-medium text-white">${option.title}</div>
                                        <div class="text-sm text-white/70">${option.description}</div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(questionDiv);
        });
    }
    
    setupEventListeners() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (submitBtn) submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        
        // Auto-advance on radio selection
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' && this.currentStep <= 5) {
                this.formData[e.target.name] = e.target.value;
                
                // Auto advance after short delay (only for questions 1-5)
                if (this.currentStep < 5) {
                    setTimeout(() => {
                        this.nextStep();
                    }, 400);
                }
            }
        });
        
        // Close results modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeResults') {
                this.closeResults();
            }
            if (e.target.id === 'proceedBtn') {
                this.handleProceed();
            }
        });
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateDisplay();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        // Update progress - show step X of 6, but calculate percentage correctly
        let displayStep = this.currentStep;
        let displayTotal = this.totalSteps;
        
        // For steps 1-5, show "Pregunta X de 5"
        // For step 6, show "Paso 6 de 6"
        if (this.currentStep <= 5) {
            document.getElementById('currentQuestion').textContent = this.currentStep;
            document.querySelector('#currentQuestion').parentElement.innerHTML = 
                `Pregunta <span id="currentQuestion">${this.currentStep}</span> de 5`;
        } else {
            document.querySelector('#currentQuestion').parentElement.innerHTML = 
                `Paso <span id="currentQuestion">6</span> de 6`;
        }
        
        const progressPercent = Math.round((this.currentStep / this.totalSteps) * 100);
        document.getElementById('progressPercent').textContent = progressPercent;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
        
        // Show/hide questions
        document.querySelectorAll('.question-slide').forEach(slide => {
            slide.classList.remove('active');
            slide.style.display = 'none';
        });
        
        const currentSlide = document.querySelector(`[data-question="${this.currentStep}"]`);
        if (currentSlide) {
            currentSlide.classList.add('active');
            currentSlide.style.display = 'block';
        }
        
        // Update buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) prevBtn.classList.toggle('hidden', this.currentStep === 1);
        if (nextBtn) nextBtn.classList.toggle('hidden', this.currentStep === this.totalSteps);
        if (submitBtn) submitBtn.classList.toggle('hidden', this.currentStep !== this.totalSteps);
    }
    
    validateCurrentStep() {
        if (this.currentStep <= 5) {
            // Validate radio selection for questions 1-5
            const currentQuestion = this.questions[this.currentStep - 1];
            const selectedValue = this.formData[currentQuestion.id];
            
            if (!selectedValue) {
                this.showError('Por favor selecciona una opción antes de continuar.');
                return false;
            }
        } else if (this.currentStep === 6) {
            // Validate contact form (step 6)
            const name = document.querySelector('input[name="name"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            
            if (!name || !email) {
                this.showError('Por favor completa tu nombre y email.');
                return false;
            }
            
            if (!this.isValidEmail(email)) {
                this.showError('Por favor ingresa un email válido.');
                return false;
            }
        }
        
        return true;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateCurrentStep()) {
            // Collect contact info
            this.formData.name = document.querySelector('input[name="name"]').value.trim();
            this.formData.email = document.querySelector('input[name="email"]').value.trim();
            this.formData.whatsapp = document.querySelector('input[name="whatsapp"]').value.trim();
            
            this.showResults();
        }
    }
    
    calculateRecommendedPlan() {
        let score = 0;
        
        // Experience scoring
        switch (this.formData.experience) {
            case 'beginner': score += 1; break;
            case 'basic': score += 2; break;
            case 'intermediate': score += 3; break;
        }
        
        // Business scoring
        switch (this.formData.business) {
            case 'idea': score += 1; break;
            case 'starting': score += 2; break;
            case 'established': score += 3; break;
        }
        
        // Time scoring
        switch (this.formData.time) {
            case 'limited': score += 1; break;
            case 'moderate': score += 2; break;
            case 'full': score += 3; break;
        }
        
        // Budget scoring (most important factor)
        switch (this.formData.budget) {
            case 'low': score += 1; break;
            case 'medium': score += 3; break;
            case 'high': score += 5; break;
        }
        
        // Goal scoring
        switch (this.formData.goal) {
            case 'learn': score += 1; break;
            case 'business': score += 2; break;
            case 'income': score += 3; break;
        }
        
        // Determine plan based on score and budget preference
        if (this.formData.budget === 'high' || score >= 12) return 'profesional';
        if (this.formData.budget === 'medium' || score >= 8) return 'emprendedor';
        return 'fundador';
    }
    
    showResults() {
        const recommendedPlanKey = this.calculateRecommendedPlan();
        const plan = this.packages[recommendedPlanKey];
        
        const resultsHTML = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-light/30">
                    <span class="text-3xl">${plan.icon}</span>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">¡Perfecto, ${this.formData.name}!</h3>
                <p class="text-white/80">Basado en tus respuestas, este es tu plan ideal:</p>
            </div>
            
            <div class="border-2 border-gold-light/30 rounded-xl p-6 bg-gold-light/5 mb-6 backdrop-blur-sm">
                <div class="text-center mb-4">
                    <div class="inline-block bg-gold-light/20 text-gold-light px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        ${plan.badge}
                    </div>
                    <h4 class="text-2xl font-bold text-white mb-1">${plan.name}</h4>
                    <p class="text-white/70 mb-4">${plan.description}</p>
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <span class="text-3xl font-bold text-gold-light">${plan.price}</span>
                        <span class="text-lg text-white/40 line-through">${plan.originalPrice}</span>
                        <span class="badge-discount">${plan.discount}</span>
                    </div>
                    <p class="text-sm text-gold-light font-medium mb-4">${plan.suitable}</p>
                </div>
                
                <div class="text-left">
                    <h5 class="font-semibold text-white mb-3">✨ Todo lo que incluye:</h5>
                    <ul class="feature-list mb-4">
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    
                    ${plan.resources ? `
                        <h5 class="font-semibold text-gold-light mb-2">🎁 Recursos especiales:</h5>
                        <ul class="feature-list text-sm">
                            ${plan.resources.map(resource => `<li class="text-gold-light/80">${resource}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
            
            <div class="text-center">
                <button id="proceedBtn" class="w-full glass-button-gold text-white font-bold py-4 px-8 rounded-lg text-lg mb-4">
                    🚀 Sí, quiero transformar mi presencia digital
                </button>
                <button id="closeResults" class="text-white/60 hover:text-white font-medium">
                    ← Revisar mis respuestas
                </button>
            </div>
        `;
        
        document.getElementById('resultsContent').innerHTML = resultsHTML;
        document.getElementById('resultsSection').classList.remove('hidden');
        
        // Store data for checkout
        sessionStorage.setItem('recommendedPlan', recommendedPlanKey);
        sessionStorage.setItem('userData', JSON.stringify(this.formData));
        
        // Send data to your backend here
        this.sendToBackend();
    }
    
    closeResults() {
        document.getElementById('resultsSection').classList.add('hidden');
    }
    
    handleProceed() {
        const plan = sessionStorage.getItem('recommendedPlan');
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        
        // URLs de Gumroad para cada plan (deberás crear estos productos)
        const gumroadLinks = {
            fundador: 'https://javiermillanv.gumroad.com/l/bootcamp-fundador',
            emprendedor: 'https://javiermillanv.gumroad.com/l/bootcamp-emprendedor', 
            profesional: 'https://javiermillanv.gumroad.com/l/bootcamp-profesional'
        };
        
        // Pre-llenar información en Gumroad si es posible
        const gumroadUrl = new URL(gumroadLinks[plan]);
        if (userData.email) {
            gumroadUrl.searchParams.set('email', userData.email);
        }
        
        // Enviar datos a tu backend antes de redirigir
        this.sendToBackend();
        
        // Redirigir a Gumroad
        window.open(gumroadUrl.toString(), '_blank');
        
        // Opcional: cerrar el modal después de un momento
        setTimeout(() => {
            this.closeResults();
        }, 1000);
    }
    
    renderPackages() {
        const container = document.getElementById('packagesContainer');
        if (!container) return;
        
        Object.entries(this.packages).forEach(([key, pkg]) => {
            const isPopular = key === 'emprendedor';
            
            const packageDiv = document.createElement('div');
            packageDiv.className = `package-card ${isPopular ? 'package-popular' : ''} reveal-card`;
            
            packageDiv.innerHTML = `
                ${isPopular ? `<div class="badge-popular">${pkg.badge}</div>` : ''}
                
                <div class="text-center mb-6">
                    <div class="text-4xl mb-3">${pkg.icon}</div>
                    ${!isPopular ? `<div class="inline-block bg-deep-blue/30 text-gold-light px-2 py-1 rounded text-xs font-semibold mb-2">${pkg.badge}</div>` : ''}
                    <h3 class="text-xl font-bold text-white mb-2">${pkg.name}</h3>
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="text-2xl font-bold text-gold-light">${pkg.price}</span>
                        <span class="text-lg text-white/40 line-through">${pkg.originalPrice}</span>
                    </div>
                    <span class="badge-discount">${pkg.discount}</span>
                </div>
                
                <ul class="feature-list mb-8 min-h-[200px]">
                    ${pkg.features.slice(0, 5).map(feature => `<li>${feature}</li>`).join('')}
                    ${pkg.features.length > 5 ? '<li class="text-gold-light">Y mucho más...</li>' : ''}
                </ul>
                
                <button class="w-full glass-button-gold text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
                    Elegir ${pkg.name}
                </button>
            `;
            
            container.appendChild(packageDiv);
        });
    }
    
    async sendToBackend() {
        try {
            // Example API call - replace with your actual endpoint
            const response = await fetch('/api/form-submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...this.formData,
                    recommendedPlan: this.calculateRecommendedPlan(),
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            
            console.log('Form submitted successfully');
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error gracefully - maybe show a message to user
        }
    }
    
    // Utility methods
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showError(message) {
        // Simple alert for now - you could make this more elegant
        alert(message);
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const smartForm = new SmartForm();
    
    // Expose globally if needed
    window.SmartForm = SmartForm;
});