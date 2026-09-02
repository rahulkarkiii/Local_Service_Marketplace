from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Account
from .serializers import RegisterSerializer, MeSerializer


class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user