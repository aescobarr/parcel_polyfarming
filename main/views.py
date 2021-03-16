from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as do_login
from django.contrib.auth.decorators import login_required
from main.models import *
from main.forms import *
import datetime


##@login_required(login_url='/login')
def index(request):
    if request.user.is_authenticated:
        parcelas = Parcelas.objects.filter(usuario=request.user.username)
        return render(request, "main/index.html",{'form':ParcelasForm,'parcelas':parcelas})
    # En otro caso redireccionamos al login
    return redirect('/login')

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
    form = ParcelasForm(request.POST).cleaned_data
    form.usuario = request.user.username
    form.fecha_creacion = datetime.date.today().strftime('%d-%m-%Y')
    form.geom_4326 = form.geom.transform(4326, True)
    try:
        if form.is_valid():
            form.save
    except:
        None


def logout(request):
    logout(request)
    return redirect('/')

# @login_required(login_url='/login/')
def view_formulario_parcela(request):
    if request.user.is_authenticated():
        usuario = request.user.username
    nuevo="1"
    admin=False
    if request.method == 'POST':
        form = ParcelasForm(request.POST)
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