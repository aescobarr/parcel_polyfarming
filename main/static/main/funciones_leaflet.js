cargar_parcelas(){
    // restore
    L.geoJSON(JSON.parse(shape_for_db)).addTo(mymap);
}

function obtener_especies_geom(){ // OBTENER ESPECIES DE RECTANGULO O FIGURA(aqui se usa la datatable)
    cargando_datos_mapa(0);
    var filtro= pasar_wkt();
//    alert("INTERSECTS(geom_4326,"+filtro+")");
    // mostramos las layers(cuadriculas,citacions,rius,etc) que hay dentro de la zona marcada
    //wmsLayer_presencia_10000.setParams({cql_filter:"WITHIN(geom_4326,"+filtro+")"});
    wmsLayer_presencia_10000.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
    wmsLayer_presencia_1000.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
    wmsLayer_citacions.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
    //wmsLayer_citacions_2.setParams({cql_filter:"WITHIN(geom_4326,"+filtro+")"});
    wmsLayer_presencia_ma.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
//    wmsLayer_presencia_10000.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
//    wmsLayer_presencia_1000.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
//    wmsLayer_citacions.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
//    wmsLayer_citacions_2.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});
//    wmsLayer_presencia_ma.setParams({cql_filter:"INTERSECTS(geom_4326,"+filtro+")"});


    $.ajax({
        url:"/especies_seleccion/",
        data:{"pol":filtro},
//        type:'json',
        success: function (data, status, xhr) {
            //console.log(data);
            rellenar_table_especies_seleccion(data);
            cargando_datos_mapa(1);
        },
        error: function (xhr, status, error) {
            alert("error");
            cargando_datos_mapa(2);
        }
    });
}
function pasar_wkt(){ // pasa las geometrias a wkt
    var geojson = editableLayers.toGeoJSON();
    var wkt = new Wkt.Wkt();
    wkt.read( JSON.stringify(geojson.features[0].geometry) );
    //console.log(wkt.write());
    return wkt.write();
}