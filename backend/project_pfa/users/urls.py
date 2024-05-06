from django.urls import path
from .views import RegisterView,LoginView,UserView,LogoutView,LoggedInUsersView,CreateColisView


urlpatterns = [
    path('register',RegisterView.as_view()),
    path('login',LoginView.as_view()),
    path('user',UserView.as_view()),
    path('logout',LogoutView.as_view()),
    path('logeduser',LoggedInUsersView.as_view()),
    path('createcolis',CreateColisView.as_view()),
   

    

]