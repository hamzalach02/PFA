from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer, ColisSerializer , DriverSerializer ,TripSerializer,ProductSerializer
from .models import User, Role ,Driver,Trip , Colis ,Product
import jwt
import datetime
from rest_framework import status
from django.utils import timezone

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role_name = request.data.get('role', 'client')
        role, created = Role.objects.get_or_create(name=role_name)
        
        user = serializer.save()
        user.roles.add(role)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = User.objects.filter(email=email).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed('Invalid email or password')

        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')

        response = Response()
        response.set_cookie('jwt', token, httponly=True)
        response.data = {'jwt': token}

        return response

class UserView(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()
            
            expected_roles = ['admin', 'driver', 'client']
            for role in roles:
                if role.name in expected_roles:
                    return Response({'message': f'{role.name.capitalize()} page'})
            
            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')

class LoggedInUsersView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')

        response = Response()
        response.delete_cookie('jwt')
        response.data = {'message': 'Successfully logged out'}
        return response

class CreateColisView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed('Unauthenticated')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()
            
            expected_role = 'client'
            if any(role.name == expected_role for role in roles):
                colis_serializer = ColisSerializer(data=request.data)
                if colis_serializer.is_valid():
                    # Save colis with creator=user
                    colis = colis_serializer.save(creator=user)

                    # Retrieve and save associated products
                    product_data = request.data.get('products', [])
                    for product_info in product_data:
                        # Create or retrieve product based on ID
                        product_id = product_info.get('id')
                        if product_id:
                            product = Product.objects.get(id=product_id)
                        else:
                            product_serializer = ProductSerializer(data=product_info)
                            if product_serializer.is_valid():
                                product = product_serializer.save()
                            else:
                                return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Associate product with colis
                        colis.products.add(product)

                    return Response(colis_serializer.data, status=status.HTTP_201_CREATED)
                return Response(colis_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')

        



class RegisterDriverAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = DriverSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Driver registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DriverCheckView(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthorized')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload['id']
        user = User.objects.get(id=user_id)

        # Check if the user has the driver role
        driver_role = Role.objects.get(name='driver')
        is_driver = driver_role in user.roles.all()

        return Response({'is_driver': is_driver})
    

class CreateTripAPIView(APIView):
    def post(self, request):
        # Retrieve JWT token from the cookie
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthorized')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')

        # Check if user has driver role and if they have an ongoing trip
        user_id = payload.get('id')
        driver = Driver.objects.filter(user_id=user_id).first()

        if not driver:
            raise AuthenticationFailed('User is not a driver')

        if Trip.objects.filter(driver=driver, end_date__gt=timezone.now()).exists():
            raise AuthenticationFailed('You are already on a trip')

        # Create the trip
        trip_data = request.data
        trip_data['driver'] = driver.user_id  # Assign the user ID as driver ID
        trip_serializer = TripSerializer(data=trip_data)

        if trip_serializer.is_valid():
            trip_serializer.save()
            return Response({"message": "Trip created successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response(trip_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class ValidateColisAPIView(APIView):
    def post(self, request):
        # Retrieve JWT token from the cookie
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthorized')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')

        # Check if user has driver role and get the driver
        user_id = payload.get('id')
        driver = Driver.objects.filter(user_id=user_id).first()

        if not driver:
            raise AuthenticationFailed('User is not a driver')

        # Get the current trip for the driver
        current_trip = Trip.objects.filter(driver=driver, end_date__gt=timezone.now()).first()

        if not current_trip:
            raise AuthenticationFailed('Driver does not have an ongoing trip')

        # Retrieve colis data from the request
        colis_data = request.data.get('colis')

        # Convert colis_data to a list if it's not already one
        if not isinstance(colis_data, list):
            colis_data = [colis_data]

        # Add the colis to the current trip
        for colis_id in colis_data:
            colis = Colis.objects.get(id=colis_id)
            current_trip.colis.add(colis)

        return Response({"message": "Colis validated and added to the trip successfully"}, status=status.HTTP_200_OK)

class CurrentTripColisAPIView(APIView):
    def get(self, request):
        # Retrieve JWT token from the cookie
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthorized')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')

        # Check if user has driver role and get the driver
        user_id = payload.get('id')
        driver = Driver.objects.filter(user_id=user_id).first()

        if not driver:
            raise AuthenticationFailed('User is not a driver')

        # Get the current trip for the driver
        current_trip = Trip.objects.filter(driver=driver, end_date__gt=timezone.now()).first()

        if not current_trip:
            raise AuthenticationFailed('Driver does not have an ongoing trip')

        # Retrieve colis associated with the current trip
        colis = current_trip.colis.all()
        
        # Serialize colis and retrieve associated products
        colis_data = []
        for colis_obj in colis:
            colis_info = {
                "id": colis_obj.id,
                "date": colis_obj.date,
                "ondelevry": colis_obj.ondelevry,
                "creator": colis_obj.creator,
                "destination": colis_obj.destination,
                "currentPlace": colis_obj.currentPlace,
                "transporter": colis_obj.transporter,
                "products": [{
                    "id": product.id,
                    "poids": product.poids,
                    "description": product.description,
                    "category": product.category
                } for product in colis_obj.products.all()]
            }
            colis_data.append(colis_info)

        return Response({"colis": colis_data}, status=status.HTTP_200_OK)

