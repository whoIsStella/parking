import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserManager(BaseUserManager):  
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
        

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin): 
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=10,
        choices=[('renter','Renter'),('owner','Owner'),('admin','Admin')],
        db_index=True
    )
    mfa_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_image_url = models.CharField(max_length=300, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    vehicle_license = models.CharField(max_length=20, blank=True, null=True)
    accessibility_needs = models.TextField(blank=True, null=True)
    notification_prefs = models.JSONField(default=dict)
    is_staff = models.BooleanField(default=False)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    
    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
        verbose_name = 'user'
        verbose_name_plural = 'users'

class ParkingSpace(models.Model):
    space_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_spaces')
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField()
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    price_per_day = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    is_accessible = models.BooleanField(default=False)
    features = models.JSONField(default=dict, blank=True, null=True) 
    images = models.JSONField(default=list, blank=True, null=True)  
    status = models.CharField(
        max_length=10,
        choices=[('active','Active'),('unlisted','Unlisted'),('pending','Pending'),('banned','Banned')],
        db_index=True
    )
    rules = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    availability_schedule = models.JSONField(default=dict)

    class Meta:
        indexes = [
            models.Index(fields=['features','status','owner']),
        ]
        verbose_name = 'parking space'
        verbose_name_plural = 'parking spaces'

class Booking(models.Model):
    booking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.ForeignKey(ParkingSpace, on_delete=models.CASCADE, related_name='bookings', db_index=True)
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', db_index=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    # amount_total = models.DecimalField(max_digits=10, decimal_places=2)
    # status = models.CharField(max_length=20, default='pending')
    status = models.CharField(
        max_length=12,
        choices=[('active', 'Active'), ('pending','Pending'),('confirmed','Confirmed'),('canceled','Canceled'),('completed','Completed'),('no-show','No Show')],
        db_index=True
    )
    amount_total = models.DecimalField(max_digits=8, decimal_places=2)
    payment = models.ForeignKey('payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    cancellation_reason = models.CharField(max_length=255, blank=True, null=True)  
    payment_status = models.CharField(max_length=20, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True) 
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        space_address = self.space.address if self.space else 'N/A Space'
        renter_email = self.renter.email if self.renter else 'N/A Renter'
        return f"Booking for {space_address} by {renter_email}"

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['renter']),
            models.Index(fields=['space']),
        ]

class PaymentMethod(models.Model):
    payment_method_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name_on_card = models.CharField(max_length=100, blank=True, null=True)
    card_brand = models.CharField(max_length=20)
    last4 = models.CharField(max_length=4)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    is_default = models.BooleanField(default=False)
    token = models.CharField(max_length=255, blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_default']),
        ]

class Payment(models.Model):
    payment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='booking_payment')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=12,
        choices=[('pending','Pending'),('completed','Completed'),('failed','Failed'),('refunded','Refunded'),('disputed','Disputed')],
        db_index=True,
        default='pending'
    )
    payment_method = models.ForeignKey('PaymentMethod', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refunded_at = models.DateTimeField(blank=True, null=True)
    transaction_ref = models.CharField(max_length=100, unique=True, null=True, blank=True)
    objects = models.Manager()

    def __str__(self):
        return f"Payment for Booking {self.booking.booking_id} by {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.amount:
            self.amount = self.booking.amount_total
        super().save(*args, **kwargs)

@receiver(post_save, sender=Payment)
def update_booking_payment_status(sender, instance, created, **kwargs):
    if created and instance.status == 'completed':
        booking = instance.booking
        if booking.payment_status != 'paid':
            booking.payment_status = 'paid'
            booking.save()

class Message(models.Model):
    message_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_id = models.ForeignKey('Rooms', on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    file = models.FileField(upload_to="chat_uploads/", null=True, blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_support = models.BooleanField(default=False) 
    is_flagged = models.BooleanField(default=False)
    flagged_reason = models.CharField(max_length=100, blank=True, null=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['sender']),
            models.Index(fields=['recipient']),
            models.Index(fields=['sent_at']),
        ]
        
class Rooms(models.Model):
    room_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_rooms')
    room_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['room_name']),
            models.Index(fields=['room_owner']),
        ]

    def __str__(self):
        return f"Room {self.room_name} owned by {self.room_owner.email}"

class RoomMembers(models.Model):
    room_id = models.ForeignKey(Rooms, on_delete=models.CASCADE, related_name='members')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('room_id', 'user_id')
        indexes = [
            models.Index(fields=['room_id']),
            models.Index(fields=['user_id']),
        ]

    def __str__(self):
        return f"{self.user_id.email} in {self.room_id.room_name}"

class Review(models.Model):
    review_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    target_type = models.CharField(max_length=8, choices=[('user','User'),('space','Space')], db_index=True)
    target_id = models.UUIDField(db_index=True)
    rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_visible = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
        ]

class AdminAction(models.Model):
    action_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actioned', null=True, blank=True)
    action_type = models.CharField(
        max_length=20,
        choices=[('ban','Ban'),('warn','Warn'),('refund','Refund'),('edit','Edit'),('resolve_ticket','Resolve Ticket'),('other','Other')],
        db_index=True
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['action_type']),
        ]

class SupportTicket(models.Model):
    ticket_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(
        max_length=15,
        choices=[('open','Open'),('in_progress','In Progress'),('resolved','Resolved'),('closed','Closed')],
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user']),
        ]

class ServiceRequest(models.Model):
    request_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    
    service_type = models.CharField(

        max_length=10,
        choices=[('roadside','Roadside'),('unlock','Unlock'),('other','Other')],
        db_index=True
    )
    status = models.CharField(
        max_length=15,
        choices=[('pending','Pending'),('in_progress','In Progress'),('resolved','Resolved'),('canceled','Canceled')],
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['service_type']),
            models.Index(fields=['user']),
        ]

class Notification(models.Model):
    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=15,
        choices=[('booking','Booking'),('payment','Payment'),('cancel','Cancel'),('support','Support'),('alert','Alert')],
        db_index=True
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['type']),
            models.Index(fields=['is_read']),
        ]
