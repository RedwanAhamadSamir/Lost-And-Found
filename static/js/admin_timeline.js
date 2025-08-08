document.addEventListener('DOMContentLoaded', function() {
    // Enhanced 3D tilt effect
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const x = e.clientX - card.getBoundingClientRect().left;
            const y = e.clientY - card.getBoundingClientRect().top;
            
            const centerX = card.offsetWidth / 2;
            const centerY = card.offsetHeight / 2;
            
            const rotateY = (x - centerX) / 20;
            const rotateX = (centerY - y) / 20;
            
            card.querySelector('.card-inner').style.transform = 
                `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(10px)`;
            
            // Parallax effect for image
            const img = card.querySelector('.parallax-img');
            if (img) {
                const moveX = (x - centerX) / 20;
                const moveY = (y - centerY) / 20;
                img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.card-inner').style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
            const img = card.querySelector('.parallax-img');
            if (img) img.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // Fixed Modal functionality
    const modal = document.getElementById('responseModal');
    const modalClose = document.querySelector('.modal-close');
    const responseList = document.getElementById('responseList');
    
    // Proper event delegation for dynamic content
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-responses') || 
            e.target.closest('.view-responses')) {
            const button = e.target.classList.contains('view-responses') ? 
                          e.target : e.target.closest('.view-responses');
            const itemId = button.getAttribute('data-id');
            
            fetch(`/responses/item/${itemId}/`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.responses && data.responses.length > 0) {
                        let html = data.responses.map(response => `
                            <div class="response-item">
                                <div class="response-user">User ID: ${response.user || 'Unknown'}</div>
                                <div class="response-message">${response.message || 'No message'}</div>
                                <div class="response-date">${response.date || 'Unknown date'}</div>
                            </div>
                        `).join('');
                        responseList.innerHTML = html;
                    } else {
                        responseList.innerHTML = '<p>No responses yet for this item.</p>';
                    }
                    modal.classList.add('active');
                })
                .catch(error => {
                    console.error('Error:', error);
                    responseList.innerHTML = '<p>Error loading responses. Please try again.</p>';
                    modal.classList.add('active');
                });
        }
    });
    
    // Close modal handlers
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Real-time updates
    const baseCheckUpdatesUrl = document.getElementById('urls').dataset.checkUpdates;
    
    function updateItemCard(itemId) {
        const url = baseCheckUpdatesUrl.replace('0', itemId);
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const card = document.querySelector(`.item-card[data-id="${itemId}"]`);
                if (card) {
                    card.setAttribute('data-status', data.is_claimed ? 'claimed' : 'unclaimed');
                    const badge = card.querySelector('.badge-glass');
                    if (badge) {
                        badge.innerHTML = data.is_claimed ? 
                            '<i class="fas fa-check-circle"></i> Claimed' : 
                            '<i class="fas fa-exclamation-circle"></i> Unclaimed';
                    }
                    const count = card.querySelector('.report-count span');
                    if (count) count.textContent = `Reports: ${data.response_count}`;
                }
            })
            .catch(error => console.error('Update error:', error));
    }

    // Update all cards every 3 seconds
    setInterval(() => {
        document.querySelectorAll('.item-card').forEach(card => {
            updateItemCard(card.getAttribute('data-id'));
        });
    }, 3000);
});