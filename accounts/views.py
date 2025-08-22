from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from .forms import CustomUserCreationForm

def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Redirect to login page after signup instead of auto-login
            return redirect('accounts:login')
        else:
            # Print form errors to console or log
            print(form.errors)  # Check your console or server logs
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/signup.html', {'form': form})

class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    
    def get_success_url(self):
        """Redirect users based on their admin status after login"""
        if self.request.user.is_admin:
            return reverse_lazy('items:admin_timeline')
        return reverse_lazy('items:student_timeline')

def user_logout(request):
    logout(request)
    return redirect('accounts:login')