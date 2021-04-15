var cargando;
$(document).ready(function() {
    $("#id_dia_entrada").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});
    $("#id_dia_salida").datepicker({ dateFormat: 'dd-mm-yy' , TimePicker: false});

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
            mostrar_panel_parcela();
            $.each(data, function(k,v){
                console.log(v);
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
    editableLayers.addLayer(geom_obj);
}

function mostrar_panel_parcela(){
    if($("#panel_parcela").is(":hidden")){
        $("#panel_parcela").show("slide",{"direction":"right"},1000);
        $("#mapa").removeClass("col-md-offset-4");
    }else{
        $("#panel_parcela").hide("slide",{"direction":"left"},1000);
        $("#mapa").addClass("col-md-offset-4");
    }

}

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
                    $("#id_num_parcela").val(data["num_parcela"]);
                    $("#id_dia_entrada").val(data["dia_entrada"]);
                    $("#id_dia_salida").val(data["dia_salida"]);
                    mostrar_panel_parcela();
                },
                error: function (data){
                    console.log(data);
                    alert("Error:"+data["Error"]);
                }
            });
        });
    });
}
//function recalc_tooltips(){
//    editableLayers.eachLayer(function(layer) {
//    console.log(layer);
//      //var fontSize = layer.features.properties.area / map.getZoom() * 30000;
//      if(map.getZoom() >= 9) {
//        layer.bindTooltip("<span style='font-size: " + 1 + "px'>" + layer.num_parcela + "</span>", {
//          className: "label",
//          permanent: true,
//          direction: "center"
//        });//.openTooltip();
//       }
//    });
//}
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

$("#id_num_parcela").on("input", function(){
        var valor_inicial = $("#id_num_parcela").val();
        $.ajax({
                url: '/check_n_parcela',
                type: 'POST',
                data: form.serialize(),//+"&geom="+edited_parcela_geom,
                success: function(data) {
                    alert("Disponible");
                },
                error: function (data){
                   alert("Error: Este numero de parcela ya existe.");
                   $("#id_num_parcela").val(valor_inicial);
                }

        });
})