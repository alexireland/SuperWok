var superWokLogin = superWokLogin||{};

sessionStorage.currentOpenOrderId = null;
superWokLogin.listCounterTableRecepietHeader = ["DESCRIPTION", "PRICE","QTY","TOTAL PRICE"];
sessionStorage.nextTakeawayId = null;
sessionStorage.nextDeliveryId = null;
sessionStorage.nextCollectionId= null;
$(document).ready(function(){


    sessionStorage.clear();
    localStorage.clear();
    SuperWokDatabase.init(function(){
        SuperWokDatabase.loadDatabaseData(function(passed){
            if(passed){
                SuperWok_SampleData.load();
            }

        });
        superWokLogin.isOpenOrder(function(decision){
            if(decision){
                superWokLogin.displayCurrentOrderInformation();
                superWokLogin.setNextTakeawayId();
                superWokLogin.setNextCollectionId();
                superWokLogin.setNextDeliveryId();
            }else{
                alert("There is no open order")
            }
        });
    });












    $('#addNewCollectionClose').click(function(){


    $('#theCloseBtn').click();



});

    $('#addNewCollectionDone').click(function(){

        var data={};
        data.name =  $('#collectionCustomerName').val();
        data.phone =  $('#collectionCustomerPhone').val();
        data.time = DateTime.please.getCurrentMilliseconds()



        var tempCustomer = new SuperWokDatabase.CUSTOMER_DETAILS({
            CUSTOMER_ID:"TEXT",
            NAME:data.name,
            FIRST_NAME:"TEXT",
            FAMILY_NAME:"TEXT",
            PHONE_NUMBER:data.number,
            ADDRESS_ONE:"TEXT",
            ADDRESS_TWO:"TEXT",
            ADDRESS_THREE:"TEXT",
            NO_OF_ORDER:"INT",
            JOIN_TIME:data.time,
            LAST_ORDERED_TIME:"INT",
            PAGE_REFERENCE : "TEXT",
            EXPIRED:"TEXT"
        });

        $('#orderedType').text(sessionStorage.orderType);
        $('#orderedPhoneNumber').text(data.phone);
        $('#orderedTime').text(DateTime.please.getUTCDateTime(data.time));


        persistence.add(tempCustomer);
        persistence.flush();
        $('#theCloseBtn').click();



    });


    $('.orderType').click(function(){


        alert("This is the start " + sessionStorage.currentOpenOrderId);
        if(sessionStorage.currentOpenOrderId==="undefined"){
            alert("You can add new order");

        }else{

        sessionStorage.orderType=$(this).text();


        if($(this).text()==="Collection"){
            $('#orderedType').val("");
            $('#collectionCustomerPhone').val("");
            $('#orderedType').text($(this).text());
            $('#CollectionPopup').reveal({
                animation: 'none',
                closeOnBackgroundClick: true,
                dismissModalClass: 'close-reveal-modal'
            });
            sessionStorage.orderType = "Collection";

        }else if($(this).text()==="Delivery"){
            $('#DeliveryCustomerName').val("");
            $('#DeliveryCustomerPhone').val("");

            $('#DeliveryAddress').val("");
            //            $('#orderedType').text($(this).text());
            $('#DeliveryPopup').reveal({
                animation: 'none',
                closeOnBackgroundClick: true,
                dismissModalClass: 'close-reveal-modal'
            });
            sessionStorage.orderType = "Delivery";

        }else {


            alert(sessionStorage.nextTakeawayId);

            $('#TakeAwayPopup').reveal({
                animation: 'none',
                closeOnBackgroundClick: true,
                dismissModalClass: 'close-reveal-modal'
            });




        }
//        alert($(this).text());



}

    });

    $('#payOrder').click(function(){

        SuperWokDatabase.ORDER_DATA.all().filter("id",'=',sessionStorage.currentOpenOrderId).list(function(err,row){
            row.forEach(function(theElement){
                theElement.ORDER_PAIED="Y";
                theElement.ORDER_FINISHED="Y";

            });

            sessionStorage.currentOpenOrderId=null;
        });
        persistence.flush(function(){
            window.location.reload();


        });




    window.print();


});


    $('#openCashDrawer').click(function(){

        window.print();




    });
    $('.categoryBtn').click(function(){

        $('#MenuPopup button').remove();
//          $('#popUpHeader').append($('<h2> </h2>').val(index).html($(this).text()));
//          $('#popUpHeader').append("<h2>"\$(this).text()\"</h2>");
        var temp = $(this).text()

        SuperWokDatabase.ITEM.all().prefetch('ITEM_CATEGORY_ID').list(function (err, rows) {



            rows.forEach(function (row) {
//                alert("This is the "+ row.ITEM_CATEGORY_ID);

//                alert(row.id);
                if(row.ITEM_CATEGORY_ID.ITEM_CATEGORY_NAME==temp){

//                    alert(row.id);



                    $('#MenuPopup').append($("<button>").attr("data-orderid",row.id).attr("class", "span1 btn-large btn-info itemButton").css("height","65px;").html(row.ITEM_NAME+"<br/> "+(row.ITEM_PRICE).toFixed(2)));
//                    alert(row.ITEM_NAME);



                }

            });

        });
        $('#MenuPopup').reveal({
            animation: 'none', //fade, fadeAndPop, none

            closeOnBackgroundClick: true, //if you click background will modal close?
            dismissModalClass: 'close-reveal-modal' //the class of a button or element that will close an open modal
        });


    });
$('#addNewDeliveryDone').click(function(){



    var tempCustomer = new SuperWokDatabase.CUSTOMER_DETAILS({
        CUSTOMER_ID:"TEXT",
        NAME:$('#DeliveryCustomerName').text(),
        FIRST_NAME:"TEXT",
        FAMILY_NAME:"TEXT",
        PHONE_NUMBER:$('#DeliveryCustomerPhone').text(),
        ADDRESS_ONE:$('#DeliveryAddress').text(),
        ADDRESS_TWO:"TEXT",
        ADDRESS_THREE:"TEXT",
        NO_OF_ORDER:"INT",
        JOIN_TIME:data.time,
        LAST_ORDERED_TIME:"INT",
        PAGE_REFERENCE : "TEXT",
        EXPIRED:"TEXT"
    });
    sessionStorage.customerPhoneNumber = $('#DeliveryCustomerPhone').text();
    persistence.add(tempCustomer);


    var newOrder = new SuperWokDatabase.ORDER_DATA({

        TODAY_ID:sessionStorage.nextDeliveryId,
        ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
        NO_OF_ORDERED_ITEM:"TEXT",
        ORDER_FINISHED:"N",
        ORDER_PAIED:"N",
        ORDER_CANCELLED:"N",
        ORDER_TOTAL_PRICE:"NUMERIC",
        ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
        EXPIRED:"NO"
    });
    persistence.add(newOrder);
    persistence.flush();

//    SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER",sessionStorage.customerPhoneNumber,function(err,customerDetail){
//
//
//
//
//    });
    SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function(err, ordeType){
        ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
    });
    SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED",'=',"N").list(function(err,row){
        row.forEach(function(theOrderDataElement){
            sessionStorage.currentOpenOrderId=theOrderDataElement.id;
        });
    });


    $('#theCloseBtn').click();




});
    $('#addNewTakeAwayDone').click(function(){

        if(sessionStorage.nextTakeawayId=="undefined"){
            sessionStorage.nextTakeawayId=1;

        }


        sessionStorage.orderType = "TakeAway";
        $('#orderedType').text(sessionStorage.orderType);


        $('#orderedTime').text(DateTime.please.getDate(DateTime.please.getCurrentMilliseconds())+" "+DateTime.please.getTime(DateTime.please.getCurrentMilliseconds()));
        var newOrder = new SuperWokDatabase.ORDER_DATA({

            TODAY_ID:sessionStorage.nextTakeawayId,
            ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
            NO_OF_ORDERED_ITEM:"TEXT",
            ORDER_FINISHED:"N",
            ORDER_PAIED:"N",
            ORDER_CANCELLED:"N",
            ORDER_TOTAL_PRICE:"NUMERIC",
            ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
            EXPIRED:"NO"
        });

        persistence.add(newOrder);
        persistence.flush();
        SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "TakeAway", function(err, ordeType){
            ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
        });
        SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED",'=',"N").list(function(err,row){
              row.forEach(function(theOrderDataElement){
                  sessionStorage.currentOpenOrderId=theOrderDataElement.id;
              });
          });
        $('#theCloseBtn').click();

    });






    $('.itemButton').live('click',function(){

        $("#counterReceiptTable table").remove();
        if(sessionStorage.currentOpenOrderId==='null'){
            alert("Please add Order Type First");
            $('#theCloseBtn').click();

        }else{

           var data={};
           data.id = $(this).attr("data-orderid");
           var orderdItem = new SuperWokDatabase.ORDERED_ITEM({
                ORDERED_ITEM_ID:"TEXT",
                ORDERED_ITEM_TIME:DateTime.please.getCurrentMilliseconds(),
                ORDERED_ITEM_QUANTITY:1,
                ORDERED_ITEM_MODIFY_DETAILS:"",
                EXPIRED:"NO"

            });

            persistence.add(orderdItem);
            persistence.flush();

            SuperWokDatabase.ITEM.findBy("id",data.id,function(err,theItem){
                theItem.ORDERED_ITEM_ITEM_ID.add(orderdItem);
            });
            persistence.flush();
            SuperWokDatabase.ORDER_DATA.findBy("id",sessionStorage.currentOpenOrderId, function(err, orderData){
                orderData.ORDERED_ITEM_ITEM_ID.add(orderdItem);
            });

            persistence.flush()

                superWokLogin.displayCurrentOrderInformation();





//                    superWokLogin.showReceiptTopInformation(sessionStorage.currentOpenOrderId);






            $('#theCloseBtn').click();
        }

    });


    $('#counterReceiptTable table tbody tr').live('click',function(){
        alert("kkkk");
        $("#counterReceiptTable table tbody tr").children().css("background-color","inherit");
        var target =  $(this).attr('data-flightcrewid');
        sessionStorage.selectedItemRowId =target;
        $(this).children().css("background-color","red");



    });

});




superWokLogin.getCurrentOrderOrderedItemData = function(orderId,callback){

    SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("ORDER_DATA_ID",'=',orderId).count(function(err,counter){
        var i =1;
        var orderedItemArray = new Array();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("ORDER_DATA_ID",'=',orderId).list(function(err,element){


            element.forEach(function(theElement){

                var orderedItemObject ={};
                orderedItemObject.id = theElement.id;
                orderedItemObject.name= theElement.ITEM_ID.ITEM_NAME;
                orderedItemObject.itemPrice = theElement.ITEM_ID.ITEM_PRICE;
                orderedItemObject.quantity = theElement.ORDERED_ITEM_QUANTITY;
                orderedItemObject.modifyDetails =theElement.ORDERED_ITEM_MODIFY_DETAILS;
                orderedItemObject.totalThisItemPrice = theElement.ORDERED_ITEM_QUANTITY*theElement.ITEM_ID.ITEM_PRICE;


                orderedItemArray.push(orderedItemObject);

                if(i===counter){
                    callback(orderedItemArray);
                }
                i+=1;
            });

        });

    });






}


superWokLogin.displayCurrentOrderInformation = function(){


    superWokLogin.showReceiptTopInformation(sessionStorage.currentOpenOrderId);
    $TABLE = $("<table>").attr({ "id": "counterPrintingInformation", "cellspacing": "0" });
    var $TBODY = $("<tbody>").css("height","150px");
//    var $THEAD = superWokLogin.addCounterReceiptHeader();

    superWokLogin.getCurrentOrderOrderedItemData(sessionStorage.currentOpenOrderId,function(orderedItemList){

        for(var i =0;i<orderedItemList.length;i++){
            superWokLogin.addItemRow($TBODY,orderedItemList[i]);
        }
    });
//    $TABLE.append($THEAD);


    superWokLogin.calculateTotal(sessionStorage.currentOpenOrderId,function(callback){
        $('#totalCurrentOrderPrice').text(callback.toFixed(2));


    });
    $TABLE.append($TBODY);
    $("#counterReceiptTable").append($TABLE);
}
superWokLogin.addItemRow = function($TBODY,itemList){

    var $TR_B = $("<TR>").attr("data-itemID", itemList.id);

    $TR_B.append($("<TD>").html(itemList.name+"<br/>"+itemList.modifyDetails));
    $TR_B.append($("<TD>").html((itemList.itemPrice).toFixed(2)));
    $TR_B.append($("<TD>").html(itemList.quantity));
    $TR_B.append($("<TD>").html((itemList.totalThisItemPrice).toFixed(2)));
    $TBODY.append($TR_B);
}
superWokLogin.showReceiptTopInformation = function(currentOpenOrderId){
    SuperWokDatabase.ORDER_DATA.all().filter("id",'=',currentOpenOrderId).prefetch("ORDER_TYPE_CATEGORY_ID").list(function(err,row){
        row.forEach(function(theElement){
            $('#orderedTime').text(DateTime.please.getDate()+" "+DateTime.please.getTime(theElement.ORDER_TIME));
            $('#orderedType').text(sessionStorage.orderType);
            if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="TakeAway"){
                $('#orderedNumber').text("T "+sessionStorage.nextTakeawayId-1);
            }else if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="Collection"){
                $('#orderedNumber').text("C "+sessionStorage.nextCollectionId-1);
            }else{
                $('#orderedNumber').text("D "+sessionStorage.nextCollectionId-1);

            }



        });

    });
}



superWokLogin.isOpenOrder = function(callback){
    SuperWokDatabase.ORDER_DATA.all().list(function(err,row){
        row.forEach(function(theElement){
            if(theElement.ORDER_FINISHED==="N"){
                sessionStorage.currentOpenOrderId = theElement.id;
                callback(true);
            }else{
               callback(false);

            }

            });
        });
    }


superWokLogin.addCounterReceiptHeader = function(){
    var lstTitles = superWokLogin.listCounterTableRecepietHeader;		// Global Variable of header titles
    var $TempTbody = $("<thead>");
    var $TR    = $("<tr>");
    var i = 0;
    while ( i <  superWokLogin.listCounterTableRecepietHeader.length)
    {
        var $TH = $("<th>");
        $TR.append($TH.text(lstTitles[i]));
        i++;
    }
    return $TempTbody.append($TR);

}

superWokLogin.setNextTakeawayId = function(){
    SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").list(function(err,row){
        var biggest = 0;
        row.forEach(function(theElement){
            if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="TakeAway"){
                if(biggest<theElement.TODAY_ID){
                    biggest=theElement.TODAY_ID;
                }
            }
        });
        sessionStorage.nextTakeawayId=biggest+1;
    });



}

superWokLogin.setNextCollectionId = function(){
    SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").list(function(err,row){
        var biggest = 0;
        row.forEach(function(theElement){
            if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="Collection"){
                if(biggest<theElement.TODAY_ID){
                    biggest=theElement.TODAY_ID;
                }
            }
        });
        sessionStorage.nextCollectionId=biggest+1;
    });



}

superWokLogin.setNextDeliveryId = function(){
    SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").list(function(err,row){
        var biggest = 0;
        row.forEach(function(theElement){
            if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="Delivery"){
                if(biggest<theElement.TODAY_ID){
                    biggest=theElement.TODAY_ID;
                }
            }
        });
        sessionStorage.nextDeliveryId=biggest+1;
    });
}

superWokLogin.calculateTotal = function(orderDataPersistenceId,callback){
    if(sessionStorage.orderType==="Delivery"){
        var total = 0;
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("ORDER_DATA_ID",'=',orderDataPersistenceId).list(function(err,row){
            row.forEach(function(theElement){
                var tempCureentTotal = theElement.ORDERED_ITEM_QUANTITY *  theElement.ITEM_ID.ITEM_PRICE;
                total+=tempCureentTotal
            });
            superWokLogin.getDeliveryCharge(sessionStorage.currentOpenOrderId,function(deliveryCharge){
                if(deliveryCharge>0){
                    $('#deliveryCharge').text(deliveryCharge.toFixed(2));
                    callback(total+=deliveryCharge);
                }
            });

            callback(total);
        });


    }else{
        var total = 0;
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("ORDER_DATA_ID",'=',orderDataPersistenceId).list(function(err,row){
            row.forEach(function(theElement){
                var tempCureentTotal = theElement.ORDERED_ITEM_QUANTITY *  theElement.ITEM_ID.ITEM_PRICE;
                total+=tempCureentTotal
            });


            callback(total);

        });


    }


}
superWokLogin.getDeliveryCharge = function(orderDataPersistenceId,callback){

    SuperWokDatabase.ORDER_DATA.all().prefetch("CUSTOMER_DETAIL_ID").filter("id",'=',orderDataPersistenceId).list(function(err,row){

        row.forEach(function(theElement){

            callback(theElement.CUSTOMER_DETAIL_ID.DELIVERY_CHARGE);
        });


    });


}


