from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Account

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: Account):
        token = super().get_token(user)

        token["user_id"] = user.id
        token["username"] = user.username
        token["role"] = user.role

        return token