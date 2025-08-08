from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken

@database_sync_to_async
def get_user(token_key):
    from marketplace.models import User
    try:
        # from rest_framework_simplejwt.tokens import UntypedToken
        # from rest_framework_simplejwt.authentication import JWTAuthentication

        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return User.objects.get(user_id=user_id)
    except (InvalidToken, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.app(scope, receive, send)



# from urllib.parse import parse_qs
# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async
# from rest_framework_simplejwt.tokens import UntypedToken
# from .models import *
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.contrib.auth.models import AnonymousUser

# @database_sync_to_async
# def get_user_from_token(token):
#     try:
#         # from rest_framework_simplejwt.tokens import UntypedToken
#         # from rest_framework_simplejwt.authentication import JWTAuthentication

#         validated_token = UntypedToken(token)
#         user = JWTAuthentication().get_user(validated_token)
#         return user
#     except Exception:
#         # from django.contrib.auth.models import AnonymousUser
#         return AnonymousUser()

# class JWTAuthMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         query_string = scope.get("query_string", b"").decode()
#         token = parse_qs(query_string).get("token", [None])[0]
#         scope["user"] = await get_user_from_token(token)
#         return await super().__call__(scope, receive, send)

#     def __call__(self, scope):
#         return JWTAuthMiddlewareInstance(scope, self.inner)

# class JWTAuthMiddlewareInstance:
#     def __init__(self, scope, inner):
#         self.scope = scope
#         self.inner = inner

#     async def __call__(self, receive, send):
#         query_string = self.scope.get("query_string", b"").decode()
#         token = parse_qs(query_string).get("token", [None])[0]

#         self.scope["user"] = await get_user_from_token(token)

#         inner = self.inner(self.scope)
#         return await inner(receive, send)


