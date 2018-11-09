//Display the date selector for the given popup
function DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear)
{
	//Get control for which we need a calendar
	var oTextbox = oFrame.document.getElementById(sControlID);

	//Go no further if the textbox itself is disabled or read only
	if( oTextbox.disabled || oTextbox.readOnly )
	{
		return;
	}
	
	var iLeft = iAdditionalOffsetLeft;
	var iTop = iAdditionalOffsetTop;
	if( iPositioning < 6 )	//Excludes only AbsFrame positioning
	{
		var oTextboxPosition = GetPosition(oTextbox.parentElement, AppRoot.IsIE && !AppRoot.IsHTML5);
		iLeft += oTextboxPosition[0];
		iTop += oTextboxPosition[1];
		if( iPositioning == 5 ) //AbsFrameWithScrollAdjust	
		{
			iTop -= AppRoot.GetScrollOffset(oFrame, oTextbox.parentElement);		
		}
		else //Relative positioning
		{
			iLeft -= 70;
			iTop += 40;
		}
	}

	var sTextboxValue = oTextbox.value;
	var sCalendarDivId = sControlID + "_div";
	var oCalendarDiv = oFrame.document.getElementById(sCalendarDivId);
	if( !oCalendarDiv )
	{
		oCalendarDiv = oFrame.document.createElement("div");
		oCalendarDiv.setAttribute("id", sCalendarDivId);
		oCalendarDiv.setAttribute("style", "position: absolute");
		oCalendarDiv.setAttribute("z-index", "999");
		
		if( iPositioning < 5 && AppRoot.IsIE && !AppRoot.IsHTML5 ) //i.e., relative positioning
		{
			oTextbox.parentElement.parentElement.appendChild(oCalendarDiv);
		}
		else
		{
			oFrame.document.getElementsByTagName("body")[0].appendChild(oCalendarDiv);
		}
	}

	var sPreviousLink = sCalendarDivId + "_Prev";
	var sNextLink = sCalendarDivId + "_Next";

	var oCurrentDate = new Date();
	var iCurrentMonth = oCurrentDate.getMonth() + 1;
	var iCurrentYear = oCurrentDate.getFullYear();

	var oSelectedDate;
	var iSelectedDate ;
	var iSelectedMonth;
	var iSelectedYear;

	
	//Attempt to parse the textbox value as a date
	if( !IsEmpty(sTextboxValue) )
	{
		try
		{
			var oParsedValue = sTextboxValue.split("/");
			if( oParsedValue.length == 2 )
			{
				oSelectedDate = new Date(oParsedValue[1], oParsedValue[0] - 1, 01);
				iSelectedDate = oSelectedDate.getDate();
				iSelectedMonth = oSelectedDate.getMonth();
				iSelectedYear = oSelectedDate.getFullYear();
			}
		}
		catch(e) {}
	}
	
	//Set start month and year if not passed in
	if( arguments.length < 6 )
	{
		//Start month and year will reflect the selected date or if none the current date
		if( IsEmpty(oSelectedDate) || isNaN(oSelectedDate) || oSelectedDate == undefined)
		{
			iStartMonth = iCurrentMonth;
			iStartYear = iCurrentYear;
		}
		else
		{
                iStartMonth = iSelectedMonth;
                iStartYear = iSelectedYear;   
		}
	}
	
		
	//Deduce what the previous and next months would be
	var iPreviousMonth = iStartMonth;
	var iPreviousYear = iStartYear - 1;
	

	var iNextMonth = iStartMonth;
	var iNextYear = iStartYear + 1;
	

	var iDisplayYear = iStartYear; 
	var iDisplayMonth = iStartMonth;
		

	//Construct html for calendar header (with current Month and Year)
	var sContents = 
		"<div id=" + sCalendarDivId + " " + 
			 "class=BaseDateCalendar " + 
			 "style='Z-INDEX: 999; LEFT: " + iLeft + "px; POSITION: absolute; TOP: " + iTop + "px'>" + 
			"<table class=BaseDateTable cellSpacing=1 cellPadding=4 " + 
                "onmouseover=\"window.cursor = 'pointer';\" onmouseout=\"window.cursor = 'auto';\">" + 
				"<tr>" + 
					"<td class=BaseDateHdrCell colspan =1 style='width:50px; text-align:left'>" + 
						"<a id=" + sPreviousLink + 
							" href=\"javascript:void DisplayCalendarSelector(" + 
								"window,'" + sControlID + "'," + 
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," + 
									iPositioning + "," + iPreviousMonth + "," + iPreviousYear + ");\"" + 
							" onkeydown=\"CalendarSelectorOnKeyDown(" + 
								"window,'" + sControlID + "'," + 
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," + 
									iPositioning + "," + iStartMonth + "," + iStartYear + ");\"" + 
                            " style=\"outline:none\"" +
							">" + 
								"<img src=Images/MonthDown.gif style='border: none'>" + 
						"</a>" + 
					"</td>" + 
					"<td class=BaseDateHdrCell  colspan=1 style='width:50px; text-align:center'>" + iStartYear + "</td>" +
					"<td class=BaseDateHdrCell colspan =1 style='width:50px; text-align:right'>" + 
						"<a id=" + sNextLink + 
							" href=\"javascript:void DisplayCalendarSelector(" + 
								"window,'" + sControlID + "'," + 
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," + 
									iPositioning + "," + iNextMonth + "," + iNextYear + ");\"" + 
							" onkeydown=\"CalendarSelectorOnKeyDown(" + 
								"window,'" + sControlID + "'," + 
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," + 
									iPositioning + "," + iStartMonth + "," + iStartYear + ");\"" + 
                            " style=\"outline:none\"" +
							">" + 
								"<img src=Images/MonthUp.gif style='border: none'>" + 
						"</a>" + 
					"</td>" + 
				"</tr>" ;
	sContents += "<tr>";
        sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '01/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Jan</td>";
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '02/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Feb</td>"
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '03/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Mar</td>"
	sContents += "</tr>";
	
	sContents += "<tr>";
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '04/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Apr</td>";
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '05/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">May</td>"
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '06/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Jun</td>"
	sContents += "</tr>";
	
	sContents += "<tr>";
        sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '07/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Jul</td>";
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '08/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Aug</td>"
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '09/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Sep</td>"
    sContents += "</tr>";
	
	sContents += "<tr>";
        sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '10/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Oct</td>";
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '11/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Nov</td>"
		sContents += "<td onmousedown=\"PickFromCalendarSelector(window, '" + sControlID + "', '12/01/" + iDisplayYear + "');\" class=BaseDateCurrentDayCell style=\"cursor:default; text-align:center\" onmouseover=\"style.backgroundColor='#84C1DF';\" onmouseout=\"style.backgroundColor='#FFFFFF'\">Dec</td>"
    sContents += "</tr>";

	//Close out tags
	sContents += "</table></div>";
	
	//If IE6 and IE6 hide select elements flag set, then do so
	if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 && 
		IsTrue(oTextbox.getAttribute("HideSelectElementsInIE6")) )
	{
		var oSelectElements = oFrame.document.getElementsByTagName("select");
		for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
		{
			oSelectElements[iElement].style.visibility = "hidden";
		}
	}

	//Display the calendar
	try
	{
		oCalendarDiv.outerHTML = sContents;
	}
	catch(e)
	{
		oCalendarDiv.outerHTML = "";
		oCalendarDiv = oFrame.document.createElement("div");
		oCalendarDiv.setAttribute("id", sCalendarDivId);
		oCalendarDiv.setAttribute("style", "position: absolute");
		oCalendarDiv.setAttribute("z-index", "999");
		oFrame.document.getElementsByTagName("body")[0].appendChild(oCalendarDiv);
		oCalendarDiv.outerHTML = sContents;
	}
	
	//Set focus, blur, and onkeydown handling on prev and next buttons
	oPreviousLink = oFrame.document.getElementById(sPreviousLink);
	oNextLink = oFrame.document.getElementById(sNextLink);
    oPreviousLink.onbeforemousedown = 
		function()
			{
				AppRoot.AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ResetTimeout(sCalendarDivId, oFrame);
               	oNextLink.onblur = null;
                oFrame.setTimeout(
                    function()
                    { 
                        oPreviousLink.focus(); 
                        oPreviousLink.onblur = 
		                    function()
			                    {
				                    AppRoot.AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).SetTimeout(
					                    sCalendarDivId,	"ResetCalendarSelector(window, '" + sCalendarDivId + "')", 200, oFrame);
                                }
                    },0);
			}
	oNextLink.onbeforemousedown = 
		function()
			{
				AppRoot.AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ResetTimeout(sCalendarDivId, oFrame);
               	oPreviousLink.onblur = null;
                oFrame.setTimeout(
                    function()
                    { 
                        oNextLink.focus(); 
                        oNextLink.onblur = 
		                    function()
			                    {
				                    AppRoot.AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).SetTimeout(
					                    sCalendarDivId,	"ResetCalendarSelector(window, '" + sCalendarDivId + "')", 200, oFrame);
                                }
                    },0);
			}
    oNextLink.onbeforemousedown();
}
function ResetCalendarSelector(oFrame, sCalendarDivId)
{
	//If IE6 and IE6 hide select elements flag set, then do so
	if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 )
	{
		var oTextbox = oFrame.document.getElementById(sCalendarDivId.substr(0, sCalendarDivId.length - 4));
		if( IsTrue(oTextbox.getAttribute("HideSelectElementsInIE6")))
		{
			var oSelectElements = oFrame.document.getElementsByTagName("select");
			for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
			{
				oSelectElements[iElement].style.visibility = "visible";
			}
		}
	}

    if( AppRoot.IsIpad)
    {
        oFrame.setTimeout(
            function()
            {
	            var oCalendarDiv = oFrame.document.getElementById(sCalendarDivId);
	            oCalendarDiv.outerHTML = "<div id=" + sCalendarDivId + " style='POSITION: absolute'></div>";
            }, 100);
    }
    else
    {
	    var oCalendarDiv = oFrame.document.getElementById(sCalendarDivId);
	    oCalendarDiv.outerHTML = "<div id=" + sCalendarDivId + " style='POSITION: absolute'></div>";
    }    
}
function CalendarSelectorOnKeyDown(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear)
{
	switch(oFrame.event.keyCode)
	{
		case 36:	//Home
			DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear + 1);
			break;
		case 35:	//End
			DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear - 1);
			break;
		case 33:	//Page up
			iStartMonth += 1;
			if( iStartMonth > 12 )
			{
				iStartMonth = 1;
				iStartYear += 1;
			}
			DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear);
			break;
		case 34:	//Page down
			iStartMonth -= 1;
			if( iStartMonth < 1 )
			{
				iStartMonth = 12;
				iStartYear -= 1;
			}
			DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear);
			break;
	}
}
function PickFromCalendarSelector(oFrame, sControlID, sPickValue)
{
	var oBaseCalendar = oFrame.document.getElementById(sControlID);
	if( !AppRoot.IsIpad) oBaseCalendar.focus();
    var oDatePieces = sPickValue.split("/");
    oBaseCalendar.value = oDatePieces[0] + "/" + oDatePieces[2];
   	if( AppRoot.IsIpad) oFrame.setTimeout(function(){ oBaseCalendar.value = sPickValue; BaseCalendarProcessChange(oFrame, sControlID); }, 10);
    else oBaseCalendar.blur();
    ResetCalendarSelector(oFrame, sControlID + "_div")
}
function BaseCalendarOnKeyDown(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning)
{
	var oBaseCalendar = oFrame.document.getElementById(sControlID);
	if( AppRoot.IsPageAvailable(oFrame) && (!oBaseCalendar.readOnly || oFrame.event.keyCode == 9 ) )
	{
		switch(oFrame.event.keyCode)
		{
			case 33:	//Page up +1 month
                var oParsedDate = ParseBaseCalendar(oBaseCalendar.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Get current month, date, and year
					var iMonth = oParsedDate.getMonth() + 1;
					var iDate = oParsedDate.getDate();
					var iYear = oParsedDate.getFullYear();
					
					//Increment the month
					iMonth += 1;
					if( iMonth > 12 )
					{
						iMonth = 1;
						iYear += 1;
					}
										
					//Reset contents of BaseDate
					var oNewDate = new Date(iYear, iMonth - 1, iDate);
					oBaseCalendar.value = 
						oNewDate.getMonth() + "/" + 
						 oNewDate.getFullYear();
				}
				oFrame.event.returnValue = false;
				break;
			case 34:	//Page down -1 month
				var oParsedDate = ParseBaseCalendar(oBaseCalendar.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Get current month, date, and year
					var iMonth = oParsedDate.getMonth();
					var iDate = oParsedDate.getDate();
					var iYear = oParsedDate.getFullYear();
					
					//Decrease the month
					iMonth -= 1;
					if( iMonth < 1 )
					{
						iMonth = 12;
						iYear -= 1;
					}
					
										
					//Reset contents of BaseDate
                   var oNewDate = new Date(iYear, iMonth, iDate);
                   oBaseCalendar.value = 
						oNewDate.getMonth() + "/" + 
						oNewDate.getFullYear();
				}
				oFrame.event.returnValue = false;
				break;
			case 187:	//+ key (which is shift=)
				if( !oFrame.event.shiftKey )
				{
					oFrame.event.returnValue = false;
					break;
				}
			case 107:	//Keypad + button
			case 38:	//Arrow up
					break;
				
			case 189:	//- key
				if( oFrame.event.shiftKey ) //shift- is underscore
				{
					oFrame.event.returnValue = false;
					break;
				}
			case 109:	//Keypad - button
			case 40:	//Arrow down
				break;
			case 67:	//Calendar
                                oFrame.event.returnValue = false;
				DisplayCalendarSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning)
				break;
			case 84:	//Today
				var oCurrentDate = new Date();
				oBaseCalendar.value = 
					(oCurrentDate.getMonth() + 1) + "/" + 
					oCurrentDate.getFullYear();
                                oFrame.event.returnValue = false;
				break;
			case 8:  //Allow backspace to process
				break;
			case 9:  //Allow tab key to process
				break;
			case 37:  //Allow left arrow to process
				break;
			case 39:  //Allow right arrow to process
				break;
			case 45:  //Allow insert key to process
				break;
			case 46:  //Allow delete key to process
				break;
			case 191:  //Allow / to process
				break;
			case 111:  //Allow keypad / to process
				break;
			default:
				//Otherwise, unless a special key, allow only #s -- chars 48-57 or keypad 96-105;
				//suppress all other characters
				if( !oFrame.event.altKey && !oFrame.event.ctrlKey )
				{
					if( oFrame.event.keyCode < 48 || 
                        oFrame.event.keyCode > 57 || 
                        (oFrame.event.shiftKey && oFrame.event.keyCode >= 48 && oFrame.event.keyCode <= 57) )
					    {
						if( oFrame.event.keyCode < 96 || oFrame.event.keyCode > 105 )
						{
                            oFrame.event.returnValue = false;
						}
					}
				}
		}
	}
	else
	{
		oFrame.event.returnValue = false;
	}	
}
function BaseCalendarProcessChange(oFrame, sControlID)
{
	//Set the value and process a change if a
	var oBaseCalendar = oFrame.document.getElementById(sControlID);
    if( !oFrame.AppFrameValues ) oFrame.AppFrameValues = new Object();
	if( IfEmpty(oBaseCalendar.value, "") != IfEmpty(oFrame.AppFrameValues[sControlID], "") )
	{
		oFrame.AppFrameValues[sControlID] = oBaseCalendar.value;
		
		//Trigger change handling, if any
		var sOnChangeScript = oBaseCalendar.getAttribute("ClientOnChangeFunction");
		
		if( !IsEmpty(sOnChangeScript) )
		{
			if( sOnChangeScript.indexOf("(") < 0 && 
				sOnChangeScript.indexOf(";") < 0 && 
				sOnChangeScript.indexOf(" ") < 0 && 
				sOnChangeScript.indexOf("=") < 0 ) //typeof(oOnSelectScript) == "function" didn't work
			{
                try
                {
				    oOnChangeScript = eval(sOnChangeScript); //NOT supported inside MTrE
				    oOnChangeScript.call(oBaseCalendar); //Sets this keyword if called this way
                }
                catch(e)
                {
				    oOnChangeScript = oFrame.eval(sOnChangeScript); //NOT supported inside MTrE
				    oOnChangeScript.call(oBaseCalendar); //Sets this keyword if called this way
                }
			}
			else
			{
				oFrame.eval(sOnChangeScript);
			}
		}
	}
}
function BaseCalendarOnBlur(oFrame, sControlID, bIssueMsgIfBadDate)
{
	//First validate
	var oBaseCalendar = oFrame.document.getElementById(sControlID);
	var oParsedDate = ParseBaseCalendar(oBaseCalendar.value, false, bIssueMsgIfBadDate, oBaseCalendar);
	if( !IsEmpty(oParsedDate) )
	{
		oBaseCalendar.value = 
			(oParsedDate.getMonth()) + "/" + 
			oParsedDate.getFullYear();
	}
	
	//Process any change
	BaseCalendarProcessChange(oFrame, sControlID);
}
function ParseBaseCalendar(sDateExpression, bIfEmptyUseToday, bIssueMsgIfBadDate, oCalendarControl)
{
	//Initialize our return
	var oRtnDate = null;
	
	//If no / separators and > 2 digits infer some separators
	if( sDateExpression.indexOf("/") < 0 && sDateExpression.length > 2 )
	{
		if( sDateExpression.length > 5 )
		{
			sDateExpression =  sDateExpression.substr(0,2) +  '/01/' +
							  sDateExpression.substr(2);
		}
		else if( sDateExpression.length == 5 )
		{
			sDateExpression =  '0' + sDateExpression.substr(0,1) + '/01/' +
							  sDateExpression.substr(1);
		}
		else if( sDateExpression.length == 4 )
		{
			sDateExpression =  sDateExpression.substr(0,2) +  '/01/' +
							  '20' + sDateExpression.substr(2);
		}
		else
		{
			sDateExpression = '0' + sDateExpression.substr(0,1) + '/' + '01/' + 
							 '20' + sDateExpression.substr(1);
		}
	}
		
	try
	{
		//If empty expression return today, if flag so set
		if( IsEmpty(sDateExpression) )
		{
			if( bIfEmptyUseToday )
			{
                                var d = new Date();
                                oRtnDate = d.setDate(1);
			}
		}
		else
		{
			//Split into pieces
			var oDatePieces = sDateExpression.split("/");
			if( oDatePieces.length == 2)
			{
				//Make sure the month is in range and day is at least between 1 and 31
				if( oDatePieces[0] < 1 || oDatePieces[0] > 12 )
				{
					throw new Error();
				}
				else
				{
                        //Set Year and Month
                        //No year
                        if( oDatePieces[0].length < 2 )
				        {
					        oDatePieces[0] = "0" + oDatePieces[0]; 
				        }
                        if (oDatePieces[1].length < 1)
                        {
                            var oCurrentDate = new Date();
                            oDatePieces[1] = '20' + oDatePieces[1]
                            oRtnDate = new Date(oCurrentDate.getFullYear(), oDatePieces[0],'01');

                        }
                        else if(oDatePieces[1].lenght == 1)
                        {
                            oDatePieces[1] = '200' + oDatePieces[1]
                            oRtnDate = new Date(oDatePieces[1], oDatePieces[0],'01');
                        }
                        else if(oDatePieces[1].lenght == 2 && oDatePieces[1].lenght < 50)
                        {
                            oDatePieces[1] = '20' + oDatePieces[1]
                            oRtnDate = new Date(oDatePieces[1], oDatePieces[0], '01');
                        }                                        
                        else if(oDatePieces[1].lenght == 2 && oDatePieces[1].lenght > 50)
                        {
                                oDatePieces[1] = '19' + oDatePieces[1]
                                oRtnDate = new Date(oDatePieces[1], oDatePieces[0] - 1, '01');
                        }                                        
                        else if(oDatePieces[1].lenght == 3)
                        {
                            oDatePieces[1] = '2' + oDatePieces[1]
                            oRtnDate = new Date(oDatePieces[1], oDatePieces[0] - 1, '01');
                        }
                        else
                        {
                            oRtnDate = new Date(oDatePieces[1],  oDatePieces[0], '01');
                        }                                           
				}
			}
			else if( oDatePieces.length == 3 )
			{
				//Make sure the month is in range, the day is at least between 1 and 31, 
				//and the year has no more than 4 digits
				if( oDatePieces[0] < 1 || oDatePieces[0] > 12 || 
					oDatePieces[1] < 1 || oDatePieces[1] > 31 || 
					oDatePieces[2].length > 4 )
				{
					throw new Error();
				}
				else
				{
					//Adjust year
					if( oDatePieces[2].length < 2 )
					{
						oDatePieces[2] = "0" + oDatePieces[2]; 
					}
					if( oDatePieces[2].length == 2 )
					{
						if( oDatePieces[2] < 50 )
						{
							oDatePieces[2] = "20" + oDatePieces[2];
						} 
						else
						{
							oDatePieces[2] = "19" + oDatePieces[2];
						} 
					} 
					
					//See if our day of month is really valid for the month and year
					var iDayInMilliseconds = 1000 * 60 * 60 * 24;
					var iLastDayOfMonth = 
						new Date(new Date(oDatePieces[1], oDatePieces[0]).getTime() - iDayInMilliseconds).getDate();
					
					if( oDatePieces[1] > iLastDayOfMonth )
					{
						throw new Error();
					}
					else
					{
						oRtnDate = new Date(oDatePieces[1], oDatePieces[0] - 1, '01');
					}
				}
			}
			else if( bIssueMsgIfBadDate )
			{
				if( oCalendarControl )
				{
					setTimeout(function(){ alert('The month/year is invalid'); oCalendarControl.focus(); }, 50);
				}
				else
				{
					setTimeout(function(){ alert('The month/year is invalid'); }, 50);
				}
			}
		}
	}
	catch(e)
	{
		if( bIssueMsgIfBadDate )
		{
			if( oCalendarControl )
			{
				setTimeout(function(){ alert('The month/year is invalid'); oCalendarControl.focus(); }, 50);
			}
			else
			{
				setTimeout(function(){ alert('The month/year is invalid'); }, 50);
			}
		}
	}
	return oRtnDate;
}
