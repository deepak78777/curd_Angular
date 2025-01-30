# serializers.py
from rest_framework import serializers
from .models import Record

class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ['id', 'amount', 'village', 'name', 'date']  # Adjust based on your model fields
