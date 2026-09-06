from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import OpenApiParameter, extend_schema
from .models import Report
from .serializers import ReportSerializer

@extend_schema(
    parameters=[
        OpenApiParameter(
            name="status",
            type=str,
            location=OpenApiParameter.QUERY,
            description="Filter by report status (admin only). One of: PENDING, REVIEWED, RESOLVED, REJECTED.",
            required=False,
        ),
        OpenApiParameter(
            name="report_type",
            type=str,
            location=OpenApiParameter.QUERY,
            description="Filter by report type (admin only). One of: BOOKING, PAYMENT, SERVICE, USER, OTHER.",
            required=False,
        ),
    ]
)

class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            queryset = Report.objects.all()

            status_param = self.request.query_params.get("status")
            report_type_param = self.request.query_params.get("report_type")

            if status_param:
                valid_statuses = dict(Report.STATUS_CHOICES).keys()
                if status_param not in valid_statuses:
                    raise ValidationError(
                        f"status must be one of {list(valid_statuses)}."
                    )
                queryset = queryset.filter(status=status_param)

            if report_type_param:
                valid_types = dict(Report.REPORT_TYPE_CHOICES).keys()
                if report_type_param not in valid_types:
                    raise ValidationError(
                        f"report_type must be one of {list(valid_types)}."
                    )
                queryset = queryset.filter(report_type=report_type_param)

            return queryset

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