function getBaseName(oControl)
{
	var sBaseName = oControl.name;
	var i = sBaseName.indexOf(":");  //Strips :ulb ...
	if( i > 0)
	{
		sBaseName = sBaseName.substring(0,i);
	}
	return sBaseName;	
}

function resetForm()
{
	//Clear form and reset all controls which should be disabled
	var oElement;
	oElement = document.getElementById("tbDays");
	oElement.setAttribute("disabled", true);
	oElement.style.background = "silver";
	oElement.value = "";
	oElement = document.getElementById("tbDaysAgo");
	oElement.setAttribute("disabled", true);
	oElement.style.background = "silver";
	oElement.value = "";
	oElement = document.getElementById("tbDaysFromNow");
	oElement.setAttribute("disabled", true);
	oElement.style.background = "silver";
	oElement.value = "";
	oElement = document.getElementById("rbToday");
	oElement.setAttribute("disabled", true);
	oElement.checked = false;
	oElement = document.getElementById("rbYesterday");
	oElement.setAttribute("disabled", true);
	oElement.checked = false;
	oElement = document.getElementById("rbTomorrow");
	oElement.setAttribute("disabled", true);
	oElement.checked = false;
	oElement = document.getElementById("rbDaysAgo");
	oElement.setAttribute("disabled", true);
	oElement.checked = false;
	oElement = document.getElementById("rbDaysFromNow");
	oElement.setAttribute("disabled", true);
	oElement.checked = false;
	oElement = document.getElementById("dtFrom");
	oElement.setAttribute("disabled", true);
	oElement.style.background = "silver";
	oElement.value = "";
	oElement = document.getElementById("dtThrough");
	oElement.setAttribute("disabled", true);
	oElement.style.background = "silver";
	oElement.value = "";
	oElement = document.getElementById("rbSpecificRange");
	oElement.checked = false;
	oElement = document.getElementById("rbRelativeRange");
	oElement.checked = false;

	//Set date type if not yet set
	oElement = document.getElementById("ddDateType");
	if( oElement.value.length < 1 )
	{
		oElement.value = "";    // sDateTypeArray[0];
	}

	//Make visible or invisible the absolute date controls
	//depending on whether or not a date type has been selected
	if ( allowAbsolute() )
	{
		oElement = document.getElementById("divAbsolute");
		oElement.style.visibility = "visible";
	}
	else
	{
		oElement = document.getElementById("divAbsolute");
		oElement.style.visibility = "hidden";
	}

	//Make visible or invisible all relative date controls
	//depending on whether or not a relative date is allowed
	if ( allowRelative() )
	{
		oElement = document.getElementById("divRelativeRange");
		oElement.style.visibility = "visible";
	}
	else
	{
		oElement = document.getElementById("divRelativeRange");
		oElement.style.visibility = "hidden";
	}
}

function parseDate(sInput)
{
	if( sInput == "" )
	{
		return "";
	}
	else if( sInput.split("/").length != 3 )
	{
		return "";
	}
	else
	{
		var iMonth = parsePositiveInteger(sInput.split("/")[0]);
		var iDay = parsePositiveInteger(sInput.split("/")[1]);
		var iYear = parsePositiveInteger(sInput.split("/")[2]);
		if( iYear < 100 && iYear >= 0 )
		{
		    iYear += 2000;
		}
		if( iMonth < 1 || iMonth > 12 || iDay < 1 || iYear < 1 )
		{
			return "";
		}
		else if( iDay > parsePositiveInteger("31,29,31,30,31,30,31,31,30,31,30,31".split(",")[iMonth - 1]) )
		{
			return "";
		}
		else if( iMonth == 2 && iDay == 29 && !(((iYear % 4 == 0) && (iYear % 100 != 0)) || (iYear % 400 == 0)) )
		{
			return "";
		}
		else
		{
			return sInput;
		}
	}
}

function parsePositiveInteger(sInput)
{
	//Initialize good number flag
	if( sInput == "" )
	{
		return -1;
	}
	else
	{
		var iNumber = parseInt(sInput);
		if( isNaN(iNumber) )
		{
			return -1;
		}
		else if( iNumber < 0 )
		{
			return -1;
		}
		else
		{
			return iNumber;
		}
	}
}


//Return true if current date type allows a relative date range
function allowRelative()
{
	var bAllow = false;
	var oRelatedControl = document.getElementById("ddDateType");
	var sRelatedValue = oRelatedControl.value;
	for( var iLoop in sDateTypeArray )
	{
		if( sDateTypeArray[iLoop] == sRelatedValue && sAllowRangeArray[iLoop].toUpperCase() == "TRUE" )
		{
			bAllow = true;
		}
	}
	return bAllow;
}

//Return true if there is a current date type
function allowAbsolute()
{
	var bAllow = false;
	var oRelatedControl = document.getElementById("ddDateType");
	var sRelatedValue = oRelatedControl.value;
	if( sRelatedValue != "")
		{
			bAllow = true;
		}
	return bAllow;
}

function processChange(oControl)
{
	if( arguments.length < 1 || !oControl )
	{
		oControl = this;
	}

	var oElement;				//Declared early for scoping purposes
	var iDays;
	var oDate;
	var oRelatedControl;
	var sRelatedValue;
	var sRange;

	switch(getBaseName(oControl))	//Post criteria as completed
	{								//else en/disable fields as necessary
		case "ddDateType" :
			resetForm();
			oElement = document.getElementById("rbSpecificRange");
			oElement.checked = true;
			processChange(oElement);
			break;
		case "rbRelativeRange" :
			if( allowRelative() )
			{
				resetForm();
				oControl.checked = true;
				oElement = document.getElementById("tbDays");
				oElement.removeAttribute("disabled");
				oElement.style.background = "white";

				//Allow user to click date-relative-to-what button
				oElement = document.getElementById("rbToday");
				oElement.removeAttribute("disabled");

				oElement = document.getElementById("rbYesterday");
				oElement.removeAttribute("disabled");

				oElement = document.getElementById("rbTomorrow");
				oElement.removeAttribute("disabled");

				oElement = document.getElementById("rbDaysAgo");
				oElement.removeAttribute("disabled");

				oElement = document.getElementById("rbDaysFromNow");
				oElement.removeAttribute("disabled");
			}
			else
			{
				oControl.checked = false;
				oElement = document.getElementById("rbSpecificRange");
				oElement.checked = true;
				alert('A relative date range cannot be specified for this date type');
			}
			break;
		case "rbSpecificRange" :
			resetForm();
			oControl.checked = true;
			oElement = document.getElementById("dtFrom");
			oElement.removeAttribute("disabled");
			oElement.style.background = "white";
			oElement = document.getElementById("dtThrough");
			oElement.removeAttribute("disabled");
			oElement.style.background = "white";
			break;
		case "tbDays" :
			iDays = parsePositiveInteger(oControl.value);
			if( iDays > 0 )
			{
				oControl.value = iDays;
			}
			else
			{
				oControl.value = "";
			}
			break;
		case "rbToday" :
			sRange = formatRange(0);
			if( sRange != "" )
			{
				oParent.addCriteria(oControl, sRange);
			}
			resetForm();
			break;
		case "rbYesterday" :
			sRange = formatRange(-1);
			if( sRange != "" )
			{
				oParent.addCriteria(oControl, sRange);
			}
			resetForm();
			break;
		case "rbTomorrow" :
			sRange = formatRange(1);
			if( sRange != "" )
			{
				oParent.addCriteria(oControl, sRange);
			}
			resetForm();
			break;			
		case "rbDaysAgo" :
			oElement = document.getElementById("rbToday");
			oElement.checked = false;
			oElement = document.getElementById("rbYesterday");
			oElement.checked = false;
			oElement = document.getElementById("rbTomorrow");
			oElement.checked = false;
			oElement = document.getElementById("rbDaysFromNow");
			oElement.checked = false;
			oElement = document.getElementById("tbDaysAgo");
			oElement.removeAttribute("disabled");
			oElement.style.background = "white";
			oElement = document.getElementById("tbDaysFromNow");
			oElement.setAttribute("disabled", true);
			oElement.style.background = "silver";
			oElement.value = "";
			break;
		case "tbDaysAgo" :
			iDays = parsePositiveInteger(oControl.value);
			if( iDays > 0 )
			{
				sRange = formatRange(0 - iDays);
				if( sRange != "" )
				{
					oParent.addCriteria(oControl, sRange);
				}
				resetForm();
			}
			else
			{
				oControl.value = ""
			}
			break;
		case "rbDaysFromNow" :
			oElement = document.getElementById("rbToday");
			oElement.checked = false;
			oElement = document.getElementById("rbYesterday");
			oElement.checked = false;
			oElement = document.getElementById("rbTomorrow");
			oElement.checked = false;
			oElement = document.getElementById("rbDaysAgo");
			oElement.checked = false;
			oElement = document.getElementById("tbDaysAgo");
			oElement.setAttribute("disabled", true);
			oElement.style.background = "silver";
			oElement.value = "";
			oElement = document.getElementById("tbDaysFromNow");
			oElement.removeAttribute("disabled");
			oElement.style.background = "white";
			break;
		case "tbDaysFromNow" :
			iDays = parsePositiveInteger(oControl.value);
			if( iDays > 0 )
			{
				sRange = formatRange(iDays);
				if( sRange != "" )
				{
					oParent.addCriteria(oControl, sRange);
				}
				resetForm();
			}
			else
			{
				oControl.value = ""
			}
			break;
		case "dtFrom" :
			oControl.value = parseDate(oControl.value);
			if( oControl.value != "" )
			{
				oRelatedControl = document.getElementById("dtThrough");
				sRelatedValue = oRelatedControl.value;				
				oParent.addCriteria(oControl, oControl.value);
				oControl.value = "";
				if( sRelatedValue != "" )
				{
					oParent.addCriteria(oRelatedControl, oRelatedControl.value);
					oRelatedControl.value = "";

				}
			}
			break;
		case "dtThrough" :
			oControl.value = parseDate(oControl.value);
			if( oControl.value != "" )
			{
				oRelatedControl = document.getElementById("dtFrom");
				sRelatedValue = oRelatedControl.value;				
				oParent.addCriteria(oControl, oControl.value);
				oControl.value = "";
				if( sRelatedValue != "" )
				{
					oParent.addCriteria(oRelatedControl, oRelatedControl.value);
					oRelatedControl.value = "";
				}
			}
			break;
	}
}

function formatRange(iOffset)
{
	var sDays = document.getElementById("tbDays").value;
	if( sDays == "" )
	{
		return "";
	}
	{
		var sReturn = "Today";
		if( iOffset < 0 )
		{
			sReturn = sReturn + " - " + Math.abs(iOffset) + " days";
		}
		else if( iOffset > 0 )
		{
			sReturn = sReturn + " + " + iOffset + " days";
		}
		return sReturn + " for " + sDays + " days";
	}
}

var oParent;
function doLoad()
{
	try{
	//Set pointer object to parent
	oParent = this.parent;	

	//Add specific listeners for event handlers as necessary
	var oDateTypeDropDown = document.getElementById("ddDateType");
	oDateTypeDropDown.onchange = function(){ processChange(oDateTypeDropDown); };
	var oRelativeRangeRadioButton = document.getElementById("rbRelativeRange");
	oRelativeRangeRadioButton.onclick = function(){ processChange(oRelativeRangeRadioButton); };
	var oSpecificRangeRadioButton = document.getElementById("rbSpecificRange");
	oSpecificRangeRadioButton.onclick = function(){ processChange(oSpecificRangeRadioButton); };
	var oDaysTextBox = document.getElementById("tbDays");
	oDaysTextBox.onchange = function(){ processChange(oDaysTextBox); };
	var oDaysAgoTextBox = document.getElementById("tbDaysAgo");
	oDaysAgoTextBox.onchange = function(){ processChange(oDaysAgoTextBox); };
	var oDaysFromNowTextBox = document.getElementById("tbDaysFromNow");
	oDaysFromNowTextBox.onchange = function(){ processChange(oDaysFromNowTextBox); };
	var oTodayRadioButton = document.getElementById("rbToday");
	oTodayRadioButton.onclick = function(){ processChange(oTodayRadioButton); };
	var oYesterdayRadioButton = document.getElementById("rbYesterday");
	oYesterdayRadioButton.onclick = function(){ processChange(oYesterdayRadioButton); };
	var oTomorrowRadioButton = document.getElementById("rbTomorrow");
	oTomorrowRadioButton.onclick = function(){ processChange(oTomorrowRadioButton); };
	var oDaysAgoRadioButton = document.getElementById("rbDaysAgo");
	oDaysAgoRadioButton.onclick = function(){ processChange(oDaysAgoRadioButton); };
	var oDaysFromNowRadioButton = document.getElementById("rbDaysFromNow");
	oDaysFromNowRadioButton.onclick = function(){ processChange(oDaysFromNowRadioButton); };
	var oFromDate = document.getElementById("dtFrom");
	var oFromOriginalOnBlur = oFromDate.onblur;
	oFromDate.onblur = function(){ oFromOriginalOnBlur(); processChange(oFromDate); }
	var oThroughDate = document.getElementById("dtThrough");
	var oThroughOriginalOnBlur = oThroughDate.onblur;
	oThroughDate.onblur = function(){ oThroughOriginalOnBlur(); processChange(oThroughDate); }

	//Set a point to the parent window and setup 
	//dropdown for available date types
	var oNewOpt;

	//Add a blank line
	oNewOpt = new Option();
	oNewOpt.text = "";
	oNewOpt.value = "";
	oDateTypeDropDown.options[oDateTypeDropDown.options.length] = oNewOpt;

	for( var iLoop in sDateTypeArray )
	{
		oNewOpt = new Option();
		oNewOpt.text = sDateTypeArray[iLoop].replace(/_/g, "'");
		oNewOpt.value = sDateTypeArray[iLoop];
		oDateTypeDropDown.options[oDateTypeDropDown.options.length] = oNewOpt;
	}

	//Setup control display attributes, disable 
	//the ones not available for initial entry (same as when
	//we do a form reset)
	resetForm();

	//Default to specific range
	oSpecificRangeRadioButton.checked = true;
	processChange(oSpecificRangeRadioButton);
	} catch(e){}
}

function checkDates()
{
	//BEFORE clearing, see if there are any unposted
	//absolute date criteria (calendar popup doesn't register
	//an event)
	oElement = document.getElementById("rbSpecificRange");
	if( oElement.checked )
	{
		processChange(document.getElementById("dtFrom"));
		processChange(document.getElementById("dtThrough"));
	}
}

//Standard instructions popup hyperlink (arg specifies
//help page)

function popupInstructions(sArg)
{
	var sURL = "../MCCM/InstructionsPopUp.aspx" + "?Type=HelpFile&URL=" + sArg;
	var oInstruct = window.open(sURL, "Instruct", "width=450,height=450,resizable=yes,status=yes", true);
	oInstruct.focus();
}
