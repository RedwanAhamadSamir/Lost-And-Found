// lost_items.js - Updated without comment functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // Card hover 3D effect
    const cards = document.querySelectorAll('.lost-item-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 20;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 20;
            card.style.transform = `translateY(-10px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s ease';
            card.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
        });
    });

    // Button micro-interactions
    const buttons = document.querySelectorAll('.card-btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0) scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-2px) scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Status indicator animation
    const statusIndicators = document.querySelectorAll('.status-indicator');
    statusIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            indicator.classList.toggle('pulse');
            setTimeout(() => {
                indicator.classList.remove('pulse');
            }, 1000);
        });
    });
});