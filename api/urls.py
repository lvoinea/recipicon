from django.urls import include, re_path

from . import views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    re_path(r'^auth/login', views.LoginEp),
    re_path(r'^auth/signup', views.SignUpEp),
    re_path(r'^auth/logout', views.LogoutEp),
    re_path(r'^auth/closeup', views.CloseUpEp),
    re_path(r'^auth/password-reset', views.PassResetEp),
    re_path(r'^auth/request-password-reset', views.PassResetRequestEp),
    re_path(r'^recipes', views.RecipeListEp.as_view()),
    re_path(r'^recipe/(?P<recipeId>[_0-9]+)', views.RecipeEp.as_view()),
    re_path(r'^shopping-list/(?P<shoppingListId>[_0-9]+)/recipe/(?P<recipeId>[0-9]+)', views.ShoppingRecipeItemEp.as_view()),
    re_path(r'^shopping-list/(?P<shoppingListId>[_0-9]+)', views.ShoppingListEp.as_view()),
    re_path(r'^ingredients', views.IngredientListEp.as_view()),
    re_path(r'^ingredient/(?P<ingredientId>[_0-9]+)', views.IngredientEp.as_view()),
    re_path(r'^ingredientbyname/(?P<ingredientName>.+)', views.IngredientByNameEp.as_view()),
    re_path(r'^shops', views.ShopListEp.as_view()),
    re_path(r'^shop/current', views.CurrentShopEp.as_view()),
    re_path(r'^shop/(?P<shopId>[_0-9]+)', views.ShopEp.as_view()),
    re_path(r'^locations', views.LocationListEp.as_view()),
    re_path(r'^location/(?P<locationId>[_0-9]+)', views.LocationEp.as_view()),
    re_path(r'^stats', views.StatsEp.as_view()),
    re_path(r'^', include(router.urls)),
]