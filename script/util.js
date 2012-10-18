var Util = Util || {};


Util.loadResource = function(window, filename, filetype) {
	var loadedResource = undefined;
	if (filetype === "js") { //if filename is a external JavaScript file
		loadedResource = window.document.createElement('script');
		loadedResource.setAttribute("type", "text/javascript");
		loadedResource.setAttribute("src", filename);
	}
	else if (filetype === "css") { //if filename is an external CSS file
		loadedResource = window.document.createElement("link");
		loadedResource.setAttribute("rel", "stylesheet");
		loadedResource.setAttribute("type", "text/css");
		loadedResource.setAttribute("href", filename);
	}
	if (typeof loadedResource !== undefined) {
		window.document.getElementsByTagName("head")[0].appendChild(loadedResource)
	}
};

Util.printDiv = function(options, callback) {
	var printWindowProperties = "toolbar=no, location=no, directories=no, status=no, " +
			"menubar=yes, scrollbars=yes, resizable=yes, width=" + options.width + ", height=" + options.height;
	var printWindow = window.open("about:blank", "Print Order", printWindowProperties);
	printWindow.document.write("<div id='printDivBody'>This is a dummy div</div>");

	Util.loadResource(printWindow, "../bootstrap/css/bootstrap.css", "css");
	Util.loadResource(printWindow, "../foundation/stylesheets/foundation.css", "css");
	Util.loadResource(printWindow, "../css/print.css", "css");
	Util.loadResource(printWindow, "../css/general.css", "css");

	callback(printWindow, "printDivBody");
};
