from django.db import models
from django.contrib.auth.models import AbstractBaseUser


from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
    

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class User(AbstractBaseUser):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    roles = models.ManyToManyField(Role)  
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()


class Product(models.Model):
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.description

class Colis(models.Model):
    date = models.DateField()
    ondelevry = models.BooleanField(default=True)
    creator = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    currentPlace = models.CharField(max_length=255)
    transporter = models.CharField(max_length=255)
    products = models.ManyToManyField(Product)

    def __str__(self):
        return f"Colis {self.id} - Destination: {self.destination}"