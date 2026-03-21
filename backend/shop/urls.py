from django.urls import path
from . import views

urlpatterns= [
        path('api/', views.getRoutes, name="routes"),
        path('api/items/', views.getItems, name="items"),
        path('api/items/<str:pk>/', views.getItem, name="item"),
        path('api/items/<str:pk>/purchase/', views.purchaseItem, name="purchase"),
]