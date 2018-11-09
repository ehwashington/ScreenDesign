/*
Standard JS - window object 
*/
window.$ = function (element) { return window.document.getElementById(element); }
window.$$ = function (element) { if (window.parent != null) return window.parent.document.getElementById(element); }
window.$id = function () { return $$(window.name).parentNode.id; }

window.parent.onbeforeunload = function () {
    var sURL = $$("hPDFUnload").value;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", sURL, false);
    xmlhttp.send();
}

window.parent.RunPDFEvent = function (sActionName) {
    //var oFrame = $$($id() + "__if");
    //if (oFrame) oFrame.contentWindow.DoParentEvent(sActionName);
    window.DoParentEvent(sActionName);
}

window.parent.ResizeWindow = function () { window.parent.RunPDFEvent('Resize'); }

window.OnLoadPDF = function (iPageCount) {
    var oPDFDiv = $("divPDF");
    oPDFDiv.style.visibility = "visible";
    if (iPageCount > 1) {
        var sImageUrl = $("divPage_1").style.backgroundImage;
        for (var i = 2; i < iPageCount + 1; i++) {
            var oDivPage = $("divPage_" + i);
            if (oDivPage != null) {
                var sImageURL = sImageUrl.replace(/Page=1/, "Page=" + i);
                oDivPage.style.backgroundImage = sImageURL;
                oDivPage.style.cursor = "auto";
            }
        }
    }
    var oParentBody = window.parent.document.body;
    if (window.document.body.currentStyle == undefined) {
        oParentBody.style.backgroundColor = window.getComputedStyle(window.document.body, null).backgroundColor;
    } else {
        oParentBody.style.backgroundColor = window.document.body.currentStyle.backgroundColor;
    }
    oParentBody.style.overflow = "hidden";
    $$($id() + "__tb").style.visibility = "visible";
    $$($id() + "__if").style.visibility = "visible";
    $$("txtPDFTotalPages").value = " / " + this.numPages;
    window.SetPDFZoom(1);
    this.pageNum = 0;
    window.onscroll = window.OnScrollPDF;
    $$("hFitPageWidth").value = "true";
    $$("bttnPDFResize").src = "images/zoom_fit_width_on.gif";
    window.ResizePDF();
    window.parent.onresize = window.parent.ResizeWindow;

    var oElements = GetElementsForClassName("label", "pdfradiobox");
    if (oElements) {
        for (var i = 0; i < oElements.length; i++) {
            if (oElements[i].children.length == 2) {
                var oCheckbox = oElements[i].children[0];
                var oSpan = oElements[i].children[1];
                oSpan.innerHTML = oCheckbox.checked ? "X" : "";

                if (AppRoot == undefined || !AppRoot.IsIE || AppRoot.BrowserVsn != 8)
                    oSpan.onclick = PDFRadioBox_OnClick;
                else
                    oSpan.onclick = DownLevelClick;
            }
        }
    }

    oElements = GetElementsForClassName("label", "pdfcheckbox");
    if (oElements) {
        for (var i = 0; i < oElements.length; i++) {
            if (oElements[i].children.length == 2) {
                var oCheckbox = oElements[i].children[0];
                var oSpan = oElements[i].children[1];
                oSpan.innerHTML = oCheckbox.checked ? "X" : "";

                if (AppRoot == undefined || !AppRoot.IsIE || AppRoot.BrowserVsn != 8)
                    oSpan.onclick = PDFCheckbox_OnClick;
                else
                    oSpan.onclick = DownLevelClick;
            }
        }
    }
    $$($id() + "__loadimg").style.display = "none";
    //Hide Print button - no supported in the release of MSOW 2.4.0
    //$$("bttnPDFPrint").style.display = "none";
}

function GetElementsForClassName(tagName, className) {
    var oElements = new Array();

    if (window.document.getElementsByClassName)
        oElements = window.document.getElementsByClassName(className);
    else {
        var oNonFilteredElements = window.document.getElementsByTagName(tagName);
        for (var i = 0; i < oNonFilteredElements.length; i++) {
            if (oNonFilteredElements[i].className == className)
                oElements.push(oNonFilteredElements[i]);
        }
    }

    return oElements;
}

window.PDFCheckbox_OnClick = function (e) {
    var oSpan;
    if (e.target) oSpan = e.target;
    else if (e.srcElement) oSpan = e.srcElement;
    if (oSpan.nodeType == 3) oSpan = oSpan.parentNode; // defeat Safari bug
    var oCheckbox = oSpan.previousSibling;
    //If checkbox is currently checked, we are unchecking.
    if (!oCheckbox.disabled) oSpan.innerHTML = oCheckbox.checked ? "" : "X";
}

function DownLevelClick() {
    if (this) {
        var oCheckbox = this.previousSibling;
        //If checkbox is currently checked, we are unchecking.
        if (!oCheckbox.disabled) this.innerHTML = oCheckbox.checked ? "" : "X";

        if (this.innerHTML == "X")
            oCheckbox.checked = true;
        else
            oCheckbox.checked = false;
    }
}


window.PDFRadioBox_OnClick = function (e) {
    var oSpan;
    if (e.target) oSpan = e.target;
    else if (e.srcElement) oSpan = e.srcElement;
    if (oSpan.nodeType == 3) oSpan = oSpan.parentNode; // defeat Safari bug
    var oCheckbox = oSpan.previousSibling;
    if (!oCheckbox.disabled) {
        if (oCheckbox.checked) oSpan.innerHTML = ""; //Unchecking
        else {
            //Checking, need to uncheck the others.
            oSpan.innerHTML = "X";
            var oGroup = window.document.getElementsByName(oCheckbox.name);
            for (var i = 0; i < oGroup.length; i++) {
                if (oGroup[i].id != oCheckbox.id && oGroup[i].checked) {
                    oGroup[i].checked = false;
                    oGroup[i].nextSibling.innerHTML = "";
                }
            }
        }
    }
}

window.OnScrollPDF = function () {
    var iScrollOffset = (window.pageYOffset + (window.innerHeight / 2)) / window.document.body.offsetHeight;
    for (var i = this.numPages; i > 0; i--) {
        var oDivPage = $("divPage_" + i);
        var oDivPDF = $("divPDF");
        var iPageOffset = oDivPage.offsetTop / oDivPDF.offsetHeight;
        if (iPageOffset < iScrollOffset) {
            window.SetPDFPage(i - 1);
            break;
        }
    }
}

window.DoParentEvent = function (sAction) {
    if (sAction == "NextPage") {
        this.pageNum++;
    }
    else if (sAction == "PrevPage") {
        this.pageNum--;
    }
    else if (sAction == "FirstPage") {
        this.pageNum = 0;
    }
    else if (sAction == "LastPage") {
        this.pageNum = this.numPages - 1;
    }
    else if (sAction == "SetPage") {
        var iPage = $$("txtPDFPage").value;
        if (isNaN(iPage) || iPage < 1 || iPage > this.numPages) {
            $$("txtPDFPage").value = this.pageNum + 1;
        } else {
            this.pageNum = parseInt($$("txtPDFPage").value) - 1;
        }
    }
    else if (sAction == "ZoomIn") {
        if ($$("hFitPageWidth").value == "true") {
            $$("hFitPageWidth").value = "false";
            $$("bttnPDFResize").src = "images/zoom_fit_width_off.gif";
        }
        var iCurrentZoom = window.GetPDFZoom();
        var iNewZoom = iCurrentZoom + 0.1;
        window.SetPDFZoom(iNewZoom);
        this.pageNum = this.pageNum;
    }
    else if (sAction == "ZoomOut") {
        if ($$("hFitPageWidth").value == "true") {
            $$("hFitPageWidth").value = "false";
            $$("bttnPDFResize").src = "images/zoom_fit_width_off.gif";
        }
        var iCurrentZoom = window.GetPDFZoom();
        var iNewZoom = (iCurrentZoom > 0.1) ? iCurrentZoom - 0.1 : 0.01;
        window.SetPDFZoom(iNewZoom);
        this.pageNum = this.pageNum;
    }
    else if (sAction == "SetZoom") {
        var iCurrentZoom = window.GetPDFZoom();
        var iNewZoom = parseInt($$("txtPDFZoom").value) / 100;
        if (iNewZoom < 0.01) iNewZoom = 0.01;
        window.SetPDFZoom(iNewZoom);
        this.pageNum = this.pageNum;
    }
    else if (sAction == "Resize") {
        window.ResizePDF();
        this.pageNum = this.pageNum;
    }
    else if (sAction == "FitPageWidth") {
        if ($$("hFitPageWidth").value == "true") {
            $$("hFitPageWidth").value = "false";
            $$("bttnPDFResize").src = "images/zoom_fit_width_off.gif";
        } else {
            $$("hFitPageWidth").value = "true";
            $$("bttnPDFResize").src = "images/zoom_fit_width_on.gif";
            window.ResizePDF();
        }
        this.pageNum = this.pageNum;
    }
    else if (sAction == "Print") {
        //Not doing anything for now
        var sURL = $$("hPDFPreviewURL").value;
        if (sURL != "") {
            try {
                //Reset the page to blank to clear any loaded PDF
                var oWinPDF = window.parent.open("about:blank", "PDFViewerPreview", "width=800,height=640,location=no,menubar=no,toolbar=no,resizable=yes");
                var oDoc = window.parent.document;
                var oForm = oDoc.createElement("form");
                oForm.method = "POST";
                oForm.action = sURL;
                oForm.target = "PDFViewerPreview";
                var oDiv = oDoc.createElement("div");
                oDiv.style.visibility = "hidden";
                for (var i = 0; i < this._fields.length; i++) {
                    var f = this.getField(_fields[i]);
                    if (f.type != "button") {
                        try {
                            var oField = oDoc.createElement("textarea");
                            oField.name = _fields[i];
                            oField.value = f.valueAsString;
                            oDiv.appendChild(oField);
                        } catch (err) { }
                    }
                }
                oForm.appendChild(oDiv);
                oDoc.body.appendChild(oForm);
                oForm.submit();
                oDoc.body.removeChild(oForm);
            } catch (e) {
                alert("Unable to open PDF: " + e);
            }
        }
    }
    else {
    }
}

window.ResizePDF = function () {
    var oParentWindow = window.parent;
    if (oParentWindow == null) return;

    var iWidth = oParentWindow.document.documentElement.clientWidth;
    var iHeight = oParentWindow.document.documentElement.clientHeight;
    if (iWidth == 0)
        iWidth = oParentWindow.document.documentElement.offsetWidth;
    if (iHeight == 0)
        iHeight = oParentWindow.document.documentElement.offsetHeight;

    var sectionToolbar = $$("sectionToolbar");
    if (sectionToolbar)
        iHeight -= sectionToolbar.clientHeight;

    var iToolbarHeight = 35;
    var oToolbar = $$($id() + "__tb");
    oToolbar.style.width = (iWidth - 10) + "px";
    oToolbar.style.height = iToolbarHeight + "px"
    var oIframe = $$($id() + "__if");
    oIframe.style.width = (iWidth - 10) + "px";
    oIframe.style.height = (iHeight - iToolbarHeight - 10) + "px";
    if ($$("hFitPageWidth").value == "true") {
        var oDivScroll = $("divScroll");
        var iCurrentWidth = oDivScroll.clientWidth;
        var iNewWidth = oIframe.clientWidth - 54;
        window.SetPDFZoom(window.GetPDFZoom() * iNewWidth / iCurrentWidth);
    }
}

window.SetPDFZoom = function (iNewZoom) {
    var iCurrentZoom = window.GetPDFZoom();
    var oDivPDF = $("divPDF");
    var oDivScroll = $("divScroll");

    if (iCurrentZoom > 0 && iNewZoom > 0) {
        oDivScroll.style.width = oDivScroll.clientWidth * iNewZoom / iCurrentZoom + "px";
        oDivScroll.style.height = oDivScroll.clientHeight * iNewZoom / iCurrentZoom + "px";
        if (oDivPDF.style.zoom == undefined) {
            if (oDivPDF.style.transform != undefined) {
                oDivPDF.style.transform = "scale(" + iNewZoom + ")";
                oDivPDF.style.transformOrigin = "0 0";
            } else if (oDivPDF.style.MozTransform != undefined) {
                oDivPDF.style.MozTransform = "scale(" + iNewZoom + ")";
                oDivPDF.style.MozTransformOrigin = "0 0";
            } else if (oDivPDF.style.WebkitTransform != undefined) {
                oDivPDF.style.WebkitTransform = "scale(" + iNewZoom + ")";
                oDivPDF.style.WebkitTransformOrigin = "0 0";
            } else if (oDivPDF.style.OTransform != undefined) {
                oDivPDF.style.OTransform = "scale(" + iNewZoom + ")";
                oDivPDF.style.OTransformOrigin = "0 0";
            } else if (oDivPDF.style.msTransform != undefined) {
                oDivPDF.style.msTransform = "scale(" + iNewZoom + ")";
                oDivPDF.style.msTransformOrigin = "0 0";
            } else { }
        } else {
            oDivPDF.style.zoom = iNewZoom;
        }
        $$("txtPDFZoom").value = Math.round(iNewZoom * 100);
    }

    if (AppRoot == undefined || !AppRoot.IsIE || AppRoot.BrowserVsn != 8)
        var x; // do nothing
    else {
        oDivScroll.style.width = window.DownLevelPageWidth + "px";
        oDivScroll.style.height = window.DownLevelPageHeight + "px";
    }
}

window.GetPDFZoom = function () {
    var oDivPDF = $("divPDF");
    if (oDivPDF.style.zoom == undefined) {
        var sScale = "";
        if (oDivPDF.style.transform != undefined) {
            sScale = oDivPDF.style.transform;
        } else if (oDivPDF.style.MozTransform != undefined) {
            sScale = oDivPDF.style.MozTransform;
        } else if (oDivPDF.style.WebkitTransform != undefined) {
            sScale = oDivPDF.style.WebkitTransform;
        } else if (oDivPDF.style.OTransform != undefined) {
            sScale = oDivPDF.style.OTransform;
        } else if (oDivPDF.style.msTransform != undefined) {
            sScale = oDivPDF.style.msTransform;
        } else { }
        return parseFloat(sScale.substring(6, sScale.length - 1));
    } else if (oDivPDF.style.zoom == "") {
        return 1;
    } else {
        return parseFloat(oDivPDF.style.zoom);
    }
}

window.SetPDFPage = function (iNewPage) {
    if (iNewPage != this._pageNum) {
        this._pageNum = iNewPage;
        $$("txtPDFPage").value = iNewPage + 1;
        $$("bttnPDFFirstPage").disabled = (this._pageNum == 0);
        $$("bttnPDFPrevPage").disabled = (this._pageNum == 0);
        $$("bttnPDFFirstPage").className = (this._pageNum == 0) ? "pdftoolbarbuttondisabled" : "pdftoolbarbutton";
        $$("bttnPDFPrevPage").className = (this._pageNum == 0) ? "pdftoolbarbuttondisabled" : "pdftoolbarbutton";
        $$("bttnPDFLastPage").disabled = (this._pageNum == this.numPages - 1);
        $$("bttnPDFNextPage").disabled = (this._pageNum == this.numPages - 1);
        $$("bttnPDFLastPage").className = (this._pageNum == this.numPages - 1) ? "pdftoolbarbuttondisabled" : "pdftoolbarbutton";
        $$("bttnPDFNextPage").className = (this._pageNum == this.numPages - 1) ? "pdftoolbarbuttondisabled" : "pdftoolbarbutton";
    }
}

window.numEvents = 0;

//Event Listener (Adobe JS - event object is created here)
window.DoPDFEvent = function (winEvent, sFunctionName) {
    if (winEvent) {
        window.numEvents++;
        if (window.numEvents == 1) {
            window.PdfDOM.event = new PDFEvent(winEvent);
            var oFunction = eval(sFunctionName);
            try { oFunction(); } catch (e) { }
            if (!window.PdfDOM.event.rc) { window.PdfDOM.event.value = ""; }
        }
        window.numEvents--;
    }
}

var PDFEvent = function (winEvent) {
    var _e = winEvent;
    var _t;
    if (_e.target) _t = _e.target;
    else if (_e.srcElement) _t = _e.srcElement;
    if (_t.nodeType == 3) _t = _t.parentNode; // defeat Safari bug
    var _f = window.getField(_t.name);

    this.windowTarget = _t;
    this.targetName = _t.name;
    this.target = _f;
    this.rc = true;
    var _getFieldValue = function () { return _f.value; }
    var _setFieldValue = function (newValue) { _f.value = newValue; }
    try { Object.defineProperty(this, "value", { get: _getFieldValue, set: _setFieldValue }); }
    catch (e) { } // Alternative 
}

var global = new function () {
    // this object is obsolete in Acrobat. Declaring this just in case some old PDFs are still calling this.
    this.setPersistent = function (cVariable, bPersist) { }
    this.subscribe = function () { }
}
/*
Adobe JS - app object (instance)
*/
var app = new function () {
    this.runtimeHighlight;
    this.runtimeHighlightColor;

    this.alert = function (obj) {
        var sMsg;
        var sTitle;
        var iType;
        var oDialogArgs = new Object();
        if (typeof obj == "string") {
            oDialogArgs["msg"] = obj;
            oDialogArgs["title"] = "PDF Alert";
            oDialogArgs["icon"] = 0;
            oDialogArgs["type"] = 0;
            oDialogArgs["oCheckbox"] = null;
            oDialogArgs["return"] = "";
        }
        else {
            oDialogArgs["msg"] = obj["cMsg"] || "";
            oDialogArgs["title"] = obj["cTitle"] || "PDF Alert";
            oDialogArgs["icon"] = obj["nIcon"] || 0;
            oDialogArgs["type"] = obj["nType"] || 0;
            oDialogArgs["oCheckbox"] = obj["oCheckbox"] || null;
            oDialogArgs["return"] = "";
        }

        if (window.showModalDialog) {
            window.showModalDialog("PDFViewerDialog.html", oDialogArgs, "dialogWidth:500px;dialogHeight:200px;resizable:no;status=no");
            return oDialogArgs["return"];
        } else {
            if (iType == 1) return confirm(oDialogArgs["msg"]) ? 1 : 2;
            else if (iType == 2 || iType == 3) return confirm(oDialogArgs["msg"]) ? 4 : 3;
            else {
                //This popup window method cannot support checkbox 
                oDialogArgs["oCheckbox"] = null;
                var oWin = window.open('PDFViewerDialog.html', '_blank', 'width=500px,height=200px,resizable=no,scrollbars=no,status=no', 'true');
                oWin.dialogArguments = oDialogArgs;
                oWin.focus();
                return 1;
            }
        }
    }
}

/*
Adobe JS - display object (instance)
*/
var display = new function () {
    this.visible = 0;
    this.hidden = 1;
    this.noPrint = 2;
    this.noView = 3;
}

/*
Adobe JS - display object (instance)
*/
var border = new function () {
    this.s = "solid";
    this.b = "beveled";
    this.d = "dashed";
    this.i = "inset";
    this.u = "underline";

    this.convertToCSS = function (s) {
        if (s == this.b) return "outset";
        if (s == this.u) return "none none solid none"
        return s;
    }
    this.convertToAcrobat = function (s) {
        if (s == "outset") return this.b;
        if (s.indexOf("none none solid") == 0) return this.u;
        return s;
    }
}

/*
Adobe JS - color object (instance)
*/
var color = new function () {
    this.transparent = ["T"];
    this.black = ["G", 0];
    this.white = ["G", 1];
    this.red = ["RGB", 1, 0, 0];
    this.green = ["RGB", 0, 1, 0];
    this.blue = ["RGB", 0, 0, 1];
    this.cyan = ["CMYK", 1, 0, 0, 0];
    this.magenta = ["CMYK", 0, 1, 0, 0];
    this.yellow = ["CMYK", 0, 0, 1, 0];
    this.dkGray = ["G", 0.25];
    this.gray = ["G", 0.5];
    this.ltGray = ["G", 0.75];

    // code from Adobe Acrobat
    this.convert = function (oColor, cColorspace) {
        var oOut = oColor;
        switch (cColorspace) {
            case "G":
                if (oColor[0] == "RGB") {
                    oOut = new Array("G", 0.3 * oColor[1] + 0.59 * oColor[2] + 0.11 * oColor[3]);
                } else if (oColor[0] == "CMYK") {
                    oOut = new Array("G", 1 - Math.min(1, 0.3 * oColor[1] + 0.59 * oColor[2] + 0.11 * oColor[3] + oColor[4]));
                }
                break;
            case "RGB":
                if (oColor[0] == "G") {
                    oOut = new Array("RGB", oColor[1], oColor[1], oColor[1]);
                } else if (oColor[0] == "CMYK") {
                    oOut = new Array("RGB", 1 - Math.min(1, oColor[1] + oColor[4]), 1 - Math.min(1, oColor[2] + oColor[4]), 1 - Math.min(1, oColor[3] + oColor[4]));
                }
                break;
            case "CMYK":
                if (oColor[0] == "G") {
                    oOut = new Array("CMYK", 0, 0, 0, 1 - oColor[1]);
                } else if (oColor[0] == "RGB") {
                    oOut = new Array("CMYK", 1 - oColor[1], 1 - oColor[2], 1 - oColor[3], 0);
                }
                break;
            default: ;
        }
        return oOut;
    }

    // code from Adobe Acrobat
    this.equal = function (c1, c2) {
        if (c1[0] == "G") {
            c1 = color.convert(c1, c2[0]);
        } else {
            c2 = color.convert(c2, c1[0]);
        }
        if (c1[0] != c2[0]) {
            return false;
        }
        var nComponents = 0;
        switch (c1[0]) {
            case "G":
                nComponents = 1;
                break;
            case "RGB":
                nComponents = 3;
                break;
            case "CMYK":
                nComponents = 4;
                break;
            default: ;
        }
        for (var i = 1; i <= nComponents; i++) {
            if (c1[i] != c2[i]) {
                return false;
            }
        }
        return true;
    }

    // from Acrobat Color array to HTML Hex
    this.convertToHex = function (colorArray) {
        if (colorArray[0] == "T") return "transparent"
        colorArray = color.convert(colorArray, "RGB");
        // RGB in Acrobat is using numbers from 0 to 1
        if (parseInt(colorArray[1]) > 1) colorArray[1] = "0";
        if (parseInt(colorArray[2]) > 1) colorArray[2] = "0";
        if (parseInt(colorArray[3]) > 1) colorArray[3] = "0";
        // need to multiple the number by 255 to convert back to the standard.
        var sR = parseInt(colorArray[1] * 255, 10).toString(16).toUpperCase();
        var sG = parseInt(colorArray[2] * 255, 10).toString(16).toUpperCase();
        var sB = parseInt(colorArray[3] * 255, 10).toString(16).toUpperCase();
        if (sR.length == 1) sR = "0" + sR;
        if (sG.length == 1) sG = "0" + sG;
        if (sB.length == 1) sB = "0" + sB;
        return "#" + sR + sG + sB;
    }

    // from HTML color to Acrobat color array
    this.convertToAcrobat = function (obj) {
        return obj;
    }
}

/*
Adobe JS - field object
*/
var field = function (sFieldName) {
    var _sFieldName = sFieldName;
    var _bWidget = false;
    var _oControl = null;
    var _aControls = null;
    if (_sFieldName.match(/\.\d*(\d)$/) == null) {
        // By Name (get field, i.e. first widget
        _aControls = window.document.getElementsByName(_sFieldName);
        _oControl = _aControls[0];
    } else {
        // By ID (get widget)
        _oControl = $(_sFieldName);
        _aControls = window.document.getElementsByName(_oControl.name);
        _bWidget = true;
    }

    var _getBorderStyle = function () { return border.convertToAcrobat(_oControl.style.borderStyle); }
    var _setBorderStyle = function (newValue) {
        if (_bWidget) { _oControl.style.borderStyle = border.convertToCSS(newValue); }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].style.borderStyle = border.convertToCSS(newValue);
            }
        }
    }
    try {
        Object.defineProperty(this, "borderStyle", { get: _getBorderStyle, set: _setBorderStyle });
    } catch (e) {
        //Alternative
    }

    var _getDisplay = function () {
        if (_oControl.type == "checkbox") {
            var oLabel = _oControl.parentElement;
            var oSpan = _oControl.nextSibling;
            if (oLabel.style.visibility == "hidden" || oSpan.style.visibility == "hidden")
                return display.hidden;
            else
                return display.visible;
        } else {
            if (_oControl.style.visibility == "hidden")
                return display.hidden;
            else
                return display.visible;
        }
    }
    var _setDisplay = function (newValue) {
        if (_bWidget) {
            switch (newValue) {
                case display.visible:
                    if (_oControl.type == "checkbox") {
                        var oLabel = _oControl.parentElement;
                        oLabel.style.visibility = "visible";
                        var oSpan = _oControl.nextSibling;
                        oSpan.style.visibility = "visible";
                    } else {
                        _oControl.style.visibility = "visible";
                    }
                    break;
                case display.hidden:
                    if (_oControl.type == "checkbox") {
                        var oLabel = _oControl.parentElement;
                        oLabel.style.visibility = "hidden";
                        var oSpan = _oControl.nextSibling;
                        oSpan.style.visibility = "hidden";
                    } else {
                        _oControl.style.visibility = "hidden";
                    }
                    break;
                case display.noPrint: //Do Not Support
                case display.noView: //Do Not Support
            }
        }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                switch (newValue) {
                    case display.visible:
                        if (_aControls[i].type == "checkbox") {
                            var oLabel = _aControls[i].parentElement;
                            oLabel.style.visibility = "visible";
                            var oSpan = _aControls[i].nextSibling;
                            oSpan.style.visibility = "visible";
                        } else {
                            _aControls[i].style.visibility = "visible";
                        }
                        break;
                    case display.hidden:
                        if (_aControls[i].type == "checkbox") {
                            var oLabel = _aControls[i].parentElement;
                            oLabel.style.visibility = "hidden";
                            var oSpan = _aControls[i].nextSibling;
                            oSpan.style.visibility = "hidden";
                        } else {
                            _aControls[i].style.visibility = "hidden";
                        }
                        break;
                    case display.noPrint: //Do Not Support
                    case display.noView: //Do Not Support
                }
            }
        }
    }
    try {
        Object.defineProperty(this, "display", { get: _getDisplay, set: _setDisplay });
    } catch (e) {
        // Alternative
    }

    var _getDoc = function () { return this; }
    try {
        Object.defineProperty(this, "doc", { get: _getDoc });
    } catch (e) {
        // Alternative
    }

    var _getFillColor = function () { return color.convertToAcrobat(_oControl.style.backgroundColor); }
    var _setFillColor = function (newValue) {
        if (_bWidget) { _oControl.style.backgroundColor = color.convertToHex(newValue); }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].style.backgroundColor = color.convertToHex(newValue);
            }
        }
    }
    try {
        Object.defineProperty(this, "fillColor", { get: _getFillColor, set: _setFillColor });
    } catch (e) {
        // Alternative
    }

    var _getHidden = function () { return (this.display == display.hidden); }
    var _setHidden = function (newValue) {
        if (newValue) { this.display = display.hidden; }
        else { this.display = display.visible; }
    }
    try {
        Object.defineProperty(this, "hidden", { get: _getHidden, set: _setHidden });
    } catch (e) {
        // Alternative
    }

    var _getLineWidth = function () { return _oControl.style.borderWidth; }
    var _setLineWidth = function (newValue) {
        if (_bWidget) { _oControl.style.borderWidth = newValue + "px"; }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].style.borderWidth = newValue + "px";
            }
        }
    }
    try {
        Object.defineProperty(this, "lineWidth", { get: _getLineWidth, set: _setLineWidth });
    } catch (e) {
        // Alternative
    }

    var _getName = function () { return _sFieldName; }
    try {
        Object.defineProperty(this, "name", { get: _getName });
    } catch (e) {
        // Alternative
    }

    var _getPage = function () {
        if (_bWidget) {
            var oElement = _oControl.parentElement;
            while (oElement != null) {
                if (oElement.tagName == "DIV" && oElement.id.indexOf("divPage_") == 0) {
                    return parseInt(oElement.id.substr(8)) - 1;
                } else {
                    oElement = oElement.parentElement;
                }
            }
            return null;
        }
        else {
            var oPages = new Array();
            for (var i = 0; i < _aControls.length; i++) {
                var oElement = _aControls[i].parentElement;
                while (oElement != null) {
                    if (oElement.tagName == "DIV" && oElement.id.indexOf("divPage_") == 0) {
                        oPages[oPages.length] = parseInt(oElement.id.substr(8)) - 1;
                        break;
                    } else {
                        oElement = oElement.parentElement;
                    }
                }

            }
            if (oPages.length == 0) return null;
            else if (oPages.length == 1) return oPages[0];
            else return oPages;
        }
    }
    try {
        Object.defineProperty(this, "page", { get: _getPage });
    } catch (e) {
        // Alternative
    }

    var _getReadonly = function () { return _oControl.disabled; }
    var _setReadonly = function (newValue) {
        if (_bWidget) { _oControl.disabled = newValue; }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].disabled = newValue;
            }
        }
    }
    try {
        Object.defineProperty(this, "readonly", { get: _getReadonly, set: _setReadonly });
    } catch (e) {
        // Alternative
    }

    var _getStrokeColor = function () { return color.convertToAcrobat(_oControl.style.borderColor); }
    var _setStrokeColor = function (newValue) {
        if (_bWidget) { _oControl.style.borderColor = color.convertToHex(newValue); }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].style.borderColor = color.convertToHex(newValue);
            }
        }
    }
    try {
        Object.defineProperty(this, "strokeColor", { get: _getStrokeColor, set: _setStrokeColor });
    } catch (e) {
        // Alternative
    }

    var _getTextColor = function () { return color.convertToAcrobat(_oControl.style.color); }
    var _setTextColor = function (newValue) {
        if (_bWidget) { _oControl.style.color = color.convertToHex(newValue); }
        else {
            for (var i = 0; i < _aControls.length; i++) {
                _aControls[i].style.color = color.convertToHex(newValue);
            }
        }
    }
    try {
        Object.defineProperty(this, "textColor", { get: _getTextColor, set: _setTextColor });
    } catch (e) {
        // Alternative
    }

    var _getType = function () {
        switch (_oControl.type) {
            case "button":
            case "submit":
            case "reset":
                return "button";
            case "checkbox":
                return "checkbox";
            case "select-one":
                if (_oControl.size > 0) return "listbox";
                else return "combobox";
            case "select-multiple":
                return "listbox";
            case "radio":
                //return "radiobutton";
                return "checkbox"; // Since TallComponents always set a group of checkboxes as radio buttons
            case "text":
            case "textarea":
                return "text";
                //case "": return "signature"; //Do Not Support
            default: return undefined;
        }
    }
    try {
        Object.defineProperty(this, "type", { get: _getType });
    } catch (e) {
        // Alternative 
    }

    var _getUserName = function () { return _oControl.title; }
    var _setUserName = function (newValue) {
        for (var i = 0; i < _aControls.length; i++) {
            _aControls[i].title = newValue;
        }
    }
    try {
        Object.defineProperty(this, "userName", { get: _getUserName, set: _setUserName });
    } catch (e) {
        // Alternative
    }

    var _getValue = function () {
        var returnValue;
        if (_oControl.type == "checkbox") {
            returnValue = "Off";
            for (var i = 0; i < _aControls.length; i++)
                if (_aControls[i].checked) returnValue = _aControls[i].value;
        }
        else
            returnValue = _oControl.value;
        if (returnValue == "true") return true;
        else if (returnValue == "false") return false;
        else if (returnValue.match(/^\d+$/) != null) return parseInt(returnValue);
        else if (returnValue.match(/^\d+\.\d+$/) != null) return parseFloat(returnValue);
        else return returnValue;
    }
    var _setValue = function (newValue) {
        var bCheck;
        if (_oControl.type == "checkbox") {
            for (var i = 0; i < _aControls.length; i++) {
                bCheck = (_aControls[i].value == newValue);
                _aControls[i].checked = bCheck;
                _aControls[i].nextSibling.innerHTML = bCheck ? "X" : "";
            }
        }
        else {
            _oControl.value = newValue;
        }
    }
    try {
        Object.defineProperty(this, "value", { get: _getValue, set: _setValue });
    } catch (e) {
        // Alternative
    }

    var _getValueAsString = function () {
        try {
            var returnValue;
            if (_oControl.type == "checkbox") {
                returnValue = "Off";
                for (var i = 0; i < _aControls.length; i++)
                    if (_aControls[i].checked) returnValue = _aControls[i].value;
            }
            else
                returnValue = _oControl.value;
            return returnValue;
        }
        catch (e) {
            return '';
        }
    }
    try {
        Object.defineProperty(this, "valueAsString", { get: _getValueAsString });
    } catch (e) {
        // Alternative
    }

    var _getNoExport = function () {
        try {
            var returnValue;
            if (_oControl.type == "checkbox") {
                for (var i = 0; i < _aControls.length; i++) {
                    returnValue = _aControls[i].getAttribute("data-noexport") || "";
                    if (returnValue == "true") return true;
                }
            }
            else {
                returnValue = _oControl.getAttribute("data-noexport") || "";
                if (returnValue == "true") return true;
            }
        }
        catch (e) { }
        return false;
    }
    var _setNoExport = function (newValue) {
        // Not support, Do nothing  
    }
    try {
        Object.defineProperty(this, "noExport", { get: _getNoExport, set: _setNoExport });
    } catch (e) {
        // Alternative
    }

    // properties for Text or Textarea ONLY
    if (_oControl.type == "text" || _oControl.type == "textarea") {
        var _getAlignment = function () { return _oControl.style.textAlign; }
        var _setAlignment = function (newValue) {
            if (_bWidget) { _oControl.style.textAlign = newValue; }
            else {
                for (var i = 0; i < _aControls.length; i++) {
                    _aControls[i].style.textAlign = newValue;
                }
            }
        }
        try {
            Object.defineProperty(this, "alignment", { get: _getAlignment, set: _setAlignment });
        } catch (e) {
            //Work around
        }

        var _getCharLimit = function () {
            if (_oControl.type == "text") { return _oControl.maxLength; }
            else { } //Do Not Support
        }
        var _setCharLimit = function (newValue) {
            if (_bWidget) {
                if (_oControl.type == "text") {
                    if (newValue == 0) { _oControl.removeAttribute("maxLength"); }
                    else { _oControl.maxLength = newValue; }
                } else { } //Do Not Support
            }
            else {
                for (var i = 0; i < _aControls.length; i++) {
                    if (_oControl.type == "text") {
                        if (newValue == 0) { _aControls[i].removeAttribute("maxLength"); }
                        else { _aControls[i].maxLength = newValue; }
                    } else { } //Do Not Support
                }
            }
        }
        try {
            Object.defineProperty(this, "charLimit", { get: _getCharLimit, set: _setCharLimit });
        } catch (e) {
            //Alternative
        }

        var _getDoNotScroll = function () { return (_oControl.style.overflow == "hidden"); }
        var _setDoNotScroll = function (newValue) {
            if (_bWidget) {
                if (newValue) { _oControl.style.overflow = "hidden" }
                else { _oControl.style.overflow = "visible" }
            }
            else {
                for (var i = 0; i < _aControls.length; i++) {
                    if (newValue) { _aControls[i].style.overflow = "hidden" }
                    else { _aControls[i].style.overflow = "visible" }
                }
            }

        }
        try {
            Object.defineProperty(this, "doNotScroll", { get: _getDoNotScroll, set: _setDoNotScroll });
        } catch (e) {
            //Alternative
        }
    }

    // properties for Dropdown and Listbox ONLY
    if (_oControl.type == "select-one" || _oControl.type == "select-multiple") {
        var _getCurrentValueIndices = function () { return _oControl.selectedIndex; }
        var _setCurrentValueIndices = function (newValue) {
            if (_bWidget) { _oControl.selectedIndex = newValue; }
            else {
                for (var i = 0; i < _aControls.length; i++) {
                    _aControls[i].selectedIndex = newValue;
                }
            }
        }
        try {
            Object.defineProperty(this, "currentValueIndices", { get: _getCurrentValueIndices, set: _setCurrentValueIndices });
        } catch (e) {
            //Alternative
        }
    }

    // properties for All EXCEPT button
    if (_oControl.type != "button") {
        var _getDefaultValue = function () {
            if (_oControl.type == "text" || _oControl.type == "textarea") {
                return _oControl.defaultValue;
            } else { return ""; } //Do Nothing - standard Javascript does not support default value for these fields
        }
        var _setDefaultValue = function (newValue) {
            if (_oControl.type == "text" || _oControl.type == "textarea") {
                if (_bWidget) { _oControl.defaultValue = newValue; }
                else {
                    for (var i = 0; i < _aControls.length; i++) {
                        _aControls[i].defaultValue = newValue;
                    }
                }
            }
            else { } //Do Nothing - standard Javascript does not support default value for these fields
        }
        try {
            Object.defineProperty(this, "defaultValue", { get: _getDefaultValue, set: _setDefaultValue });
        } catch (e) {
            //Alternative
        }
    }

    // properties for Checkbox and Radio buttons ONLY
    if (_oControl.type == "checkbox" || _oControl.type == "radio") {
        var _getExportValues = function () {
            var oExportValues = new Array();
            for (var i = 0; i < _aControls.length; i++) {
                oExportValues[oExportValues.length] = _aControls[i].value;
            }
            return oExportValues;
        }
        var _setExportValues = function (newValue) {
            for (var i = 0; i < newValue.length; i++) {
                if (i > _aControls.length - 1) break;
                _aControls[i].value = newValue[i];
            }
        }
        try {
            Object.defineProperty(this, "exportValues", { get: _getExportValues, set: _setExportValues });
        } catch (e) {
            // Alternative
        }
    }

    // properties for Dropdown, Listbox, Checkbox, and Radiobox ONLY
    if (_oControl.type == "select-one" || _oControl.type == "select-multiple" || _oControl.type == "checkbox" || _oControl.type == "radio") {
        var _getNumItems = function () {
            if (_oControl.type == "select-one" || _oControl.type == "select-multiple") {
                return _oControl.options.length;
            } else if (_oControl.type == "checkbox" || _oControl.type == "radio") {
                return this.exportValues.length;
            } else { return null }
        }
        try {
            Object.defineProperty(this, "numItems", { get: _getNumItems });
        } catch (e) {
            // Alternative
        }
    }

    var oLastFocusControl;
    this.setFocus = function () {
        var oGoto = _oControl;
        if (this.type == "checkbox") oGoto = oGoto.nextSibling;
        oGoto.focus();
        oGoto.style.zIndex = "999";
        try {
            oLastFocusControl.style.zIndex = "-1";
        } catch (e) { }
        oLastFocusControl = oGoto;
        var oDivPDF = $("divPDF");
        var iPageYOffset = Math.round((oGoto.offsetTop + oGoto.offsetParent.offsetTop) / oDivPDF.offsetHeight * window.document.body.offsetHeight);
        if (iPageYOffset < window.pageYOffset || iPageYOffset > (window.pageYOffset + window.innerHeight)) {
            window.scrollTo(0, iPageYOffset);
        }
    }

    // functions for Button ONLY
    if (_oControl.type == "button") {
        this.buttonGetCaption = function (nFace) {
            //ignore nFace
            return this.value;
        }

        this.buttonSetCaption = function (cCaption, nFace) {
            _oControl.value = cCaption;
            this.value = cCaption;
        }
    }

    // functions for Checkbox ONLY
    if (_oControl.type == "checkbox") {
        this.checkThisBox = function (nWidget, bCheckIt) {
            bCheckIt = bCheckIt == undefined ? true : bCheckIt;
            _oControl.checked = bCheckIt;
            _oControl.nextSibling.innerHTML = bCheckIt ? "X" : "";
        }

        this.defaultIsChecked = function (nWidget, bIsDefaultChecked) {

            bIsDefaultChecked = bIsDefaultChecked == undefined ? true : bIsDefaultChecked;
            _oControl.defaultChecked = bIsDefaultChecked;
        }

        this.isBoxChecked = function () {
            return _oControl.checked;
        }

        this.isDefaultChecked = function () {
            return _oControl.defaultChecked;
        }
    }

    // functions for Dropdown and Listbox ONLY
    if (_oControl.type == "select-one" || _oControl.type == "select-multiple") {
        this.clearItems = function () {
            for (var i = _oControl.length; i > 0; i--) {
                _oControl.remove(0);
            }
        }

        this.deleteItemAt = function (nIdx) {
            _oControl.remove(nIdx);
        }

        this.getItemAt = function (nIdx, bExportValue) {
            bExportValue = bExportValue == undefined ? true : bExportValue;
            if (bExportValue) {
                return _oControl.options(nIdx).value;
            } else {
                return _oControl.options(nIdx).text;
            }
        }

        this.insertItemAt = function (cName, cExport, nIdx) {
            cExport = cExport == undefined ? cName : cExport;
            nIdx = nIdx == undefined ? 0 : nIdx;

            var oOption = document.createElement("option");
            oOption.text = cName;
            oOption.value = cExport;
            if (nIdx == -1) {
                _oControl.add(oOption, _oControl.options(null));
            } else {
                _oControl.add(oOption, _oControl.options(nIdx));
            }
        }

        this.setItems = function (oArray) {
            for (var i = 0; i < oArray.length; i++) {
                if (oArray[i] instanceof Array) {
                    this.insertItemAt(oArray[i][0], oArray[i][1], -1);
                } else {
                    this.insertItemAt(oArray[i], oArray[i], -1);
                }
            }
        }
    }

    // Properties that are not supported
    this.buttonAlignX = undefined;
    this.buttonAlignY = undefined;
    this.buttonFitBounds = undefined;
    this.buttonPosition = undefined;
    this.buttonScaleHow = undefined;
    this.buttonScaleWhen = undefined;
    this.calcOrderIndex = undefined;
    this.comb = undefined;
    this.commitOnSelChange = undefined;
    this.defaultStyle = undefined; // Rich text not supported
    this.doNotSpellCheck = undefined;
    this.delay = undefined;
    this.editable = undefined;
    this.fileSelect = undefined;
    this.highlight = undefined;
    this.multiline = undefined;
    this.multipleSelection = undefined;
    this.password = undefined;
    this.print = undefined;
    this.radiosInUnison = undefined;
    this.rect = undefined;
    this.required = undefined;
    this.richText = undefined;
    this.richValue = undefined;
    this.rotation = undefined;
    this.style = undefined;
    this.submitName = undefined;
    this.textFont = undefined; //this is set at page rendering
    this.textSize = undefined; //this is set at page rendering

    // Functions that are not supported
    this.browseForFileToSubmit = function () { }
    this.buttonGetIcon = function (nFace) { }
    this.buttonImportIcon = function (cPath, nPage) { }
    this.buttonSetIcon = function (oIcon, nFace) { }
    this.getArray = function () { }
    this.getLock = function () { }
    this.setAction = function (cTrigger, cScript) { }
    this.setLock = function () { }
    this.signatureGetModifications = function () { }
    this.signatureGetSeedValue = function () { }
    this.signatureInfo = function () { }
    this.signatureSetSeedValue = function () { }
    this.signatureSign = function () { }
    this.signatureValidate = function () { }
}

/*
Adobe JS - doc object ("this" in PDF)
*/
var _getNumFields = function () { return this._fields.length; }
try {
    Object.defineProperty(this, "numFields", { get: _getNumFields });
} catch (e) {
    //Alternative
}

var _getNumPages = function () { return this._numPages; }
try {
    Object.defineProperty(this, "numPages", { get: _getNumPages });
} catch (e) {
    //Alternative
}

var _getPageNum = function () { return this._pageNum; }
var _setPageNum = function (newValue) {
    if (newValue >= 0 && newValue < this._numPages) {
        window.SetPDFPage(newValue);
        var oDivPage = $("divPage_" + (newValue + 1));
        var oDivPDF = $("divPDF");
        var iPageYOffset = Math.round(oDivPage.offsetTop / oDivPDF.offsetHeight * window.document.body.offsetHeight);
        window.scrollTo(0, iPageYOffset);
    }
}
try {
    Object.defineProperty(this, "pageNum", { get: _getPageNum, set: _setPageNum });
} catch (e) {
    //Alternative
}

this.nocache = true; //Do Nothing

this.calculateNow = function () { return; } //Do Nothing

this.getField = function (sFieldName) {
    try { return new field(sFieldName); }
    catch (e) { return null; }
}

this.getNthFieldName = function (index) { return this._fields[index]; }

this.removeScript = function (cName) { } //Do Nothing

this.submitForm = function (obj) {
    var sURL = "";
    var sMethod = "POST";
    var sSubmitAs = "HTML" // ignore SubmitAs parameter, we always want to submit page as HTML here.
    var bEmpty = false; // If true, submit all fields, including those that have no value. If false (the default), exclude fields that currently have no value.
    var bGet = false;
    if (typeof obj == "string") {
        sURL = obj;
    }
    else {
        sURL = obj["cURL"] || "";
        bEmpty = obj["bEmpty"] || false;
        bGet = obj["bGet"] || false;
        sSubmitAs = obj["cSubmitAs"] || "HTML";
    }
    if (bGet) {
        window.document.forms[0].method = "GET";
    }

    if (sURL.indexOf("../") == 0) {
        sURL = sURL.substr(3);
    }

    try {
        if (sSubmitAs.toLowerCase() == "xfdf") {
            var sRequestText = '<?xml version="1.0" encoding="UTF-8"?>';
            sRequestText += '<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">';
            sRequestText += '<f href="';
            var queryString = window.parent.location.search;
            if (queryString.length > 1) {
                var parameters = queryString.substr(1).split("&");
                for (var i = 0; i < parameters.length; i++) {
                    var para = decodeURIComponent(parameters[i]);
                    if (para.indexOf("actualUrl=") == 0) {
                        sRequestText += escape(para.substr(10));
                        break;
                    }
                }
            }
            sRequestText += '"/>';
            sRequestText += "<fields>";

            for (var i = 0; i < this._fields.length; i++) {
                var f = this.getField(_fields[i]);
                if (f.type != "button" && !f.noExport) {
                    if (bEmpty || f.valueAsString != "") {
                        if (f.type == "text" || f.valueAsString != "Off") {
                            sRequestText += '<field name="' + _fields[i] + '"';
                            if (f.valueAsString == '') {
                                sRequestText += '/>';
                            } else {
                                sRequestText += '><value>' + f.valueAsString + '</value></field>';
                            }

                        }
                    }
                }
            }
            sRequestText += "</fields>";
            sRequestText += "</xfdf>";

            var sCurrentUrl = window.parent.location.href.replace(window.parent.location.search, "");
            var doc = window.parent.document;
            var oForm = doc.createElement("form");
            oForm.method = "POST";
            oForm.action = sCurrentUrl + "?submitAs=xfdf";

            var oField = doc.createElement("textarea");
            oField.name = "method"
            oField.value = encodeURIComponent(sMethod);
            oForm.appendChild(oField);

            oField = doc.createElement("textarea");
            oField.name = "url"
            oField.value = encodeURIComponent(sURL);
            oForm.appendChild(oField);

            oField = doc.createElement("textarea");
            oField.name = "xfdf"
            oField.value = encodeURIComponent(sRequestText);
            oForm.appendChild(oField);

            doc.body.appendChild(oForm);
            oForm.submit();
        } else {
            var doc = window.parent.document;
            var oForm = doc.createElement("form");
            oForm.method = sMethod;
            oForm.action = sURL;
            for (var i = 0; i < this._fields.length; i++) {
                var f = this.getField(_fields[i]);
                if (f.type != "button" && !f.noExport) {
                    if (bEmpty || f.valueAsString != "") {
                        if (f.type == "text" || f.valueAsString != "Off") {
                            var oField = doc.createElement("textarea");
                            oField.name = _fields[i];
                            oField.value = f.valueAsString;
                            oForm.appendChild(oField);
                        }
                    }
                }
            }
            doc.body.appendChild(oForm);
            oForm.submit();
        }
    } catch (e) {
        alert(e);
    }
}

/*
Adobe JS - other build-in functions
*/
function AFNumber_Format(nDec, sepStyle, negStyle, currStyle, strCurrency, bCurrencyPrepend) {
    var iValue = parseFloat(event.value);
    if (isNaN(iValue)) {
        event.value = "";
        app.alert("It must be a numeric value.");
        return;
    }

    if (bCurrencyPrepend) {
        if (iValue < 0) {
            event.value = '-' + strCurrency + Math.abs(iValue.toFixed(nDec));
        } else {
            event.value = strCurrency + iValue.toFixed(nDec);
        }
    } else {
        event.value = iValue.toFixed(nDec) + strCurrency;
    }
}

function AFNumber_Keystroke(nDec, sepStyle, negStyle, currStyle, strCurrency, bCurrencyPrepend) {
    return; // Do Nothing
}

function AFPercent_Format(nDec, sepStyle, bPercentPrepend) {
    var iValue = parseFloat(event.value);
    if (isNaN(iValue)) {
        event.value = "";
        app.alert("It must be a numeric value.");
        return;
    }

    var iValue = iValue * 100;
    if (bPercentPrepend) {
        event.value = "%" + iValue.toFixed(nDec);
    } else {
        event.value = iValue.toFixed(nDec) + "%";
    }
}

function AFPercent_Keystroke(nDec, sepStyle) {
    return; // Do Nothing
}

function AFTime_Format(ptf) {
    var sValue = event.value.toString();
    if (sValue.length == 0) { event.value = ""; }

    var oDate = new Date("1/1/1900 " + sValue);
    if (oDate == "Invalid Date") {
        event.value = "";
        app.alert("Invalid Time Entry. (Ex. 12:30 AM)");
    } else {
        var sTime;
        var sMin = "" + oDate.getMinutes();
        if (sMin.length == 1) sMin = "0" + sMin;
        if (oDate.getHours() > 12) {
            sTime = (oDate.getHours() - 12) + ":" + sMin + " PM";
        } else if (oDate.getHours() == 12) {
            sTime = "12:" + sMin + " PM";
        } else if (oDate.getHours() == 0) {
            sTime = "12:" + sMin + " AM";
        } else {
            sTime = oDate.getHours() + ":" + sMin + " AM";
        }
        event.value = sTime;
    }
}

function AFTime_Keystroke(ptf) {
    return; // Do Nothing
}

function AFDate_FormatEx(cFormat) {
    var sValue = event.value.toString();
    if (cFormat == 'mm/dd/yyyy') {
        if (sValue.length == 0) { event.value = ""; }

        var sDay, sMonth, sYear;
        if (sValue.match(/^\d{6}(\d{2})?$/g) != null) {
            sMonth = sValue.substring(0, 2) - 1;
            sDay = sValue.substring(2, 4);
            sYear = sValue.substring(4);
        } else if (sValue.match(/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2}(\d{2})?$/g)) {
            var ar = sValue.split(/[-\/\.]/g);
            sMonth = ar[0] - 1; sDay = ar[1]; sYear = ar[2];
        } else {
            sDay = ""; sMonth = ""; sYear = "";
        }

        var oDate = new Date(sYear, sMonth, sDay);
        if (oDate == "Invalid Date") {
            event.value = "";
            app.alert("Invalid Date Entry. Must be in the format 'mm/dd/yyyy'");
            return false;
        } else if (oDate.getDate() != sDay || oDate.getMonth() != sMonth || oDate.getFullYear() != sYear) {
            event.value = "";
            app.alert("Invalid Date Entry. Must be in the format 'mm/dd/yyyy'");
            return false;
        } else {
            event.value = (oDate.getMonth() + 1) + "/" + oDate.getDate() + "/" + oDate.getFullYear();
            return true;
        }
    } else if (cFormat == 'yyyy') {
        if (sValue.length == 4 && sValue.match(/^\d{4}?$/g)) {
            return true;
        } else {
            event.value = "";
            app.alert("Invalid Date Entry. Must be in the format 'yyyy'");
            return false;
        }
    }
}

function AFDate_KeystrokeEx(cFormat) {
    return; // Do Nothing
}

function AFSpecial_Format(psf) {
    var sValue = event.value.toString();
    if (sValue.length == 0) { event.value = ""; }

    switch (psf) {
        case 0:
            if (sValue.match(/^\d{5}$/g) == null) {
                event.value = "";
                app.alert("Invalid Zip Code. (Ex: 12345)");
            }
            break;
        case 1:
            var sZipCode = sValue.replace(/[\s-]/g, "");
            if (sZipCode.match(/^\d{9}$/g) == null) {
                event.value = "";
                app.alert("Invalid Zip Code. (Ex: 12345-6789)");
            } else {
                event.value = sZipCode.substring(0, 5) + "-" + sZipCode.substring(5);
            }
            break;
        case 2:
            var sPhone = sValue.replace(/[\s\(\)x-]/g, "");
            if (sPhone.match(/^\d{7,14}$/g) == null) {
                event.value = "";
                app.alert("Invalid Phone Number. (format: (888)111-2222x9999)");
            } else {
                var s = "";
                if (sPhone.length < 10) {
                    for (var i = 0; i < sPhone.length; i++) {
                        if (i == 3) s += "-";
                        if (i == 7) s += "x";
                        s += sPhone.charAt(i);
                    }
                } else {
                    for (var i = 0; i < sPhone.length; i++) {
                        if (i == 0) s += "(";
                        if (i == 3) s += ")";
                        if (i == 6) s += "-";
                        if (i == 10) s += "x";
                        s += sPhone.charAt(i);
                    }
                }
                event.value = s;
            }
            break;
        case 3:
            var sSSN = sValue.replace(/[\s-]/g, "");
            if (sSSN.match(/^\d{9}$/g) == null) {
                event.value = "";
                app.alert("Invalid Social Security Number. (Ex: 111-22-3333)");
            } else {
                event.value = sSSN.substring(0, 3) + "-" + sSSN.substring(3, 5) + "-" + sSSN.substring(5);
            }
            break;
        default: ;
    }
}

function AFSpecial_Keystroke(nDec, sepStyle) {
    return; // Do Nothing
}

window.fnCheckMaxLength = function (iCharLimit) {
    var oControl = window.event.target || window.event.srcElement;
    setTimeout(function () {
        iCharLimit = iCharLimit || 0;
        var str = oControl.value.toString();
        if (iCharLimit > 0 && str.length > iCharLimit) {
            oControl.value = oControl.value.substring(0, iCharLimit);
        }
    }, 0);
}
