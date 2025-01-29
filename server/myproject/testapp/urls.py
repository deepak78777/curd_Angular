from django.urls import path
from . import views  # Ensure views are correctly imported

urlpatterns = [
    path('example/', views.example_view, name='example'),
]
