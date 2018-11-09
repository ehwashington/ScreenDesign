function BaseGridAddSortLinkEvents(oFrame, oDiv, oGrid)
{
	//Look for header row to add events to any sort links
	if( oGrid.rows && oGrid.rows.length > 1 && oGrid.rows[0].cells && oGrid.rows[0].cells.length > 0 )
	{
		for( var iCell = 0; iCell < oGrid.rows[0].cells.length; iCell++ )
		{
			if( oGrid.rows[0].cells[iCell].children && oGrid.rows[0].cells[iCell].children.length > 0 )
			{
				for( var iChild = 0; iChild < oGrid.rows[0].cells[iCell].children.length; iChild++ )
				{
					var oChild = oGrid.rows[0].cells[iCell].children[iChild];
					if( oChild.tagName.toLowerCase() == 'span' )
					{
						oChild.onmousedown = 
							function()
								{ 
									if( oDiv.__IsExpanded && !oDiv.__CurrentBlur )
									{
										oDiv.__CurrentBlur = oDiv.onblur;
									}
									if( oDiv.__IsExpanded )
									{
										oDiv.onblur = null;
									}
								};
						oChild.onmouseout = 
							function()
								{ 
									if( oDiv.__IsExpanded && oDiv.__CurrentBlur )
									{
										oDiv.onblur = oDiv.__CurrentBlur;
										oDiv.__CurrentBlur = null;
										oDiv.focus();
									}
								};
						oChild.onclick = 
							function()
								{ 
									if( oDiv.__IsExpanded && oDiv.__CurrentBlur )
									{
										setTimeout(oChild.onmouseout, 30);
									}
								};
					}
				}		
			}
		}		
	}
	
	//Do the same type of thing for filter button
	var oFilter = oFrame.document.getElementById(oGrid.id + "_Filter_Anchor");
	if( oFilter )
	{
		oFilter.onmousedown = 
			function()
				{ 
					if( oDiv.__IsExpanded && !oDiv.__CurrentBlur )
					{
						oDiv.__CurrentBlur = oDiv.onblur;
					}
					if( oDiv.__IsExpanded )
					{
						oDiv.onblur = null;
					}
				}
		oFilter.onclick = oFilter.onmouseout = 
			function()
				{ 
					if( oDiv.__IsExpanded && oDiv.__CurrentBlur )
					{
						oDiv.onblur = oDiv.__CurrentBlur;
						oDiv.__CurrentBlur = null;
					}
				}
	}
}

function FilterGrid(oFrame, oGrid, iFilterPopupWidth, iFilterPopupHeight)
{
	//Determine frame where grid is located and let the 
	//target frame be the outermost frame in that browser
	var oTargetFrame = oFrame.top;
	if( oTargetFrame == AppRoot.top )
	{
		oTargetFrame = AppRoot.AppMainFrame;
	}

	//Determine the opening position of the filter:  the basic idea is to attempt to
	//put to the left of the datagrid and just below the level of the filter icon, 
	//to the extent possible, else to the right, else centered horizontally, or 
	//altogether centered if all else fails
	var oGridPosition = [0,0];
	var oControl = oGrid;
	var oParentFrame = oFrame;
	while( oControl )
	{
		oGridPosition = AddPositionOffset(oGridPosition, GetPosition(oControl, false));
		oControl = null;
		if( oParentFrame != oTargetFrame && 
			oParentFrame.name && 
			oParentFrame.parent && 
			oParentFrame.parent != oParentFrame )
		{
			oControl = oParentFrame.parent.document.getElementById(oParentFrame.name);
			oParentFrame = oParentFrame.parent;
		}
	}
	if( oGridPosition[0] > (iFilterPopupWidth + 11) )
	{
		oGridPosition[0] = oGridPosition[0] - (iFilterPopupWidth + 11);
	}
	else if( GetFrameWidth(oTargetFrame) - oGridPosition[0] - oGrid.clientWidth > (iFilterPopupWidth + 11) )
	{
		oGridPosition[0] = oGridPosition[0] + oGrid.clientWidth + 10;
	} 
	else
	{
		oGridPosition[0] = (GetFrameWidth(oTargetFrame) - iFilterPopupWidth)/2;
	}
	if( GetFrameHeight(oTargetFrame) - oGridPosition[1] > (iFilterPopupHeight + 25) )
	{
		oGridPosition[1] = oGridPosition[1] + 25;
	}
	else
	{
		oGridPosition[1] = (GetFrameHeight(oTargetFrame) - iFilterPopupHeight)/2;
	}
	
	//Popup the filter overlay
	OpenFramePopup(
		oTargetFrame, 'PopupGridFilter.aspx', '',
		'GetData?Grid=' + oGrid.id + '&GridFrame=' + oFrame.AppFrameId.toString(), iFilterPopupWidth, iFilterPopupHeight, 
		'overlay=true,opacity=25,title=true,resizable=yes,toolbar=yes,border=2' + 
			',left=' + oGridPosition[0].toString() + ',top=' + oGridPosition[1].toString() + 
			',owner=' + oFrame.AppFrameId + ',exitfunction=CloseFilter');
}

function ResizeGrid(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	var oGridDiv = AppRoot.GetPointer(iAppFrameId, oChildExpand.Id + "_GridDiv");
	if( !oGridDiv.__AutoExpand )
	{
		oGridDiv.__AutoExpand = oChildExpand;
		oChildExpand.GridDivNormalWidth = parseInt(oGridDiv.style.width,10);
		oChildExpand.GridDivNormalHeight = 
			(oGridDiv.__OriginalHeight ? oGridDiv.__OriginalHeight : parseInt(oGridDiv.style.height,10));
		oChildExpand.GridNormalWidth = parseInt(oControl.style.width,10);
		oGridDiv.__Sizer = AppRoot.GetPointer(iAppFrameId, oChildExpand.Id + "_Sizer");
		if( oGridDiv.__Sizer )
		{
			oChildExpand.SizerNormalLeft = parseInt(oGridDiv.__Sizer.style.left,10);
		}
	}

	if( oChildExpand.GridDivNormalWidth ) oGridDiv.style.width = (oChildExpand.GridDivNormalWidth + iStretchWidth) + 'px';
	if( oChildExpand.GridNormalWidth ) oControl.style.width = (oChildExpand.GridNormalWidth + iStretchWidth) + 'px';
	if( oChildExpand.GridDivNormalHeight )
	{
		oGridDiv.style.height = 
			(((oGridDiv.__IsExpanded && oGridDiv.__ExpandedHeight) 
				    ? oGridDiv.__ExpandedHeight : oChildExpand.GridDivNormalHeight) + 
			 iStretchHeight) + 'px';
	}
	if( oChildExpand.SizerNormalLeft ) oGridDiv.__Sizer.style.left = (oChildExpand.SizerNormalLeft + iStretchWidth) + 'px';
	
	//Adjust grid so that upon resizing it adjusts grid expansion
	if( oGridDiv.__IsExpanded )
	{
		if( parseInt(oGridDiv.style.height,10) <= (oChildExpand.GridDivNormalHeight + iStretchHeight) )
		{
			BaseGridContract(AppCurrentFrames.Item[iAppFrameId].Frame, oChildExpand.Id);
		}
	}
	if( oControl.clientHeight > (oChildExpand.GridDivNormalHeight + iStretchHeight) )
	{
		oGridDiv.__Sizer.style.display = "";
	}
	else
	{
		oGridDiv.__Sizer.style.display = "none";
	}
}

function BaseGridExpand(oFrame, sBaseName, iOriginalHeight, iExpandedHeight)
{
	var oDiv = oFrame.document.getElementById(sBaseName + "_GridDiv");
	var iHeightChange = ( oDiv.__AutoExpand && oDiv.__AutoExpand.ChangeInHeight ) ? oDiv.__AutoExpand.ChangeInHeight : 0;
	if( !oDiv.__OriginalHeight ) oDiv.__OriginalHeight = iOriginalHeight;
	if( !oDiv.__ExpandedHeight ) oDiv.__ExpandedHeight = iExpandedHeight;
	if( parseInt(oDiv.style.height,10) <= (oDiv.__OriginalHeight + iHeightChange) )
	{
		//Grab the grid
		var oGrid = oFrame.document.getElementById(sBaseName);

		oDiv.style.height = Math.min(iExpandedHeight + iHeightChange, oGrid.clientHeight + 5) + "px";
		oDiv.parentElement.style.zIndex = 999;
		oFrame.document.getElementById(sBaseName + "_Sizer").src = "Images/UpGrid.gif";
		oDiv.__OriginalOnBlur = oDiv.onblur;
		oFrame.setTimeout(function(){ 
			oDiv.focus();
			oDiv.onblur = function(){ oDiv.__Contract = oFrame.setTimeout(function(){ 
				AppRoot.BaseGridContract(oFrame, sBaseName); },175); }; },30);

		//Loop through any sortable columns and add events
		BaseGridAddSortLinkEvents(oFrame, oDiv, oGrid);
		oDiv.__IsExpanded = true;
        if( !AppRoot.IsIE || AppRoot.IsHTML5 )
        {
            oFrame.setTimeout(function(){ oGrid.onmouseup = function(){ oFrame.setTimeout(function(){ BaseGridContract(oFrame, sBaseName); }, 50); }; }, 200);
        }
	}
    else if( !AppRoot.IsIE || AppRoot.IsHTML5 )
    {
        BaseGridContract(oFrame, sBaseName);
    }
}

function BaseGridContract(oFrame, sBaseName)
{
	var oDiv = oFrame.document.getElementById(sBaseName + "_GridDiv");
    if( !AppRoot.IsIE || AppRoot.IsHTML5 ) oFrame.document.getElementById(sBaseName).onmouseup = null;
	oDiv.__Contract = null;
	oDiv.__IsExpanded = false;
	var iHeightChange = ( oDiv.__AutoExpand && oDiv.__AutoExpand.ChangeInHeight ) ? oDiv.__AutoExpand.ChangeInHeight : 0;
	if( parseInt(oDiv.style.height,10) > (oDiv.__OriginalHeight + iHeightChange) )
	{
		if( oDiv.__OriginalOnBlur )
		{
			oDiv.__OriginalOnBlur();
		}
		oDiv.onblur = oDiv.__OriginalOnBlur;
		oDiv.style.height = (oDiv.__OriginalHeight + iHeightChange) + 'px';
		oDiv.parentElement.style.zIndex = 0;
		oFrame.document.getElementById(sBaseName + "_Sizer").src = "Images/DownGrid.gif";
	}
}

function BaseGridLoad(oFrame, sGridClientID, iTotalGridHeight, bExpandable, sHTML, iMatchesLeft, iMatchesRight, bMinimizeHeight, iTotalGridWidth, bMinimizeWidth)
{
	var oGridDiv = oFrame.document.getElementById(sGridClientID + "_GridDiv");
    if( oGridDiv.__MaxHeight && oGridDiv.clientHeight < oGridDiv.__MaxHeight ) oGridDiv.style.height = oGridDiv.__MaxHeight + 'px';
    if( oGridDiv.__MaxWidth && oGridDiv.clientWidth < oGridDiv.__MaxWidth ) oGridDiv.style.width = oGridDiv.__MaxWidth + 'px';
    if( arguments.length > 7 && bMinimizeHeight && !oGridDiv.__MaxHeight && iTotalGridHeight && iTotalGridHeight > 0 ) oGridDiv.__MaxHeight = parseInt(oGridDiv.style.height, 10);
    if( arguments.length > 9 && bMinimizeWidth && !oGridDiv.__MaxWidth && iTotalGridWidth && iTotalGridWidth > 0 ) oGridDiv.__MaxWidth = parseInt(oGridDiv.style.width);

    var sFocusElementId = (oFrame.document.activeElement ? oFrame.document.activeElement.id : '');
	if( iTotalGridHeight > 0 )	//Following block masks dhtml loss of grid height (possibly a bug)
	{
		if( bExpandable && oGridDiv.__IsExpanded)
		{
			oGridDiv.style.height = (oGridDiv.__ExpandedHeight + 
				((oGridDiv.__AutoExpand && oGridDiv.__AutoExpand.ChangeInHeight) ? oGridDiv.__AutoExpand.ChangeInHeight : 0)) + 
				'px';
		}
		else
		{
			oGridDiv.style.height = (iTotalGridHeight + 
				((oGridDiv.__AutoExpand && oGridDiv.__AutoExpand.ChangeInHeight) ? oGridDiv.__AutoExpand.ChangeInHeight : 0)) + 
				'px';
		}
	}
	var oGrid = GetPointer(oFrame.AppFrameId, sGridClientID);
	var sGridWidth = oGrid.style.width;
	if( arguments.length > 4 && iMatchesLeft > 0 && oGridDiv.lastHTML )
	{
		sHTML = oGridDiv.lastHTML.substr(0, iMatchesLeft) + sHTML;
	}
	if( arguments.length > 5 && iMatchesRight > 0 && oGridDiv.lastHTML )
	{
		sHTML = sHTML + oGridDiv.lastHTML.substr(oGridDiv.lastHTML.length - iMatchesRight);
	}
	oGridDiv.lastHTML = sHTML;
	oGridDiv.innerHTML = oGridDiv.lastHTML;
	oGridDiv.scrollTop = oGridDiv.scrollHeight;
	oGridDiv.scrollTop = 0;

	ResetPointer(oFrame.AppFrameId, sGridClientID);
	oGrid = GetPointer(oFrame.AppFrameId, sGridClientID);
	oGrid.style.width = sGridWidth;
	
	if( bExpandable )
	{
	    var iHeightChange = (oGridDiv.__AutoExpand && oGridDiv.__AutoExpand.ChangeInHeight) ? oGridDiv.__AutoExpand.ChangeInHeight : 0;
		if( oGridDiv.__IsExpanded )
		{
			oGridDiv.style.height = Math.min(oGridDiv.__ExpandedHeight + iHeightChange, oGrid.clientHeight + 5) + "px";
			BaseGridAddSortLinkEvents(oFrame, oGridDiv, oGrid);
			oGridDiv.focus();
		}

		var oSizer = oFrame.document.getElementById(sGridClientID + "_Sizer");
		var iContractedGridSize;
		if( oGridDiv.__OriginalHeight )
		{
			iContractedGridSize = oGridDiv.__OriginalHeight + iHeightChange;
		}
		else
		{
			iContractedGridSize = oGridDiv.clientHeight;
		}
		if( oGrid.clientHeight > iContractedGridSize )
		{
			oSizer.style.display = "";
		}
		else
		{
			oSizer.style.display = "none";
			if( oGridDiv.__IsExpanded )
			{
				BaseGridContract(oFrame, sGridClientID);
			}
		}
	}

    if( oGridDiv.__MaxHeight && oGrid.clientHeight + 10 < oGridDiv.__MaxHeight ) oGridDiv.style.height = (oGrid.clientHeight + 10) + 'px';
    if( oGridDiv.__MaxWidth && oGrid.clientWidth + 25 < oGridDiv.__MaxWidth ) oGridDiv.style.width = (oGrid.clientWidth + 25) + 'px';

    //If focus element id corresponds to an actual element upon grid replace then return focus
    if( sFocusElementId )
    {
        var oFocusElement = oFrame.document.getElementById(sFocusElementId);
        if( oFocusElement && oFocusElement != oFrame.document.activeElement )
        {
            oFocusElement.focus();
            if( oFocusElement.select ) oFocusElement.select();
        }
    }
}

//Sets a given radio button group
function SetRadioGroupInput(oFrame, sGroupName, sValue)
{
	//Loop through all component radio buttons and look the one that
	//matches the input value, and check it (which automatically unchecks the
	//others) -- as we go uncheck any that don't match so that if none match
	//at least we've unchecked them all.
	var oComponentRadioButtons = oFrame.document.getElementsByName(sGroupName);
	for(var iComponentRadioButton = 0; 
			iComponentRadioButton < oComponentRadioButtons.length; 
			iComponentRadioButton ++)
	{
		if( oComponentRadioButtons[iComponentRadioButton].tagName.toUpperCase() != "TABLE" )
		{
			if( oComponentRadioButtons[iComponentRadioButton].value == sValue )
			{
				oComponentRadioButtons[iComponentRadioButton].checked = true;
				break;
			}
			else
			{
				oComponentRadioButtons[iComponentRadioButton].checked = false;
			}
		}
	}
}

//Sets a given list box
function SetListBox(oFrame, sListBoxID, sSelectedValues, sDelimiter)
{
	//Convert values into an object that indexes them for us by value
	var oSelectedValuesHash;
	if( IsEmpty(sSelectedValues) )
	{
		oSelectedValuesHash = new Object();
	}
	else
	{
		oSelectedValuesHash = GetArrayHash(sSelectedValues.split(sDelimiter));
	}

	//Loop through all listbox options and leave selected 
	//those and only those indicated as selected values
	var oListBox = oFrame.document.getElementById(sListBoxID);
	for(var iOption = 0; iOption < oListBox.length; iOption ++)
	{
		var oListBoxOption = oListBox.options[iOption];
		if( oSelectedValuesHash.propertyIsEnumerable(oListBoxOption.value) )
		{
			oListBoxOption.selected = true;
		}
		else
		{
			oListBoxOption.selected = false;
		}
	}
}
function GetArrayHash(oArray)
{
	var oHash = new Object();
	if( oArray.length > 0 )
	{
		for( var iValue in oArray )
		{
			oHash[oArray[iValue]] = null;
		}
	}
	return oHash;
}

//setup tooltip to display dynamic contents of the control or default tooltip overrides on mouseover.
function SetupTooltip(oControl)
{
	oControl.onmouseover = 
		function()
			{ 
				if( !this.title || this.title == '' || this.__IsValueTooltip )
				{
					this.title = this.value;
					this.__IsValueTooltip = true;
				}
			};
		
	var oOriginalMouseout = oControl.onmouseout;
	oControl.onmouseout = 
		function()
			{ 
				if( this.__IsValueTooltip )
				{
                    this.removeAttribute('title');
		            try{ delete this.title; } catch(e){}
					this.__IsValueTooltip = false;
				}
				if( oOriginalMouseout )
				{
					oOriginalMouseout();
				}
			};

	oControl.onmouseover.call(oControl);
}


//Affirmation handling
function Affirm(iFrameId, sControlID, sAffirmation)
{
    try
    {
	    var oControl = GetPointer(iFrameId, sControlID);
	    var sTitle = oControl.title;
	    oControl.title = window.status = sAffirmation;
	    AppCurrentFrames.Item[iFrameId].Frame.setTimeout(function(){ try{ window.status = ''; oControl.title = sTitle; } catch(e){} }, 2000);
    }
    catch(e){} 
}

//Message handling
var ActiveMessageFrame = null;
var ActiveMessageBox = null;
var ActiveMessages = null;
var ActiveMessageStickpinImage = null;
var ActiveMessageStick = false;
function SetMessages(oFrame, sMessagesXML)
{
	//Create a new xml doc and load it with the messages XML
	var xmlMessages;
	if( AppRoot.IsIE && !AppRoot.IsHTML5 )
	{
		xmlMessages = new ActiveXObject("Microsoft.XMLDOM");
	    xmlMessages.onreadystatechange = 
		    function()
		    {
			    if( xmlMessages.readyState == 4 )
			    {
				    IssueMessages(oFrame, xmlMessages);
			    }
		    }
	    xmlMessages.loadXML(sMessagesXML);
	}
	else
	{
		var oXMLParser = new DOMParser();
		xmlMessages = oXMLParser.parseFromString(sMessagesXML,"text/xml");
        IssueMessages(oFrame, xmlMessages);
	}
}
function IssueMessages(oFrame, xmlMessages)
{
	//Get all the messages (which are errors, warnings, or basic info messages)
	var oErrors = xmlMessages.getElementsByTagName("error");
	var oWarnings = xmlMessages.getElementsByTagName("warning");
	var oMessages = xmlMessages.getElementsByTagName("message");

	//If there are any messages, continue
	if( oErrors.length > 0 || oWarnings.length > 0 || oMessages.length > 0 )
	{
		//Reset any existing messages first
		ResetMessages();

		//Set a pointer to the message box and the div tag with the messages
		ActiveMessageFrame = oFrame;
		ActiveMessageBox = oFrame.document.getElementById("__divMessageBox");
		ActiveMessages = oFrame.document.getElementById("__divMessages");
		ActiveMessageStickpinImage = oFrame.document.getElementById("__divMessagePin");
		ActiveMessageStickpinImage.src = "Images/Unstick.gif";
		
		//Create table html to display messages, and a few helpful work strings
		var sMessagesHTML = "<table>";
		var sRowStart = "<tr><td width='25px' align='center' valign='top' style='PADDING-TOP: 1px'>";
		var sMsgColStart = "<td align='left' valign='top'>";
				
		//Loop through all the errors
		for( var iError = 0; iError < oErrors.length; iError++ )
		{
			//Setup new row -- with error symbol
			sMessagesHTML += sRowStart + "<img src='Images/error.gif'></td>" + 
							 sMsgColStart + "<b>" + oErrors[iError].firstChild.data + "</b></td>";
		}

		//Loop through all the errors
		for( var iWarn = 0; iWarn < oWarnings.length; iWarn++ )
		{
			//Setup new row -- with error symbol
			sMessagesHTML += sRowStart + "<img src='Images/warning.gif'></td>" + 
							 sMsgColStart + "<b>" + oWarnings[iWarn].firstChild.data + "</b></td>";
		}

		//Loop through all the errors
		for( var iMsg = 0; iMsg < oMessages.length; iMsg++ )
		{
			//Setup new row -- with error symbol
			sMessagesHTML += sRowStart + "</td>" +
							 sMsgColStart + "<b>" + oMessages[iMsg].firstChild.data + "</b></td>";
		}
		
		//Close the table html
		sMessagesHTML += "</table>";
				
		//Set the messages, make the message box visible, and cause it to
		//disappear whenever the message box loses focus
		ActiveMessages.innerHTML = sMessagesHTML;
		ActiveMessageBox.style.visibility = "visible";
		setTimeout(function(){ try{ ActiveMessageBox.focus(); ActiveMessageBox.onblur = ResetMessages; } catch(e){} }, 250);
	}
}
function StickMessages()
{
	if( ActiveMessageStick )
	{
		ActiveMessageBox.focus();
		ActiveMessageBox.onblur = null;
		ActiveMessageStickpinImage.src = "Images/Unstick.gif";
		ActiveMessageStick = false;
	}
	else
	{
		ActiveMessageBox.focus();
		ActiveMessageBox.onblur = ResetMessages;
		ActiveMessageStickpinImage.src = "Images/Stick.gif";
		ActiveMessageStick = true;
	}
}
function SetOnBlurMessages()
{
	if( ActiveMessageStick )
	{
		ActiveMessageBox.onblur = null;
	}
	else
	{
		ActiveMessageBox.onblur = ResetMessages;
	}
}
function ResetMessages()
{
	//If there's an active mesage box clear the messages and hide the message box
	if( ActiveMessageFrame !== null && !IsFrameClosed(ActiveMessageFrame) )
	{
		try
		{
			ActiveMessageBox.style.visibility = "hidden";
			ActiveMessages.innerHTML = "";
			ActiveMessageBox.onblur = null;
		}
		catch(e){ }
	}

	//Clear message related pointers regardless
	ActiveMessageFrame = null; 
	ActiveMessageBox = null;
	ActiveMessages = null;
	ActiveMessageStickpinImage = null;
	ActiveMessageStick = false;
}
