from django.urls import path, include
from . import views as local_views

urlpatterns = [
    path('search', local_views.search, name='search'),
    path('video', local_views.summary, name='video'),
    path('summary', local_views.summary, name='summary'),
    path('session', local_views.session, name='session'),
    path('session/<int:sess_id>', local_views.session, name='session-with-id'),
    path('submit', local_views.submit, name='submit'),
]
