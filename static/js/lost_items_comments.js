// lost_items_comments.js - Updated with all fixes

// Global variables
let currentItemId = null;
let isItemOwner = false;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCommentSystem();
});

// Initialize comment system
function initializeCommentSystem() {
    // Modal functionality
    const modal = document.getElementById('commentsModal');
    const closeBtn = document.querySelector('.close');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Close modal events
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeModal();
        }
    }

    // Click outside modal to close
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // ESC key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Close modal with animation
function closeModal() {
    const modal = document.getElementById('commentsModal');
    modal.style.animation = 'modalFadeOut 0.3s ease-out';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = '';
    }, 300);
}

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Delete lost item function
function deleteLostItem(itemId) {
    const confirmation = confirm(
        'Are you sure you want to delete this lost item report?\n\n' +
        'This action cannot be undone and will remove all associated comments.'
    );
    
    if (confirmation) {
        showLoading();
        
        fetch(`/items/lost-item/delete/${itemId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                const card = document.querySelector(`[data-item-id="${itemId}"]`);
                if (card) {
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        card.remove();
                        showNotification('Item deleted successfully!', 'success');
                    }, 500);
                }
            } else {
                showNotification('Error: ' + (data.error || 'Failed to delete item'), 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('An error occurred while deleting the item.', 'error');
        });
    }
}

// Show comments modal
function showComments(itemId) {
    currentItemId = itemId;
    const modal = document.getElementById('commentsModal');
    modal.style.display = 'block';
    
    document.getElementById('modalBody').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading comments...</p>
        </div>
    `;
    
    fetch(`/items/lost-item/comments/${itemId}/`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayComments(data);
            } else {
                document.getElementById('modalBody').innerHTML = `
                    <div class="no-comments">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading comments.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('modalBody').innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-wifi"></i>
                    <p>Connection error. Please try again.</p>
                </div>
            `;
        });
}

// Display comments in modal
function displayComments(data) {
    isItemOwner = data.is_item_owner;
    document.getElementById('modalTitle').textContent = `Comments for "${data.item_title}"`;
    
    let html = '<div class="comments-section">';
    
    if (data.comments.length === 0) {
        html += `
            <div class="no-comments">
                No comments yet. Be the first to comment!
            </div>
        `;
    } else {
        data.comments.forEach(comment => {
            html += renderComment(comment);
        });
    }
    
    html += '</div>';
    
    html += `
        <div class="comment-form">
            <textarea 
                class="comment-input" 
                id="newComment" 
                placeholder="Share your thoughts or ask a question..." 
                rows="3"
                maxlength="1000"
            ></textarea>
            <button class="comment-submit" onclick="addComment()">
                <i class="fas fa-paper-plane"></i>
                Post Comment
            </button>
            <div style="clear: both;"></div>
        </div>
    `;
    
    document.getElementById('modalBody').innerHTML = html;
    
    setTimeout(() => {
        const commentInput = document.getElementById('newComment');
        if (commentInput) commentInput.focus();
    }, 100);
}

// Render individual comment
function renderComment(comment) {
    const isOwner = comment.is_owner ? ' (You)' : '';
    const ownerClass = comment.is_owner ? 'comment-owner' : '';
    
    let html = `
        <div class="comment ${ownerClass}" data-comment-id="${comment.id}">
            <div class="comment-header">
                <span class="comment-author">${comment.user_id}${isOwner}</span>
                <span class="comment-date">${formatDate(comment.created_at)}</span>
            </div>
            <div class="comment-message">${escapeHtml(comment.message)}</div>
            <div class="comment-actions">
                <button class="reply-btn" onclick="showReplyForm(${comment.id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            <div class="reply-form" id="replyForm${comment.id}" style="display: none;">
                <textarea 
                    class="reply-input" 
                    id="replyInput${comment.id}" 
                    placeholder="Write a thoughtful reply..." 
                    rows="2"
                    maxlength="500"
                ></textarea>
                <button class="reply-submit" onclick="addReply(${comment.id})">
                    <i class="fas fa-paper-plane"></i> Reply
                </button>
            </div>
    `;
    
    if (comment.replies && comment.replies.length > 0) {
        html += '<div class="replies">';
        comment.replies.forEach(reply => {
            const replyIsOwner = reply.is_owner ? ' (You)' : '';
            const replyOwnerClass = reply.is_owner ? 'reply-owner' : '';
            html += `
                <div class="reply ${replyOwnerClass}">
                    <div class="comment-header">
                        <span class="comment-author">${reply.user_id}${replyIsOwner}</span>
                        <span class="comment-date">${formatDate(reply.created_at)}</span>
                    </div>
                    <div class="comment-message">${escapeHtml(reply.message)}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Show/hide reply form
function showReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm${commentId}`);
    const isVisible = replyForm.style.display === 'block';
    
    document.querySelectorAll('.reply-form').forEach(form => {
        if (form.id !== `replyForm${commentId}`) form.style.display = 'none';
    });
    
    replyForm.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        setTimeout(() => {
            const replyInput = document.getElementById(`replyInput${commentId}`);
            if (replyInput) replyInput.focus();
        }, 100);
    }
}

// Add new comment
function addComment() {
    const messageElement = document.getElementById('newComment');
    const message = messageElement.value.trim();
    
    if (!message) {
        showNotification('Please write a comment before posting.', 'warning');
        messageElement.focus();
        return;
    }
    
    if (message.length > 1000) {
        showNotification('Comment is too long. Maximum 1000 characters allowed.', 'warning');
        return;
    }
    
    const submitBtn = document.querySelector('.comment-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    submitBtn.disabled = true;
    
    fetch(`/items/lost-item/add-comment/${currentItemId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            messageElement.value = '';
            showComments(currentItemId);
            showNotification('Comment posted successfully!', 'success');
        } else {
            showNotification('Error: ' + (data.error || 'Failed to post comment'), 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        console.error('Error:', error);
        showNotification('An error occurred while posting the comment.', 'error');
    });
}

// Add reply to comment
function addReply(commentId) {
    const replyInput = document.getElementById(`replyInput${commentId}`);
    const message = replyInput.value.trim();
    
    if (!message) {
        showNotification('Please write a reply before posting.', 'warning');
        replyInput.focus();
        return;
    }
    
    if (message.length > 500) {
        showNotification('Reply is too long. Maximum 500 characters allowed.', 'warning');
        return;
    }
    
    const submitBtn = document.querySelector(`#replyForm${commentId} .reply-submit`);
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    submitBtn.disabled = true;
    
    fetch(`/items/lost-item/add-comment/${currentItemId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            message: message,
            parent_id: commentId
        })
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            replyInput.value = '';
            showComments(currentItemId);
            showNotification('Reply posted successfully!', 'success');
        } else {
            showNotification('Error: ' + (data.error || 'Failed to post reply'), 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        console.error('Error:', error);
        showNotification('An error occurred while posting the reply.', 'error');
    });
}