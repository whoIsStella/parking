from django.db import models 
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .models import User, ParkingSpace, Booking, PaymentMethod, Payment, Message, Review, AdminAction, SupportTicket, ServiceRequest, Notification
from rest_framework import status, permissions, viewsets, filters
from rest_framework.views import APIView
#from rest_framework.decorators import api_view
#from .serializers import ReviewSerializer This has alreaady been imported, see line 29
from rest_framework.permissions import IsAuthenticatedOrReadOnly 
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotAuthenticated
from django.core.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone



from .models import (
    User, ParkingSpace, Booking, PaymentMethod, Payment,
    Message, Review, AdminAction, SupportTicket, ServiceRequest, Notification
)

from .serializers import (
    UserSerializer, RegisterSerializer, ParkingSpaceSerializer, BookingSerializer, PaymentMethodSerializer,
    PaymentSerializer, MessageSerializer, ReviewSerializer, AdminActionSerializer,
    SupportTicketSerializer, ServiceRequestSerializer, NotificationSerializer
)

from .permissions import (
    IsAdminUser,
    IsOwnerOrAdmin,
    IsRenterOrOwnerOrAdmin,
    IsSelfOrAdmin,
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
            
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        print(
                'REQUEST USER:', request.user, 
                'is_authenticated:', request.user.is_authenticated,
                'role:', getattr(request.user, "role", None)
            )
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({"detail": "Account is inactive/banned."}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token), 
                "refresh": str(refresh),             
                "user": UserSerializer(user).data,
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request): 
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

class UserViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'address']
    ordering_fields = ['created_at', 'email', 'role']

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated] 
        return [permission() for permission in self.permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        user_to_flag = self.get_object()
        if request.user == user_to_flag:
            raise ValidationError("You cannot flag your own account.")

        AdminAction.objects.create(
            admin=request.user,
            user=user_to_flag,
            action_type='warn', 
            reason=request.data.get('reason', 'User flagged for review.')
        )
        return Response({"status": "user flagged for review"}, status=status.HTTP_200_OK)
    

class ParkingSpaceViewSet(viewsets.ModelViewSet):
    queryset = ParkingSpace.objects.all() 
    serializer_class = ParkingSpaceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['address', 'description']
    ordering_fields = ['price_per_hour', 'created_at', 'status']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.AllowAny] 
        elif self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsOwnerOrAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated] 
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        if self.request.user.role != 'owner' and not self.request.user.role == 'admin':
            raise PermissionDenied("Only users with the 'owner' or 'admin' role can create parking spaces.")
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if self.action == 'list':
            if user.is_authenticated and user.role == 'admin':
                return ParkingSpace.objects.all() 
            elif user.is_authenticated and user.role == 'owner':
                return ParkingSpace.objects.filter(owner=user)
            return ParkingSpace.objects.filter(status='active')
        elif self.action == 'retrieve':
            return ParkingSpace.objects.all()
        return super().get_queryset()

from .permissions import IsRenterOrOwnerOrAdmin
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all() 
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsRenterOrOwnerOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['space__address', 'renter__email']
    ordering_fields = ['start_time', 'created_at', 'status']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            raise NotAuthenticated("Authentication required.")
        
        queryset = Booking.objects.select_related('space', 'renter', 'space__owner')

        if user.role == 'renter':
            return queryset.filter(renter=user)
        elif user.role == 'owner':
            return queryset.filter(space__owner=user)
        elif user.role == 'admin':
            return queryset.all()
        return Booking.objects.none()
    
    def perform_create(self, serializer):
        space_id = self.request.data.get("space")
        if not space_id:
            raise ValidationError({"space": "This field is required."})
        try:
            space = ParkingSpace.objects.get(pk=space_id)
        except ParkingSpace.DoesNotExist:
            raise ValidationError({"space": "Invalid parking space."})
        serializer.save(space=space, renter=self.request.user)
        

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'is_default']

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated] 
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSelfOrAdmin] 
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        print(f"[DEBUG] Creating payment method for user: {self.request.user}")
        if not PaymentMethod.objects.filter(user=self.request.user).exists():
            serializer.save(user=self.request.user, is_default=True)
        else:
            serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ['renter', 'owner']:
            return PaymentMethod.objects.filter(user=user)
        elif user.is_authenticated and user.role == 'admin':
            return PaymentMethod.objects.all()
        return PaymentMethod.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """Returns the payment methods for the current user."""
        methods = PaymentMethod.objects.filter(user=request.user)
        serializer = self.get_serializer(methods, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def set_default(self, request, pk=None):
        """Set this method as default for the current user."""
        user = request.user
        PaymentMethod.objects.filter(user=user).update(is_default=False)
        updated = PaymentMethod.objects.filter(user=user, pk=pk).update(is_default=True)

        if updated:
            return Response({"message": "Default payment method set."})
        else:
            return Response({"error": "Payment method not found."}, status=404)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options'] 

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['content', 'sender__email', 'recipient__email']
    ordering_fields = ['sent_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSelfOrAdmin] 
        return [permission() for permission in self.permission_classes]
    
    def notify_user_ws(self, user, notification_dict):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user.user_id}",
            {
                "type": "send.notification",
                "notification": notification_dict
            }
        )

    def perform_create(self, serializer):  
        message = serializer.save(sender=self.request.user)
        if message.recipient != self.request.user:
            notification = Notification.objects.create(
                user=message.recipient,
                type='message', 
                content=f"You have a new message from {message.sender.get_short_name()}." 
            )
            
            from .serializers import NotificationSerializer
            self.notify_user_ws(
                notification.user,
                NotificationSerializer(notification).data
            )

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role in ['renter', 'owner']:
                return Message.objects.filter(
                    models.Q(sender=user) | models.Q(recipient=user)
                ).distinct()
            elif user.role == 'admin':
                return Message.objects.all()
        return Message.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def flag_message(self, request, pk=None):
        message = self.get_object()
        reason = request.data.get('reason', 'Message flagged for review by admin.')
        message.is_flagged = True
        message.flagged_reason = reason
        message.save()
        AdminAction.objects.create(
            admin=request.user,
            action_type='warn', 
            reason=f"Message {message.message_id} flagged: {reason}"
        )
        return Response({"status": "message flagged", "message_id": message.message_id}, status=status.HTTP_200_OK) 
    
# import logging
# logger = logging.getLogger(__name__)
    
# class UserStatusView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         print("DEBUG: request.user =", request.user)
#         print("DEBUG: request.auth =", request.auth)
#         print("DEBUG: is_authenticated =", request.user.is_authenticated)
#         user_ids = request.data.get("user_ids", [])
#         status_dict = get_users_online_status(user_ids)
#         return Response(status_dict)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.AllowAny] 
        elif self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSelfOrAdmin]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if self.action in ['list', 'retrieve']:
            if user.is_authenticated and user.role == 'admin':
                return Review.objects.all() 
            return Review.objects.filter(is_visible=True) 
        return super().get_queryset()

#Try api_view right here Juliana!


class AdminActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminAction.objects.all()
    serializer_class = AdminActionSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['action_type', 'reason', 'user__email', 'admin__email']
    ordering_fields = ['created_at']
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)
        
    def get_queryset(self):
        return super().get_queryset()




class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['subject', 'description', 'user__email']
    ordering_fields = ['created_at', 'status']

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSelfOrAdmin]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='open')

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ['renter', 'owner']:
            return SupportTicket.objects.filter(user=user)
        elif user.is_authenticated and user.role == 'admin':
            return SupportTicket.objects.all()
        return SupportTicket.objects.none()


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['service_type', 'notes', 'user__email']
    ordering_fields = ['created_at', 'status']
    
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSelfOrAdmin]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role in ['renter', 'owner']:
                return ServiceRequest.objects.filter(user=user)
            elif user.role == 'admin':
                return ServiceRequest.objects.all()
        return ServiceRequest.objects.none()


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['sent_at', 'is_read']

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin] 
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ['renter', 'owner']:
            return Notification.objects.filter(user=user)
        elif user.is_authenticated and user.role == 'admin':
            return Notification.objects.all()
        return Notification.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if notification.user != request.user and not (hasattr(request.user, "role") and request.user.role == "admin"):
            raise PermissionDenied("You do not have permission to mark this notification as read.")
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def create_notification(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.data.get('user'), sent_at=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsSelfOrAdmin])
    def resolve_request(self, request, pk=None):
        service_request = self.get_object()
        serializer = ServiceRequestSerializer(service_request, data=request.data, partial = True)
        if serializer.is_valid(raise_exception=True):
            serializer.save(status='resolved', resolved_at=timezone.now())
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        return Response(serializer.data)

# @api_view(['POST'])       This is inside of the NotificationView. Try it on line 357 instead.
# def create_review(request):
#     serializer = ReviewSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
