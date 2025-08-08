from rest_framework.exceptions import PermissionDenied
from rest_framework import serializers

from . import admin

from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_id', 'email', 'first_name', 'last_name', 'phone_number',
                  'role', 'mfa_enabled', 'is_active', 'profile_image_url',
                  'address', 'vehicle_license', 'accessibility_needs', 'notification_prefs')
        read_only_fields = ('user_id', 'email', 'is_active', 'is_staff', 'is_superuser', 'created_at', 'role')
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'renter'),
        )
        return user                                            #these corrospond with the tables in M2 and the models
    
class ParkingSpaceSerializer(serializers.ModelSerializer):
    owner_email = serializers.ReadOnlyField(source='owner.email')
    owner_id = serializers.ReadOnlyField(source='owner.user_id')

    class Meta:
        model = ParkingSpace
        fields = ('space_id', 'owner', 'owner_email', 'owner_id', 'address', 'latitude', 'longitude',
                  'description', 'price_per_hour', 'price_per_day', 'is_accessible',
                  'features', 'images', 'status', 'rules', 'created_at', 'updated_at',
                  'availability_schedule')
        read_only_fields = ('space_id', 'owner_email', 'owner_id', 'created_at', 'updated_at')
        extra_kwargs = {
            'owner': {'write_only': True, 'required': False} 
        }


class BookingSerializer(serializers.ModelSerializer):
    renter = UserSerializer(read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True, source='space.owner')
    owner_id = serializers.ReadOnlyField(source='space.owner.user_id')
    space = serializers.PrimaryKeyRelatedField(
        queryset=ParkingSpace.objects.all()
    )
    payment_status = serializers.CharField(read_only=True) 

    class Meta:
        model = Booking
        fields = [
            'booking_id', 'renter', 'space', 'start_time', 'end_time',
            'amount_total', 'status', 'payment_status', 'owner', 'owner_id',
        ]
        read_only_fields = ('renter', 'owner', 'owner_id')
        
class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    recipient_email = serializers.ReadOnlyField(source='recipient.email')
    booking_id = serializers.ReadOnlyField(source='booking.booking_id')
    file_url = serializers.SerializerMethodField()
    
    recipient = serializers.UUIDField(write_only=True)

    def validate_recipient(self, value):
        try:
            user = User.objects.get(user_id=value)
            return user
        except User.DoesNotExist:
            # Accept "admin-user-id" as a special case
            if str(value) == 'admin-user-id':
                admin_user = admin.get_admin_user()
                if admin_user:
                    return admin_user
                raise serializers.ValidationError("Admin user not found.")
            raise serializers.ValidationError("Recipient user not found.")

    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            request = self.context.get("request")
            url = obj.file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    class Meta:
        model = Message
        fields = (
            'message_id', 'sender', 'sender_email', 'recipient', 'recipient_email',
            'booking', 'booking_id', 'content', 'sent_at', 'is_support',
            'is_flagged', 'flagged_reason', 'file', 'file_url'
        )
        read_only_fields = ('message_id', 'sender', 'sender_email', 'sent_at', 'file_url')
        extra_kwargs = {
            'file': {'required': False, 'allow_null': True},
            'booking': {'required': False, 'allow_null': True}
            
        }
        
class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['payment_method_id', 'user', 'card_brand', 'last4', 'expiry_month', 'expiry_year', 'is_default']

    def create(self, validated_data):
        print("[DEBUG] Creating payment method for:", validated_data.get("user", "Unknown User"))
        return PaymentMethod.objects.create(**validated_data)

class PaymentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        booking = validated_data.get('booking')
        requesting_user = self.context['request'].user

        if not booking:
            raise serializers.ValidationError("A booking is required to create a payment.")

        if booking.renter != requesting_user and booking.space.owner != requesting_user:
             raise PermissionDenied("You are not authorized to pay for this booking.")

        if Payment.objects.filter(booking=booking).exists():
            raise serializers.ValidationError("A payment for this booking already exists.")

        validated_data['user'] = requesting_user
        validated_data['amount'] = booking.amount_total
        validated_data['status'] = 'completed'  
        
        payment_method = PaymentMethod.objects.filter(user=requesting_user, is_default=True).first()
        if not payment_method:
            payment_method = PaymentMethod.objects.filter(user=requesting_user).first()
        
        if not payment_method:
            raise serializers.ValidationError("No payment method found for this user. Please add one.")
            
        validated_data['payment_method'] = payment_method
        
        validated_data['transaction_ref'] = f"txn_{booking.booking_id}"
        
        validated_data['status'] = 'completed' 

        payment = super().create(validated_data)
        if payment.status == 'completed':
            booking = payment.booking
            booking.status = 'completed'
            booking.payment_status = 'paid'
            booking.save()
        return payment
                
    class Meta:
        model = Payment
        fields = [
            'payment_id', 'booking', 'user', 'amount', 'status',
            'payment_method', 'created_at', 'refunded_at', 'transaction_ref'
        ]
        read_only_fields = ('payment_id', 'user', 'created_at', 'refunded_at', 'transaction_ref', 'amount')
        
class ReviewSerializer(serializers.ModelSerializer):  #This is the ReviewSerializer (lines 163-187). Please don't make two of them
    author = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        write_only=True
    )
    class Meta:
        model = Review
        fields = (
            'review_id', 'author', 'booking', 'target_type', 'target_id',
            'rating', 'comment', 'created_at', 'is_visible'
        )
        read_only_fields = ('review_id', 'created_at', 'is_visible')

    def validate(self, data):
        if not (1 <= data['rating'] <= 5):
            raise serializers.ValidationError({"rating": "Rating must be between 1 and 5."})
        
        requesting_user = data['author']
        
        
        booking = data.get('booking')
        if not booking or booking.renter != requesting_user or booking.status != 'completed':
            raise serializers.ValidationError({"author": "You can only review parking spaces for completed bookings you made."})
        return data

    

      #      renter=requesting_user, 
      #       space=data['parking_space'],
      #       status='completed'
      #  ).exists():
      #      raise serializers.ValidationError({"user": "You can only review parking spaces for completed bookings."})
      #   return data


class AdminActionSerializer(serializers.ModelSerializer):
    admin_email = serializers.ReadOnlyField(source='admin.email')
    user_email = serializers.ReadOnlyField(source='user.email') 

    class Meta:
        model = AdminAction
        fields = ('action_id', 'admin', 'admin_email', 'user', 'user_email', 'action_type', 'reason', 'created_at')
        read_only_fields = ('action_id', 'admin', 'admin_email', 'created_at')
        extra_kwargs = {
            'admin': {'write_only': True, 'required': False}, 
        }
        
class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta:
        model = SupportTicket
        fields = ('ticket_id', 'user', 'user_email', 'subject', 'description',
                  'status', 'created_at', 'resolved_at')
        read_only_fields = ('ticket_id', 'user', 'user_email', 'created_at', 'resolved_at')
        extra_kwargs = {
            'status': {'read_only': True}, 
        }
        
class ServiceRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    booking_id = serializers.ReadOnlyField(source='booking.booking_id')
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = ServiceRequest
        fields = ('request_id', 'booking', 'booking_id', 'user', 'user_email',
                  'service_type', 'status', 'created_at', 'resolved_at', 'notes')
        read_only_fields = ('request_id', 'user', 'user_email', 'created_at', 'resolved_at')
        extra_kwargs = {
            'booking': {'write_only': True, 'required': True}, 
            'status': {'read_only': True},
        }
        
class NotificationSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta:
        model = Notification
        fields = ('notification_id', 'user', 'user_email', 'type', 'content', 'is_read', 'sent_at')
        read_only_fields = ('notification_id', 'user', 'user_email', 'sent_at', 'is_read')

