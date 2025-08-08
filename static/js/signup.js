document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 900
                    }
                },
                color: {
                    value: ["#9b59b6", "#3498db", "#2ecc71"]
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.2,
                        sync: false
                    }
                },
                size: {
                    value: 4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 3,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 160,
                    color: "#9b59b6",
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2.5,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 800,
                        rotateY: 1600
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 150,
                        line_linked: {
                            opacity: 0.8
                        }
                    },
                    push: {
                        particles_nb: 6
                    }
                }
            },
            retina_detect: true
        });
    }

    // Floating label functionality
    const floatInputs = document.querySelectorAll('.floating-input input, .floating-input select');
    floatInputs.forEach(input => {
        // Initialize filled state
        if (input.value) {
            input.parentNode.classList.add('filled');
        }
        
        // Focus/blur events
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
            if (this.value) {
                this.parentNode.classList.add('filled');
            } else {
                this.parentNode.classList.remove('filled');
            }
        });
        
        // For selects
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', function() {
                if (this.value) {
                    this.parentNode.classList.add('filled');
                } else {
                    this.parentNode.classList.remove('filled');
                }
            });
        }
    });

    // Password strength indicator
    const passwordInput = document.querySelector('#id_password1');
    if (passwordInput) {
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength';
        strengthBar.innerHTML = '<div class="strength-bar"></div>';
        passwordInput.parentNode.appendChild(strengthBar);
        
        passwordInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            const bar = strengthBar.querySelector('.strength-bar');
            
            bar.style.width = strength.percentage + '%';
            bar.style.backgroundColor = strength.color;
        });
    }

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length > 0) strength += 10;
        if (password.length >= 8) strength += 20;
        
        // Character variety
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        // Common pattern penalty
        if (/(.)\1/.test(password)) strength -= 15;
        
        strength = Math.max(0, Math.min(100, strength));
        
        return {
            percentage: strength,
            color: strength < 40 ? '#e74c3c' : 
                   strength < 70 ? '#f39c12' : '#2ecc71'
        };
    }

    // Form submission animation
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.querySelector('.btn-text').textContent = 'Processing...';
                submitBtn.querySelector('.btn-icon').textContent = '⏳';
            }
        });
    });
});