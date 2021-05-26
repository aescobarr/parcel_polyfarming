var editableLayers;
var edited_parcela_geom;
var map;
var layer_editada;
$(document).ready(function() {

    var base = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    });

    var ign = new L.TileLayer('http://www.ign.es/wmts/mapa-raster?service=WMTS&request=GetTile&version=1.0.0&layers=&styles=&tilematrixSet=GoogleMapsCompatible&format=image/jpeg&height=256&width=256&layer=MTN&style=default&tilematrix={z}&tilerow={y}&tilecol={x}',{
        maxZoom: 18,
        minZoom: 0,
        continuousWorld: true,
        attribution: 'Capa Raster CC BY 4.0 <a href="http://www.ign.es/web/ign/portal">ign.es</a>'
    });

    var orto25k_icc = L.tileLayer.wms('http://geoserveis.icgc.cat/icc_mapesbase/wms/service?', {
        layers: 'orto25m',
        transparent: true
    });

    var baseLayers = {
		"IGN": ign,
		"Ortofotos 25k ICC": orto25k_icc,
		"Open street map": base
	};
	map = L.map('map', {
            layers: [base,orto25k_icc,ign]
    }).setView([41.666141,1.761932], 20);
	L.control.layers(baseLayers).addTo(map);
	editableLayers = new L.FeatureGroup();
    //////---------
    // CREAR BARRA DE CONTROL(con leaflet GEOMAN)
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      dragMode: false,
      cutPolygon: false,
      allowSelfIntersection: false,
      removalMode: false
    });
    //traducción
    const customTranslation = {
      "tooltips": {
        "firstVertex": "",
        "continueLine": "",
        "finishPoly": "Clica el primer punto cuando desees acabar",
      },
      "actions": {
        "finish": "Finalizar",
        "cancel": "Cancelar",
        "removeLastVertex": "Quitar último punto"
      },
      "buttonTitles": {
        "drawPolyButton": "Crear nueva parcela",
        "editButton": "Editar una parcela",
        "deleteButton": "Eliminar una parcela",
      }
    };
    map.pm.setLang('polyfarminges', customTranslation, 'es');
    //
    //Añadir la accion cancelar a la opcion de editar
    const acciones = [
    'finishMode',
    { text: 'Cancelar', onClick: () => cancelar_edicion() }
    ]
    map.pm.Toolbar.changeActionsOfControl('editMode', acciones);
    //////-------
    map.addLayer(editableLayers);
    map.on('pm:create', function(e){//map.on(L.Draw.Event.CREATED, function (e) {
//        e.layer.on('pm:edit', function(e){layer_editada = e;});//Cuando se edita algo de una layer
        e.layer.on('pm:update', function(e){//Cuando se ha terminado de editar
            editar_layer(e);
            layer_editada = e;
        })
        //console.log(e);
        var type = e.layerType,layer = e.layer;
        editableLayers.addLayer(layer);
        var string_json = JSON.stringify(editableLayers.toGeoJSON());
        //alert(layer);
        $.confirm({
            title: 'Crear parcela',
            content: 'Deseas crear esta parcela?',
            buttons: {
                confirm: {
                    text: 'Si',
                    btnClass: 'btn-blue',
                    action: function(){
                        var geojson = layer.toGeoJSON();
                        var wkt = new Wkt.Wkt();
                        wkt.read( JSON.stringify(geojson));//.features[0].geometry)
                        //console.log(wkt.write());
                        $.ajax({
                            type: "POST", //<-- Necesario el token_ajax.js
                            //dataType: "json",
                            url: "/formulario_parcela_nueva",
                            data:{'geom_wkt':wkt.write()},
                            success: function(data) {
                                alert("Parcela creada!");
                                ocultar_panel_mapa();
                                mostrar_panel_parcela();
                                //mostrar_panel_parcela();
//                                console.log(data);
                                $("#id_num_parcela").val(data["num_parcela"]);
                                layer.num_parcela = data["num_parcela"];
                                layer.valor_inicial=layer["_latlngs"];
                                activar_clicar();
                                //layer.bindTooltip("my tooltip text").openTooltip();
                                layer.bindTooltip(""+data["num_parcela"],{permanent: true, direction:"center", interactive:false});//.openTooltip()
//                                var label = layerLabel();
//                                label.setContent(data["num_parcela"]);
//                                dsfdsgsg
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
    });
});

function recalc_tooltips(){
    editableLayers.eachLayer(function(layer) {
        layer.unbindTooltip();
        layer.bindTooltip(""+layer.num_parcela,{//"<span style='font-size: " + fontSize + "px'>" + layer.num_parcela + "</span>", {
          permanent: true,
          direction: "center",
        });
//       }
    });
}

function editar_layer(layer){ //map.on('pm:edit', function(e){//map.on(L.Draw.Event.EDITED, function(e){
        $.confirm({
            title: 'Editar parcela',
            content: 'Deseas aplicar los cambios?',
            buttons: {
                confirm: {
                    text: 'Si',
                    btnClass: 'btn-blue',
                    action: function(){
                        var geojson = layer.layer.toGeoJSON();
                        var wkt = new Wkt.Wkt();
                        wkt.read(JSON.stringify(geojson));
                        $.ajax({
                            type: "POST", //<-- Necesario el token_ajax.js
                            //dataType: "json",
                            url: "/editar_parcela_geom",
                            data:{'num_parcela':layer.layer.num_parcela,'geom_wkt':wkt.write()},
                            success: function(data) {
                                alert("Parcela editada con éxito.");
//                                recalc_tooltips();
//                                ocultar_panel_mapa();
//                                mostrar_panel_parcela();
                                activar_clicar();
                                layer.layer.unbindTooltip();
                                layer.layer.bindTooltip(""+layer.layer.num_parcela,{permanent: true, direction:"center", interactive:false});//.openTooltip()
                            },
                            error: function (data){
                               alert(data);
                               console.log(data); // the message
                            }
                        });
                        edited_parcela_geom="";
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

function cancelar_edicion(){
    location.reload();
//    console.log(layer_editada._latlngs);
//    console.log(layer_editada.valor_inicial);
//    layer_editada._latlngs = layer_editada.valor_inicial;
//    layer_editada.redraw();
}