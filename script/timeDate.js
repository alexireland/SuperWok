var DateTime = DateTime || {};

DateTime.Now = {
	getTime:function() {
		var currentTime = new Date();
		var currentHour   = this.padTime(currentTime.getHours());
  		var currentMinute = this.padTime(currentTime.getMinutes());
		return currentHour + ":" + currentMinute;
	},
	getDate:function() {
		var currentTime = new Date();
 	    var mnths = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
  		var currentDate = currentTime.getDate();
  		var currentMonth = currentTime.getMonth();
  		var currentYear = currentTime.getFullYear();
		return currentDate + " " + mnths[currentMonth] + " " + currentYear;
	},
	getUTCTime:function() {
		var currentTime = new Date();
		var currentHour   = this.padTime(currentTime.getUTCHours());
  		var currentMinute = this.padTime(currentTime.getUTCMinutes());
		return currentHour + ":" + currentMinute;
	},
	getUTCDate:function() {
		var currentTime = new Date();
 	    var mnths = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
  		var currentDate = currentTime.getUTCDate();
  		var currentMonth = currentTime.getUTCMonth();
  		var currentYear = currentTime.getUTCFullYear();
		return currentDate + " " + mnths[currentMonth] + " " + currentYear;
	},
    getCurrentMilliseconds:function() {
	    return parseInt(new Date().getTime(), 10);
    },
	padTime:function(val) {
		return DateTime.pad(val);
	}
};

DateTime.please = {
    getTodayDateForID:function(millis){
        var currentTime = millis ? new Date(millis) : new Date ();
        var mnths = ["01","02","03","04","05","06","07","08","09","10","11","12"];
        var currentDate = currentTime.getDate();
        var currentMonth = currentTime.getMonth();
        var currentYear = currentTime.getFullYear();
        return currentDate +mnths[currentMonth]+ currentYear;
    },
    getTime:function(millis) {
        var currentTime = new Date(millis) ? new Date(millis) : new Date ();
        var currentHour   = this.padTime(currentTime.getHours());
        var currentMinute = this.padTime(currentTime.getMinutes());
	    return currentHour + ":" + currentMinute;
    },
    getDate:function(millis) {
        var currentTime = millis ? new Date(millis) : new Date ();
        var mnths = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
        var currentDate = currentTime.getDate();
        var currentMonth = currentTime.getMonth();
        var currentYear = currentTime.getFullYear();
        return currentDate + " " + mnths[currentMonth] + " " + currentYear;
    },
    getUTCTime:function(millis) {
        var currentTime = millis ? new Date(millis) : new Date ();
        var currentHour   = this.padTime(currentTime.getUTCHours());
        var currentMinute = this.padTime(currentTime.getUTCMinutes());
	    return currentHour + ":" + currentMinute;
    },
    getUTCDate:function(millis) {
        var currentTime = millis ? new Date(millis) : new Date ();
        var mnths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var currentDate = currentTime.getUTCDate();
        var currentMonth = currentTime.getUTCMonth();
        var currentYear = currentTime.getUTCFullYear();
	    return this.padTime(currentDate) + " " + mnths[currentMonth] + " " + currentYear;
    },
    getUTCDateTime:function(millis) {
        return DateTime.please.getUTCDate(millis) + " " + DateTime.please.getUTCTime(millis);
    },
    getCurrentMilliseconds:function() {
	    return parseInt(new Date().getTime(), 10)
    },
    getMilliseconds:function(str) {
        if (jQuery.trim(str) !== "") {
            var dateParts = DateTime.splitDate(str);
            return Date.UTC(dateParts[0], dateParts[1], dateParts[2], dateParts[3], dateParts[4], dateParts[5], dateParts[6]);
        }
        return -1;
    },
	getGUIDDate : function(millis) {
		millis = millis ? millis : DateTime.please.getCurrentMilliseconds();
		var dateParts = DateTime.splitDate(DateTime.please.getUTCDateTime());
		var guidDate = dateParts[0] +"-"+ dateParts[1] +"-"+ dateParts[2] +"-"+ dateParts[3] +"."+dateParts[4] +"."+ dateParts[5] +"."+ dateParts[6];

		return guidDate;
	},
    padTime:function(val) {
        return DateTime.pad(val);
    },
    /**
    *  Takes two dates in standard mobiscroll format, i.e dd Mth YYYY HH:MM
    *
    * retruns true if time1 > time2
    */
    isGreaterThan: function (time1, time2) {

        if ($.trim(time1) === "" || $.trim(time2) === "")
            return undefined;

        var time1_ms = this.getMilliseconds(time1);
        var time2_ms = this.getMilliseconds(time2);

        console.log("time1_ms: " + time1_ms);
        console.log("time2_ms: " + time2_ms);

        return time1_ms > time2_ms;
    }
};

DateTime.Set = function() {
	this.setDateTime();
	this.positionTopBarWindows();
	this.t();
};

DateTime.positionTopBarWindows = function() {
	var seatTimeWindowLeftPosition    = window.innerWidth - $(".timeWindow").outerWidth();
	$(".timeWindow").css("left", seatTimeWindowLeftPosition);
};

DateTime.t = function() {

	$("#topBar_Clock").click(function() {
		var display =  $(".timeWindow").css("display");
		$(".timeWindow").slideToggle();
	});
};

DateTime.printClock = function() {
	// Update the time display
	var clock = document.getElementById("clock");
	if(clock) {
		clock.firstChild.nodeValue = this.Now.getUTCTime();
	}
};

DateTime.printDate = function() {
	var date = document.getElementById("date");
	if(date) {
		date.firstChild.nodeValue = this.Now.getUTCDate();
	}
};

DateTime.setClock = function() {
	this.printClock();
	setInterval('DateTime.printClock()', 1000);
};

DateTime.setDate = function() {
	this.printDate();
	setInterval('DateTime.printDate()',1000);
};

DateTime.setDateTime = function() {
	this.setClock();
	this.setDate();
};

DateTime.pad = function(val) {
	if (parseInt(val, 10) < 10) {
		val = "0" + val;
	}
	return val;
};

DateTime.splitDate = function(str) {
    if(!str) {
        str = DateTime.please.getUTCDateTime();
    }
    var lstDate_Time = str.split(" ");
    var strDate = lstDate_Time[0];
    var strMonth = lstDate_Time[1];
    var strYear = lstDate_Time[2];
    var strTimeHour = lstDate_Time[3].split(":");
    var strHour = strTimeHour[0];
    var strMin = strTimeHour[1];
    var d = new Date();
    var strSeconds = d.getUTCSeconds(); //this gives you seconds[0-60] for a brand new date, not for the one passed in
    var strMilliSeconds = d.getUTCMilliseconds(); //this gives you milliseconds[0-999] for a brand new date, not for the one passed in

    var intMonth = 0;
    if(strMonth==="Jan") {
        intMonth = 0;
    }
    if(strMonth==="Feb") {
        intMonth = 1;
    }
    if(strMonth==="Mar") {
        intMonth = 2;
    }
    if(strMonth==="Apr") {
        intMonth = 3;
    }
    if(strMonth==="May") {
        intMonth = 4;
    }
    if(strMonth==="Jun") {
        intMonth = 5;
    }
    if(strMonth==="Jul") {
        intMonth = 6;
    }
    if(strMonth==="Aug") {
        intMonth = 7;
    }
    if(strMonth==="Sep") {
        intMonth = 8;
    }
    if(strMonth==="Oct") {
        intMonth = 9;
    }
    if(strMonth==="Nov") {
        intMonth = 10;
    }
    if(strMonth==="Dec") {
        intMonth = 11;
    }

    var intYear  = DateTime.pad(parseInt(strYear, 10));
    intMonth = DateTime.pad(intMonth);
    var intDay = DateTime.pad(parseInt(strDate, 10));
    var intHour   = DateTime.pad(parseInt(strHour, 10));
    var intMinute = DateTime.pad(parseInt(strMin, 10));
    var intSeconds = DateTime.pad(parseInt(strSeconds, 10));
    var intMilliSeconds = DateTime.pad(parseInt(strMilliSeconds, 10));

    console.log("intYear: " + intYear + " intMonth: " + intMonth + " intDay: " + intDay +
        " intHour: " + intHour + " intMinute: " + intMinute + " intSeconds: " + intSeconds +
        " intMilliseconds: " + intMilliSeconds);

    return [intYear, intMonth, intDay, intHour, intMinute, intSeconds, intMilliSeconds];
};

/*
 * Document Loads From this point when the parent html document is run. To set time explicitly
 * call DateTime.Set();, or to access time directly call DateTime.Now and use the methods provided.
 */

$(document).ready(function() {
	DateTime.Set();
});