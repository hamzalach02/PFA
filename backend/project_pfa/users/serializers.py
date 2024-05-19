from rest_framework import serializers
from .models import User, Role,Colis, Product,Driver,Trip
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
        fields = ['id', 'date', 'ondelevry', 'creator', 'destination', 'currentPlace', 'transporter', 'products']

    def create(self, validated_data):
        products_data = validated_data.pop('products')
        colis = Colis.objects.create(**validated_data)
        for product_data in products_data:
            Product.objects.create(colis=colis, **product_data)
        return colis
    

class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Driver
        fields = ['user', 'cin', 'telephone', 'license_number', 'vehicle_number']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(data=user_data)
        
        if user_serializer.is_valid(raise_exception=True):
            user = user_serializer.save()

            # Assign the driver role to the user
            driver_role = Role.objects.get(name='driver')
            user.roles.add(driver_role)
            
            # Create the Driver
            driver = Driver.objects.create(user=user, **validated_data)
            
            return driver
        else:
            raise serializers.ValidationError(user_serializer.errors)
        
class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['id', 'driver', 'start_date', 'end_date', 'current_place', 'cities_to_visit', 'state', 'colis']