var superWokLogin = superWokLogin || {};

sessionStorage.currentOpenOrderId = null;
sessionStorage.nextTakeAwayId = null;
sessionStorage.nextDeliveryId = null;
sessionStorage.nextCollectionId = null;
superWokLogin.listCounterTableRecepietHeader = ["DESCRIPTION", "PRICE", "QTY", "TOTAL PRICE"];
sessionStorage.todaysOrderId = null;

$(document).ready(function () {

    sessionStorage.clear();
    localStorage.clear();
    SuperWokDatabase.init(function () {

        var temp = DateTime.please.getUTCDate()+" 03:00 ";
        sessionStorage.todayDateForFiltering = DateTime.please.getMilliseconds(temp);
        SuperWokDatabase.loadDatabaseData(function (passed) {
            if (passed) {
                SuperWok_SampleData.load();
            }

        });
        superWokLogin.isOpenOrder(function (decision) {
            if (decision) {
                superWokLogin.displayCurrentOrderInformation();

            } else {


            }
        });
    });


    $('#comesMain').click(function(){

        SuperWokDatabase.ITEM.all().prefetch('ITEM_CATEGORY_ID').list(function (err, rows) {

            rows.forEach(function (row) {

                if (row.ITEM_NAME==="Boild Rice Comes Main"||row.ITEM_NAME==="Chips Comes Mian"||row.ITEM_NAME==="Fired Rice Comes Main"||row.ITEM_NAME==="Fired Noodle Comes Main"||row.ITEM_NAME==="YangZhou Comes Main"||row.ITEM_NAME==="Curry Sauce") {

                    $('#MenuPopup').append($("<button>").attr("data-orderid", row.id).attr("data-orderitemprice", row.ITEM_PRICE).attr("class", "span1 btn-small btn-warning itemButton").css("height", "45px;").css("font-size", "18px").html(row.ITEM_NAME + "<br/><br/> " + (row.ITEM_PRICE).toFixed(2)));
                }
            });

        });
        $('#MenuPopup').append($("<button>").attr("id", "CloseInMenu").attr("class", "btn-small btn-warning  close-reveal-modal").css("height", "55px;").text("X"));



    });
    $('#callBackOrder').live('click', function () {


        var tempTodayId = ($('#theCallBackId').val()).toUpperCase();



        $('#orderId').text(tempTodayId);

        SuperWokDatabase.ORDER_DATA.all().filter("ORDER_TIME",'>',sessionStorage.todayDateForFiltering).filter("TODAY_ID", '=', tempTodayId).filter("ORDER_CANCELLED", '=', "N").count(function (err, counter) {
            if (counter > 0) {

                SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").filter("TODAY_ID", '=', tempTodayId).filter("ORDER_CANCELLED", '=', "N").list(function (err, row) {
                    SuperWokDatabase.ORDER_DATA.all().prefetch("CUSTOMER_DETAIL_ID").filter("TODAY_ID", '=', tempTodayId).filter("ORDER_CANCELLED", '=', "N").list(function (err, row1) {
                        row.forEach(function (theElement) {
                            if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME == "Delivery") {


//                           SuperWokDatabase.ORDER_DATA.all().prefetch("CUSTOMER_DETAIL_ID").filter("TODAY_ID",'=',tempTodayId).filter("ORDER_CANCELLED",'=',"N").list(function(err,row1){
                                row1.forEach(function (theElement1) {

                                    sessionStorage.currentOpenOrderId = theElement.id;
                                    sessionStorage.orderType = "Delivery";
                                    sessionStorage.currentOrderCustomerPhoneNumber = theElement1.CUSTOMER_DETAIL_ID.PHONE_NUMBER;
                                    sessionStorage.currentOrderCustomerName = theElement1.CUSTOMER_DETAIL_ID.CUSTOMER_NAME;

                                    sessionStorage.currentOderDeliveryCharge = theElement1.CUSTOMER_DETAIL_ID.DELIVERY_CHARGE;
                                    $('#deliveryCharge').text((parseFloat(sessionStorage.currentOderDeliveryCharge)).toFixed(2));

                                });


                            } else if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Collection") {
                                sessionStorage.currentOpenOrderId = theElement.id;
                                sessionStorage.orderType = "Collection";
                                $('#orderId').val(theElement.TODAY_ID);
                            } else {
                                sessionStorage.currentOpenOrderId = theElement.id;
                                sessionStorage.orderType = "TakeAway";
                                $('#orderId').val(theElement.TODAY_ID);
                            }
                        });
//                       alert(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
                        superWokLogin.displayCurrentOrderInformation();
                    });


                });


            } else {
                alert("NO ORDER")

            }


        });


    });

    $('#useAddNewCollectionDone').click(function () {
        var data = {};
        data.name = $('#collectionCustomerName').val();
        data.phone = $('#collectionCustomerPhone').val();
        data.time = DateTime.please.getCurrentMilliseconds()

        sessionStorage.currentOrderCustomerPhoneNumber = data.phone;
        sessionStorage.orderType = "Collection";
        sessionStorage.currentOrderCustomerName = data.name;

        $('#orderedType').text(sessionStorage.orderType);
        $('#orderedPhoneNumber').text(data.phone);
        $('#orderedTime').text(DateTime.please.getUTCDateTime(data.time));
        $('#orderedCustomerName').text(data.name);


        SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Collection", function (err, ordeType) {
            superWokLogin.getNextOrderId(ordeType, function (theId) {
                $('#orderId').text("C" + theId);
                var newOrder = new SuperWokDatabase.ORDER_DATA({
                    ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                    NO_OF_ORDERED_ITEM:"TEXT",
                    TODAY_ID:"C" + theId,
                    ORDER_FINISHED:"N",
                    ORDER_UPDATED:"N",
                    ORDER_PAIED:"N",
                    ORDER_CANCELLED:"N",
                    ORDER_TOTAL_PRICE:"NUMERIC",
                    ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                    EXPIRED:"NO"
                });
                persistence.add(newOrder);
                SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Collection", function (err, ordeType) {
                    ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                });
                SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                    row.forEach(function (theOrderDataElement) {
                        sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                    });
                });
                SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER", sessionStorage.currentOrderCustomerPhoneNumber, function (err, customer) {
                    customer.CUSTOMER_DETAIL_ID_ORDERED_DATA.add(newOrder);
                });

            });
        });
        $('#theCloseBtn').click();


    });
    $('#addNewCollectionClose').click(function () {
        $('#cancelOrderType').click();
    });
    $('#collectionCustomerPhone').live('change', function () {
        var tempPhoneNumber = $(this).val();
        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', tempPhoneNumber).count(function (err, counter) {
            if (err) {

            } else {
                if (counter > 0) {
                    SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', tempPhoneNumber).list(function (err, row) {
                        row.forEach(function (theCustomer) {
                            $('#collectionCustomerName').val(theCustomer.CUSTOMER_NAME);
                        });

                    });
                } else {

                }

            }

        });


    });
    $('#DeliveryCustomerPhone').live('change', function () {
//        alert($(this).val());
        var tempPhoneNumber = $(this).val();

        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', tempPhoneNumber).count(function (err, counter) {
            if (err) {


            } else {
                if (counter > 0) {
                    SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', tempPhoneNumber).list(function (err, row) {
                        row.forEach(function (theCustomer) {
                            $('#DeliveryCustomerName').val(theCustomer.CUSTOMER_NAME);
                            $('#DeliveryAddress').val(theCustomer.ADDRESS_ONE);
                            $('#DeliveryChargePrice').val(theCustomer.DELIVERY_CHARGE);

                        });

                    });
                } else {

                }

            }

        });


    });

    $('#useAddNewDeliveryDone').click(function () {
        var data = {};
        data.name = $('#DeliveryCustomerName').val();
        data.phone = $('#DeliveryCustomerPhone').val();
        data.address = $('#DeliveryAddress').val();
        data.time = DateTime.please.getCurrentMilliseconds();
        		if($('#DeliveryChargePrice').val()){
			  data.deliveryCharge = $('#DeliveryChargePrice').val();      	
		}else{
			  data.deliveryCharge =0;	
		}

        sessionStorage.currentOrderCustomerPhoneNumber = data.phone;
        sessionStorage.orderType = "Delivery";
        sessionStorage.currentOderDeliveryCharge = data.deliveryCharge;
        sessionStorage.currentOrderCustomerName = data.name;


        $('#orderedType').text("Delivery");
        $('#orderedPhoneNumber').text(data.phone);
        $('#orderedTime').text(DateTime.please.getUTCDateTime(data.time));
        $('#orderDeliveryAddress').text(data.address);
        $('#orderedCustomerName').text(data.name);


        SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
            superWokLogin.getNextOrderId(ordeType, function (theId) {
                $('#orderId').text("D" + theId);
                var newOrder = new SuperWokDatabase.ORDER_DATA({
                    ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                    NO_OF_ORDERED_ITEM:"TEXT",
                    TODAY_ID:"D" + theId,
                    ORDER_FINISHED:"N",
                    ORDER_PAIED:"N",
                    ORDER_UPDATED:"N",
                    ORDER_CANCELLED:"N",
                    ORDER_TOTAL_PRICE:"NUMERIC",
                    ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                    EXPIRED:"NO"
                });
                persistence.add(newOrder);
                SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
                    ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                });
                SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                    row.forEach(function (theOrderDataElement) {
                        sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                    });
                });
                SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER", sessionStorage.currentOrderCustomerPhoneNumber, function (err, customer) {
                    customer.CUSTOMER_DETAIL_ID_ORDERED_DATA.add(newOrder);
                });
            })

        });
        $('#theCloseBtn').click();


    });

    $('#addNewCollectionClose').click(function () {


        $('#theCloseBtn').click();


    });

    $('#addNewCollectionDone').click(function () {

        var data = {};
        data.name = $('#collectionCustomerName').val();
        data.phone = $('#collectionCustomerPhone').val();
        data.time = DateTime.please.getCurrentMilliseconds()

        sessionStorage.currentOrderCustomerPhoneNumber = data.phone;
        sessionStorage.orderType = "Collection";
        sessionStorage.currentOrderCustomerName = data.name;
        var tempCustomer = new SuperWokDatabase.CUSTOMER_DETAILS({
            CUSTOMER_ID:"TEXT",
            CUSTOMER_NAME:data.name,
            FIRST_NAME:"TEXT",
            FAMILY_NAME:"TEXT",
            PHONE_NUMBER:data.phone,
            ADDRESS_ONE:"",
            ADDRESS_TWO:"TEXT",
            ADDRESS_THREE:"TEXT",
            NO_OF_ORDER:"INT",
            JOIN_TIME:data.time,
            LAST_ORDERED_TIME:"INT",
            PAGE_REFERENCE:"TEXT",
            EXPIRED:"NO"
        });

        $('#orderedType').text(sessionStorage.orderType);
        $('#orderedPhoneNumber').text(data.phone);
        $('#orderedTime').text(DateTime.please.getUTCDateTime(data.time));
        $('#orderedCustomerName').text(data.name);

        persistence.add(tempCustomer);
        persistence.flush(function () {
            SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Collection", function (err, ordeType) {
                superWokLogin.getNextOrderId(ordeType, function (theId) {
                    $('#orderId').text("C" + theId);
                    var newOrder = new SuperWokDatabase.ORDER_DATA({
                        ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                        NO_OF_ORDERED_ITEM:"TEXT",
                        TODAY_ID:"C" + theId,
                        ORDER_FINISHED:"N",
                        ORDER_PAIED:"N",
                        ORDER_CANCELLED:"N",
                        ORDER_TOTAL_PRICE:"NUMERIC",
                        ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                        EXPIRED:"NO"
                    });
                    persistence.add(newOrder);
                    SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Collection", function (err, ordeType) {
                        ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                    });
                    SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                        row.forEach(function (theOrderDataElement) {
                            sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                        });
                    });
                    SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER", sessionStorage.currentOrderCustomerPhoneNumber, function (err, customer) {
                        customer.CUSTOMER_DETAIL_ID_ORDERED_DATA.add(newOrder);
                    });


                })

            });
            $('#theCloseBtn').click();
        });


    });

    $('#addNewDeliveryDone').click(function () {

        var data = {};
        data.name = $('#DeliveryCustomerName').val();
        data.phone = $('#DeliveryCustomerPhone').val();
        data.address = $('#DeliveryAddress').val();
        data.time = DateTime.please.getCurrentMilliseconds();
		if($('#DeliveryChargePrice').val()){
			  data.deliveryCharge = $('#DeliveryChargePrice').val();      	
		}else{
			  data.deliveryCharge =0;	
		}
        
        sessionStorage.currentOrderCustomerPhoneNumber = data.phone;
        sessionStorage.orderType = "Delivery";
        sessionStorage.currentOderDeliveryCharge = data.deliveryCharge;
        sessionStorage.currentOrderCustomerName = data.name;

        SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', data.phone).count(function (err, counter) {
            if (err) {

            } else {
                $('#orderedType').text("Delivery");
                $('#orderedPhoneNumber').text(data.phone);
                $('#orderedTime').text(DateTime.please.getUTCDateTime(data.time));
                $('#orderDeliveryAddress').text(data.address);
                $('#orderedCustomerName').text(data.name);

                if (counter > 0) {

                    SuperWokDatabase.CUSTOMER_DETAILS.all().filter("PHONE_NUMBER", '=', sessionStorage.currentOrderCustomerPhoneNumber).list(function (err, row) {
                        row.forEach(function (theCustomer) {


                            theCustomer.CUSTOMER_NAME=$('#DeliveryCustomerName').val();
                            theCustomer.PHONE_NUMBER=$('#DeliveryCustomerPhone').val();
                            theCustomer.ADDRESS_ONE=$('#DeliveryAddress').val();
                            theCustomer.DELIVERY_CHARGE=$('#DeliveryChargePrice').val();

                        });

                    });

                    SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
                        superWokLogin.getNextOrderId(ordeType, function (theId) {
                            $('#orderId').text("D" + theId);
                            var newOrder = new SuperWokDatabase.ORDER_DATA({
                                ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                                NO_OF_ORDERED_ITEM:"TEXT",
                                TODAY_ID:"D" + theId,
                                ORDER_FINISHED:"N",
                                ORDER_PAIED:"N",
                                ORDER_CANCELLED:"N",
                                ORDER_TOTAL_PRICE:"NUMERIC",
                                ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                                EXPIRED:"NO"
                            });
                            persistence.add(newOrder);
                            SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
                                ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                            });
                            SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                                row.forEach(function (theOrderDataElement) {
                                    sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                                });
                            });
                            SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER", sessionStorage.currentOrderCustomerPhoneNumber, function (err, customer) {
                                customer.CUSTOMER_DETAIL_ID_ORDERED_DATA.add(newOrder);
                            });


                        })

                    });
                    $('#theCloseBtn').click();


                } else {


                    var tempCustomer = new SuperWokDatabase.CUSTOMER_DETAILS({
                        CUSTOMER_ID:"TEXT",
                        CUSTOMER_NAME:data.name,
                        FIRST_NAME:"TEXT",
                        FAMILY_NAME:"TEXT",
                        PHONE_NUMBER:data.phone,
                        ADDRESS_ONE:data.address,
                        DELIVERY_CHARGE:data.deliveryCharge,
                        ADDRESS_TWO:"TEXT",
                        ADDRESS_THREE:"TEXT",
                        NO_OF_ORDER:"INT",
                        JOIN_TIME:data.time,
                        LAST_ORDERED_TIME:"INT",
                        PAGE_REFERENCE:"TEXT",
                        EXPIRED:"NO"
                    });

                    persistence.add(tempCustomer);
                    persistence.flush(function () {
                        SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
                            superWokLogin.getNextOrderId(ordeType, function (theId) {
                                $('#orderId').text("D" + theId);
                                var newOrder = new SuperWokDatabase.ORDER_DATA({
                                    ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                                    NO_OF_ORDERED_ITEM:"TEXT",
                                    TODAY_ID:"D" + theId,
                                    ORDER_FINISHED:"N",
                                    ORDER_PAIED:"N",
                                    ORDER_CANCELLED:"N",
                                    ORDER_TOTAL_PRICE:"NUMERIC",
                                    ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                                    EXPIRED:"NO"
                                });
                                persistence.add(newOrder);
                                SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "Delivery", function (err, ordeType) {
                                    ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                                });
                                SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                                    row.forEach(function (theOrderDataElement) {
                                        sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                                    });
                                });
                                SuperWokDatabase.CUSTOMER_DETAILS.findBy("PHONE_NUMBER", sessionStorage.currentOrderCustomerPhoneNumber, function (err, customer) {
                                    customer.CUSTOMER_DETAIL_ID_ORDERED_DATA.add(newOrder);
                                });


                            })

                        });
                        $('#theCloseBtn').click();
                    });


                }

            }

        });








    });

    $('#addNewDeliveryClose').click(function () {

        $('#theCloseBtn').click();
    });

    $('.orderType').click(function () {
        if (sessionStorage.currentOpenOrderId === "undefined") {
//			alert("You can add new order");

        } else {
            sessionStorage.orderType = $(this).text();
            if ($(this).text() === "Collection") {
                $('#orderedType').val("");
                $('#collectionCustomerPhone').text("");
                $('#orderedType').text($(this).text());
                $('#CollectionPopup').reveal({
                    animation:'none',
                    closeOnBackgroundClick:true,
                    dismissModalClass:'close-reveal-modal'
                });

            } else if ($(this).text() === "Delivery") {
                $('#foodPriceInBottom').show();
                $('#bottomDeliveryPrice').show();
                $('#DeliveryCustomerName').val("");
                $('#DeliveryCustomerPhone').text("");
                $('#DeliveryAddress').val("");
                $('#DeliveryPopup').reveal({
                    animation:'none',
                    closeOnBackgroundClick:true,
                    dismissModalClass:'close-reveal-modal'
                });


            } else {


                $('#orderedType').text(sessionStorage.orderType);

                $('#orderedTime').text(DateTime.please.getDate(DateTime.please.getCurrentMilliseconds()) + " " + DateTime.please.getTime(DateTime.please.getCurrentMilliseconds()));
                SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "TakeAway", function (err, ordeType) {
                    superWokLogin.getNextOrderId(ordeType, function (theId) {
                        $('#orderId').text("T " + theId);
                        var newOrder = new SuperWokDatabase.ORDER_DATA({
                            ORDER_TIME:DateTime.please.getCurrentMilliseconds(),
                            NO_OF_ORDERED_ITEM:"TEXT",
                            TODAY_ID:"T" + theId,
                            ORDER_FINISHED:"N",
                            ORDER_UPDATED:"N",
                            ORDER_PAIED:"N",
                            ORDER_CANCELLED:"N",
                            ORDER_TOTAL_PRICE:"NUMERIC",
                            ITEM_CATEGORY_FULL_DESCRIPTION:"TEXT",
                            EXPIRED:"NO"
                        });
                        persistence.add(newOrder);
                        SuperWokDatabase.ORDER_TYPE_CATEGORY.findBy("ORDER_TYPE_CATEGORY_NAME", "TakeAway", function (err, ordeType) {
                            ordeType.ORDER_ORDER_TYPE_CATEGORY_ID.add(newOrder);
                        });
                        SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', "N").list(function (err, row) {
                            row.forEach(function (theOrderDataElement) {
                                sessionStorage.currentOpenOrderId = theOrderDataElement.id;
                            });
                        });

                    })

                });
                persistence.flush();

            }
        }
    });

    $('#payOrder').click(function () {

        SuperWokDatabase.ORDER_DATA.all().filter("id", '=', sessionStorage.currentOpenOrderId).list(function (err, row) {
            row.forEach(function (theElement) {
                theElement.ORDER_PAIED = "Y";
                theElement.ORDER_FINISHED = "Y";
                superWokLogin.calculateTotal(sessionStorage.currentOpenOrderId, function (callback) {
//                        alert(" The Total Price is" + callback);
                    theElement.ORDER_TOTAL_PRICE = callback;
                    theElement.ORDER_DELIVERY_CHARGE = $('#deliveryCharge').text();

                });
            });
            sessionStorage.currentOpenOrderId = null;
            $('#orderPayOrUnpaid').text("YES");

        });
        Util.printDiv({width:"400", height:"500"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#orderSection").html();
            printWindow.document.getElementById("counterReceiptTable").style.height = "auto";
            printWindow.focus();
            printWindow.print();

        });

        persistence.flush(function () {
            $('#theCloseBtn').click();
            window.location.reload();
        });




//        $('#payPopUp').reveal({
//            animation:'none', //fade, fadeAndPop, none
//            closeOnBackgroundClick:true, //if you click background will modal close?
//            dismissModalClass:'close-reveal-modal' //the class of a button or element that will close an open modal
//        });


    });

    $('#payOrderNow').live('click', function () {

//        alert(sessionStorage.currentOpenOrderId);

        SuperWokDatabase.ORDER_DATA.all().filter("id", '=', sessionStorage.currentOpenOrderId).list(function (err, row) {
            row.forEach(function (theElement) {
                theElement.ORDER_PAIED = "Y";
                theElement.ORDER_FINISHED = "Y";
                superWokLogin.calculateTotal(sessionStorage.currentOpenOrderId, function (callback) {
//                        alert(" The Total Price is" + callback);
                    theElement.ORDER_TOTAL_PRICE = callback;
                    theElement.ORDER_DELIVERY_CHARGE = $('#deliveryCharge').text();

                });
            });
            sessionStorage.currentOpenOrderId = null;
            $('#orderPayOrUnpaid').text("YES");

        });
        Util.printDiv({width:"400", height:"500"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#orderSection").html();
            printWindow.document.getElementById("counterReceiptTable").style.height = "auto";
            printWindow.focus();
            printWindow.print();

        });

        persistence.flush(function () {
            $('#theCloseBtn').click();
            window.location.reload();
        });


    });

    $('#payOrderLater').live('click', function () {


        SuperWokDatabase.ORDER_DATA.all().filter("id", '=', sessionStorage.currentOpenOrderId).list(function (err, row) {
            row.forEach(function (theElement) {
                theElement.ORDER_PAIED = "N";
                theElement.ORDER_FINISHED = "Y";
                superWokLogin.calculateTotal(sessionStorage.currentOpenOrderId, function (callback) {
                    theElement.ORDER_TOTAL_PRICE = callback;
                    theElement.ORDER_DELIVERY_CHARGE = sessionStorage.currentOderDeliveryCharge;
                });
            });
            sessionStorage.currentOpenOrderId = null;
            $('#orderPayOrUnpaid').text("NO");


        });
        Util.printDiv({width:"400", height:"500"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#orderSection").html();
            printWindow.document.getElementById("counterReceiptTable").style.height = "auto";
            printWindow.focus();
            printWindow.print();

        });
        persistence.flush(function () {
            $('#theCloseBtn').click();
            window.location.reload();
        });


    });

    $('#openCashDrawer').click(function () {
        Util.printDiv({width:"0", height:"0"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#openCashDrawerPrint").html();

//            printWindow.document.getElementById("counterReceiptTable").style.height = "auto";

            printWindow.focus();
            printWindow.print();
            window.location.reload();
        });


    });
    $('.categoryBtn').click(function () {

        $('#MenuPopup button').remove();

        var temp = $(this).text();



        SuperWokDatabase.ITEM.all().prefetch('ITEM_CATEGORY_ID').list(function (err, rows) {
//            var docFrag = document.createDocumentFragment();
//            var buttonElm;
            rows.forEach(function (row) {
                if (row.ITEM_CATEGORY_ID.ITEM_CATEGORY_NAME == temp) {
//                    buttonElm = document.createElement("button");
//                    buttonElm.innerHTML = row.ITEM_NAME + "<br/><br/> " + (row.ITEM_PRICE).toFixed(2);
//                    buttonElm.setAttribute("data-orderid", row.id);
//                    buttonElm.setAttribute("data-orderitemprice", row.ITEM_PRICE);
//                    buttonElm.setAttribute("class", "span1 btn-small btn-info itemButton");
//                    docFrag.appendChild(buttonElm);
                    $('#MenuPopup').append($("<button>").attr("data-orderid", row.id).attr("data-orderitemprice", row.ITEM_PRICE).attr("class", "span1 btn-small btn-info itemButton").css("height", "45px;").css("font-size", "18px").html(row.ITEM_NAME + "<br/><br/> " + (row.ITEM_PRICE).toFixed(2)));
                }
            });
//            $('#MenuPopup').append(docFrag);
        });
        if(temp==="Special Main Course"||temp==="Chicken Dishes"||temp==="Beef Dishes"||temp==="King Prawn Dishes"||temp==="Roast Duck Dishes"||temp==="Roast Pork Dishes"||temp==="Vegetable Dishes"){
            $('#comesMain').click();

        }
        $('#MenuPopup').append($("<button>").attr("id", "CloseInMenu").attr("class", "btn-small btn-warning  close-reveal-modal").css("height", "55px;").text("X"));

        $('#MenuPopup').reveal({
            animation:'none', //fade, fadeAndPop, none

            closeOnBackgroundClick:true, //if you click background will modal close?
            dismissModalClass:'close-reveal-modal' //the class of a button or element that will close an open modal
        });


    });
    $('#CloseInMenu').click(function () {


        $('#theCloseBtn').click();

    });


    $('#modifyItemClose').click(function () {
        $('#theCloseBtn').click();

    });


    $('#cancelOrderType').click(function () {
        SuperWokDatabase.ORDER_DATA.all().filter("ORDER_FINISHED", '=', 'N').list(function (err, row) {
            row.forEach(function (theElement) {
                theElement.ORDER_FINISHED = "Y";
                theElement.ORDER_CANCELLED = "Y";

            });

        });

        persistence.flush(function () {
            window.location.reload();


        });


    });

    $('.itemButton').live('click', function () {

        $("#counterReceiptTable table").remove();
        if (sessionStorage.currentOpenOrderId === 'null') {
//			alert("Please add Order Type First");
//			$('#theCloseBtn').click();

        } else {

            var data = {};
            data.id = $(this).attr("data-orderid");
            data.price = $(this).attr("data-orderitemprice");

            var orderdItem = new SuperWokDatabase.ORDERED_ITEM({
                ORDERED_ITEM_ID:"TEXT",
                ORDERED_ITEM_TIME:DateTime.please.getCurrentMilliseconds(),
                ORDERED_ITEM_QUANTITY:"1",
                ORDERED_ITEM_NEW_PRICE:data.price,
                ORDERED_ITEM_MODIFY_DETAILS:"",
                EXPIRED:"NO"

            });

            persistence.add(orderdItem);
            persistence.flush();

            SuperWokDatabase.ITEM.findBy("id", data.id, function (err, theItem) {
                theItem.ORDERED_ITEM_ITEM_ID.add(orderdItem);
            });
            persistence.flush();
            SuperWokDatabase.ORDER_DATA.findBy("id", sessionStorage.currentOpenOrderId, function (err, orderData) {
                orderData.ORDERED_ITEM_ITEM_ID.add(orderdItem);
            });

            persistence.flush(function () {
                superWokLogin.displayCurrentOrderInformation();


            });


        }

    });


    $('#counterReceiptTable table tbody tr').live('click', function () {
        $("#counterReceiptTable table tbody tr").children().css("background-color", "inherit");
        var target = $(this).attr('data-itemid');
        sessionStorage.selectedItemRowId = target;
        $(this).children().css("background-color", "red");


    });

    $('#modifyItem').live('click', function () {

        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("id", '=', sessionStorage.selectedItemRowId).list(function (err, row) {

            row.forEach(function (element) {

                $('#modifyItemName').text(element.ITEM_ID.ITEM_NAME);
                $('#modifyItemPrice').val(element.ORDERED_ITEM_NEW_PRICE);
                $('#modifyItemQty').val(element.ORDERED_ITEM_QUANTITY);
                $('#modifyItemFreeText').val("");

            });

        });

        $('#ModifyItemPopup').reveal({
            animation:'none',
            closeOnBackgroundClick:true,
            dismissModalClass:'close-reveal-modal'
        });

    });

    $('#updateItem').click(function () {
        $("#counterReceiptTable table").remove();

        var data = {};

        data.updateItemPrice = $('#modifyItemPrice').val();
        data.updateItemQty = $('#modifyItemQty').val();
        data.updateItemModify = $('#modifyItemFreeText').val();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("id", '=', sessionStorage.selectedItemRowId).list(function (err, row) {

            row.forEach(function (element) {


                element.ORDERED_ITEM_NEW_PRICE = parseFloat(data.updateItemPrice);
                element.ORDERED_ITEM_QUANTITY = data.updateItemQty;
                element.ORDERED_ITEM_MODIFY_DETAILS = data.updateItemModify;

            });

        });
        persistence.flush(function () {
                superWokLogin.displayCurrentOrderInformation()
//              window.location.reload();
            }

        );


        $('#theCloseBtn').click();

    });

    $('#deleteItem').click(function () {
        $("#counterReceiptTable table").remove();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("EXPIRED", '=', "NO").filter("id", '=', sessionStorage.selectedItemRowId).list(function (err, row) {
            row.forEach(function (element) {
                element.EXPIRED = "YES";
            });
        });
        persistence.flush(function () {
            sessionStorage.selectedItemRowId = null;
//            window.location.reload();
            superWokLogin.displayCurrentOrderInformation();

        });

        $('#theCloseBtn').click();
    });

    $('#plusQty').click(function(){
        $("#counterReceiptTable table").remove();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("id", '=', sessionStorage.selectedItemRowId).list(function (err, row) {
            row.forEach(function (element) {
                element.ORDERED_ITEM_QUANTITY =parseInt(element.ORDERED_ITEM_QUANTITY)+1;
            });
        });
        persistence.flush(function () {
                superWokLogin.displayCurrentOrderInformation();
            }
        );
    });

    $('#minusQty').click(function(){
        $("#counterReceiptTable table").remove();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("id", '=', sessionStorage.selectedItemRowId).list(function (err, row) {
            row.forEach(function (element) {
                if(element.ORDERED_ITEM_QUANTITY==1){
                    $('#deleteItem').click();
                }else{
                element.ORDERED_ITEM_QUANTITY =parseInt(element.ORDERED_ITEM_QUANTITY)-1;
                    persistence.flush(function () {
                        superWokLogin.displayCurrentOrderInformation();
                    });
                }
            });
        });

    });

});


superWokLogin.getCurrentOrderOrderedItemData = function (orderId, callback) {

    SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("EXPIRED", '=', "NO").filter("ORDER_DATA_ID", '=', orderId).count(function (err, counter) {
        var i = 1;
        var orderedItemArray = new Array();
        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("EXPIRED", '=', "NO").filter("ORDER_DATA_ID", '=', orderId).list(function (err, element) {


            element.forEach(function (theElement) {

                var orderedItemObject = {};
                orderedItemObject.id = theElement.id;
                orderedItemObject.name = theElement.ITEM_ID.ITEM_NAME;
                orderedItemObject.itemPrice = theElement.ORDERED_ITEM_NEW_PRICE;
                orderedItemObject.quantity = theElement.ORDERED_ITEM_QUANTITY;
                orderedItemObject.modifyDetails = theElement.ORDERED_ITEM_MODIFY_DETAILS;
                orderedItemObject.totalThisItemPrice = theElement.ORDERED_ITEM_QUANTITY * theElement.ORDERED_ITEM_NEW_PRICE;


                orderedItemArray.push(orderedItemObject);

                if (i === counter) {
                    callback(orderedItemArray);
                }
                i += 1;
            });

        });

    });


}


superWokLogin.displayCurrentOrderInformation = function () {


    superWokLogin.showReceiptTopInformation(sessionStorage.currentOpenOrderId);

    if (sessionStorage.orderType === "Delivery" || sessionStorage.orderType === "Collection") {
//        superWokLogin.showCurrentCustomerDetails(sessionStorage.currentOpenOrderId);
    }

    $TABLE = $("<table>").attr({ "id":"counterPrintingInformation", "cellspacing":"0" });
    var $TBODY = $("<tbody>").css("height", "150px").css("width", "350px;");
//    var $THEAD = superWokLogin.addCounterReceiptHeader();

    superWokLogin.getCurrentOrderOrderedItemData(sessionStorage.currentOpenOrderId, function (orderedItemList) {

        for (var i = 0; i < orderedItemList.length; i++) {
            superWokLogin.addItemRow($TBODY, orderedItemList[i]);
        }
    });
//    $TABLE.append($THEAD);


    superWokLogin.calculateTotal(sessionStorage.currentOpenOrderId, function (callback) {
//        alert("Calculateing total");

        $('#totalCurrentOrderPrice').text(callback.toFixed(2));


    });
    $TABLE.append($TBODY);
    $("#counterReceiptTable").append($TABLE);
}

superWokLogin.addItemRow = function ($TBODY, itemList) {


//    var trElem = document.createElement("tr");
//    trElem.setAttribute("data-itemID", itemList.id);
//    var  tdElem = document.createElement("td");
//    tdElem.setAttribute();
//    tdElem.innerHTML = itemList.quantity+"  "+itemList.name + "   "+ itemList.modifyDetails+"  "+(parseFloat(itemList.itemPrice)).toFixed(2)+"  "+(itemList.totalThisItemPrice).toFixed(2);
//    trElem.appendChild(tdElem);
//    $TBODY.append(trElem);


    var $TR_B = $("<TR>").attr("data-itemID", itemList.id);
    $TR_B.append($("<TD>").html(itemList.quantity));
    $TR_B.append($("<TD>").html("<p>*</p>"));
    $TR_B.append($("<TD>").html(itemList.name + "<br/>" + itemList.modifyDetails));
    $TR_B.append($("<TD>").html((parseFloat(itemList.itemPrice)).toFixed(2)));
    $TR_B.append($("<TD>").html((itemList.totalThisItemPrice).toFixed(2)));
    $TBODY.append($TR_B);
}
superWokLogin.showReceiptTopInformation = function (currentOpenOrderId) {
    SuperWokDatabase.ORDER_DATA.all().filter("id", '=', currentOpenOrderId).prefetch("ORDER_TYPE_CATEGORY_ID").list(function (err, row) {

        row.forEach(function (theElement) {
            if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Delivery" || theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Collection") {
                SuperWokDatabase.ORDER_DATA.all().filter("id", '=', currentOpenOrderId).prefetch("CUSTOMER_DETAIL_ID").prefetch("ORDER_TYPE_CATEGORY_ID").list(function (err, row) {
                    if (err) {
                    } else {

                        row.forEach(function (theElement) {
                            $('#orderedTime').text(DateTime.please.getDate() + " " + DateTime.please.getTime(theElement.ORDER_TIME));
                            $('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//			$('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//            alert("the id is " + theElement.theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//            alert("the id is " + theElement.theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
                            $('#orderedCustomerName').text(theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
                            $('#orderedPhoneNumber').text(theElement.CUSTOMER_DETAIL_ID.PHONE_NUMBER);
                            $('#orderDeliveryAddress').text(theElement.CUSTOMER_DETAIL_ID.ADDRESS_ONE);


//			if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "TakeAway") {
//				$('#orderedNumber').text("T " + sessionStorage.nextTakeawayId - 1);
//			} else if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Collection") {
//				$('#orderedNumber').text("C " + sessionStorage.nextCollectionId - 1);
//			} else {
//				$('#orderedNumber').text("D " + sessionStorage.nextCollectionId - 1);
//
//			}


                        });
                    }

                });


            } else {

                SuperWokDatabase.ORDER_DATA.all().filter("id", '=', currentOpenOrderId).prefetch("ORDER_TYPE_CATEGORY_ID").list(function (err, row) {
                    if (err) {
                    } else {

                        row.forEach(function (theElement) {
                            $('#orderedTime').text(DateTime.please.getDate() + " " + DateTime.please.getTime(theElement.ORDER_TIME));
                            $('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//			$('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//            alert("the id is " + theElement.theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
//            alert("the id is " + theElement.theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
//                           $('#orderedCustomerName').text(theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
//                           $('#orderedPhoneNumber').text(theElement.CUSTOMER_DETAIL_ID.PHONE_NUMBER);
//                           $('#orderDeliveryAddress').text(theElement.CUSTOMER_DETAIL_ID.ADDRESS_ONE);


//			if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "TakeAway") {
//				$('#orderedNumber').text("T " + sessionStorage.nextTakeawayId - 1);
//			} else if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Collection") {
//				$('#orderedNumber').text("C " + sessionStorage.nextCollectionId - 1);
//			} else {
//				$('#orderedNumber').text("D " + sessionStorage.nextCollectionId - 1);
//
//			}


                        });
                    }

                });


            }


        });


    });


//	SuperWokDatabase.ORDER_DATA.all().filter("id", '=', currentOpenOrderId).prefetch("CUSTOMER_DETAIL_ID").prefetch("ORDER_TYPE_CATEGORY_ID").list(function (err, row) {
//		if(err){}else{
//
//        row.forEach(function (theElement) {
//			$('#orderedTime').text(DateTime.please.getDate() + " " + DateTime.please.getTime(theElement.ORDER_TIME));
//			$('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
////			$('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
////            alert("the id is " + theElement.theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
////            alert("the id is " + theElement.theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
//            $('#orderedCustomerName').text(theElement.CUSTOMER_DETAIL_ID.CUSTOMER_NAME);
//            $('#orderedPhoneNumber').text(theElement.CUSTOMER_DETAIL_ID.PHONE_NUMBER);
//            $('#orderDeliveryAddress').text(theElement.CUSTOMER_DETAIL_ID.ADDRESS_ONE);
//
//
////			if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "TakeAway") {
////				$('#orderedNumber').text("T " + sessionStorage.nextTakeawayId - 1);
////			} else if (theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME === "Collection") {
////				$('#orderedNumber').text("C " + sessionStorage.nextCollectionId - 1);
////			} else {
////				$('#orderedNumber').text("D " + sessionStorage.nextCollectionId - 1);
////
////			}
//
//
//		});
//        }
//
//	});
}


superWokLogin.isOpenOrder = function (callback) {
    SuperWokDatabase.ORDER_DATA.all().count(function (err, counter) {
        if (counter > 0) {
            SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").list(function (err, row) {
                if(err){}else{
                row.forEach(function (theElement) {
                    if (theElement.ORDER_FINISHED === "N") {
                        sessionStorage.orderType = theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME;
                        callback(true);
                    } else {
                        callback(false);
                    }

                });
                }
                });


        }
        callback(false);


    });

}


superWokLogin.addCounterReceiptHeader = function () {
    var lstTitles = superWokLogin.listCounterTableRecepietHeader;		// Global Variable of header titles
    var $TempTbody = $("<thead>");
    var $TR = $("<tr>");
    var i = 0;
    while (i < superWokLogin.listCounterTableRecepietHeader.length) {
        var $TH = $("<th>");
        $TR.append($TH.text(lstTitles[i]));
        i++;
    }
    return $TempTbody.append($TR);
}

superWokLogin.calculateTotal = function (orderDataPersistenceId, callback) {


    if (sessionStorage.orderType === "Delivery") {
        var total = 0;

        SuperWokDatabase.ORDERED_ITEM.all().prefetch("ITEM_ID").filter("EXPIRED", '=', "NO").filter("ORDER_DATA_ID", '=', orderDataPersistenceId).list(function (err, row) {
            row.forEach(function (theElement) {
                var tempCureentTotal = theElement.ORDERED_ITEM_QUANTITY * theElement.ORDERED_ITEM_NEW_PRICE;
                total += tempCureentTotal;

            });
            $('#deliveryCharge').text((parseFloat(sessionStorage.currentOderDeliveryCharge)).toFixed(2));
            $('#foodPrice').text((parseFloat(total)).toFixed(2));

            callback(parseFloat(total) + parseFloat(sessionStorage.currentOderDeliveryCharge));
        });

        SuperWokDatabase.ORDER_DATA.all().filter("EXPIRED", '=', "NO").filter("id", '=', orderDataPersistenceId).prefetch("ORDER_TYPE_CATEGORY_ID").prefetch("CUSTOMER_DETAIL_ID").list(function (err, row) {

            row.forEach(function (theElement) {
                theElement.ORDER_TOTAL_PRICE = total;
                theElement.ORDER_DELIVERY_CHARGE = sessionStorage.currentOderDeliveryCharge;
            });


        });


    } else {

        var total = 0;


        SuperWokDatabase.ORDERED_ITEM.all().filter("EXPIRED", '=', "NO").prefetch("ITEM_ID").filter("ORDER_DATA_ID", '=', orderDataPersistenceId).list(function (err, row) {
            row.forEach(function (theElement) {
                var tempCureentTotal = theElement.ORDERED_ITEM_QUANTITY * theElement.ORDERED_ITEM_NEW_PRICE;
                total += tempCureentTotal
            });
            callback(total);
//            alert(total);

        });

        SuperWokDatabase.ORDER_DATA.all().filter("EXPIRED", '=', "NO").filter("id", '=', orderDataPersistenceId).prefetch("ORDER_TYPE_CATEGORY_ID").prefetch("CUSTOMER_DETAIL_ID").list(function (err, row) {

            row.forEach(function (theElement) {

                theElement.ORDER_TOTAL_PRICE = total;
            });


        });


    }


}

//superWokLogin.getDeliveryCharge = function (currentPersistenceID) {
//
//	SuperWokDatabase.ORDER_DATA.all().prefetch("CUSTOMER_DETAIL_ID").filter("id", '=', currentPersistenceID).list(function (err, row) {
//
//		row.forEach(function (theElement) {
//            return(theElement.CUSTOMER_DETAIL_ID.DELIVERY_CHARGE);
//             $('#deliveryCharge').text(theElement.CUSTOMER_DETAIL_ID.DELIVERY_CHARGE);
//		});
//
//
//	});
//
//
//}

superWokLogin.showCurrentCustomerDetails = function (orderId) {

    SuperWokDatabase.ORDER_DATA.all().filter("EXPIRED", '=', "NO").prefetch("ORDER_TYPE_CATEGORY_ID").prefetch("CUSTOMER_DETAIL_ID").list(function (err, row) {

        row.forEach(function (theElement) {

            $('#orderedType').text(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME);
            alert(theElement.CUSTOMER_DETAIL_ID.PHONE_NUMBER);
            $('#orderedPhoneNumber').text(theElement.CUSTOMER_DETAIL_ID.PHONE_NUMBER);
            $('#orderDeliveryAddress').text(theElement.CUSTOMER_DETAIL_ID.ADDRESS_ONE);
//            alert("THFFJLSFJKLSJDLKF"+theElement.CUSTOMER_DETAIL_ID.NAME);

        });


    });


}

superWokLogin.getNextOrderId = function (theType, callback) {

    var todayDate = DateTime.please.getTodayDateForID();
    SuperWokDatabase.ORDER_DATA.all().filter("ORDER_TYPE_CATEGORY_ID", '=', theType).filter("ORDER_FINISHED", '=', 'Y').filter("ORDER_CANCELLED", '=', "N").count(function (err, counter) {
        if (counter === 0) {
            callback(1);
        } else {

            SuperWokDatabase.ORDER_DATA.all().filter("ORDER_TYPE_CATEGORY_ID", '=', theType).filter("ORDER_FINISHED", '=', 'Y').filter("ORDER_CANCELLED", '=', "N").list(function (err, row) {
                var orderCounter = 1;
                row.forEach(function (theElement) {
//                        alert(DateTime.please.getTodayDateForID(theElement.ORDER_TIME));
                    if (DateTime.please.getTodayDateForID(theElement.ORDER_TIME) == todayDate) {
//                            alert(DateTime.please.getTodayDateForID(theElement.ORDER_TIME));
                        orderCounter = orderCounter + 1;
                    }
                });
                callback(orderCounter);

            });
        }


    });
}
superWokLogin.isThisPreviousCustomer = function(phoneNumber,callback){

    SuperWokDatabase.CUSTOMER_DETAILS.filter("EXPIRED",'=',"NO").filter("PHONE_NUMBER",'=',phoneNumber).count(function(counter){
        alert(counter);
        if(counter>0){

            callback(1);
        }else{
            callback(0)

        }

    });



}