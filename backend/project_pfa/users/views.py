from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer, ColisSerializer
from .models import User, Role
import jwt
import datetime
from rest_framework import status

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
                serializer = ColisSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save(creator=user)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                raise AuthenticationFailed('Unauthorized')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
