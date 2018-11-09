epx = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
frmLocation = location;

//Next (2) functions cause a description field to be cleared 
//as soon as a code field is cleared
function linkCodeDesc(sCodeField, sDescField)
{
	try	//We try catch because sometimes fields are not available
	{
		var oCode = document.getElementById(sCodeField);
		oCode.RelatedDescriptionField = document.getElementById(sDescField);
		oCode.onchange = clearRelatedValue; 
	}
	catch(ex) {}
}

function clearRelatedValue()
{
	this.RelatedDescriptionField.value = "";
}

//Standard zoom
var oZoomFrame;
var sZoomPopupHeaderTitle;
var sZoomControlID;
var iZoomMaxLength;
var iZoomListBoxBehavior; //1 - selected items only, 2 - all items, otherwise not a listbox
function zoomValue(sPopupHeaderTitle, sControlID, iMaxLength, bEditable, iListBoxBehavior)
{
	//ADAPTED FROM MTrE
	//If not specified, determine if user can edit value or not
	//based on whether or not control is enabled -- if the control 
	//doesn't have a disabled property it's not an input in the first
	//place
	var oFrame = window;
	var oControl = oFrame.document.getElementById(sControlID);
    var sControlProperty = 'value';
	if( arguments.length < 4 )
	{
		if( oControl.tagName.toUpperCase() == "DIV" || 
			oControl.tagName.toUpperCase() == "SPAN" || 
			oControl.tagName.toUpperCase() == "TD") 
		{
			bEditable = false;
            sControlProperty = 'innerText'
		}
		else
		{
			try{ bEditable = !oControl.disabled; }
			catch(e){ bEditable = false; }
			
			if( bEditable )
			{
				try{ bEditable = !oControl.readOnly; }
				catch(e){} //Error ignored since we don't have a read only control
			}
		}
	}
	
	//If max length not specified OR text not editable, set to 0.
	if( bEditable )
	{
		if( arguments.length < 3 )
		{
			try{ iMaxLength = oControl.maxLength ? oControl.maxLength : 0; }
			catch(e){ iMaxLength = 0; }
		}
	}
	else
	{
		iMaxLength = 0;
	}

	//Preserve input arguments in variables scoped for access by all
	//(particularly the zoom popup), except for bEditable which is 
	//passed in the URL
	oZoomFrame = oFrame;
	sZoomPopupHeaderTitle = sPopupHeaderTitle;
	sZoomControlID = sControlID;
	iZoomMaxLength = iMaxLength;
	iZoomListBoxBehavior = iListBoxBehavior;
	//Open the zoom popup
    AppRoot.OpenFramePopup(AppRoot.AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Top(), 
        'PopupZoom.aspx', 'IsEditable=' + bEditable.toString() + '&MaxLength=' + iMaxLength.toString(),
        'GetData?ControlFrame=' + window.AppFrameId + '&ControlID=' + sControlID + '&ControlProperty=' + sControlProperty + 
            '&Title=' + sPopupHeaderTitle.replace(/'/g, '\\\''), 
        800, 460, 'overlay=true,opacity=45,border=2,title=true,resizable=yes,centered=yes,toolbar=yes,owner=' + window.AppFrameId);


//    AppRoot.OpenFramePopup(window, 'PopupZoom.aspx', 'IsEditable=" + bEditable + "&MaxLength=" + iMaxLength + "&ControlFrame=" + oFrame.AppFrameId + "&ControlID=" + sZoomControlID +
//     "&ControlProperty=" + oControl.value + '&Title=' + sPopupHeaderTitle.replace(/'/g, '\\\''), 'GetData?'
//	window.open("PopupZoom.aspx?IsEditable=" + bEditable + "&MaxLength=" + iMaxLength + "&ControlFrame=" + oFrame.AppFrameId + "&ControlID=" + sZoomControlID +
//     "&ControlProperty=" + oControl.value + '&Title=' + sPopupHeaderTitle.replace(/'/g, '\\\''), "Zoom",
//		"resizable=yes,width=460,height=500" + 
//		",resizable=yes,left=" + Math.max(0,(screen.width - 460)/2) + 
//		",top=" + Math.max(0,((screen.height - 500)/2)-20));
//        

}

function setupPrintWindow(oWindow,sContents,sTitle,iHeight)
{

	//Add extra space to each detail line for notes

	if( arguments.length < 4 )
	{
		iHeight = 0;
	}
	if( iHeight > 0 )
	{
		sContents = sContents.replace("</TR>","</**TR**>");
		sContents = sContents.replace(/<\/TR>/g,"</TR><TR class=xtd style='HEIGHT: " + iHeight + "px' nowrap><TD colspan='999'>&nbsp;</TD></TR>");
		sContents = sContents.replace("</**TR**>","</TR>");
	}

	//Initialize html before and after the contents we wanna display
	var sBefore = "<HTML>";
	var sAfter = "</HTML>";

	//Add printer friendly style sheet reference
	sBefore = sBefore + " <HEAD><LINK href=MCCMStyles_PF.css rel=stylesheet></HEAD>";

	//Prepare to add body
	sBefore = sBefore + "<BODY>";
	sAfter = " </BODY>" + sAfter;

	//Add print, close hyperlinks
	var now = new Date();
	sBefore = sBefore + " <table id=tblReportHdr><tr><td width=20%></td><td align=center width=60% class=pfTitle>" + sTitle
	sBefore = sBefore + " (" + (now.getMonth() + 1).toString() + "/" + now.getDate().toString()
	sBefore = sBefore + "/" + now.getFullYear().toString() + "  " + ("00" + now.getHours().toString()).slice(-2) 
	sBefore = sBefore + ":" + ("00" + (now.getMinutes()).toString()).slice(-2) + ")</td><td width=20% align=right>"
	//Following removed -- Print and Close links not currently necessary since printing automatic
	//sBefore = sBefore + " <a id=pfPrint href='javascript:window.print();window.close();'>Print</a>&nbsp;&nbsp;"
	//sBefore = sBefore + " <a id=pfClose href='javascript:window.close();'>Close</a>"
	sBefore = sBefore + " </td></tr></table><br>"

	//Populate the specified window specified contents
	oWindow.document.open();
	oWindow.document.write(sBefore + sContents + sAfter);

	//Loop through tables and adjust sizes to account for columns not visible in printer
	//friendly mode
	var iAdjustWidth = 0;
	var oTable = oWindow.document.getElementById("dgWorkList");
	for(var i=0 ; i < oTable.rows[0].cells.length ; i++)
	{
		if( oTable.rows[0].cells[i].className == "noprint" )
		{
			iAdjustWidth += parseInt(oTable.rows[0].cells[i].style.width);
		}
	}
	var iNewWidth = parseInt(oTable.style.width) - iAdjustWidth;
	var sNewWidth = iNewWidth.toString() + "px";
	oTable.style.width = sNewWidth;

	//Line up the table with the report title the worklist datagrid table
	oWindow.document.getElementById("tblReportHdr").style.width = sNewWidth;

	//Adjust window to fit report (max 800) and display the window
	oWindow.document.close();
	oWindow.resizeTo(Math.min(iNewWidth + 50,800),600);

	//We have decided to automatically print then close the window
	setTimeout(function(){ oWindow.print();	oWindow.close(); },0);
}

function fnNewWindowCrystal(sURL,iWidth,iHeight,sWinName) {
	if(arguments.length < 2)
		iWidth = 800;
	if(arguments.length < 3)
		iHeight = 630;
	if(arguments.length < 4)
	{
		if(sURL.substr(0,8) == '../MCCM/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,8) == '../mccm/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,5) == 'help/') 
			sWinName = 	sURL.substr(5,5);
		else if(sURL.substr(0,5) == 'WBIR.') 
			sWinName = 	'wbirwizard';
		else if(sURL.substr(0,5) == 'http:') 
			sWinName = 	'cerme';
		else
			sWinName = 	sURL.substr(0,5);
	}	
    AppRoot.OpenNewBrowswerFromFrame(AppRoot, sURL, iWidth, iHeight);
}

function jumpTo(x,y) {
	if (epx[x] == 1) {
		location.hash = "#JP"+x;
	} else {
		frmAction(x,y);
	}		
}

function frmAction(x,y) {
	for (var i=0; i < document.all.tags("SPAN").length; i++) {
		var obj = document.all.tags("SPAN")[i];
		if (obj.id == y) {
			if(epx[x] == 0) {
				document["IM" + x].src = "images/minus.gif";
				document["IM" + x].alt = "Close Detail";
				epx[x] = 1;
				obj.style.display = "";
				location.hash = "#JP"+x;
			} else {
				document["IM" + x].src = "images/plus.gif";
				document["IM" + x].alt = "View Detail";
				epx[x] = 0;
				obj.style.display = "none";
			}
			var wrk = "";
			for (var j=0; j < epx.length; j++) {
				wrk = wrk + epx[j];
			}
			document.Form1.hiddenJumpTo.value=wrk;
		}
	}
}

function CovNotice(sUrl) {
	var obj = document.getElementById("txtRevMCCMID")
	if (obj != null) {
		sUrl = sUrl + "?ResultID=" + document.Form1.txtRevMCCMID.value;	
	}
	fnNewWindow(sUrl, 800, 580);
}

function goTop() {
	location.hash = "#JPX";
}

function fnNewWindow(sURL, iWidth, iHeight, sWinName, bEncode) {
    if(arguments.length < 2)
		iWidth = 800;
	if(arguments.length < 3)
		iHeight = 630;
	if(arguments.length < 4)
	{
		if(sURL.substr(0,8) == '../MCCM/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,8) == '../mccm/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,5) == 'help/') 
			sWinName = 	sURL.substr(5,5);
		else if(sURL.substr(0,5) == 'WBIR.') 
			sWinName = 	'wbirwizard';
		else if(sURL.substr(0,5) == 'http:') 
			sWinName = 	'cerme';
		else if(sURL.substr(0,15) == '../MCCMPackets/') 
			sWinName = 	'packets';
		else
			sWinName = 	sURL.substr(0,5);
	}	

	var iX = Math.max(0,(screen.width - iWidth)/2);
	var iY = Math.max(0, ((screen.height - iHeight) / 2) - 20);
    if (bEncode == true)
        sURL = encodeURL(sURL);
	var oPopUpWin = window.open(sURL, sWinName  , "width=" + iWidth + ",height=" + iHeight + 
			",left=" + iX + ",top=" + iY + ",resizable=yes,scrollbars=yes,status=yes", true);
						 
	//Give it focus
	oPopUpWin.focus();
}

//From http: //roneiv.wordpress.com/2007/12/25/how-to-do-proper-url-encoding-in-javascript-when-using-windowopen/
function encodeURL(url) {
    if (url.indexOf("?") > 0) {
        encodedParams = "?";
        parts = url.split("?");
        params = parts[1].split("&");
        for (i = 0; i < params.length; i++) {
            if (i > 0) {
                encodedParams += "&";
            }
            if (params[i].indexOf("=") > 0) 
            {
                p = params[i].split("=");
                encodedParams += (p[0] + "=" + escape(encodeURI(p[1])));
            }
            else {
                encodedParams += params[i];
            }
        }
        url = parts[0] + encodedParams;
    }
    return url;
}

function fnNewWindowNoScroll(sURL,iWidth,iHeight,sWinName) {
	if(arguments.length < 2)
		iWidth = 800;
	if(arguments.length < 3)
		iHeight = 630;
	if(arguments.length < 4)
	{
		if(sURL.substr(0,8) == '../MCCM/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,8) == '../mccm/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,5) == 'help/') 
			sWinName = 	sURL.substr(5,5);
		else if(sURL.substr(0,5) == 'WBIR.') 
			sWinName = 	'wbirwizard';
		else if(sURL.substr(0,5) == 'http:') 
			sWinName = 	'cerme';
		else
			sWinName = 	sURL.substr(0,5);
	}
	
	var iX = Math.max(0,(screen.width - iWidth)/2); 
	var iY = Math.max(0,((screen.height - iHeight)/2)-20);
	var oPopUpWin = window.open(sURL, sWinName  , "width=" + iWidth + ",height=" + iHeight + 
			",left=" + iX + ",top=" + iY + ",resizable=no,scrollbars=no,status=yes", true);
	//Give it focus
	oPopUpWin.focus();
}

function setFocus(sCtl) {
   if (document.Form1[sCtl] != null) {
        document.Form1[sCtl].focus();}
}

function fExtractSearchValues(oActionArgs_In)
{
    var sArray = new Array(3);

    if (oActionArgs_In.VisitorId)
    {
        sArray[0] = "Visitor";
        sArray[1] = "V";
        sArray[2] = oActionArgs_In.VisitorId;
    }
    else if (oActionArgs_In.PhysicianStaffID)
    {
        sArray[0] = "Staff";
        sArray[1] = "E";
        sArray[2] = oActionArgs_In.PhysicianStaffID;
    }
    else if (oActionArgs_In.EncMCCMID)
    {
        sArray[0] = "";
        sArray[1] = "P";
        sArray[2] = oActionArgs_In.EncMCCMID;
    }

    return sArray;
}

// Runs a search using the specified parameters (sArgs_In) and updates specified control values.
//     e.g. Vistor|V|LEWISA4986, Staff|E|A086, |P|asfdlhl
function InvokeAjaxCallBack(sArgs_In, hashControls_In)
{
    var result = AppRoot.GetAJAXResult('MCCM', 'ReviewHelper', 'UpdateUI', 'data=' + escape(sArgs_In.join("|")));
    
    if (result != "no data")
    {
        for (var key in hashControls_In)
        {
            if (hashControls_In.hasOwnProperty(key))
            {
                try { document.getElementById(key).value = result.split("|")[hashControls_In[key]]; } catch (e) { }
            }
        }
    }

    ajaxCleanup();
}



function fPatEncSearchURL(sArg, iWidth, iHeight) {
	var sSSURL = "";
	if ( iWidth === undefined ) {
			iWidth = 715;
		}
	if ( iHeight === undefined ) {
			iHeight = 600;
		}
	if(sArg.indexOf("URL=") == 0)
	{
		sSSURL = sArg.substr(4);
	}
	else
	{
		oElement=window.document.getElementById(sArg); 
		sSSURL = oElement.value ;
	}
	// By adding 2000px to the x & y coodinates, it opens the window
	//   offscreen, which is, essentially, in minimized mode.
	var iX = Math.max(0,(screen.width - iWidth)/2) + 2000; 
	var iY = Math.max(0,((screen.height - iHeight)/2)-20) + 2000;
	var obj = window.open(sSSURL,"PopUpSearch","width=" + iWidth+",height=" + iHeight + 
			",left=" + iX + ",top=" + iY + ",resizable=yes,scrollbars=yes,status=yes");
	obj.focus();	//The lookup should always grab the focus after opening
}

function fVisitorSearchURL(sArg) {
	var sSSURL = "";
	if(sArg.indexOf("URL=") == 0)
	{
		sSSURL = sArg.substr(4);
	}
	else
	{
		oElement=window.document.getElementById(sArg); 
		sSSURL = oElement.value ;
	}
	var iX = Math.max(0,(screen.width - 785)/2); 
	var iY = Math.max(0,((screen.height - 545)/2)-20);
	var obj = window.open(sSSURL,"PopUpSearch","width=785,height=545" + 
			",left=" + iX + ",top=" + iY + ",resizable=yes,scrollbars=yes,status=yes"); 
	obj.focus();	//The lookup should always grab the focus after opening
}
		
function isValidDate(dateStr) {
	// Checks for the following valid date formats:
	// MM/DD/YY   MM/DD/YYYY   MM-DD-YY   MM-DD-YYYY
	var datePat = /^(\d{1,2})(\/|-)(\d{1,2})\2(\d{4})$/; // requires 4 digit year
	var matchArray = dateStr.match(datePat); // is the format ok?
	if (matchArray == null) { return false;	}
	month = matchArray[1]; // parse date into variables
	day = matchArray[3];
	year = matchArray[4];
	if (month < 1 || month > 12) { return false; }
	if (day < 1 || day > 31) { return false; }
	if ((month==4 || month==6 || month==9 || month==11) && day==31) { return false; }
	if (month == 2) { // check for february 29th
		var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
		if (day>29 || (day==29 && !isleap)) { return false; }
	}
	return true;
}

function doDialog(sTitle,sHTMLText,sChoices,sDefault,iWidth,iHeight) {
	//Collect together the elements of the dialog 
	//so the can be handed to the modal window dialog
	var oDialogArgs = new Object();
	oDialogArgs["Title"] = sTitle;
	oDialogArgs["Text"] = sHTMLText;
	oDialogArgs["Choices"] = sChoices;
	oDialogArgs["Default"] = sDefault;

	//Default the width and height if not specified
	if(arguments.length < 5)
		iWidth = 400;
	if(arguments.length < 6)
		iHeight = 200;

	//Popup the dialog with appropriate width and height
	//AND return from here whatever value the modal dialog returns
	return window.showModalDialog("../MCCM/MCCMDialog.html", oDialogArgs,
				      "status:no;edge:sunken;scroll:no;" + 
				      "dialogWidth:" + iWidth.toString() + "px;" + 
				      "dialogHeight:" + iHeight.toString() + "px;");
}

function fUnitsHist(sList,sDate1,sTime1) {
	if (arguments.length < 2) return;
	var aList = sList.split("|");
	if (aList.length == 0) return;
	var dt1x = new Date(sDate1);
	var sUnt = "";
	var nHr = 23;
	var nMi = 59;
	if (arguments.length == 3) {
		if (sTime1.split(":").length == 2) {
			nHr = Number(sTime1.split(":")[0]);
			nMi = Number(sTime1.split(":")[1]);
		}
	}
	dt1x.setHours(nHr,nMi,59,999);
	for (var i=0; i<aList.length-1; i=i+2) {			
		var dt2 = new Date(aList[i]);
		if (dt1x.getTime() >= dt2.getTime()) {
			sUnt = aList[i+1];
			break;
		}
	}
	DbComboClear("PrimaryProfile1_dbComboUnitCd");
 	if (sUnt != "") {
		document.getElementById("PrimaryProfile1_dbComboUnitCd").value = sUnt;
		document.getElementById("PrimaryProfile1_dbComboUnitCd_ulbValueHidden").value = sUnt.split(":")[0];
 	}
}

function fServicesHist(sList,sDate1) {
	if(arguments.length < 2) return;
	var aList = sList.split("|");
	if (aList.length == 0) return;
	var dt1x = new Date(sDate1);
	var sSrv = "";
	for (var i=0; i<aList.length-1; i=i+2) {			
		var dt2 = new Date(aList[i]);
		if (dt1x.getTime() >= dt2.getTime()) {
			sSrv = aList[i+1];
			break;
		}
	}
	DbComboClear("PrimaryProfile1_dbComboServiceCd");
 	if (sSrv != "") {
		document.getElementById("PrimaryProfile1_dbComboServiceCd").value = sSrv;
		document.getElementById("PrimaryProfile1_dbComboServiceCd_ulbValueHidden").value = sSrv.split(":")[0];
 	}
}

// **********************************************************
// Below functions control AJAX processing in the application
function ajaxInitiateRequest(sControl1,sControl2,sControl3) {
	var obj = null;
	if( (window.AppRoot && !AppRoot.IsIE) || window.XMLHttpRequest ) //IE7 has this method
	{
		obj = new XMLHttpRequest();
	}
	else
	{
		try
		{
			obj = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			obj = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}

	// Optionally, hide up to 3 controls for the life of the ajax transaction.
	// Also change to an hourglass cursor.
	try {
		if (arguments.length > 0) document.getElementById(sControl1).style.visibility = "hidden";
		if (arguments.length > 1) document.getElementById(sControl2).style.visibility = "hidden";
		if (arguments.length > 2) document.getElementById(sControl3).style.visibility = "hidden";
		document.body.style.cursors = 'wait';
		if (obj == null) ajaxTestForError("*Err*:Unable to initiate XmlHttpRequest object.");
	}
	catch(e) { }

	// Return the XmlHttpRequest object
	return obj;
}

function ajaxTestForError(sResp) {
	try {
		if (arguments.length < 1) return false;
		if (sResp.length < 6) return true;
		if (sResp.toLowerCase().substr(0,6) != "*err*:") return true;
		alert(sResp.substr(6) + "  Please exit this task.");
		return false;
	}
	catch(e) {
		alert("Error in 'ajaxTestForError' function.  Please exit this task.");
		return false;
	}
}

function ajaxCleanup(sControl1,sControl2,sControl3) {
	// Unhide the controls and reset the cursor upon the successful completion of the ajax transaction
	try {
		if (arguments.length > 0) document.getElementById(sControl1).style.visibility = "visible";
		if (arguments.length > 1) document.getElementById(sControl2).style.visibility = "visible";
		if (arguments.length > 2) document.getElementById(sControl3).style.visibility = "visible";
		document.body.style.cursors = 'auto';
	}
	catch(e) { }
}

function DoAction(oWindow, sRefreshAction)
{
	//window.parent.opener.AppRoot.DoAction(window.parent.opener, sRefreshAction);
    ((window.parent&&window.parent.opener)?window.parent.opener:window.top).AppRoot.DoAction((window.parent&&window.parent.opener)?window.parent.opener:oWindow, sRefreshAction);
}

// Above functions control AJAX processing in the application (the latter via MTrE)
// ********************************************************************************
