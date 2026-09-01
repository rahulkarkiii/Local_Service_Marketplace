from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Analytics
from.serializers import AnalyticsSerializer

class AnalyticsListCreateView(generics.ListCreateAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]

class AnalyticsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]
