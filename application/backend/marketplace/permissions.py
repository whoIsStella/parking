# marketplace/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'owner') and obj.owner == request.user:
            return True
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsRenterOrOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return (obj.renter == request.user or
                obj.space.owner == request.user or
                (request.user and request.user.is_authenticated and request.user.role == 'admin'))


class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'sender') and obj.sender == request.user: # For Message sender
            return True
        if hasattr(obj, 'author') and obj.author == request.user: # For Review author
            return True
        if request.method in permissions.SAFE_METHODS and hasattr(obj, 'recipient') and obj.recipient == request.user:
            return True

        return request.user and request.user.is_authenticated and request.user.role == 'admin'