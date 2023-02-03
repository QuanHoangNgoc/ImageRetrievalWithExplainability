from django.db import models
from .apps import LscConfig as cfg

# Create your models here.

# Class containing interaction session data, 
# sessionID is defined as database's implicit PK
class SessionData(models.Model):
    dataset_name = models.CharField(max_length=256, default=cfg.collection_name)

class ImageEmbeddingManager(models.Manager):
    def create_image_embedding(self, image_name, milvus_id):
        return self.create(image_name=image_name, milvus_id=milvus_id)

class ImageEmbedding(models.Model):
    image_name = models.CharField(max_length=256, db_index=True, unique=True)
    milvus_id = models.PositiveBigIntegerField(primary_key=True)

    objects = ImageEmbeddingManager()

class ImageCropped(models.Model):
    image_name = models.CharField(max_length=256, primary_key=True)
    milvus_id = models.IntegerField(db_index=True)
    lo_x = models.IntegerField()
    lo_y = models.IntegerField()
    hi_x = models.IntegerField()
    hi_y = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['image_name', 'lo_x', 'lo_y', 'hi_x', 'hi_y'], 
                name='unique_image_name_crop_combination'
            )
        ]

