# -*- coding: utf-8 -*-
from django.forms import ModelForm, Textarea, TextInput, Select, EmailInput, NumberInput
from django import forms
from django.forms.widgets import *
from main.models import *
class ParcelasForm(forms.ModelForm):
    class Meta:
        model = Parcelas
        fields = [
            # 'usuario',
            'num_parcela',
            'geom',
            'dia_entrada',
            'cobertura_gramineas',
            'cobertura_leguminosa',
            'altura_sp_dominante',
            'porcen_suelo_desnudo',
            'descomp_bonigas',
            'dia_salida',
            'alt_pasto_no_comido',
            'num_animales',
            'porcen_suelo_desnudo_salida',
            'porcen_alimento_para_vacas',
            'num_balas'
        ]