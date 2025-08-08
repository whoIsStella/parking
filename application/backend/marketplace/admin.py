from django.contrib import admin
from .models import (
    User, ParkingSpace, Booking, PaymentMethod, Payment,
    Message, Review, SupportTicket, ServiceRequest, Notification
)

admin.site.register(User)
admin.site.register(ParkingSpace)
admin.site.register(Booking)
admin.site.register(PaymentMethod)
admin.site.register(Payment)
admin.site.register(Message)
admin.site.register(Review)
admin.site.register(SupportTicket)
admin.site.register(ServiceRequest)
admin.site.register(Notification)
