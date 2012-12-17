var superWokReport = superWokReport || {};
superWokReport.listReportTableHeader = ["ORDERTIME","ID","TYPE","CANCELLED", "PAYED","PRICE"];
$(document).ready(function(){
    $('#dateFrom').scroller({dateOrder:'ddmmyy', timeFormat:'HH:ii', ampm:false, preset:'datetime', theme:'android', mode:'clickpick', dateFormat:'dd M yy'});
    $('#dateTo').scroller({dateOrder:'ddmmyy', timeFormat:'HH:ii', ampm:false, preset:'datetime', theme:'android', mode:'clickpick', dateFormat:'dd M yy'});


    SuperWokDatabase.init(function () {
        var temp = DateTime.please.getUTCDate()+" 03:00 ";
        sessionStorage.todayDateForFiltering = DateTime.please.getMilliseconds(temp);
        sessionStorage.tomorrowDateForFiltering = parseInt(sessionStorage.todayDateForFiltering)+86400000;
        SuperWokDatabase.loadDatabaseData(function (passed) {
            if (passed) {
                SuperWok_SampleData.load();
            }

        });
//        superWokReport.createReportTable();
    });


    $('#getReportTop').click(function(){

        var from = DateTime.please.getMilliseconds($('#dateFrom').val());
        var to = DateTime.please.getMilliseconds($('#dateTo').val());
        $('#reportPeriod').text($('#dateFrom').val()+"---"+$('#dateTo').val());
        superWokReport.createReportTable(from,to);


    });

    $('#printReport').live('click',function(){
        Util.reportPrintDiv({width:"350", height:"500"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#showTheOrderDetails").html();
//            printWindow.document.getElementById("showTheOrderDetails").style.height = "auto";
            printWindow.focus();
            printWindow.print();

        });
//        window.location.reload();



    });
    $('#openDraw').click(function () {
        Util.printDiv({width:"0", height:"0"}, function (printWindow, printDivBody) {
            printWindow.document.getElementById(printDivBody).innerHTML = $("#openCashDrawerPrint").html();

//            printWindow.document.getElementById("counterReceiptTable").style.height = "auto";

            printWindow.focus();
            printWindow.print();
            window.location.reload();
        });


    });

});
superWokReport.createReportTable = function(timeFrom,timeTo){


    $TABLE = $("<table>").attr({ "id":"superWokreportInnerTable", "cellspacing":"0" }).css("width","600px").css("height","400px;");

    var $TBODY = $("<tbody>").css("height","50px").css("overflow","auto");
//    var $THEAD = superWokReport.addReportHeader();

    superWokReport.getReportData(timeFrom,timeTo,function (reportList) {


        for (var i = 0; i < reportList.length; i++) {
            superWokReport.addReportMemberRow($TBODY, reportList[i]);
        }
    });

//    $TABLE.append($THEAD);
    $TABLE.append($TBODY);
    $("#reportTable").append($TABLE);




}
superWokReport.getReportData = function(timeFrom,timeTo,callback){

    SuperWokDatabase.ORDER_DATA.all().filter("ORDER_TIME",'>=',timeFrom).filter("ORDER_TIME",'<=',timeTo).count(function(err,counter){
        var i =1;
        var reportDataArray = new Array();
        var sumTakeAway=0;
        var sumCollection=0;
        var sumDelivery=0;
        var sumCancel=0;
        var sumTotal = 0;
        var sumTakeAwayQty=0;
        var sumCollectionQty=0;
        var sumDeliveryQty=0;
        var sumCancelQty=0;
        var sumTotalQty = 0;

       SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_TYPE_CATEGORY_ID").filter("ORDER_TIME",'>=',timeFrom).filter("ORDER_TIME",'<=',timeTo).list(function(err,row){
           if(err){

           }else{
        row.forEach(function(theElement){

            var reportItem ={};
            reportItem.id = theElement.id;
            reportItem.todayId = theElement.TODAY_ID;
            reportItem.time = theElement.ORDER_TIME;
            reportItem.finished = theElement.ORDER_FINISHED;
            reportItem.cancelled = theElement.ORDER_CANCELLED;
            reportItem.payStatus = theElement.ORDER_PAIED;
            reportItem.noOfOrderItmes = theElement.NO_OF_ORDERED_ITEM;
            reportItem.theOrderPrice = theElement.ORDER_TOTAL_PRICE;
            reportItem.ordetType = theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME;

            sumTotalQty+=1;


            if(theElement.ORDER_CANCELLED==="Y"){

                sumCancel+=parseFloat(theElement.ORDER_TOTAL_PRICE);
                parseInt(sumCancelQty+=1);
            }else{
                parseInt(sumTotal+=theElement.ORDER_TOTAL_PRICE);

                if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="TakeAway"){



                    sumTakeAway+=theElement.ORDER_TOTAL_PRICE;
                    parseInt(sumTakeAwayQty+=1);
                }else if(theElement.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME==="Collection"){

                    sumCollection+=theElement.ORDER_TOTAL_PRICE;
                    parseInt(sumCollectionQty+=1);
                }else{

                    sumDelivery+=theElement.ORDER_TOTAL_PRICE;
                    parseInt(sumDeliveryQty+=1);
                }

            }

            reportDataArray.push(reportItem);


            if (i === counter) {
                $('#reportTakeAwayTotalPrice').text(sumTakeAway.toFixed(2));
                $('#reportCollectionTotalPrice').text(sumCollection.toFixed(2));
                $('#reportDeliveryTotalPrice').text(sumDelivery.toFixed(2));
                $('#reportCancelTotalPrice').text(sumCancel.toFixed(2));
                $('#reportTotalTotalPrice').text(sumTotal.toFixed(2));
                $('#reportTakeAwayQty').text(sumTakeAwayQty);
                $('#reportCollectionQty').text(sumCollectionQty);
                $('#reportDeliveryQty').text(sumDeliveryQty);
                $('#reportCancelQty').text(sumCancelQty);
                $('#reportTotalTotalQty').text(sumTotalQty);

                callback(reportDataArray);
            }
            i += 1;


        });
           }

    });





    });

}

superWokReport.addReportMemberRow = function($TBODY,itemList){


var $TR_B = $("<TR>").attr("data-itemID", itemList.id);

$TR_B.append($("<TD>").html(DateTime.please.getDate(itemList.time)+" "+DateTime.please.getTime(itemList.time)));
// $TR_B.append($("<TD>").html(itemList.orderPhoneNumber));
$TR_B.append($("<TD>").html(itemList.todayId));
$TR_B.append($("<TD>").html(itemList.ordetType));
$TR_B.append($("<TD>").html(itemList.cancelled));
$TR_B.append($("<TD>").html(itemList.payStatus));
$TR_B.append($("<TD>").html((parseFloat(itemList.theOrderPrice)).toFixed(2)));
    $TBODY.append($TR_B);

}
superWokReport.addReportHeader = function(){
    var lstTitles = superWokReport.listReportTableHeader;		// Global Variable of header titles
    var $TempTbody = $("<thead>");
    var $TR    = $("<tr>");
    var i = 0;

    while ( i < superWokReport.listReportTableHeader.length)
    {
        var $TH = $("<th>");
        $TR.append($TH.text(lstTitles[i]));
        i++;
    }
    return $TempTbody.append($TR);


}
