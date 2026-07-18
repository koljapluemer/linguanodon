import json

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_POST
from django.views.generic import CreateView

from accounts.forms import SignupForm
from tracking.views import dashboard_data


class SignupView(CreateView):
    form_class = SignupForm
    template_name = 'accounts/signup.html'
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        response = super().form_valid(form)
        login(self.request, self.object)
        return response


@login_required
def profile(request):
    return render(request, 'accounts/profile.html', {
        'data_json': json.dumps(dashboard_data(request.user)),
    })


@login_required
@require_POST
def delete_account(request):
    user = request.user
    logout(request)
    user.delete()
    return redirect('index')
