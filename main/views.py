from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as do_login
from django.contrib.auth.decorators import login_required
from django.core import serializers
from main.models import *
from main.forms import *
from main.serializers import *
from django.http import *
import datetime
import json
from copy import copy


@login_required(login_url='/login')
def index(request):
    #if request.user.is_authenticated:
    return render(request, "main/index.html",{'form':ParcelasForm})#,'parcelas':json_parcelas})


    #return redirect('/login')

def login(request):
    # Creamos el formulario de autenticación vacío
    form = AuthenticationForm()
    if request.method == "POST":
        # Añadimos los datos recibidos al formulario
        form = AuthenticationForm(data=request.POST)
        # Si el formulario es válido...
        if form.is_valid():
            # Recuperamos las credenciales validadas
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            # Verificamos las credenciales del usuario
            user = authenticate(username=username, password=password)

            # Si existe un usuario con ese nombre y contraseña
            if user is not None:
                # Hacemos el login manualmente
                do_login(request, user)
                # Y le redireccionamos a la portada
                return redirect('/')

    # Si llegamos al final renderizamos el formulario
    return render(request, "main/login.html", {'form': form})

def guardar_nueva_parcela(request):
    usuario = request.user
    geom = request.POST["geom_wkt"]
    num_parcela = 1
    try:
        #Asignar automáticamente un número de parcela(busca hueco si se eliminó una anteriormente)
        if(Parcelas.objects.filter(usuario=request.user).exists()):#Si tiene al menos una parcela creada
            nparcelas = Parcelas.objects.filter(usuario=request.user).values("num_parcela").order_by("num_parcela")
            min_value = nparcelas[0]["num_parcela"]
            chosen_num = 1
            for num in nparcelas:
                if(min_value <= num["num_parcela"]):
                    min_value += ((num["num_parcela"]-min_value)+1)

            #chosen_num = min_value
            num_parcela = min_value#chosen_num
        #
        form = ParcelasForm(data={'usuario':usuario,'num_parcela':num_parcela,'geom':geom})  # request.POST
        if form.is_valid():
            form.save()
            # return HttpResponseRedirect(reverse('main:index'))
            #return HttpResponse("{}", content_type='application/json;')
            return JsonResponse({"num_parcela": num_parcela})
    except:
        response = JsonResponse({"error": "Error al crear la parcela."})
        response.status_code = 400
        return response

def guardar_editar_parcela(request):
    #geom = request.POST["geom_wkt"]
    try:
        if request.method == 'POST':
            usuario = request.user
            try:#mirar si existe la parcela antes de editarla
                id = Parcelas.objects.get(usuario=usuario, num_parcela=request.POST["num_parcela"]).id
                instancia = get_object_or_404(Parcelas, id=id)
            except:
                response = JsonResponse({"error": "Error: Editando una parcela que no existe."})
                response.status_code = 400
                return response
            #
            # ##Si tambien se ha modificado el poligono aparte de los datos:
            # if request.POST["geom"] != "" and request.POST["geom"] != "undefined" and request.POST["geom"] is not None:
            #     instancia.geom = request.POST["geom"]
            # #
            #Como no pasamos los obligatorios como la geometria,usuario,etc en el Post,los añadimos manualmente
            post = copy(request.POST)
            post["usuario"] = instancia.usuario
            post["geom"] = instancia.geom
            post["ultima_modificacion"] = datetime.datetime.now()
            #post[""] = instancia.
            #Y ahora si que podemos pasar los datos juntos
            form = ParcelasForm(post, instance=instancia)#modificar un form
            # form = ParcelasForm(instance=instancia)#cargar un form
            if form.is_valid():
                form.save()
                return HttpResponse("{}", content_type='application/json;')
    except:
        response = JsonResponse({"error": "Error al crear la parcela."})
        response.status_code = 400
        return response

def editar_geom_parcela(request):
    try:
        if request.method == 'POST':
            usuario = request.user
            geom = request.POST["geom_wkt"]
            try:#mirar si existe la parcela antes de editarla
                id = Parcelas.objects.get(usuario=usuario, num_parcela=request.POST["num_parcela"]).id
                instancia = get_object_or_404(Parcelas, id=id)
            except:
                response = JsonResponse({"error": "Error: Editando una parcela que no existe."})
                response.status_code = 400
                return response
            #
            # ##Si tambien se ha modificado el poligono aparte de los datos:
            # if request.POST["geom"] != "" and request.POST["geom"] != "undefined" and request.POST["geom"] is not None:
            #     instancia.geom = request.POST["geom"]
            # #
            #Como no pasamos los obligatorios como la geometria,usuario,etc en el Post,los añadimos manualmente
            post = copy(request.POST)
            post["usuario"] = instancia.usuario
            post["geom"] = geom
            post["ultima_modificacion"] = datetime.datetime.now()
            #post[""] = instancia.
            #Y ahora si que podemos pasar los datos juntos
            form = ParcelasForm(post, instance=instancia)#modificar un form
            # form = ParcelasForm(instance=instancia)#cargar un form
            if form.is_valid():
                form.save()
                return HttpResponse("{}", content_type='application/json;')
    except:
        response = JsonResponse({"error": "Error al crear la parcela."})
        response.status_code = 400
        return response


def GetParcelas(request):
    parcelas = Parcelas.objects.filter(usuario=request.user).order_by('num_parcela')
    resultado = []
    for p in parcelas:
        resultado.append({'num_parcela': p.num_parcela, 'geom':p.geom})

    # form = ParcelasForm(instance=instancia)#cargar un form
    resultado = json.dumps(resultado)
    return HttpResponse(resultado, content_type='application/json;')

    #parcelas = Parcelas.objects.filter(usuario=request.user).order_by('num_parcela')#.values("geom")
    #resultado = []
    #for p in parcelas:
    # json1 = serializers.serialize('json', parcelas.clean_fields() )
    # json_parcelas = json.dumps(json1)
    # return render(request, "main/index.html",{'form':ParcelasForm,'parcelas':json_parcelas})

def GetInfoParcela(request):
    try:
        if request.method == 'POST':
            parcela = Parcelas.objects.get(usuario=request.user, num_parcela=request.POST["num_parcela"])
            #resultado = []
            #Cambiar el formato de la base de datos al que usamos en los formularios
            try:
                entrada = parcela.dia_entrada.strftime('%d-%m-%Y')
            except:
                entrada = ""
            try:
                salida = parcela.dia_salida.strftime('%d-%m-%Y')
            except:
                salida = ""
            # entrada = datetime.strptime(parcela.dia_entrada, '%Y-%m-%d')
            # entrada.strftime('%d-%m-%Y')
            #
            resultado ={'num_parcela': parcela.num_parcela, 'dia_entrada': entrada, 'dia_salida':salida}
            resultado = json.dumps(resultado)
            return HttpResponse(resultado, content_type='application/json;')
        #si llega hasta aquí es que si existe ya dicha parcela
        response = JsonResponse({"Error": "Error al enviar los datos."})
        response.status_code = 400
        return response
    except:
        response = JsonResponse({"Error": "Hay 2 o más parcelas con el mismo numero."})
        response.status_code = 400
        return response

def logout(request):
    logout(request)
    return redirect('/')

def check_n_parcela(request): #al modificar un num_parcela, comprueba dinámicamente si esa parcela ya existe
    try:
        if request.method == 'POST':
            if(Parcelas.objects.filter(usuario=request.user, num_parcela=request.POST["num_parcela"]).exists()):
                return HttpResponse("{}", content_type='application/json;')
        #si llega hasta aquí es que si existe ya dicha parcela
        response = JsonResponse({"Error": "El nº de parcela introducido ya existe."})
        response.status_code = 400
        return response
    except:
        response = JsonResponse({"Error": "Error con el nº de parcela o usuario."})
        response.status_code = 400
        return response



# @login_required(login_url='/login/')
# def view_formulario_parcela(request):
#     if request.user.is_authenticated():
#         usuario = request.user.username
#     nuevo="1"
#     admin=False
#     if request.method == 'POST':
#         form = ParcelasForm(request.POST)
        # if request.user.groups.filter(name="Admins"):
        #     admin=True
        # try:
        #     id_form=request.POST["id_form"]
        #     instance = get_object_or_404(ParcelasForm, id=id_form)
        #     # form = CitacionsEspeciesForm(instance=instance)
        # except:
        #     instance = None
        #     #nuevo = "1"
        #     #form = CitacionsEspeciesForm
        #
        # # QUE TIPO DE FORMULARIO ES:
        # if instance is None:# Si se guarda por primera vez el form
        #     form = ParcelasForm(request.POST)
        # else:
        #     if "cargar_form" in request.POST: # Si solo se carga el form
        #         form = CitacionsEspeciesForm(instance=instance)
        #         nuevo="0"
        #     else:#Si se modifica un form ya existente
        #         form = CitacionsEspeciesForm(request.POST, instance=instance)
        #         nuevo="0"
        # ###
        #
        # if form.is_valid() and "cargar_form" not in request.POST: # Si se envia un id_form quiere decir que se esta cargando un proyecto,no hay que guardarlo
        #     # process the data in form.cleaned_data as required
        #     # ...
        #     # redirect to a new URL: