from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from .models import Item, LostItem
from .forms import ItemForm, LostItemForm, ClaimForm
from responses.models import Response
from django.contrib import messages
from django.http import JsonResponse
import json
# Add this import at the top if not already present
from django.core.mail import send_mail
from django.conf import settings



@login_required
def admin_timeline(request):
    if not request.user.is_admin:
        return redirect('items:student_timeline')
    items = Item.objects.all().order_by('-date_found')
    return render(request, 'items/admin_timeline.html', {
        'items': items,
        'is_admin': request.user.is_admin
    })

@login_required
def admin_upload(request):
    if not request.user.is_admin:
        return redirect('items:student_timeline')
    if request.method == 'POST':
        form = ItemForm(request.POST, request.FILES)
        if form.is_valid():
            item = form.save(commit=False)
            item.found_by = request.user
            item.save()
            return redirect('items:admin_timeline')
    else:
        form = ItemForm()
    return render(request, 'items/admin_upload.html', {'form': form})

@login_required
def student_timeline(request):
    if request.user.is_admin:
        return redirect('items:admin_timeline')
    
    try:
        items = Item.objects.all().order_by('-date_found')
    except Exception as e:
        items = []
        messages.error(request, "Could not load items. Please try again later.")
        print(f"Error loading items: {str(e)}")  # Debug logging
    
    return render(request, 'items/student_timeline.html', {'items': items})

@login_required
def report_lost_item(request):
    if request.user.is_admin:
        return redirect('items:admin_timeline')
    if request.method == 'POST':
        form = LostItemForm(request.POST)
        if form.is_valid():
            lost_item = form.save(commit=False)
            lost_item.reported_by = request.user
            lost_item.save()
            return redirect('items:lost_items_timeline')
    else:
        form = LostItemForm()
    return render(request, 'items/report_lost.html', {'form': form})

@login_required
def lost_items_timeline(request):
    if request.user.is_admin:
        return redirect('items:admin_timeline')
    
    lost_items = LostItem.objects.all().order_by('-date_reported')
    
    # DEBUG: Print user and lost items
    print("DEBUG: Current user ID:", request.user.user_id)  # Verify
    print("DEBUG: Fetched lost items:", list(lost_items.values('title', 'reported_by__user_id')))
    
    return render(request, 'items/lost_items_timeline.html', {'lost_items': lost_items})

@login_required
def delete_item(request, pk):
    if not request.user.is_admin:
        return redirect('items:student_timeline')
    
    item = get_object_or_404(Item, pk=pk)
    if request.method == 'POST':
        item.delete()
    return redirect('items:admin_timeline')  # Redirect back to admin timeline


@login_required
def create_response(request, item_id):
    item = get_object_or_404(Item, pk=item_id)
    
    if request.user.is_admin:
        return redirect('items:student_timeline')
    
    if request.method == 'POST':
        message = request.POST.get('message', '')
        # Ensure user is properly set
        if request.user and request.user.is_authenticated:
            if not Response.objects.filter(item=item, user=request.user).exists():
                Response.objects.create(
                    item=item, 
                    user=request.user, 
                    message=message
                )
    
    return redirect('items:student_timeline')



@login_required
def toggle_claim_status(request, item_id):
    if not request.user.is_admin:
        return JsonResponse({'success': False, 'error': 'Permission denied'})
    
    item = get_object_or_404(Item, pk=item_id)
    
    if request.method == 'POST':
        form = ClaimForm(request.POST, instance=item)
        if form.is_valid():
            item = form.save(commit=False)
            # Add this line to actually update the claim status:
            item.is_claimed = not item.is_claimed
            if item.is_claimed:
                item.claimed_by = request.user
                item.claim_date = timezone.now()
            else:
                item.claimed_by = None
                item.claim_date = None
            item.save()
            
            return JsonResponse({
                'success': True,
                'is_claimed': item.is_claimed,
                'response_count': item.responses.count()
            })
    
    return JsonResponse({'success': False})


@login_required
def check_item_updates(request, item_id):
    if not request.user.is_admin:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    item = get_object_or_404(Item, pk=item_id)
    
    # Get responses with admin replies
    responses = Response.objects.filter(item=item).select_related('user')
    
    responses_data = []
    for response in responses:
        admin_replies = []
        try:
            from .models import AdminReply
            admin_replies = [
                {
                    'id': reply.id,
                    'message': reply.message,
                    'admin_id': reply.admin.user_id,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
                }
                for reply in AdminReply.objects.filter(response=response)
            ]
        except:
            pass
        
        responses_data.append({
            'id': response.id,
            'message': response.message,
            'user_id': response.user.user_id,
            'created_at': response.response_date.strftime('%Y-%m-%d %H:%M'),
            'admin_replies': admin_replies
        })
    
    return JsonResponse({
        'is_claimed': item.is_claimed,
        'response_count': item.responses.count(),
        'responses': responses_data
    })
    
@login_required
def delete_lost_item(request, item_id):
    """Delete a lost item (only by the person who reported it)"""
    lost_item = get_object_or_404(LostItem, pk=item_id)
    
    # Only the person who reported it can delete
    if lost_item.reported_by != request.user:
        return JsonResponse({'success': False, 'error': 'Permission denied'})
    
    if request.method == 'POST':
        lost_item.delete()
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def get_lost_item_comments(request, item_id):
    """Get all comments for a lost item"""
    lost_item = get_object_or_404(LostItem, pk=item_id)
    
    # Get all comments with their replies
    comments = lost_item.comments.filter(parent=None).prefetch_related('replies', 'user')
    
    def serialize_comment(comment):
        return {
            'id': comment.id,
            'message': comment.message,
            'user_id': comment.user.user_id,
            'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),
            'is_owner': comment.user == request.user,
            'replies': [serialize_comment(reply) for reply in comment.replies.all()]
        }
    
    comments_data = [serialize_comment(comment) for comment in comments]
    
    return JsonResponse({
        'success': True,
        'comments': comments_data,
        'item_title': lost_item.title,
        'item_owner': lost_item.reported_by.user_id,
        'is_item_owner': lost_item.reported_by == request.user
    })

@login_required
def add_lost_item_comment(request, item_id):
    """Add a comment or reply to a lost item"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    lost_item = get_object_or_404(LostItem, pk=item_id)
    
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        parent_id = data.get('parent_id')
        
        if not message:
            return JsonResponse({'success': False, 'error': 'Message cannot be empty'})
        
        # Import the model here to avoid circular import
        from .models import LostItemComment
        
        parent_comment = None
        if parent_id:
            parent_comment = get_object_or_404(LostItemComment, pk=parent_id)
        
        comment = LostItemComment.objects.create(
            lost_item=lost_item,
            user=request.user,
            message=message,
            parent=parent_comment
        )
        
        return JsonResponse({
            'success': True,
            'comment': {
                'id': comment.id,
                'message': comment.message,
                'user_id': comment.user.user_id,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),
                'is_owner': True
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    


# Add this view function to your existing views.py
@login_required
def add_admin_reply(request, response_id):
    """Add admin reply to a user response"""
    if not request.user.is_admin:
        return JsonResponse({'success': False, 'error': 'Permission denied'})
    
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    try:
        response = get_object_or_404(Response, pk=response_id)
        
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        
        if not message:
            return JsonResponse({'success': False, 'error': 'Reply message cannot be empty'})
        
        from .models import AdminReply
        admin_reply = AdminReply.objects.create(
            response=response,
            admin=request.user,
            message=message
        )
        
        return JsonResponse({
            'success': True,
            'reply': {
                'id': admin_reply.id,
                'message': admin_reply.message,
                'admin_id': admin_reply.admin.user_id,
                'created_at': admin_reply.created_at.strftime('%Y-%m-%d %H:%M')
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
@login_required
def add_admin_reply(request, response_id):
    """Add admin reply to a user response and send email notification"""
    if not request.user.is_admin:
        return JsonResponse({'success': False, 'error': 'Permission denied'})
    
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    try:
        response = get_object_or_404(Response, pk=response_id)
        
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        user_email = data.get('user_email', '')  # Get user email from request
        
        if not message:
            return JsonResponse({'success': False, 'error': 'Reply message cannot be empty'})
        
        from .models import AdminReply
        admin_reply = AdminReply.objects.create(
            response=response,
            admin=request.user,
            message=message
        )
        
        # Send email notification if user_email is provided
        if user_email:
            try:
                subject = f"Admin Response to Your Inquiry About: {response.item.title}"
                email_message = f"""
Hello,

An administrator has responded to your inquiry about the item "{response.item.title}".

Admin Response: {message}

You can view the item and response at: {request.build_absolute_uri(response.item.get_absolute_url())}

Thank you,
The Lost and Found Team
"""
                
                send_mail(
                    subject,
                    email_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user_email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log the error but don't fail the whole request
                print(f"Failed to send email notification: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'reply': {
                'id': admin_reply.id,
                'message': admin_reply.message,
                'admin_id': admin_reply.admin.user_id,
                'created_at': admin_reply.created_at.strftime('%Y-%m-%d %H:%M')
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})