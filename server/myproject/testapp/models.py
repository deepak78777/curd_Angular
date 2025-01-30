# models.py
from django.db import models

class Record(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    village = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    date = models.DateField()

    def __str__(self):
        return f"{self.name} - {self.amount} - {self.village} - {self.date}"
