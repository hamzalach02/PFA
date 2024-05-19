from rest_framework import serializers
from .models import User, Role,Colis, Product,Driver,Trip,Client
from django.contrib.auth.hashers import make_password

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'roles']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'poids', 'description', 'category']

class ColisSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True)

    class Meta:
        model = Colis
        fields = ['id', 'date', 'ondelevry', 'creator', 'destination', 'currentPlace', 'transporter', 'products', 'image']

    def create(self, validated_data):
        products_data = validated_data.pop('products')
        colis = Colis.objects.create(**validated_data)
        for product_data in products_data:
            Product.objects.create(colis=colis, **product_data)
        return colis
    

    
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['user', 'phone_number', 'current_place']

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['user', 'cin', 'phone_number', 'current_place','license_number', 'vehicle_number']

   
class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['id', 'driver', 'start_date', 'end_date', 'current_place', 'cities_to_visit', 'state', 'colis']





