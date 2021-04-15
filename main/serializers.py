from main.models import *
from rest_framework import serializers
#
# class ParcelasSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Parcelas
#         fields =['id','usuario','num_parcela','geom','geom_4326','dia_entrada','cobertura_gramineas','cobertura_leguminosa','altura_sp_dominante','porcen_suelo_desnudo','descomp_bonigas','dia_salida','alt_pasto_no_comido','num_animales','porcen_suelo_desnudo_salida','porcen_alimento_para_vacas','num_balas']
#         read_only_fields = ['id','usuario']
#     def create(self, validated_data):
#         return Parcelas(**validated_data)
#     def update(self, instance, validated_data):