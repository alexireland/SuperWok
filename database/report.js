var report = report || {};

$(document).ready(function () {
    report.init();
});

report.init = function () {
    report.populateOrderTable();
}

report.populateOrderTable = function () {
    SuperWokDatabase.ORDER_DATA.all().prefetch("ORDER_STATUS_ID").prefetch("ORDER_TYPE_CATEGORY_ID").prefetch("PAY_STATUS_ID").list(function (err, orders) {

        var rowDetails = new Array();

        orders.forEach(function (order) {
            var row = new Array(order.ORDER_TIME, order.ORDER_TYPE_CATEGORY_ID.ORDER_TYPE_CATEGORY_NAME, order.PAYS_STATUS_ID.PAY_STATUS_NAME);
            rowDetails.push(row);
        });

        //report.table.new (rowDetails);
        $("#orderReportPlaceHolder").append(report.table.new (rowDetails));
    });
}

report.table = {};

report.table.params = {
    id: "orderReportTable",
    attr: "class='orderTableStyle' ",
    headers: ["Time","Type","Pay Status"]
}


report.table.new = function (tableDetails) {
    var tableStart = "<table id ='" + report.table.params.id + "' " + report.table.params.id + " >\n"
    var tableEnd = "</table>\n";
    tableStart  += this.getThead(report.table.params.headers);

    for (var i = 0; i < tableDetails.length; i+=1)
    {
        tableStart += this.getDataRow(tableDetails[i]);
    }

    return tableStart + tableEnd;
};

report.table.getDataRow = function (rowDetails) {
    var trStart = "\n<tr>\n";
    var trEnd   = "<\tr>\n";
    for (var i = 0; i < rowDetails.length; i += 1)
    {
        trStart += "<td>" + rowDetails[i] + "</td>\n";
    }

    return trStart + trEnd;
};

report.table.getThead = function (headerList){
    var theadStart  = "<thead>\n";
    var theadEnd    = "\n<\thead>\n";
    var rows = "";
    for (var i = 0; i < headerList.length; i += 1) {
        rows += "\t<tr>\n\t\t<th>" + headerList[i] + "<th>\t<\tr>\n";
    }
    return theadStart + rows + theadEnd    
};