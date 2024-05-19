from django.urls import path
from .views import RegisterView,LoginView,UserView,LogoutView,LoggedInUsersView,CreateColisView,RegisterDriverAPIView, DriverCheckView ,CreateTripAPIView, ValidateColisAPIView,CurrentTripColisAPIView


urlpatterns = [

    
    path('register',RegisterView.as_view()),
    path('login',LoginView.as_view()),
    path('user',UserView.as_view()),
    path('logout',LogoutView.as_view()),
    path('logeduser',LoggedInUsersView.as_view()),
    path('createcolis',CreateColisView.as_view()),
    path('registerdriver',RegisterDriverAPIView.as_view()),
    path('drivercheck',DriverCheckView.as_view()),
    path('createTrip',CreateTripAPIView.as_view()),
    path('validateColis',ValidateColisAPIView.as_view()),
    path('currentTripColis',CurrentTripColisAPIView.as_view()),



]