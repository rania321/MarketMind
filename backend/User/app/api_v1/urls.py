from django.urls import path , include
from dj_rest_auth.registration.views import VerifyEmailView
from .views import CustomVerifyEmailView

urlpatterns = [
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/",include("dj_rest_auth.registration.urls")),
    path('dj-rest-auth/account-confirm-email/<str:key>/', CustomVerifyEmailView.as_view(), name='account_confirm_email'),
]