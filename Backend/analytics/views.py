from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Analytics
from.serializers import AnalyticsSerializer

class AnalyticsListCreateAPIView(generics.ListCreateAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]

class AnalyticsDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]
