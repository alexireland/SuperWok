
var superWokCustomer = superWokCustomer || {};
superWokCustomer.listCustomerTableHeader = ["NAME","PHONE","ADDRESS","DELIVER CHARGE","NO.ORDER","JOIN","LAST ORDER","MAP"];
$(document).ready(function(){


    SuperWokDatabase.init(function () {
        var temp = DateTime.please.getUTCDate()+" 03:00 ";
        sessionStorage.todayDateForFiltering = DateTime.please.getMilliseconds(temp);
        sessionStorage.tomorrowDateForFiltering = parseInt(sessionStorage.todayDateForFiltering)+86400000;
        SuperWokDatabase.loadDatabaseData(function (passed) {
            if (passed) {
                SuperWok_SampleData.load();
            }

        });
    });

    superWokCustomer.createCustomerTable();



//    $("#superWokCustomerInnerTable").tablesorter( {sortList: [[0,0], [1,0]]} );

    $('#customerTable table tbody tr').live('click', function () {
        $("#superWokCustomerInnerTable tbody tr").children().css("background-color", "inherit");
        var target = $(this).attr('data-customerDetailID');
        sessionStorage.selectedCustomerRowId = target;
        $(this).children().css("background-color", "red");


    });



    $('#modifyCustomer').live('click', function () {
        $("#customerTable").remove();

        $('#modifyCustomerName').val("");
        $('#modifyCustomerPhone').val("");
        $('#modifyCustomerAddress').val("");
        $('#modifyCustomerCharge').val("");


        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("EXPIRED",'=',"NO").filter("id", '=', sessionStorage.selectedCustomerRowId).list(function (err, row) {

            row.forEach(function (element) {

                $('#modifyCustomerName').val(element.CUSTOMER_NAME);
                $('#modifyCustomerPhone').val(element.PHONE_NUMBER);
                $('#modifyCustomerAddress').val(element.ADDRESS_ONE);
                $('#modifyCustomerCharge').val(element.DELIVERY_CHARGE);


            });

        });

        $('#ModifyCustomerPopup').reveal({
            animation:'none',
            closeOnBackgroundClick:true,
            dismissModalClass:'close-reveal-modal'
        });

    });

    $('#updateCustomer').click(function () {
        $('#customerTable table').remove();

        var data = {};

        data.updateName = $('#modifyCustomerName').val();
        data.updatePhone = $('#modifyCustomerPhone').val();
        data.updateAddress = $('#modifyCustomerAddress').val();
        data.updateCharge = $('#modifyCustomerCharge').val();
        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("EXPIRED",'=',"NO").filter("id", '=', sessionStorage.selectedCustomerRowId).list(function (err, row) {

            row.forEach(function (element) {
                element.CUSTOMER_NAME = data.updateName;
                element.PHONE_NUMBER = data.updatePhone;
                element.ADDRESS_ONE = data.updateAddress;
                element.DELIVERY_CHARGE = data.updateCharge;

            });

        });
        persistence.flush(function () {
//                superWokCustomer.createCustomerTable();
              window.location.reload();
            }

        );


        $('#theCloseBtn').click();

    });

    $('#deleteCustomer').click(function () {
        $("#counterReceiptTable table").remove();
        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("EXPIRED", '=', "NO").filter("id", '=', sessionStorage.selectedCustomerRowId).list(function (err, row) {
            row.forEach(function (element) {
                element.EXPIRED = "YES";
            });
        });
        persistence.flush(function () {
            sessionStorage.selectedItemRowId = null;
//            window.location.reload();
            superWokCustomer.createCustomerTable();

        });

        $('#theCloseBtn').click();
        window.location.reload();
    });




    $('#modifyCustomerClose').click(function(){
        $('#theCloseBtn').click();
        window.location.reload();

    });










    $('#myModal').hide();
    $('#goToGoogle').click(function() {
        $('#myModals').reveal();
    });

    $('#testModel').click(function(){

        $('#myModal').reveal();


    });
    $("#print").click(function(){


        window.print("ABCD");
    });

    superWokCustomer.googleMapInitialize();


});




superWokCustomer.googleMapInitialize = function(){
//    var mapOptions = {
//        center: new google.maps.LatLng(53.35710874569601, -6.30615234375),
//        zoom: 8,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
//    var map = new google.maps.Map(document.getElementById("map_canvas"),
//        mapOptions);

}

superWokCustomer.createCustomerTable = function(){
    $TABLE = $("<table>").attr({ "id":"superWokCustomerInnerTable", "cellspacing":"0" }).attr("class","tablesorter").css("width","100%").css("height","400px;");
    var $TBODY = $("<tbody>").css("height","50px").css("overflow","auto");
//    var $THEAD = superWokCustomer.addCustomerHeader;

    superWokCustomer.getCustomerData(function (CustomerList) {
        for (var i = 0; i < CustomerList.length; i++) {
            superWokCustomer.addCustomerMemberRow($TBODY, CustomerList[i]);
        }
    });
//    $TABLE.append($THEAD);
    $TABLE.append($TBODY);
    $("#customerTable").append($TABLE);

}
superWokCustomer.getCustomerData = function(callback){

    SuperWokDatabase.CUSTOMER_DETAILS.all().count(function(err,counter){

        var i =1;
        var CustomerDataArray = new Array();
        SuperWokDatabase.CUSTOMER_DETAILS.all().list(function(err,row){
            if(err){
            }else{
                row.forEach(function(theElement){
                    var CustomerItem ={};
                    CustomerItem.id = theElement.id;
                    CustomerItem.customerName = theElement.CUSTOMER_NAME;
                    CustomerItem.phoneNumber = theElement.PHONE_NUMBER;
                    CustomerItem.customerAddress = theElement.ADDRESS_ONE;
                    CustomerItem.deliveryCharge = theElement.DELIVERY_CHARGE;
                    CustomerItem.numOfOrder = theElement.NO_OF_ORDER;
                    CustomerItem.joinTime = theElement.JOIN_TIME;
                    CustomerItem.lastOrderTime = theElement.LAST_ORDERED_TIME;
                    CustomerItem.mapReference = theElement.PAGE_REFERENCE;

                    CustomerDataArray.push(CustomerItem);
                    if (i === counter) {
                        callback(CustomerDataArray);
                    }
                    i += 1;
                });
            }
        });

    });

}



superWokCustomer.addCustomerMemberRow = function($TBODY,itemList){


    var $TR_B = $("<TR>").attr("data-customerDetailID", itemList.id);

//    $TR_B.append($("<TD>").html(DateTime.please.get(itemList.time)+" "+DateTime.please.getTime(itemList.time)));
    $TR_B.append($("<TD>").html(itemList.customerName).css("width","5%").css("background-color",""));
    $TR_B.append($("<TD>").html(itemList.phoneNumber).css("width","10%").css("background-color",""));
    $TR_B.append($("<TD>").html(itemList.customerAddress).css("width","30%").css("background-color",""));
    $TR_B.append($("<TD>").html(itemList.deliveryCharge).css("width","5%").css("background-color",""));
    $TR_B.append($("<TD>").html(itemList.numOfOrder).css("width","5%").css("background-color",""));
    $TR_B.append($("<TD>").html(DateTime.please.getDate(itemList.joinTime)).css("width","10%").css("background-color",""));
    $TR_B.append($("<TD>").html(DateTime.please.getDate(itemList.lastOrderTime)).css("width","10%").css("background-color",""));
    $TR_B.append($("<TD>").html(itemList.mapReference).css("width","5%").css("background-color",""));

    $TBODY.append($TR_B);

}
superWokCustomer.addCustomerHeader = function(){
    var lstTitles = superWokCustomer.listCustomerTableHeader;		// Global Variable of header titles
    var $TempTbody = $("<thead>");
    var $TR    = $("<tr>");
    var i = 0;

    while ( i < superWokCustomer.listCustomerTableHeader.length)
    {
        var $TH = $("<th>");
        $TR.append($TH.text(lstTitles[i]));
        i++;
    }
    return $TempTbody.append($TR);


}