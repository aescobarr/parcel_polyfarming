# -*- coding: utf-8 -*-
from django.forms import ModelForm, Textarea, TextInput, Select, EmailInput, NumberInput
from django import forms
from django.forms.widgets import *
from main.models import *
class ParcelaForm(forms.ModelForm):
    class Meta:
        model = Parcelas
        fields = (
            'usuario',
            'num_parcela',
            'geom',
            #'geom_4326',
            # 'dia_entrada',
            # 'cobertura_gramineas',
            # 'cobertura_leguminosa',
            # 'altura_sp_dominante',
            # 'porcen_suelo_desnudo',
            # 'descomp_bonigas',
            # 'dia_salida',
            # 'alt_pasto_no_comido',
            # 'num_animales',
            # 'porcen_suelo_desnudo_salida',
            # 'porcen_alimento_para_vacas',
            # 'num_balas',
        )
        # widgets = {
        #     'id': forms.HiddenInput(),
        # }

class LapsoForm(forms.ModelForm):
    # dia_entrada = DateInput(input_formats=settings.DATE_INPUT_FORMATS)
    # dia_salida = DateInput(input_formats=settings.DATE_INPUT_FORMATS)
    class Meta:
        model = Lapsos
        fields = (
            'parcela',
            'dia_visita',
            'dia_entrada',
            'cobertura_gramineas',
            'altura_gramineas',
            'cobertura_leguminosa',
            'altura_leguminosa',
            'punto_optimo',
            'descomp_bonigas',
            'dia_salida',
            'alt_pasto_no_comido',
            'num_animales',
            'num_balas',
        )