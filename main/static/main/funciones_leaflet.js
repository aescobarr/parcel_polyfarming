var editableLayers;
var edited_parcela_geom;
var map;
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
//            center: [41.666141,1.761932],
//            zoom: 8,
            layers: [base,orto25k_icc,ign]
    }).setView([41.666141,1.761932], 20);

	L.control.layers(baseLayers).addTo(map);

	editableLayers = new L.FeatureGroup();

    //	editableLayers.eachLayer(function(layer) {
    //        layer.on('click', function(){
    //            alert("clicado");
    //            alert(this._leaflet_id);
    //        });
    //    });

    var draw_options = {
      position: 'topleft',
      draw: {
          polyline: false,
          polygon: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                  color: '#FF0000', // Color the shape will turn when intersects
                  message: '<strong>Error:<strong> Dibujo no válido.' // Message that will show when intersect
              },
              shapeOptions: {
                  color: '#33cc33'
              }
          },
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false
      },
      edit: {
          featureGroup: editableLayers,
          remove: true
      }
    };

    var drawControl = new L.Control.Draw(draw_options);
    map.addLayer(editableLayers);
    map.addControl(drawControl);


    map.on(L.Draw.Event.CREATED, function (e) {
        console.log(e);
        var type = e.layerType,layer = e.layer;
        editableLayers.addLayer(layer);
//        layer.on('click', function(){
//            alert(this._leaflet_id);
//        });
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
                                mostrar_panel_parcela();
//                                console.log(data);
                                $("#id_num_parcela").val(data["num_parcela"]);
                                layer.num_parcela = data["num_parcela"];
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

    map.on(L.Draw.Event.EDITED, function(e){
        var editedlayers = e.layers;
        var layer;
        editedlayers.eachLayer(function(l) { // En el caso de editar se necesita hacer esto para obtener la layer
            layer = l;
        });
        console.log(layer);
        var string_json = JSON.stringify(editableLayers.toGeoJSON());
//        console.log(string_json);
        $.confirm({
            title: 'Editar parcela',
            content: 'Deseas aplicar los cambios?',
            buttons: {
                confirm: {
                    text: 'Si',
                    btnClass: 'btn-blue',
                    action: function(){
                        var geojson = layer.toGeoJSON();
                        var wkt = new Wkt.Wkt();
                        wkt.read( JSON.stringify(geojson));
                        edited_parcela_geom = wkt.write();
                        //.features[0].geometry)
                        $.ajax({
                            type: "POST", //<-- Necesario el token_ajax.js
                            //dataType: "json",
                            url: "/editar_parcela_geom",
                            data:{'num_parcela':layer.num_parcela,'geom_wkt':wkt.write()},
                            success: function(data) {
                                alert("Parcela editada.");
                                mostrar_panel_parcela();
                                activar_clicar();
                                layer.bindTooltip(""+layer.num_parcela,{permanent: true, direction:"center", interactive:false});//.openTooltip()
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
    });

    map.on(L.Draw.Event.DELETED, function(e){
        alert("eliminado");
    });

    map.on('zoomend', function() {//cuando se haga mucho zoom, recalcular posición de los toolips para que aparezcan en el centro de cada polígono
        if(map.getZoom() == 10){
            //recalc_tooltips();
        }
    });
});

function recalc_tooltips(){
    editableLayers.eachLayer(function(layer) {
        //layer.popup().setLatLng(layer.getCenter()).setContent("X").openOn(map);

        layer.unbindTooltip();
        console.log(layer.getCenter());
    //console.log(layer);
//      var fontSize = 2 * map.getZoom();
//      if(fontSize >= 10) {
        layer.bindTooltip(""+layer.num_parcela,{//"<span style='font-size: " + fontSize + "px'>" + layer.num_parcela + "</span>", {
          permanent: true,
          //interactive: false,
          direction: "center",
          //offset:[layer.getCenter()["lat"],layer.getCenter()["lng"]]
        });//.openTooltip();
//       }
    });
}