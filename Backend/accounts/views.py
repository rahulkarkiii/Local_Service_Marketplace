from rest_framework import generics
from accounts.permissions import IsAdmin
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Account
from .serializers import RegisterSerializer, MeSerializer, AccountAdminSerializer


class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class AccountListView(generics.ListAPIView):
    queryset = Account.objects.all().order_by("-date_joined")
    serializer_class = AccountAdminSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountAdminSerializer
    permission_classes = [IsAuthenticated, IsAdmin]