from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager
from django.core.validators import FileExtensionValidator



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


class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    cin = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=20)
    license_number = models.CharField(max_length=255)
    vehicle_number = models.CharField(max_length=255)
    current_place = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user} {self.license_number}"


class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    phone_number = models.CharField(max_length=20)
    current_place = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user} - {self.phone_number}"



class Product(models.Model):
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.description


class Colis(models.Model):
    date = models.DateField()
    ondelevry = models.BooleanField(default=True)
    creator = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='colis')
    destination = models.CharField(max_length=255)
    currentPlace = models.CharField(max_length=255)
    transporter = models.CharField(max_length=255)
    products = models.ManyToManyField(Product)
    image = models.ImageField(upload_to='colis_images', null=True, blank=True)

    def __str__(self):
        return f"Colis {self.id} - Destination: {self.destination}"

    

class Trip(models.Model):
    STATE_CHOICES = [
        ('on road', 'On Road'),
        ('end', 'End')
    ]

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    current_place = models.CharField(max_length=255)
    cities_to_visit = models.TextField()  # Assuming a comma-separated list of cities
    state = models.CharField(max_length=10, choices=STATE_CHOICES, default='on road')
    colis = models.ManyToManyField(Colis, blank=True)

    def __str__(self):
        return f"Trip for Driver {self.driver.user.name} ({self.driver.user.email}) - Start Date: {self.start_date}, End Date: {self.end_date}"
