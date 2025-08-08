from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from items.models import Item
from .models import Response
from django.http import JsonResponse
from django.utils import timezone
from items.models import Item
from django.db import transaction

@login_required
@transaction.atomic
def create_response(request, item_id):
    item = get_object_or_404(Item, pk=item_id)
    
    if request.method == 'POST':
        message = request.POST.get('message', '')
        
        # Debug: Print current status before changes
        print(f"DEBUG: Current status - Claimed: {item.is_claimed}, Responses: {item.responses.count()}")
        
        if not Response.objects.filter(item=item, user=request.user).exists():
            try:
                # 1. Create the response
                response = Response.objects.create(
                    item=item,
                    user=request.user,
                    message=message
                )
                print(f"DEBUG: Created response ID {response.id}")
                
                # 2. Force refresh and update claim status
                item.refresh_from_db()  # Ensure we have latest data
                item.update_claim_status()
                
                # 3. Verify the update
                item.refresh_from_db()
                print(f"DEBUG: Updated status - Claimed: {item.is_claimed}, By: {item.claimed_by.user_id if item.claimed_by else None}")
                
            except Exception as e:
                print(f"ERROR: Failed to create response - {str(e)}")
                raise  # Re-raise the exception to trigger transaction rollback
    
    return redirect('items:student_timeline')

def item_responses(request, item_id):
    item = get_object_or_404(Item, pk=item_id)
    responses = Response.objects.filter(item=item).select_related('user').order_by('-response_date')
    
    response_data = [{
        'user': response.user.user_id,
        'message': response.message,
        'date': response.response_date.strftime("%b %d, %Y %H:%M")
    } for response in responses]
    
    return JsonResponse({
        'responses': response_data
    })