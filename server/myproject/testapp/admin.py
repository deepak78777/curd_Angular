from django.contrib import admin
from .models import Record

# Create a custom admin class to display fields in a customized way
class RecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'amount', 'village', 'name', 'date')  # Fields to be displayed in the list view
    search_fields = ('name', 'village')  # Allow searching by name and village
    list_filter = ('village', 'date','amount')  # Filter by village and date

# Register the Record model with the custom admin options
admin.site.register(Record, RecordAdmin)
