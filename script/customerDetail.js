$("document").ready(function(){

    $('#myModal').hide();
    $('#goToGoogle').click(function() {
        $('#myModals').reveal();
    });

    $('#testModel').click(function(){

        $('#myModal').reveal();


    });
    $("#print").click(function(){
        alert("hi");

        window.print("ABCD");
    });

    googleMapInitialize();

});


function googleMapInitialize() {
    var mapOptions = {
        center: new google.maps.LatLng(53.35710874569601, -6.30615234375),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);

}