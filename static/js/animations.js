document.addEventListener('DOMContentLoaded', function() {
    // Parallax effect for header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            header.style.transform = 'translateY(' + scrollPosition * 0.3 + 'px)';
        });
    }

    // Staggered animation for nav items
    const navItems = document.querySelectorAll('.nav-links > *');
    navItems.forEach((item, index) => {
        item.style.transitionDelay = (index * 0.1) + 's';
    });

    // 3D tilt effect for cards
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
    });

    // Micro-interaction for buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
});