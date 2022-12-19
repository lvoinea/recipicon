from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication

class CsrfExemptTokenAuthentication(TokenAuthentication):

    def enforce_csrf(self, request):
        print ("here 1")
        return  # To not perform the csrf check previously happening


class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        print ("here 2")
        return  # To not perform the csrf check previously happening