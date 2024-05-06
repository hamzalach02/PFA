from rest_framework import serializers
from .models import User, Role,Colis, Product

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'roles']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
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