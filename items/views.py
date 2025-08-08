from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from .models import Item, LostItem
from .forms import ItemForm, LostItemForm, ClaimForm
from responses.models import Response

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
    items = Item.objects.all().order_by('-date_found')
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
    return JsonResponse({
        'is_claimed': item.is_claimed,
        'response_count': item.responses.count()
    })