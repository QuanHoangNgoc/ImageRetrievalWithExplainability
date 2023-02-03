from django.contrib import admin
from .models import SessionData, ImageEmbedding, ImageCropped

# Register your models here
admin.site.register(SessionData)
admin.site.register(ImageEmbedding)
admin.site.register(ImageCropped)