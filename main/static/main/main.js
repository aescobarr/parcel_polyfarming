var cargando;
$(document).ready(function() {
    $("#id_dia_entrada").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});
    $("#id_dia_salida").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});

    $(".leaflet-control-zoom-in").html("");
    $(".leaflet-control-zoom-out").html("");
//    $('#panel_parcela').dialog({
//        resizable:true,
//        modal:true,
//        width:"1000px",
//
//        autoOpen:false,
//        show: {
//            effect: "fade",
//            duration: 500
//        },
//        hide: {
//            effect: "fade",
//            duration: 500
//        }
//    });
    cargando = $.alert({
        closeIcon: false,
        icon: 'fa fa-spinner fa-spin',
        title: 'Cargando parcelas de usuario...',
        content: '',
        buttons: {
            buttonA: {
                text: '',
                isHidden: true
            }
        }
    });

    $.ajax({
        type: "POST",
        url: "/gparcelas",
        success: function(data) {
            //mostrar_panel_parcela();
            $.each(data, function(k,v){
                crear_wkt(v["geom"],v["num_parcela"]);
                //data(v["geom"]);
            });
            recalc_tooltips();
            activar_clicar();
            map.setView([41.666141,1.761932], 8);
            cargando.close();
        },
        error: function (data){
            alert("Error:"+data);
           console.log(data); // the message
           map.setView([41.666141,1.761932], 8);
        }
    });
    // restore
//    console.log(parcelas["fields"]);
//    if(parcelas.length > 0){ //si el usuario tiene alguna parcela
//        $.each(parcelas, function(k,v){
//            console.log(v);
//            //data(v["geom"]);
//        });
//    }
    //L.geoJSON(JSON.parse(shape_for_db)).addTo(mymap);

//    /// CUANDO SE CLICAN LAS OPCIONES
//    $(".boton_herramientas").on("click",function(evt){
//        if($(this).attr("id")=="herramienta_crear"){
//            new L.Draw.Polygon(map, drawControl.options.polygon).enable();
//        }else if($(this).attr("id")=="herramienta_editar"){
//            new L.editing.enable(); //_updatePoly
//        }
//
//    });

});

function pasar_wkt(){ // pasa las geometrias a wkt
    var geojson = editableLayers.toGeoJSON();
    var wicket = new Wkt.Wkt();
    wicked.read( JSON.stringify(geojson.features[0].geometry) );
    //console.log(wkt.write());
    return wicket.write();
}

function crear_wkt(geom,num_parcela){
    //Dibujar WKT
    var wicket = new Wkt.Wkt();
    wicket.read(geom);
    var geom_obj = wicket.toObject();//{icon: greenIcon}
    //asignar parcela al objeto
    geom_obj.num_parcela = num_parcela;
    //
    geom_obj.valor_inicial=geom_obj["_latlngs"];
    editableLayers.addLayer(geom_obj);
//    geom_obj.on('pm:edit', function(e){layer_editada = geom_obj;});//Cuando se edita algo de una layer
    geom_obj.on('pm:update', function(e){//Cuando se ha terminado de editar
        editar_layer(e);
//        var geojson = e.layer.toGeoJSON();
//        var wkt = new Wkt.Wkt();
//        wkt.read( JSON.stringify(geojson));
//        edited_parcela_geom = wkt.write();
    })

}

function mostrar_panel_parcela(){
    if($("#panel_parcela").is(":hidden")){
        $("#panel_parcela").show("slide",{"direction":"left"},500);
        $("#map").hide("slide",{"direction":"right"},500);
    }else{
        $("#panel_parcela").hide("slide",{"direction":"left"},500);
        $("#map").show("slide",{"direction":"right"},500);
    }
//    $("#panel_parcela").dialog('open');
}
//function cerrar_panel_parcela(){
//    $("#panel_parcela").dialog('close');
//}

function activar_clicar(){
    editableLayers.eachLayer(function(layer) {
        layer.on('click', function(){
//            console.log(this);
//            alert(this._leaflet_id);
//            alert(this.num_parcela);
            $.ajax({
                type: "POST",
                url: "/ginfoparcela",
                data:{"num_parcela":this.num_parcela},
                success: function(data) {
                    mostrar_panel_parcela();
                    $("#id_num_parcela").val(data["num_parcela"]);
                    $("#id_dia_entrada").val(data["dia_entrada"]);
                    $("#id_dia_salida").val(data["dia_salida"]);
                },
                error: function (data){
                    console.log(data);
                    alert("Error:"+data["Error"]);
                }
            });
        });
    });
}
$("#formulario").submit(function(e){ //Si se edita una Parcela
    var form = $(this);
    //if(validar_form(form)){
    $.ajax({
                url: '/formulario_parcela_edit',
                type: 'POST',
                data: form.serialize(),//+"&geom="+edited_parcela_geom,
                success: function(data) {
                    alert("Cambios aplicados con éxito!");
                },
                error: function (data){
                   alert(data);
                   console.log(data); // the message
                }
    });
    edited_parcela_geom="";
    //}
    e.preventDefault(); //para no ejecutar el actual submit del form
});

function eliminar_parcela(){
    $.confirm({
                title: 'Eliminar parcela',
                content: 'Seguro que deseas borrar la parcela '+$("#id_num_parcela").val()+' y sus datos?',
                buttons: {
                    confirm: {
                        text: 'Si',
                        btnClass: 'btn-blue',
                        action: function(){
                            //.features[0].geometry)
                            $.ajax({
                                type: "POST", //<-- Necesario el token_ajax.js
                                //dataType: "json",
                                url: "/eliminar_parcela",
                                data:{'num_parcela':$("#id_num_parcela").val()},
                                success: function(data) {
                                    alert("Parcela eliminada con éxito.");
                                    location.reload();
                                    //mostrar_panel_parcela();
                                },
                                error: function (data){
                                   alert(data);
                                   console.log(data); // the message
                                }
                            });
                        }
                    },
                    cancel: {
                        text: 'No',
                        btnClass: 'btn-red',
                        action: function(){
                            //$.alert('Canceled!');
                        }
                    }
                }
            });
}
$("#id_num_parcela").on("input", function(){
        var valor_inicial = $("#id_num_parcela").val();
        $.ajax({
                url: '/check_n_parcela',
                type: 'POST',
                data: $("#formulario").serialize(),//+"&geom="+edited_parcela_geom,
                success: function(data) {
                    alert("Disponible");
                },
                error: function (data){
                   alert("Error: Este numero de parcela ya existe.");
                   $("#id_num_parcela").val(valor_inicial);
                }

        });
})