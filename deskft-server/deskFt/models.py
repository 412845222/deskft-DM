from django.db import models

# Create your models here.
class Anchor(models.Model):
    code = models.CharField(max_length=20)
    room_id = models.CharField(max_length=20)
    authBody = models.CharField(max_length=1000)
    lastGameId = models.CharField(max_length=20)
    def __int__(self):
        return self.id
