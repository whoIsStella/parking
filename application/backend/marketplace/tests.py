from django.test import TestCase

import redis
try:
    redis.StrictRedis(host='redis', port=6379).ping()
except redis.exceptions.ConnectionError:
    print("Redis not available")
    raise Exception("Redis is not running. Please start Redis server.")