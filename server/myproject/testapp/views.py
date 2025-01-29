from django.http import JsonResponse

def example_view(request):
    data = {"message": "Hello, this is an example response!"}
    return JsonResponse(data)
