from rest_framework.authentication import TokenAuthentication 

class CsrfExemptTokenAuthentication(TokenAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening