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

	var map = L.map('map', {
            center: [40.0000000, -4.0000000],
            zoom: 6,
            layers: [base,orto25k_icc,ign]
    });

	L.control.layers(baseLayers).addTo(map);

	var editableLayers = new L.FeatureGroup();

	editableLayers.eachLayer(function(layer) {
        layer.on('click', function(){
            alert(this._leaflet_id);
        });
    });

    var draw_options = {
      position: 'topleft',
      draw: {
          polyline: false,
          polygon: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                  color: '#FF0000', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
              },
              shapeOptions: {
                  color: '#33cc33'
              }
          },
          circle: false,
          rectangle: true,
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
        var type = e.layerType,layer = e.layer;
        editableLayers.addLayer(layer);
        layer.on('click', function(){
            alert(this._leaflet_id);
        });
        var string_json = JSON.stringify(editableLayers.toGeoJSON());
        console.log(string_json);
    });

    map.on(L.Draw.Event.EDITED, function(e){
        var string_json = JSON.stringify(editableLayers.toGeoJSON());
        console.log(string_json);
    });

    map.on(L.Draw.Event.DELETED, function(e){
        console.log("eliminado");
    });

});