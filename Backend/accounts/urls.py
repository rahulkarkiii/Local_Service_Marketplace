from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .jwt_serializers import CustomTokenObtainPairSerializer
from .views import RegisterView, MeView, AccountListView, AccountDetailView


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("accounts/", AccountListView.as_view(), name="account-list"),
    path("accounts/<int:pk>/", AccountDetailView.as_view(), name="account-detail"),
]