from django.conf import settings
import redis

_redis_instance = None

def get_redis_instance():
    global _redis_instance
    if _redis_instance is None:
        _redis_instance = redis.StrictRedis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True
        )
    return _redis_instance

def set_user_online(user_id):
    redis_conn = get_redis_instance()
    redis_conn.set(f"online_user_{user_id}", "1", ex=300)  

def set_user_offline(user_id):
    redis_conn = get_redis_instance()
    redis_conn.delete(f"online_user_{user_id}")

def get_online_users():
    redis_conn = get_redis_instance()
    online_keys = redis_conn.keys('online_user_*')
    return {int(key.split('_')[-1]) for key in online_keys}