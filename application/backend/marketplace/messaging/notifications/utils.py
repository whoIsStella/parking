# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync

# def get_users_online_status(user, notification_dict):
#     channel_layer = get_channel_layer()
#     async_to_sync(channel_layer.group_send)(
#         f"user_{user.user_id}",
#         {
#             "type": "send_notification",
#             "notification": notification_dict
#         }
#     )
