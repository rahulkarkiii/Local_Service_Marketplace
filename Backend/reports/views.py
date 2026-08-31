from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Report
from .serializers import ReportSerializer


class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Report.objects.all()

        return Report.objects.filter(reporter=user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Report.objects.all()

        return Report.objects.filter(reporter=user)

    def perform_update(self, serializer):
        user = self.request.user
        report = serializer.instance

        if user.role == "ADMIN":
            serializer.save()
            return

        if report.reporter == user:
            serializer.save(
                reporter=report.reporter,
                status=report.status,
            )
            return

        raise PermissionDenied(
            "You can only update your own reports."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if instance.reporter == user:
            instance.delete()
            return

        raise PermissionDenied(
            "You can only delete your own reports."
        )