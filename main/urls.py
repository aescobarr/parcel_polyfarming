from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login),
    path('logout', views.logout),
    path('formulario_parcela_edit', views.guardar_editar_parcela),
    path('formulario_parcela_nueva', views.guardar_nueva_parcela),
    path('editar_parcela_geom', views.editar_geom_parcela),
    path('ginfoparcela', views.GetInfoParcela),#para obtener toda la info de la parcela al clicarla
    path('gparcelas', views.GetParcelas),#para obtener la info básica que mostrar en el mapa
    path('check_n_parcela', views.check_n_parcela),

    # url(r'^login/$', auth_views.login, name='login'),
    # url(r'^logout/$', auth_views.logout, {'next_page': '/base_dades/'}, name='logout'),
]
