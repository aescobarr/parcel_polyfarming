from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login),
    path('logout', views.logout),
    path('formulario_parcela', views.view_formulario_parcela),
    path('formulario_parcela_nuevo', views.guardar_nueva_parcela),

    # url(r'^login/$', auth_views.login, name='login'),
    # url(r'^logout/$', auth_views.logout, {'next_page': '/base_dades/'}, name='logout'),
]
