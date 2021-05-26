var cargando_parcelas;
var editando_parcela="";
var editando_lapso="";
$(document).ready(function() {
    $("#id_dia_visita").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});
    $("#id_dia_entrada").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});
    $("#id_dia_salida").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});
    $("#id_dia_visita").datepicker($.datepicker.regional['es']);
    $("#id_dia_entrada").datepicker($.datepicker.regional['es']);
    $("#id_dia_salida").datepicker($.datepicker.regional['es']);

    $(".leaflet-control-zoom-in").html("");
    $(".leaflet-control-zoom-out").html("");
    cargando_parcelas = $.alert({
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
            cargando_parcelas.close();
        },
        error: function (data){
            alert("Error:"+data);
           console.log(data); // the message
           map.setView([41.666141,1.761932], 8);
        }
    });
});
////--------------------------FUNIONES LEAFLET------------------------------------
function pasar_wkt(){ // pasa las geometrias a wkt
    var geojson = editableLayers.toGeoJSON();
    var wicket = new Wkt.Wkt();
    wicked.read( JSON.stringify(geojson.features[0].geometry) );
    //console.log(wkt.write());
    return wicket.write();
}

function crear_wkt(geom,num_parcela){
    var wicket = new Wkt.Wkt();
    wicket.read(geom);
    var geom_obj = wicket.toObject();//{icon: greenIcon}
    geom_obj.num_parcela = num_parcela;
    //
    geom_obj.valor_inicial=geom_obj["_latlngs"];
    editableLayers.addLayer(geom_obj);
    geom_obj.on('pm:update', function(e){//Cuando se ha terminado de editar
        editar_layer(e);
    })
}
function activar_clicar(){
    editableLayers.eachLayer(function(layer) {
        layer.on('click', function(){
            ocultar_panel_mapa();
            mostrar_panel_parcela();
            getinfoparcela(this.num_parcela);
        });
    });
}

function getinfoparcela(num_parcela){
        $.ajax({
                type: "POST",
                url: "/ginfoparcela",
                data:{"num_parcela":num_parcela},
                success: function(data) {
//                    mostrar_panel_parcela();
                    editando_parcela = data["num_parcela"];
                    $("#botones_n_parcela_aceptar").prop('disabled',true);
                    $("#id_num_parcela").val(data["num_parcela"]);
                    $("#info_header_n_parcela").html(data["num_parcela"]);
                    //Lapsos/actividad
                    if(data["lapsos"]==""){
                        $("#container_lapsos").html('<p align="center">Sin actividad en esta parcela.</p>');
                        $("#panel_graficos").html('<div id="grafico_coberturas"></div><div id="grafico_alturas"></div><div id="grafico_altura_pasto_no_comido"></div><div id="grafico_num_animales"></div><div id="grafico_num_balas"></div>');
                    }else{
                        var array_coberturas=[];
                        var array_alturas=[];
                        var array_altura_pasto_no_comido=[];
                        var array_num_animales=[]
                        var array_num_balas=[]
                        $("#container_lapsos").html('');
                        $.each(data["lapsos"], function(i, lapso){
                            if(lapso["dia_visita"]==""){
                                $("#container_lapsos").append('<button type="button" class="btn btn-outline-success col-md-3" onclick="clk_lapso('+lapso["id"]+');"><i class="bi-calendar2-check" style="font-size: 2rem;"></i><br>Actividad animal <br>'+lapso["dia_entrada"]+' a '+lapso["dia_salida"]+'</button>');
//                                if(lapso["cobertura_gramineas"]!=null){
                                if(lapso["dia_entrada"]!=null){
                                    array_coberturas.push([lapso["dia_entrada"],lapso["cobertura_gramineas"],lapso["cobertura_gramineas"]+"%",lapso["cobertura_leguminosa"],lapso["cobertura_leguminosa"]+"%"]);
                                    array_alturas.push([lapso["dia_entrada"],lapso["altura_gramineas"],lapso["altura_gramineas"]+"cm",lapso["altura_leguminosa"],lapso["altura_leguminosa"]+"cm"]);
                                }
                                if(lapso["dia_salida"]!=null){
                                    array_altura_pasto_no_comido.push([lapso["dia_salida"],lapso["alt_pasto_no_comido"],lapso["alt_pasto_no_comido"]+"cm"]);
                                    array_num_animales.push([lapso["dia_salida"],lapso["num_animales"],lapso["num_animales"]]);
                                    array_num_balas.push([lapso["dia_salida"],lapso["num_balas"],lapso["num_balas"]]);
                                }
//                                }
                            }else
                            {
                                $("#container_lapsos").append('<button type="button" class="btn btn-outline-info col-md-3" onclick="clk_lapso('+lapso["id"]+');"><i class="bi-calendar2" style="font-size: 2rem;"></i><br>Visita<br> el '+lapso["dia_visita"]+'</button>');
                            }
                        });
                        $('#grafico_coberturas').chartinator({
                            columns: //columnas_coberturas,
                            [
                                  {label: 'Fecha', type: 'string'},
                                  {label: 'Cobertura Gramineas', type: 'number'},
                                  {role: 'annotation', type: 'string'},
                                  {label: 'Cobertura Leguminosa', type: 'number'},
                                  {role: 'annotation', type: 'string'}
                            ],
                            rows: array_coberturas,
                            chartType: 'LineChart',
                            lineChart: {
                                width: null,
                                height: 310,
                                chartArea: {
                                    left: "10%",
                                    top: 40,
                                    width: "85%",
                                    height: "65%"
                                },
                                fontName: 'Roboto',
                                title: 'Coberturas (%) en dias de entrada',
                                titleTextStyle: {
                                    fontSize: 'h4'
                                },
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#94ac27', '#3691ff'],
                                tooltip: {
                                    trigger: 'focus'
                                }
                            }
                        });
                        $('#grafico_alturas').chartinator({
                            columns: //columnas_coberturas,
                            [
                                  {label: 'Fecha', type: 'string'},
                                  {label: 'Altura Gramineas', type: 'number'},
                                  {role: 'annotation', type: 'string'},
                                  {label: 'Altura Leguminosa', type: 'number'},
                                  {role: 'annotation', type: 'string'}
                            ],
                            rows: array_alturas,
                            chartType: 'LineChart',
                            lineChart: {
                                width: null,
                                height: 310,
                                chartArea: {
                                    left: "10%",
                                    top: 40,
                                    width: "85%",
                                    height: "65%"
                                },
                                fontName: 'Roboto',
                                title: 'Alturas (cm) en dias de entrada',
                                titleTextStyle: {
                                    fontSize: 'h4'
                                },
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#94ac27', '#3691ff'],
                                tooltip: {
                                    trigger: 'focus'
                                }
                            }
                        });

                        $('#grafico_altura_pasto_no_comido').chartinator({
                            columns: //columnas_coberturas,
                            [
                                  {label: 'Fecha', type: 'string'},
                                  {label: 'Altura pasto no comido', type: 'number'},
                                  {role: 'annotation', type: 'string'},
                            ],
                            rows: array_altura_pasto_no_comido,
                            chartType: 'LineChart',
                            lineChart: {
                                width: null,
                                height: 310,
                                chartArea: {
                                    left: "10%",
                                    top: 40,
                                    width: "85%",
                                    height: "65%"
                                },
                                fontName: 'Roboto',
                                title: 'Altura (cm) pasto no comido en dias de salida',
                                titleTextStyle: {
                                    fontSize: 'h4'
                                },
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#94ac27', '#3691ff'],
                                tooltip: {
                                    trigger: 'focus'
                                }
                            }
                        });

                        $('#grafico_num_animales').chartinator({
                            columns: //columnas_coberturas,
                            [
                                  {label: 'Fecha', type: 'string'},
                                  {label: 'Nº de animales', type: 'number'},
                                  {role: 'annotation', type: 'number'},
                            ],
                            rows: array_num_animales,
                            chartType: 'LineChart',
                            lineChart: {
                                width: null,
                                height: 310,
                                chartArea: {
                                    left: "10%",
                                    top: 40,
                                    width: "85%",
                                    height: "65%"
                                },
                                fontName: 'Roboto',
                                title: 'Nº de animales en dias de salida',
                                titleTextStyle: {
                                    fontSize: 'h4'
                                },
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#94ac27', '#3691ff'],
                                tooltip: {
                                    trigger: 'focus'
                                }
                            }
                        });

                        $('#grafico_num_balas').chartinator({
                            columns: //columnas_coberturas,
                            [
                                  {label: 'Fecha', type: 'string'},
                                  {label: 'Nº de balas', type: 'number'},
                                  {role: 'annotation', type: 'number'},
                            ],
                            rows: array_num_balas,
                            chartType: 'LineChart',
                            lineChart: {
                                width: null,
                                height: 310,
                                chartArea: {
                                    left: "10%",
                                    top: 40,
                                    width: "85%",
                                    height: "65%"
                                },
                                fontName: 'Roboto',
                                title: 'Nº de balas en dias de salida',
                                titleTextStyle: {
                                    fontSize: 'h4'
                                },
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#94ac27', '#3691ff'],
                                tooltip: {
                                    trigger: 'focus'
                                }
                            }
                        });


/////---------------------------------------------
//                        var options = {
//                            exportEnabled: true,
//                            animationEnabled: true,
//                            title:{
//                                text: "Gráfico de actividad"
//                            },
////                            subtitles: [{
////                                text: "Click Legend to Hide or Unhide Data Series"
////                            }],
////                            axisX: {
////                                title: "Fecha"
////                            },
//                            axisY: {
//                                title: "Units Sold",
//                                titleFontColor: "#4F81BC",
//                                lineColor: "#4F81BC",
//                                labelFontColor: "#4F81BC",
//                                tickColor: "#4F81BC"
//                            },
////                            axisY2: {
////                                title: "Profit in USD",
////                                titleFontColor: "#C0504E",
////                                lineColor: "#C0504E",
////                                labelFontColor: "#C0504E",
////                                tickColor: "#C0504E"
////                            },
//                            toolTip: {
//                                shared: true
//                            },
//                            legend: {
//                                cursor: "pointer",
//                                itemclick: toggleDataSeries
//                            },
//                            data: [{
//                                type: "spline",
//                                name: "Cobertura Gramineas",
//                                showInLegend: true,
//                                xValueFormatString: "MMM YYYY",
//                                yValueFormatString: "#,##0 Units",
//                                dataPoints: [{datos_grafico_cobertura_gramineas}]
//                            }]
//                        };
//                        $('#panel_graficos').CanvasJSChart()
                        /// --------
//                        $('#grafico_cobertura_gramineas').simpleBarGraph({
//                              data: datos_grafico_cobertura_gramineas
//                        });
//                        $('#grafico_altura_gramineas').simpleBarGraph({
//                              data: datos_grafico_altura_gramineas
//                        });
                    }
//                    $("#id_dia_entrada").val(data["dia_entrada"]);
//                    $("#id_dia_salida").val(data["dia_salida"]);
                },
                error: function (data){
                    console.log(data);
                    alert("Error:"+data["Error"]);
                }
            });
}

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

function eliminar_lapso(){
    $.confirm({
                title: 'Eliminar actividad',
                content: 'Seguro que deseas borrar esta actividad y sus datos?',
                buttons: {
                    confirm: {
                        text: 'Si',
                        btnClass: 'btn-blue',
                        action: function(){
                            //.features[0].geometry)
                            $.ajax({
                                type: "POST", //<-- Necesario el token_ajax.js
                                //dataType: "json",
                                url: "/eliminar_lapso",
                                data:{'num_parcela':$("#id_num_parcela").val(),'id_lapso':editando_lapso},
                                success: function(data) {
                                    alert("Actividad eliminada con éxito.");
                                    //location.reload();
                                    getinfoparcela($("#id_num_parcela").val());
//                                    mostrar_panel_parcela();
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

function clk_lapso(id){
    $.ajax({
        type: "POST",
        url: "/ginfolapso",
        data:{"id":id, "num_parcela":$("#id_num_parcela").val()},
        success: function(data) {
            editando_lapso = id;
//            mostrar_panel_info_lapso();
            ocultar_panel_lapsos();
            mostrar_panel_info_lapso();
            if(data["dia_visita"]==""){
                $("#radio_no_visita").prop("checked", true).trigger("click");
                $("#id_dia_visita").val("");
                $("#id_dia_entrada").val(data["dia_entrada"]);
                $("#id_cobertura_gramineas").val(data["cobertura_gramineas"]);
                $("#id_altura_gramineas").val(data["altura_gramineas"]);
                $("#id_cobertura_leguminosa").val(data["cobertura_leguminosa"]);
                $("#id_altura_leguminosa").val(data["altura_leguminosa"]);
                $("#id_punto_optimo").val(data["punto_optimo"]);
                $("#id_descomp_bonigas").val(data["descomp_bonigas"]);
                $("#id_dia_salida").val(data["dia_salida"]);
                $("#id_alt_pasto_no_comido").val(data["alt_pasto_no_comido"]);
                $("#id_num_animales").val(data["num_animales"]);
                $("#id_num_balas").val(data["num_balas"]);
            }else{
                $("#radio_visita").prop("checked", true).trigger("click");
                $("#id_dia_visita").val(data["dia_visita"]);
            }
            //$("#id_num_parcela").val(data["num_parcela"]);

        },
        error: function (data){
            console.log(data);
            alert("Error:"+data["Error"]);
        }
    });
}
////--------------------------FUNCIONES VISUALES------------------------------------

//function mostrar_panel_parcela(){
//    editando_parcela = "";
//    if($("#panel_parcela").is(":hidden")){
//        $("#panel_parcela").show("slide",{"direction":"left"},500);
//        $("#map").hide("slide",{"direction":"right"},500);
//    }else{
//        $("#panel_parcela").hide("slide",{"direction":"left"},500);
//        $("#map").show("slide",{"direction":"right"},500);
//    }
////    $("#panel_parcela").dialog('open');
//}
///-------
function mostrar_panel_mapa(){
    $("#map").show("slide",{"direction":"right"},500);
}
function ocultar_panel_mapa(){
    $("#map").hide("slide",{"direction":"right"},500);
}
///-------
function mostrar_panel_parcela(){
    $("#panel_parcela").show("slide",{"direction":"left"},500);
}
function ocultar_panel_parcela(){
    editando_parcela = "";
    $("#panel_parcela").hide("slide",{"direction":"left"},500);
}
///-------
function mostrar_panel_lapsos(){
$("#panel_lapsos").show("slide",{"direction":"left"},500);
$("#panel_graficos").show("slide",{"direction":"left"},500);
}
function ocultar_panel_lapsos(){
$("#panel_lapsos").hide("slide",{"direction":"left"},500);
$("#panel_graficos").hide("slide",{"direction":"left"},500);
}
///-------
function mostrar_panel_info_lapso(){
    $("#panel_info_lapso").show("slide",{"direction":"right"},500);
}
function ocultar_panel_info_lapso(){
    $("#panel_info_lapso").hide("slide",{"direction":"right"},500);
}
///-------
function mostrar_panel_lapso_visita(){
    $("#info_lapso_visita").show("slide",{"direction":"left"},500);
}
function ocultar_panel_lapso_visita(){
    $("#info_lapso_visita").hide("slide",{"direction":"left"},500);
}
///-------
function mostrar_panel_lapso_no_visita(){
    $("#info_lapso_no_visita").show("slide",{"direction":"right"},500);
}
function ocultar_panel_lapso_no_visita(){
    $("#info_lapso_no_visita").show("slide",{"direction":"right"},500);
}
///-------

function cancelar_guardar_actividad(){
    ocultar_panel_info_lapso();
    mostrar_panel_lapsos();
}

function cancelar_editar_parcela(){
    ocultar_panel_parcela();
    mostrar_panel_mapa();
}
//function mostrar_panel_lapsos(){
//    $("#panel_lapsos").show("slide",{"direction":"left"},500);
//    $("#panel_info_lapso").hide("slide",{"direction":"right"},500);
//}

//function mostrar_panel_info_lapso(){
//    $("#panel_lapsos").hide("slide",{"direction":"left"},500);
//    $("#panel_info_lapso").show("slide",{"direction":"right"},500);
//}
//function mostrar_panel_lapso_visita(){
//    $("#info_lapso_visita").show("slide",{"direction":"left"},500);
//    $("#info_lapso_no_visita").hide("slide",{"direction":"right"},500);
//}

//function mostrar_panel_lapso_no_visita(){
//    $("#info_lapso_visita").hide("slide",{"direction":"left"},500);
//    $("#info_lapso_no_visita").show("slide",{"direction":"right"},500);
//}

//function cerrar_panel_parcela(){
//    $("#panel_parcela").dialog('close');
//}

function btn_nuevo_lapso(){
    editando_lapso = "";
    ocultar_panel_lapsos();
    mostrar_panel_info_lapso();
    $("#formulario_lapso")[0].reset();
}

////--------------------------FORMULARIOS------------------------------------

$("#formulario_parcela").submit(function(e){ //Si se edita una Parcela
    var form = $(this);
    //if(validar_form(form)){
    $.ajax({
                url: '/formulario_parcela_edit',
                type: 'POST',
                data: form.serialize()+"&num_parcela_original="+editando_parcela,
                success: function(data) {
                    alert("Cambios aplicados con éxito!");
                    editando_parcela = $("#id_num_parcela").val();
                    $("#botones_n_parcela_aceptar").prop('disabled',true);
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

$("#formulario_lapso").submit(function(e){ //Si se edita una Parcela
    var form = $(this);
    //if(validar_form(form)){
    $.ajax({
                url: '/formulario_lapso',
                type: 'POST',
                data: form.serialize()+"&num_parcela="+$("#id_num_parcela").val()+"&editando_lapso="+editando_lapso,//+"&geom="+edited_parcela_geom,
                success: function(data) {
                    alert("Actividad guardada!");
                    editando_lapso="";
                    getinfoparcela($("#id_num_parcela").val());
                    ocultar_panel_info_lapso();
                    mostrar_panel_lapsos();
//                    mostrar_panel_lapsos();
                },
                error: function (data){
                   alert("Error al añadir la actividad, comprueba que los datos sean correctos.");
                   console.log(data); // the message
                }
    });
    edited_parcela_geom="";
    //}
    e.preventDefault(); //para no ejecutar el actual submit del form
});

$("#id_num_parcela").on("input", function(){
//    $("#botones_n_parcela *").prop('disabled',false);
    $("#botones_n_parcela_aceptar").prop('disabled',false);

//        var valor_inicial = $("#id_num_parcela").val();
//        $.ajax({
//                url: '/check_n_parcela',
//                type: 'POST',
//                data: $("#formulario_parcela").serialize(),//+"&geom="+edited_parcela_geom,
//                success: function(data) {
//                    $("#botones_n_parcela *").prop('disabled',false);
//                },
//                error: function (data){
//                   alert("Error: Este numero de parcela ya existe.");
//                   $("#id_num_parcela").val(valor_inicial);
//                }
//
//        });
});