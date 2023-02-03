from django.urls import path, include
from . import views as local_views

urlpatterns = [
    path('search', local_views.search, name='search'),
    path('video', local_views.video, name='video'),
]
