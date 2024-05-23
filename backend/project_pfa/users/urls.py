from django.urls import path
from .views import RegisterView,LoginView,UserView,LogoutView,LoggedInUsersView,CreateColisView,RegisterDriverAPIView, DriverCheckView ,CreateTripAPIView, ValidateColisAPIView,CurrentTripColisAPIView,RegisterClientAPIView,ColisImageUploadView,ClientColisListView,PickColisView,DeliverColisView,UpdateCurrentPlaceDriverAPIView,GetCurrentLocationDriverAPIView,CreateBonView,AdminClientView,AdminDriversView,DeleteClientView,DeleteDriverView,UpdateDriverView,UpdateClientView,AdminColisView,UpdateColisById,DeleteColisById
from .views import UpdateProductById, DeleteProductById, ColisByStateView , ColisMonthlyStatsView

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
    path('registerclient',RegisterClientAPIView.as_view()),
    path('mycolislist',ClientColisListView.as_view()),
    path('addimagecolis/<int:colis_id>/', ColisImageUploadView.as_view(), name='add_image_colis'),
    path('pickcolis',PickColisView.as_view()),
    path('delivercolis',DeliverColisView.as_view()),
    path('updatedriverplace',UpdateCurrentPlaceDriverAPIView.as_view()),
    path('getdriverplace',GetCurrentLocationDriverAPIView.as_view()),
    path('generatebon',CreateBonView.as_view()),
    ##admin api 
     path('adminclients',AdminClientView.as_view()),
     path('admindrivers',AdminDriversView.as_view()),
     path('delete-client/<int:client_id>/', DeleteClientView.as_view(), name='delete-client'),
     path('delete-driver/<int:driver_id>/', DeleteDriverView.as_view(), name='delete-driver'),
     path('update-driver/<int:id>/', UpdateDriverView.as_view(), name='update_driver'),
     path('update-client/<int:id>/', UpdateClientView.as_view(), name='update_driver'),
     path('admincolis',AdminColisView.as_view()),
     path('update-colis/<int:colis_id>/', UpdateColisById.as_view(), name='update-colis'),
     path('delete-colis/<int:colis_id>/', DeleteColisById.as_view(), name='delete-colis'),
     path('update-product/<int:product_id>/', UpdateProductById.as_view(), name='update_product'),
     path('delete-product/<int:product_id>/', DeleteProductById.as_view(), name='delete_product'),
     path('ColisByState',ColisByStateView.as_view()),
     path('ColisMonthlyStats',ColisMonthlyStatsView.as_view())




]