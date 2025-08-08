from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (MeView, LoginView, RegisterView, UserViewSet, ParkingSpaceViewSet,
                    BookingViewSet, PaymentMethodViewSet, PaymentViewSet, MessageViewSet, ReviewViewSet,
                    AdminActionViewSet, SupportTicketViewSet, ServiceRequestViewSet, NotificationViewSet)
                    #create_review)
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
#from .serializers import PaymentMethodSerializer
#from .models import PaymentMethod
 #Note: Litterally everything is tied to 'users' so 
 #there is no specific person assigned this to this endpoint.
#If you see a broken componant associated with 'users' then just fix it.
# You will learn how to use websockets to be able to
#work on messages, notifications, and service requests.
router = DefaultRouter()
router.register(r'users', UserViewSet) #everyone  DONE-ISH
router.register(r'spaces', ParkingSpaceViewSet) #juan  DONE
router.register(r'bookings', BookingViewSet) # juan DONE
router.register(r'payment-methods', PaymentMethodViewSet) # nathan  DONE
router.register(r'payments', PaymentViewSet)  # nathan
router.register(r'messages', MessageViewSet)  # stella DONE-ISH
# the messages are late and out of order but, hey, at least they are there.
router.register(r'reviews', ReviewViewSet) # el juliana
router.register(r'admin-actions', AdminActionViewSet) # fatma
router.register(r'support-tickets', SupportTicketViewSet) # krish   DONE
router.register(r'service-requests', ServiceRequestViewSet) # krish  DONE
router.register(r'notifications', NotificationViewSet)  # stella DONE

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    #path('api/', include('marketplace.urls')) This is already being called in parkingbnb/urls.py and settings.py
]


