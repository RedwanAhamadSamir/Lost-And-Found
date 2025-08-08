document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP animations
    gsap.registerEffect({
        name: "fadeInUp",
        effect: (targets, config) => {
            return gsap.from(targets, {
                duration: config.duration,
                opacity: 0,
                y: 20,
                ease: "power2.out"
            });
        },
        defaults: {duration: 0.6}
    });
    
    // Apply fadeInUp effect to form elements
    gsap.effects.fadeInUp(".upload-form", {delay: 0.2});
    gsap.effects.fadeInUp(".upload-header");
    
    // File upload preview
    const fileInput = document.getElementById('id_image');
    const uploadArea = document.getElementById('uploadArea');
    const fileName = document.getElementById('fileName');
    const previewContainer = document.getElementById('previewContainer');
    const uploadLabel = document.getElementById('uploadLabel');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileName.textContent = file.name;
                
                // Show preview for image files
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        previewContainer.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        previewContainer.appendChild(img);
                        previewContainer.style.display = 'block';
                        
                        // Animate preview appearance
                        gsap.from(img, {
                            duration: 0.5,
                            opacity: 0,
                            scale: 0.8,
                            ease: "back.out(1.7)"
                        });
                    }
                    
                    reader.readAsDataURL(file);
                } else {
                    previewContainer.style.display = 'none';
                }
                
                // Animate upload label
                gsap.to(uploadLabel, {
                    duration: 0.3,
                    y: -5,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    ease: "power1.out"
                });
            }
        });
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'rgba(79, 70, 229, 0.3)';
            uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(79, 70, 229, 0.3)';
            uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        });
    }
    
    // Form submission with progress animation
    const uploadForm = document.getElementById('uploadForm');
    const progressBar = document.getElementById('progressBar');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadFeedback = document.getElementById('uploadFeedback');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            let isValid = true;
            const requiredFields = uploadForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    gsap.to(field, {
                        duration: 0.3,
                        x: [-5, 5, -5, 5, 0],
                        boxShadow: '0 0 0 2px var(--error-color)',
                        ease: "power1.inOut"
                    });
                }
            });
            
            if (!isValid) {
                // Shake form to indicate error
                gsap.to(uploadForm, {
                    duration: 0.5,
                    x: [-10, 10, -10, 10, 0],
                    ease: "power1.inOut"
                });
                return;
            }
            
            // Disable button during upload
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            
            // Simulate progress (in a real app, use XMLHttpRequest with progress events)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    // Show success feedback after a short delay
                    setTimeout(() => {
                        uploadFeedback.classList.add('active');
                        
                        // Animate success feedback
                        gsap.from('.feedback-content', {
                            duration: 0.6,
                            opacity: 0,
                            y: 20,
                            ease: "back.out(1.7)"
                        });
                    }, 500);
                }
                
                progressBar.style.width = progress + '%';
            }, 200);
            
            // In a real application, you would submit the form with AJAX
            // const formData = new FormData(uploadForm);
            // fetch(uploadForm.action, {
            //     method: 'POST',
            //     body: formData
            // }).then(response => {
            //     if (response.ok) {
            //         uploadFeedback.classList.add('active');
            //     }
            // });
        });
    }
    
    // Done button in feedback modal
    const doneBtn = document.getElementById('doneBtn');
    if (doneBtn) {
        doneBtn.addEventListener('click', function() {
            // Animate feedback modal out
            gsap.to(uploadFeedback, {
                duration: 0.4,
                opacity: 0,
                onComplete: () => {
                    uploadFeedback.classList.remove('active');
                    // Reset form and redirect
                    uploadForm.reset();
                    previewContainer.innerHTML = '';
                    previewContainer.style.display = 'none';
                    fileName.textContent = 'No file selected';
                    progressBar.style.width = '0';
                    uploadBtn.disabled = false;
                    uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Item';
                    
                    // Redirect to timeline
                    window.location.href = "{% url 'items:admin_timeline' %}";
                }
            });
        });
    }
    
    // Form validation indicators
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.boxShadow = '0 0 0 2px var(--success-color)';
            } else {
                this.style.boxShadow = '0 0 0 2px var(--error-color)';
            }
        });
    });
    
    // Date picker enhancement
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.addEventListener('focus', function() {
            gsap.to(this, {
                duration: 0.3,
                boxShadow: '0 0 0 2px var(--primary-color)',
                ease: "power1.out"
            });
        });
        
        dateInput.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.style.boxShadow = '0 0 0 2px var(--success-color)';
            } else {
                this.style.boxShadow = 'none';
            }
        });
    }
});