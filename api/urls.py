from django.conf.urls import include,url

from . import views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    url(r'^login', views.LoginEp),
    url(r'^logout', views.LogoutEp),
    url(r'^recipes', views.RecipeListEp.as_view()),
    url(r'^recipe/(?P<recipe_id>[_0-9]+)', views.RecipeEp.as_view()),
    url(r'^ingredients', views.IngredientsEp.as_view()),
    url(r'^', include(router.urls)),
    
]