from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, NotFound
from .serializers import UserSerializer, ColisSerializer , DriverSerializer ,TripSerializer,ProductSerializer,ClientSerializer,BonSerializer
from .models import User, Role ,Driver,Trip , Colis ,Product,Client
import jwt
import datetime
from rest_framework import status
from django.utils import timezone

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.db.models import Count
from django.utils import timezone
from django.db.models.functions import ExtractDay
from django.utils.dateformat import DateFormat
from django.db.models.functions import TruncDate



class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the role from the request data, defaulting to 'client' if not provided
        role_name = request.data.get('role', 'client')
        role, created = Role.objects.get_or_create(name=role_name)
        
        # Save the user instance
        user = serializer.save()
        
        # Add the role to the user
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
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
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
        except (IndexError, jwt.DecodeError, User.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')

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
                # Get the Client instance for the authenticated user
                client = Client.objects.get(user=user)

                # Update request data to include the client as creator and default state
                request.data['creator'] = client.user_id
                request.data['state'] = 'pending'

                colis_serializer = ColisSerializer(data=request.data)
                if colis_serializer.is_valid():
                    # Save colis with creator=client and default state
                    colis = colis_serializer.save()

                    # Retrieve and save associated products
                    products_data = request.data.get('products', [])
                    for product_data in products_data:
                        product_serializer = ProductSerializer(data=product_data)
                        if product_serializer.is_valid():
                            product_serializer.save()
                            colis.products.add(product_serializer.instance)
                        else:
                            # If product data is not valid, return error response
                            return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                    return Response(colis_serializer.data, status=status.HTTP_201_CREATED)
                return Response(colis_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')

        
class CreateBonView(APIView):
    def post(self, request):
        # Retrieve JWT token from the request cookies
        token = request.COOKIES.get('jwt')
        if not token:
            return Response({'error': 'JWT token not provided'}, status=status.HTTP_401_UNAUTHORIZED)

        # Decode JWT token and retrieve user information
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
            user = User.objects.get(id=user_id)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Expired JWT token'}, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return Response({'error': 'Invalid JWT token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the user has the "client" role
        if not user.roles.filter(name='client').exists():
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Parse request data
        colis_id = request.data.get('colis')
        if colis_id is None:
            return Response({'error': 'colis_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            colis = Colis.objects.get(id=colis_id)
        except Colis.DoesNotExist:
            return Response({'error': 'Colis not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create the Bon instance
        serializer = BonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['colis'] = colis  # Assign colis instance
            pdf_file = request.FILES.get('pdf_invoice')
            if pdf_file:
                file_name = default_storage.save(f'invoices/{pdf_file.name}', ContentFile(pdf_file.read()))
                serializer.validated_data['pdf_invoice'] = file_name
            
            bon = serializer.save()
            return Response(BonSerializer(bon).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ColisImageUploadView(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request, colis_id):
        # Retrieve the JWT token from the cookie
        token = request.COOKIES.get('jwt')
        if not token:
            return Response({'error': 'JWT token not provided'}, status=status.HTTP_401_UNAUTHORIZED)

        # Decode the JWT token to get the user ID
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Expired JWT token'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid JWT token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Retrieve the Colis instance
        try:
            colis = Colis.objects.get(pk=colis_id)
        except Colis.DoesNotExist:
            return Response({'error': f'Colis with ID {colis_id} does not exist'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the authenticated user is the creator of the Colis
        if user_id != colis.creator.user_id:
            return Response({'error': 'You are not authorized to upload an image for this colis'}, status=status.HTTP_403_FORBIDDEN)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the file name with user_id and creator_id
        file_name = f'{user_id}_{colis.creator_id}_{image_file.name}'

        # Save the image file to colis_images directory with the constructed file name
        try:
            colis.image.save(file_name, image_file)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Return the URL of the saved image
        image_url = request.build_absolute_uri(colis.image.url)
        return Response({'image_url': image_url}, status=status.HTTP_201_CREATED)    

class ClientColisListView(APIView):
    def get(self, request):
        # Retrieve JWT token from the request cookies
        token = request.COOKIES.get('jwt')
        if not token:
            return Response({'error': 'JWT token not provided'}, status=status.HTTP_401_UNAUTHORIZED)

        # Decode JWT token and retrieve user information
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
            user = User.objects.get(id=user_id)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Expired JWT token'}, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return Response({'error': 'Invalid JWT token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the user has the "client" role
        if not user.roles.filter(name='client').exists():
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Retrieve Colis instances associated with the client
        client_colis = Colis.objects.filter(creator=user.client)

        # Serialize Colis instances
        serializer = ColisSerializer(client_colis, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)




class RegisterClientAPIView(APIView):
    def post(self, request, *args, **kwargs):
        user_data = request.data.copy()
        role_name = user_data.pop('role', 'client')  # Extract and remove role from user data
        user_serializer = UserSerializer(data=user_data)

        if user_serializer.is_valid():
            user = user_serializer.save()

            # Add client role to the user
            client_role, created = Role.objects.get_or_create(name=role_name)
            user.roles.add(client_role)

            client_data = request.data
            client_data['user'] = user.id
            client_serializer = ClientSerializer(data=client_data)

            if client_serializer.is_valid():
                client_serializer.save()
                return Response({"message": "Client registered successfully"}, status=status.HTTP_201_CREATED)

            user.delete()  # Rollback user creation if client creation fails
            return Response(client_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterDriverAPIView(APIView):
     def post(self, request, *args, **kwargs):
        user_data = request.data.copy()
        role_name = user_data.pop('role', 'driver')  # Extract and remove role from user data
        user_serializer = UserSerializer(data=user_data)

        if user_serializer.is_valid():
            user = user_serializer.save()

            # Add client role to the user
            driver_role, created = Role.objects.get_or_create(name=role_name)
            user.roles.add(driver_role)

            driver_data = request.data
            driver_data['user'] = user.id
            driver_serializer = DriverSerializer(data=driver_data)

            if driver_serializer.is_valid():
                driver_serializer.save()
                return Response({"message": "Driver registered successfully"}, status=status.HTTP_201_CREATED)

            user.delete()  # Rollback user creation if client creation fails
            return Response(driver_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)




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

        # Add the colis to the current trip if state is pending
        for colis_id in colis_data:
            colis = Colis.objects.get(id=colis_id)
            if colis.state == 'pending':
                colis.state = 'waiting for pick up'  # Set state to "waiting for pick up"
                colis.transporter = user_id
                colis.save()
                current_trip.colis.add(colis)
            else:
                return Response({"message": "Colis state is not pending"}, status=status.HTTP_400_BAD_REQUEST)

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
        colis_in_trip = current_trip.colis.all()
        serializer = ColisSerializer(colis_in_trip, many=True)

        return Response(serializer.data)





class PickColisView(APIView):
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

        # Retrieve colis ID from the request
        colis_id = request.data.get('colis')

        if not colis_id:
            raise NotFound('Colis ID not provided')

        try:
            colis = Colis.objects.get(id=colis_id)
        except Colis.DoesNotExist:
            raise NotFound('Colis not found')

        # Check if the colis is part of the current trip
        if not current_trip.colis.filter(id=colis.id).exists():
            raise AuthenticationFailed('Colis is not part of the current trip')

        # Set the state of the colis to "picked up"
        colis.state = 'picked up'
        colis.save()

        # Update the colis current place to the current place of the trip
        colis.currentPlace = current_trip.current_place
        colis.save()

        return Response({"message": "Colis picked up successfully"}, status=status.HTTP_200_OK)




class DeliverColisView(APIView):
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

        # Retrieve colis ID from the request
        colis_id = request.data.get('colis')

        if not colis_id:
            raise NotFound('Colis ID not provided')

        try:
            colis = Colis.objects.get(id=colis_id)
        except Colis.DoesNotExist:
            raise NotFound('Colis not found')

        # Check if the colis is part of the current trip
        if not current_trip.colis.filter(id=colis.id).exists():
            raise AuthenticationFailed('Colis is not part of the current trip')

        # Set the state of the colis to "picked up"
        colis.state = 'delivered'
        colis.save()

        # Update the colis current place to the current place of the trip
        colis.currentPlace = colis.destination
        colis.save()

        return Response({"message": "Colis delivred up successfully"}, status=status.HTTP_200_OK)


class UpdateCurrentPlaceDriverAPIView(APIView):
    def post(self, request):
        # Retrieve JWT token from the headers
        token = request.headers.get('Authorization')

        if not token:
            raise AuthenticationFailed('Unauthorized')

        try:
            # Extract the token value from the "Bearer" scheme
            token = token.split()[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')

        # Check if user is a driver
        user_id = payload.get('id')
        driver = Driver.objects.filter(user_id=user_id).first()

        if not driver:
            raise AuthenticationFailed('User is not a driver')

        # Get the new current place from the request
        new_current_place = request.data.get('current_place')

        # Update the driver's current place
        driver.current_place = new_current_place
        driver.save()

        return Response({"message": "Current place updated successfully"}, status=status.HTTP_200_OK)


class GetCurrentLocationDriverAPIView(APIView):
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

        # Get the current place of the driver
        current_place = driver.current_place

        return Response({
            "current_place": current_place
        })
    

    ## admin api 

## show the clients for the admin 

class AdminClientView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if roles.filter(name='admin').exists():
                clients = Client.objects.all()
                clients_data = [
                    {
                        'id': client.user.id,
                        'first_name': client.user.first_name,
                        'last_name': client.user.last_name,
                        'email': client.user.email,
                        'phone_number': client.phone_number,
                        'current_place': client.current_place,
                    }
                    for client in clients
                ]
                return Response(clients_data, status=status.HTTP_200_OK)

            # Check for other roles
            expected_roles = ['driver', 'client']
            for role in roles:
                if role.name in expected_roles:
                    return Response({'message': f'{role.name.capitalize()} page'})

            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (IndexError, jwt.DecodeError, User.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')

##show the drivers for the admin 


class AdminDriversView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if roles.filter(name='admin').exists():
                drivers = Driver.objects.all()
                drivers_data = [
                    {
                        'id': driver.user.id,
                        'first_name': driver.user.first_name,
                        'last_name': driver.user.last_name,
                        'email': driver.user.email,
                        'cin': driver.cin,
                        'phone_number': driver.phone_number,
                        'license_number': driver.license_number,
                        'vehicle_number': driver.vehicle_number,
                        'current_place': driver.current_place,
                    }
                    for driver in drivers
                ]
                return Response(drivers_data, status=status.HTTP_200_OK)

            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (IndexError, jwt.DecodeError, User.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')


## delete a client via id 


class DeleteClientView(APIView):
    def delete(self, request, client_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            # Retrieve the client and associated user
            try:
                client = Client.objects.get(user_id=client_id)
                user = client.user
            except Client.DoesNotExist:
                return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

            # Delete the client and user
            client.delete()
            user.delete()

            return Response({'message': 'Client and associated user deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Unauthenticated')
        except User.DoesNotExist:
            raise AuthenticationFailed('Unauthenticated')
        


## delete driver via id 

class DeleteDriverView(APIView):
    def delete(self, request, driver_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            # Retrieve the driver and associated user
            try:
                driver = Driver.objects.get(user_id=driver_id)
                user = driver.user
            except Driver.DoesNotExist:
                return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)

            # Delete the driver and user
            driver.delete()
            user.delete()

            return Response({'message': 'Driver and associated user deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Unauthenticated')
        except User.DoesNotExist:
            raise AuthenticationFailed('Unauthenticated')
        


##update driver : 
class UpdateDriverView(APIView):
    def put(self, request, id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if roles.filter(name='admin').exists():
                driver = Driver.objects.get(user_id=id)
                driver_user = User.objects.get(id=id)
                # Update driver information based on request data
                driver_user.first_name = request.data.get('first_name', driver_user.first_name)
                driver_user.last_name = request.data.get('last_name', driver_user.last_name)
                driver_user.email = request.data.get('email', driver_user.email)
                driver_user.save()
                driver.cin = request.data.get('cin', driver.cin)
                driver.phone_number = request.data.get('phone_number', driver.phone_number)
                driver.license_number = request.data.get('license_number', driver.license_number)
                driver.vehicle_number = request.data.get('vehicle_number', driver.vehicle_number)
                driver.current_place = request.data.get('current_place', driver.current_place)
                driver.save()
                return Response({'message': 'Driver updated successfully'}, status=status.HTTP_200_OK)

            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (IndexError, jwt.DecodeError, User.DoesNotExist, Driver.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')
        


class UpdateClientView(APIView):
    def put(self, request, id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if roles.filter(name='admin').exists():
                client = Client.objects.get(user_id=id)
                client_user = User.objects.get(id=id)
                # Update driver information based on request data
                client_user.first_name = request.data.get('first_name', client_user.first_name)
                client_user.last_name = request.data.get('last_name', client_user.last_name)
                client_user.email = request.data.get('email', client_user.email)
                client_user.save()
                client.phone_number = request.data.get('phone_number', client.phone_number)
                client.current_place = request.data.get('current_place', client.current_place)
                client.save()
                return Response({'message': 'Client updated successfully'}, status=status.HTTP_200_OK)

            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (IndexError, jwt.DecodeError, User.DoesNotExist, Client.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')
        


class AdminColisView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
            user = User.objects.get(id=user_id)
            roles = user.roles.all()

            # Check if the user has the admin role
            if roles.filter(name='admin').exists():
                colis = Colis.objects.all()
                serializer = ColisSerializer(colis, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (IndexError, jwt.DecodeError, User.DoesNotExist):
            raise AuthenticationFailed('Unauthorized')



class UpdateColisById(APIView):
    def put(self, request, colis_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            colis = Colis.objects.get(id=colis_id)
            serializer = ColisSerializer(colis, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (jwt.DecodeError, Colis.DoesNotExist):
            raise NotFound('Colis not found')

class DeleteColisById(APIView):
    def delete(self, request, colis_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            colis = Colis.objects.get(id=colis_id)
            colis.products.clear()  # Remove all related products from the colis before deletion
            colis.delete()
            return Response({'message': 'Colis and associated products deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (jwt.DecodeError, Colis.DoesNotExist):
            raise NotFound('Colis not found')
        




class UpdateProductById(APIView):
    def put(self, request, product_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (jwt.DecodeError, Product.DoesNotExist):
            raise NotFound('Product not found')


class DeleteProductById(APIView):
    def delete(self, request, product_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(id=payload['id'])
            roles = user.roles.all()

            # Check for admin role
            if not roles.filter(name='admin').exists():
                raise AuthenticationFailed('Unauthorized')

            product = Product.objects.get(id=product_id)
            colis_list = Colis.objects.filter(products__id=product_id)
            for colis in colis_list:
                colis.products.remove(product)

            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        except (jwt.DecodeError, Product.DoesNotExist):
            raise NotFound('Product not found')
        


class ColisByStateView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Authorization header missing')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
            # Here you might need to customize how you fetch the user and its roles based on your User model
            user = User.objects.get(id=user_id)
            roles = user.roles.all()

            if roles.filter(name='admin').exists():
                colis_by_state = Colis.objects.values('state').annotate(count=Count('state'))
                data = [{'state': item['state'], 'count': item['count']} for item in colis_by_state]
                return JsonResponse(data, safe=False)
            else:
                raise AuthenticationFailed('User is not authorized to access this resource')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('JWT token expired')
        except (jwt.InvalidTokenError, User.DoesNotExist):
            raise AuthenticationFailed('Invalid JWT token')
        



class ColisMonthlyStatsView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Authorization header missing')

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user_id = payload['id']
            # Here you might need to customize how you fetch the user and its roles based on your User model
            user = User.objects.get(id=user_id)
            roles = user.roles.all()

            if roles.filter(name='admin').exists():
                # Get the start and end date of the current month
                today = timezone.now()
                start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                end_of_month = start_of_month.replace(day=1, month=start_of_month.month + 1) - timezone.timedelta(seconds=1)

                # Query colis created within the current month
                colis_by_day = Colis.objects.filter(date__gte=start_of_month, date__lte=end_of_month) \
                    .annotate(month_day=TruncDate('date')) \
                    .values('month_day') \
                    .annotate(count=Count('id'))

                data = [{'month_day': item['month_day'].strftime('%B %d'), 'count': item['count']} for item in colis_by_day]
                return JsonResponse(data, safe=False)
            else:
                raise AuthenticationFailed('User is not authorized to access this resource')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('JWT token expired')
        except (jwt.InvalidTokenError, User.DoesNotExist):
            raise AuthenticationFailed('Invalid JWT token')