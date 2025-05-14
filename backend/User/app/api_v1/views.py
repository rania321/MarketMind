from django.shortcuts import render
from dj_rest_auth.registration.views import VerifyEmailView
from django.http import HttpResponseRedirect

class CustomVerifyEmailView(VerifyEmailView):
    def get(self, request, *args, **kwargs):
        key = kwargs.get('key')
        frontend_url = f"http://127.0.0.1:5000/verify-email/{key}/"
        return HttpResponseRedirect(frontend_url)
# Create your views here.
