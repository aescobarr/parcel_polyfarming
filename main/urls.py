from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login),
    path('signout', views.signout),
    path('formulario_parcela_edit', views.editar_n_parcela),
    path('formulario_parcela_nueva', views.guardar_nueva_parcela),
    path('formulario_lapso', views.guardar_editar_lapso),
    path('editar_parcela_geom', views.editar_geom_parcela),
    path('eliminar_parcela', views.eliminar_parcela),
    path('eliminar_lapso', views.eliminar_lapso),
    path('ginfoparcela', views.GetInfoParcela),#para obtener toda la info de la parcela al clicarla
    path('ginfolapso', views.GetInfoLapso),#para obtener toda la info del lapso al clicarlo
    path('gparcelas', views.GetParcelas),#para obtener la info básica que mostrar en el mapa
    path('check_n_parcela', views.check_n_parcela),
    path('generar_informe_actividad', views.generar_informe),
    path('colgar_informe_actividad', views.leer_informe),

    # url(r'^login/$', auth_views.login, name='login'),
    # url(r'^logout/$', auth_views.logout, {'next_page': '/base_dades/'}, name='logout'),
]
