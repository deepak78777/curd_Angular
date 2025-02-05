# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Record
from .serializers import RecordSerializer

@api_view(['POST'])
def create_record(request):
    serializer = RecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_all_records(request):
    records = Record.objects.all()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
def update_record(request, pk):
    try:
        record = Record.objects.get(pk=pk)
    except Record.DoesNotExist:
        return Response(status=404)
    
    serializer = RecordSerializer(record, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_record(request, pk):
    try:
        record = Record.objects.get(pk=pk)
    except Record.DoesNotExist:
        return Response(status=404)
    
    record.delete()
    return Response(status=204)
