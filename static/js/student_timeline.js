document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Form submission handling
    const responseForms = document.querySelectorAll('.response-form');
    responseForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const textarea = this.querySelector('textarea');
            if (textarea.value.trim() === '') {
                e.preventDefault();
                textarea.style.borderColor = '#e74c3c';
                setTimeout(() => {
                    textarea.style.borderColor = '#eee';
                }, 2000);
            }
        });
    });

    // Image hover effect enhancement
    const cardImages = document.querySelectorAll('.card-image-container');
    cardImages.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.querySelector('.card-image').style.transform = 'scale(1.05)';
        });
        container.addEventListener('mouseleave', function() {
            this.querySelector('.card-image').style.transform = 'scale(1)';
        });
    });
});