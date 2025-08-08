document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    // File upload preview
    const fileInput = document.getElementById('id_image');
    const fileName = document.querySelector('.file-name');
    const previewContainer = document.querySelector('.preview-container');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileName.textContent = this.files[0].name;
                
                // Show preview for images
                if (this.files[0].type.match('image.*')) {
                    previewContainer.style.display = 'block';
                    previewContainer.innerHTML = '';
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.createElement('img');
                        preview.src = e.target.result;
                        preview.style.maxWidth = '100%';
                        preview.style.maxHeight = '200px';
                        preview.style.borderRadius = '8px';
                        preview.style.marginTop = '10px';
                        previewContainer.appendChild(preview);
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            } else {
                fileName.textContent = 'No file chosen';
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = '';
            }
        });
    }

    // 3D card tilt effect
    const glassCard = document.querySelector('.glass-card');
    if (glassCard) {
        glassCard.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            glassCard.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        glassCard.addEventListener('mouseenter', () => {
            glassCard.style.transition = 'none';
        });

        glassCard.addEventListener('mouseleave', () => {
            glassCard.style.transition = 'transform 0.5s ease';
            glassCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        });
    }

    // Form submission animation
    const form = document.querySelector('.lost-item-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-text">Processing...</span><span class="btn-icon"><i class="fas fa-spinner fa-spin"></i></span>';
                
                // Add liquid wave effect
                const liquid = submitBtn.querySelector('.liquid-effect');
                liquid.style.animation = 'liquid 1s linear infinite';
                
                // Re-enable after 5 seconds if still processing
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span class="btn-text">Try Again</span><span class="btn-icon"><i class="fas fa-redo"></i></span>';
                        liquid.style.animation = '';
                    }
                }, 5000);
            }
        });
    }

    // Micro-interactions for form inputs
    const inputs = document.querySelectorAll('.floating-input input, .floating-input textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
    });
});