# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_record, name='create_record'),
    path('records/', views.get_all_records, name='get_all_records'),
    path('records/<int:pk>/', views.update_record, name='update_record'),
    path('records/<int:pk>/delete/', views.delete_record, name='delete_record'),
]
