document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#4f46e5"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                }
            },
            "opacity": {
                "value": 0.3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#4f46e5",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": true,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 0.5
                    }
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('id_password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            let isValid = true;
            const username = document.getElementById('id_username');
            const password = document.getElementById('id_password');
            
            // Reset error states
            username.parentElement.classList.remove('error');
            password.parentElement.classList.remove('error');
            
            // Validate username
            if (!username.value.trim()) {
                username.parentElement.classList.add('error');
                isValid = false;
                gsap.to(username, {
                    duration: 0.3,
                    x: [-5, 5, -5, 5, 0],
                    ease: "power1.inOut"
                });
            }
            
            // Validate password
            if (!password.value.trim()) {
                password.parentElement.classList.add('error');
                isValid = false;
                gsap.to(password, {
                    duration: 0.3,
                    x: [-5, 5, -5, 5, 0],
                    ease: "power1.inOut"
                });
            }
            
            if (!isValid) {
                // Shake form to indicate error
                gsap.to(loginForm, {
                    duration: 0.5,
                    x: [-10, 10, -10, 10, 0],
                    ease: "power1.inOut"
                });
                return;
            }
            
            // Disable button during submission
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            
            // Simulate authentication (in a real app, this would be an AJAX call)
            setTimeout(() => {
                // In a real application, you would submit the form here
                // For this example, we'll just simulate a successful login
                window.location.href = "{% url 'items:student_timeline' %}";
            }, 1500);
        });
    }

    // Social login buttons animation
    const socialButtons = document.querySelectorAll('.btn-social');
    
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1.05,
                ease: "back.out(1.7)"
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1,
                ease: "back.out(1.7)"
            });
        });
    });

    // Initialize GSAP animations
    gsap.from('.auth-card', {
        duration: 0.8,
        opacity: 0,
        y: 50,
        ease: "back.out(1.7)"
    });
    
    gsap.from('.logo-container', {
        duration: 0.8,
        scale: 0,
        rotation: 360,
        ease: "elastic.out(1, 0.5)",
        delay: 0.3
    });
    
    gsap.from('.form-group', {
        duration: 0.6,
        opacity: 0,
        y: 20,
        stagger: 0.2,
        delay: 0.5,
        ease: "power2.out"
    });
});