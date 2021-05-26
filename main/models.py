from django.conf import settings
##from django.db import models
from django.contrib.gis.db import models


class Parcelas(models.Model):
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) #obligatorio
    num_parcela = models.IntegerField(null=False) #obligatorio
    geom = models.TextField(blank=False, null=False) #obligatorio
    # geom_4326 = models.GeometryField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultima_modificacion = models.DateTimeField(blank=True, null=True)


    class Meta:
        managed = True
        db_table = 'parcelas'

class Lapsos(models.Model):
    punto_optimo_choices = (
        ('Antes del punto óptimo', 'Antes del punto óptimo'),
        ('En el punto óptimo', 'En el punto óptimo'),
        ('Después del punto óptimo', 'Después del punto óptimo')
    )
    descomp_bonigas_choices = (
        ('No se ven', 'No se ven'),
        ('Se ven poco', 'Se ven poco'),
        ('Se ven claramente', 'Se ven claramente')
    )

    id = models.AutoField(primary_key=True)
    parcela = models.ForeignKey(Parcelas, on_delete=models.CASCADE) #obligatorio
    dia_visita = models.DateField(blank=True, null=True)
    dia_entrada = models.DateField(blank=True, null=True)
    cobertura_gramineas = models.FloatField(blank=True, null=True)
    altura_gramineas = models.FloatField(blank=True, null=True)
    cobertura_leguminosa = models.FloatField(blank=True, null=True)
    altura_leguminosa = models.FloatField(blank=True, null=True)
    punto_optimo = models.CharField(max_length=32, blank=True, null=True, choices=punto_optimo_choices)
    descomp_bonigas = models.CharField(max_length=32, blank=True, null=True, choices=descomp_bonigas_choices)
    # -----
    dia_salida = models.DateField(blank=True, null=True)
    alt_pasto_no_comido = models.FloatField(blank=True, null=True)
    num_animales = models.IntegerField(blank=True, null=True)
    num_balas = models.IntegerField(blank=True, null=True)
    #
    # altura_sp_dominante = models.FloatField(blank=True, null=True)
    # porcen_suelo_desnudo = models.FloatField(blank=True, null=True)
    # descomp_bonigas = models.FloatField(blank=True, null=True)
    # porcen_suelo_desnudo_salida = models.FloatField(blank=True, null=True)
    # porcen_alimento_para_vacas = models.FloatField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultima_modificacion = models.DateTimeField(blank=True, null=True)


    class Meta:
        managed = True
        db_table = 'lapsos'