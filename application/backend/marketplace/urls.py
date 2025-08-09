from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (MeView, LoginView, RegisterView, UserViewSet, ParkingSpaceViewSet,
                    BookingViewSet, PaymentMethodViewSet, PaymentViewSet, MessageViewSet, ReviewViewSet,
                    AdminActionViewSet, SupportTicketViewSet, ServiceRequestViewSet, NotificationViewSet)

router = DefaultRouter()
router.register(r'users', UserViewSet) 
router.register(r'spaces', ParkingSpaceViewSet) 
router.register(r'bookings', BookingViewSet)
router.register(r'payment-methods', PaymentMethodViewSet)
router.register(r'payments', PaymentViewSet) 
router.register(r'messages', MessageViewSet) 
router.register(r'reviews', ReviewViewSet) 
router.register(r'admin-actions', AdminActionViewSet) 
router.register(r'support-tickets', SupportTicketViewSet) 
router.register(r'service-requests', ServiceRequestViewSet) 
router.register(r'notifications', NotificationViewSet)  

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
]


