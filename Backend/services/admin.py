from django.contrib import admin

from .models import Service, ServiceCategory


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "created_at")
    list_filter = ("parent",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Service)