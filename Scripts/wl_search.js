//Shared JavaScript Library for WorkList Searchs


//Reset worklist that opened search
function resetParent()
{
	//Get the URL of the Work List that opened the search
	sWlURL = window.top.AppRoot.AppMainFrame.frameClassic.location.toString();

	//if( sWlURL.search(/SHIFT=Yes/i) < 0 )
	//{
		//Refresh worklist frame
		//this.opener.location.replace(sWlURL);
        window.document.body.onload = null;
        window.document.body.style.visibility = "hidden";
        window.top.AppRoot.AppMainFrame.frameClassic.location.replace(sWlURL.split('?')[0]);
        setTimeout(exitToParent,0);
	//}
	//else
	//{
		//If opened with SHIFT option set (which prevents
		//the worklist dataset from populating), need to reset
		//not just frame but whole browser window without option
		//sWlURL =  this.opener.parent.location.toString();
		//this.opener.parent.location.replace(sWlURL.replace(/SHIFT=Yes/i,"SHIFT=No"));
	//}

	//Either way exit to parent
	//exitToParent();
}

//Exit to opening browser
function exitToParent()
{
	//this.opener.parent.focus();
    window.document.body.onload = null;
    window.top.AppRoot.CloseFrame(window);
}

//Process change (most generic onchange handler)

function processChange()
{
	addCriteria(this, this.value);
}

//Process picklist (non-null) selection (called on doc focus
//for each control that might be populated by standard search)


function processPick(oElement)
{
	if( oElement.value.length > 0 )
	{
		addCriteria(oElement);
		oElement.value = "";
	}
}


//Process wildcard entry (on change for wildcard field)

function processWildcard()
{
	if( this.value.length > 0)
	{
		if( this.value.substr(this.value.length - 1,1) == '*' )
		{
			addCriteria(this, this.value);
		}
		else
		{
			addCriteria(this, this.value + '*');
		}
	}
}


function processTextfield()
{
	if( this.value.length > 0)
	{
		addCriteria(this, this.value);
	}
}


// Process click (on click for checkbox)
 
function processClickCheckbox()
{
	this.checked = false;
	addCriteria(this, "");
}


// Change logical join (and/or) for a selected criterion

function alterJoin()
{
	//Get and/or element and new value
	var oElement = document.getElementById("ddJoin");
	var sSelectedValue = oElement.value;
	if( sSelectedValue == " " )   //had to coax change event along
	{
		sSelectedValue = "";
	}
	
	//Clear the value
	oElement.value = "";
	oElement.selectedIndex = -1;

	//Selection only applies to a current line
	var iCurrent = oSearch.selectedIndex;
	if(iCurrent < 0)
	{
		msgNoCurrentLine();
	}
	else if( iCurrent == oSearch.options.length - 1 && sSelectedValue.length > 0 )
	{
		alert('Last line may not end with an And/Or');
	}
	else if( iCurrent < oSearch.options.length - 1 && sSelectedValue.length == 0 )
	{
		alert('All lines but the last must end with an And/Or');
	}
	else
	{
		parseCondition(iCurrent);
		if( sSelectedValue == "")
		{
			sJoin = "";
		}
		else
		{
			sJoin = ' ' + sSelectedValue;
		}
		replaceCondition(iCurrent);
	}
}


//Process change (in state at least) to dbCombo control

function processCombo()
{
	//Determine which control fired this event
	var oControl = this;
	
	//Change in hospital clears or saved search clears
	//everything; anything else adds a condition (normally)
	if(getBaseName(oControl) == "comboSavedSearch")
	{
		//clearInputs();	// --> Auto post back now occurs
	}
	else if( DbComboGetValue(getBaseName(oControl)) != '' )
	{
		if(getBaseName(oControl) == "comboFacility")
		{
			addCriteria(oControl, DbComboGetValue(getBaseName(oControl))); // --> Auto post back now occurs
		}
		else
		{ 
			addCriteria(oControl, DbComboGetValue(getBaseName(oControl))); 
			DbComboClear(getBaseName(oControl)); 
		} 
	}
	
	//Peform a good return
	return true;
}


// Change logical operator for selected criterion
var sSelectedOperand = "";
function alterOperand()
{
	//Get and/or element and new value
	var oElement = document.getElementById("ddOperand");
	var sSelectedValue = oElement.value;
	if( sSelectedValue == "EQUAL" )
	{
		sSelectedValue = "=";	//Visual Studio HTML editor kept choking on explicit equal sign
	}
	if( sSelectedValue == " " )   //had to coax change event along
	{
		sSelectedValue = "";
	}
	sSelectedOperand = sSelectedValue; //Communicates selected operand outside of this scope
	
	//Clear the value
	oElement.value = "";
	oElement.selectedIndex = -1;

	//Selection only applies to a current line
	var iCurrent = oSearch.selectedIndex;
	if( iCurrent < 0 )
	{
		msgNoCurrentLine();
	}	
	else if(sSelectedValue.length > 0 )
	{
		parseCondition(iCurrent);
		if( sOperand == "" )
		{
			alert('This search condition does not accept an operand');
		}
		else if( sSelectedValue == "Null" )
		{
			sCriteria = sCriteria.replace(" Range"," Date");
			sOperand = " " + sSelectedValue;
			sCriteriaValue = "";
			if( isValidOperand() ){ replaceCondition(iCurrent); }
		}
		else if( sSelectedValue == "Not" )
		{
			if( sOperand == " Like " || sOperand == " Null" )
			{
				sOperand = " Not" + sOperand;
				if( isValidOperand() ){ replaceCondition(iCurrent); }
			}
			else if( sOperand == " Not Like " || sOperand == " Not Null" )
			{
				sOperand = sOperand.substr(4);
				if( isValidOperand() ){ replaceCondition(iCurrent); }
			}
			else
			{
				alert('The Not toggle applies only to the Like and Null operands');
			}
		}
		else if( sOperand == " Like " || sOperand == " Not Like " )
		{
			alert('Like cannot be used in combination with other operands');
		}
		else if( sOperand == " Null" || sOperand == " Not Null" )
		{
			alert('Only Null and Not Null can apply to a condition without a value');
		}
		else if( sCriteria.search(" Range") >= 0 && sSelectedValue != "=" && sSelectedValue != "<>" )
		{
			alert('This operand does not make sense for a date range');
		}
		else
		{
			sOperand = ' ' + sSelectedValue + ' ';
			if( isValidOperand() ){ replaceCondition(iCurrent); }
		}
	}
}


//Change level of parentheses around search criterion

function scopeCondition(sLeftOrRight)
{
	//Get and/or element and new value
	var oElement = document.getElementById("dd" + sLeftOrRight);
	var sSelectedValue = oElement.value;
	if( sSelectedValue == " " )   //had to coax change event along
	{
		sSelectedValue = "";
	}
	
	//Clear the value
	oElement.value = "";
	oElement.selectedIndex = -1;

	//Selection only applies to a current line
	var iCurrent = oSearch.selectedIndex;
	if( iCurrent < 0 )
	{
		msgNoCurrentLine();
	}	
	else
	{
		parseCondition(iCurrent);
		if( sLeftOrRight == "Left" )
		{
			sLeft = sSelectedValue;
		}
		else
		{
			sRight = sSelectedValue;
		}
		replaceCondition(iCurrent);
	}
}


//Parse the condition into pieces (scoped to be available to all)
var sLeft = "";			//Parentheses on left
var sCriteria = "";		//Criteria label
var sOperand = "";		//Logical operator
var sCriteriaValue = "";	//Value to which comparison is made
var sRight = "";		//Parentheses on right
var sJoin = "";			//Logical connector to next criterion (and/or/blank)
function parseCondition(iCondition)
{
	//Get condition
	var sCondition = oSearch.options[iCondition].text;
	
	//Initialize pieces of condition
	sLeft = "";
	sCriteria = "";
	sOperand = "";
	sCriteriaValue = "";
	sRight = "";
	sJoin = "";
	
	//Strip left parenthesis off condition, if any
	var sTemp = "";
	while(sCondition.length > 0)
	{
		if(sCondition.substr(0,1) != "(")
		{
			break;
		}
		else
		{
			sLeft = sLeft + "(";
			if(sCondition.length > 1)
			{
				sCondition = sCondition.substr(1);
			}
			else
			{
				sCondition = "";
			}
		}
	}

	//Strip And condition if any
	if(sCondition.length > 4)
	{
		sTemp = sCondition.substr(sCondition.length - 4,4);
		if(sTemp.toUpperCase() == " AND")
		{
			sJoin = " And";
			if(sCondition.length > 4)
			{
				sCondition = sCondition.substr(0,sCondition.length - 4);
			}		
			else
			{
				sCondition = "";
			}
		}
	}

	//Strip Or condition if any
	if(sCondition.length > 3 && sJoin == "")
	{
		sTemp = sCondition.substr(sCondition.length - 3,3);
		if(sTemp.toUpperCase() == " OR")
		{
			sJoin = " Or";
			if(sCondition.length > 3)
			{
				sCondition = sCondition.substr(0,sCondition.length - 3);
			}		
			else
			{
				sCondition = "";
			}		
		}
	}

	//Strip right parenthesis off condition, if any
	while(sCondition.length > 0)
	{
		if(sCondition.substr(sCondition.length - 1,1) != ")")
		{
			break;
		}
		else
		{
			sRight = sRight + ")";
			if(sCondition.length > 1)
			{
				sCondition = sCondition.substr(0,sCondition.length - 1);
			}
			else
			{
				sCondition = "";
			}
		}
	}

	//Determine current operator (= first found in string BEFORE any single quote)
	if( sCondition.length > 0)
	{
		var iMinStart = sCondition.indexOf(" '");
		if( iMinStart <= 0)
		{
			iMinStart = sCondition.length;
		}
		var iFind = 0;
		var sOperators = [' Not Null',' Null',' Not Like ',' Like ',' <> ',' <= ',' >= ',' = ',' < ',' > '];
		for( var i = 0 ; i < 10 ; i++ )
		{
			iFind = sCondition.indexOf(sOperators[i]);
			if(iFind >= 0 && iFind < iMinStart)
			{
				iMinStart = iFind;
				sOperand = sOperators[i];
			} 
		}
		if( sOperand.length > 0 )
		{
			if( iMinStart + sOperand.length < sCondition.length )
			{
				sCriteriaValue = sCondition.substr(iMinStart + sOperand.length);
			}
			if( iMinStart > 0)
			{
				sCriteria = sCondition.substr(0,iMinStart);
			}
		}
		else
		{
			sCriteria = sCondition;
		}
	}
}


//Reset the condition specified 

function replaceCondition(iCondition)
{
	//Reset condition
	var sCondition = sLeft + sCriteria + sOperand + sCriteriaValue + sRight + sJoin;
	oSearch.options[iCondition].text = sCondition;
	oSearch.options[iCondition].value = sCondition;
	syncFormData();
}


//Move criterion up or down

function moveCriteria(sUpOrDown)
{
	var iCurrent = oSearch.selectedIndex;
	if(iCurrent >= 0)
	{
		var bResetCurrent = false;
		var iMoveTo = iCurrent;
		if(sUpOrDown == "down")
		{
			iMoveTo += 1;
			if(iMoveTo < oSearch.options.length)
			{
				switchCriteria(iCurrent,iMoveTo);
				bResetCurrent = true;
			}
		}
		else
		{
			iMoveTo -= 1;
			if(iMoveTo >= 0)
			{
				switchCriteria(iCurrent,iMoveTo);
				bResetCurrent = true;
			}
		}

		if(bResetCurrent)
		{
			oSearch.selectedIndex = iMoveTo;
		}	
	}
}


//Switch places for two criterion (preserving logical connector if 
//moving up the last line)

function switchCriteria(iCurrent,iMoveTo)
{
	var sCurrentText = oSearch.options[iCurrent].text;
	var sCurrentValue = oSearch.options[iCurrent].value;
	oSearch.options[iCurrent].text = oSearch.options[iMoveTo].text;
	oSearch.options[iCurrent].value = oSearch.options[iMoveTo].value;
	oSearch.options[iMoveTo].text = sCurrentText;
	oSearch.options[iMoveTo].value = sCurrentValue;
	
	//If we're moving to or form the last line we need 
	//to adjust the And/Or so it stays on the line where it is
	var iLesser = Math.min(iMoveTo,iCurrent);
	var iGreater = Math.max(iMoveTo,iCurrent);
	if(iGreater == oSearch.options.length - 1)
	{
		parseCondition(iGreater);
		var sSaveJoin = sJoin;
		sJoin = "";
		replaceCondition(iGreater);
		parseCondition(iLesser);
		sJoin = sSaveJoin;
		replaceCondition(iLesser);
	}
	syncFormData();
}


//Remove specified criterion

function removeCriteria()
{
	var iSelected = oSearch.selectedIndex;
	var bClearFacility = false;
	if(iSelected >= 0)  // iSelected = -1 if nothing selected
	{
	    //If removing the currently selected facility, also clear the Facility dbcombo
        if (oSearch.options[iSelected].text.length > 12) {
	        var sFacCode = oSearch.options[iSelected].text;
	        sFacCode = sFacCode.replace(/[(]/g, "");
	        if (sFacCode.indexOf("Facility =") == 0) {
	            sFacCode = sFacCode.substr(12);
	            var a2 = sFacCode.indexOf("'");
	            if (a2 > 1) {
	                sFacCode = sFacCode.substr(0, a2);
	                if (sFacCode == DbComboGetValue("comboFacility")) 
                    {
                        bClearFacility = true;
                    }
	            }
	        }
	    }

		//Delete the selected criterion
		oSearch.options[iSelected] = null;

		//If any criteria left, for ease of use
		//make the criterion selected that is nearest
		//in position to the one deleted
		if(oSearch.options.length > 0)
		{
			if(iSelected < oSearch.options.length)
			{
				oSearch.selectedIndex = iSelected;
			}
			else
			{
				iSelected = oSearch.options.length - 1;
				oSearch.selectedIndex = iSelected;
				parseCondition(iSelected);
				sJoin = "";
				replaceCondition(iSelected);
			}
		}
	}
	syncFormData();

    //if removed the current facility criteria, clear the combo and refresh
	if (bClearFacility) {
	    DbComboClear('comboFacility');
	    __doPostBack('comboFacility', '');
	}
}


//Add criterion corresponding to control and optional value provided

var sOperator = ""; 
var sValue = "";
function addCriteria(oControl, sControlValue)
{
	//Determine the criteria to be 
	//added to the listbox
	sOperator = "=";
	if(arguments.length < 2)
	{
		sValue = oControl.value;
	}
	else
	{
		sValue = sControlValue;
	}

    // Do not clear the Facility combo after selecting a facility
    if (getBaseName(oControl) != "comboFacility") 
    {
        oControl.value = "";
    }

	var sLabel = mapControl(oControl);
	var sNewCriteria = sLabel;
	var sNewOperand = " " + sOperator + " ";
	if( sOperator != "" )
	{
		sNewCriteria = sNewCriteria + sNewOperand + "'" + sValue + "'";
	}

	//Make room for one more
	oSearch.options[oSearch.options.length] = new Option();

	//Determine where it's being added (ie., after the currently selected
	//line or if none at the bottom), then add the new option
	var iNewOptionIndex;
	if( oSearch.options.selectedIndex < 0 || 
		oSearch.selectedIndex == oSearch.options.length - 2 ) //len-1 = current max element, len-1-1 = prev max
	{
		iNewOptionIndex = oSearch.options.length - 1;
		oSearch.options[iNewOptionIndex].text = sNewCriteria;
		oSearch.options[iNewOptionIndex].value = sNewCriteria;

		//If there is a previous line, add an AND to it (assuming it's non-trivial)
		if(iNewOptionIndex > 0)
		{
			parseCondition(iNewOptionIndex - 1);
			if( sCriteria.length == 0 )
			{
				//Delete the trivial condition (happens when no initial conditions)
				oSearch.options[iNewOptionIndex - 1] = null;
				iNewOptionIndex -= 1;
			} 
			else if( sCriteria == sLabel && ( sNewOperand == sOperand || sLabel.indexOf(" Date") < 0 ) )
			{
				oSearch.options[iNewOptionIndex - 1].text += " Or";
			}
			else
			{
				oSearch.options[iNewOptionIndex - 1].text += " And";
			}
		}
	}
	else
	{
		//Shift down other criteria to make room
		iNewOptionIndex = oSearch.selectedIndex + 1;
		for(var iOptionIndex = oSearch.options.length - 1; iOptionIndex > iNewOptionIndex  ; iOptionIndex-- )
		{
			oSearch.options[iOptionIndex].text = oSearch.options[iOptionIndex - 1].text;
			oSearch.options[iOptionIndex].value = oSearch.options[iOptionIndex - 1].value;
		}
		
		//Stick the new one in
		oSearch.options[iNewOptionIndex].text = sNewCriteria;
		oSearch.options[iNewOptionIndex].value = sNewCriteria;

		
		//Link the new option to what follows by an And or Or
		parseCondition(iNewOptionIndex + 1);
		if( sCriteria == sLabel && ( sNewOperand == sOperand || sLabel.indexOf(" Date") < 0 ) )
		{
			oSearch.options[iNewOptionIndex].text += " Or";
		}
		else
		{
			oSearch.options[iNewOptionIndex].text += " And";
		}
	}
	
	//Select the new option just added
	if( oSearch.selectedIndex >= 0 )
	{
		oSearch.options[oSearch.selectedIndex].selected = false;
	}
	oSearch.options[iNewOptionIndex].selected = true;

	//Synchronize the listbox with the textbox that 
	//actually manages to make the round-trip
	syncFormData();
}


//Synchronize hidden field that takes back the search criteria with 
//the listbox

function syncFormData()
{
	var sFormData = "";
	if(oSearch.options.length > 0)
	{
		for(var i=0 ; i < oSearch.options.length ; i++)
		{
			if(sFormData == "")
			{
				sFormData = oSearch.options[i].text;
			}
			else
			{
				sFormData = sFormData + ";" + oSearch.options[i].text;
			}
		}
	}
	oFormData.Value = sFormData;
	document.forms[0].tbFormData.value = sFormData;  //Only became necessary in debugging!
}


//Standard msg telling user no criterion currently selected

function msgNoCurrentLine()
{
	alert('No current line is selected');
}


//Returns only the base name of the control (as opposed to what it was
//rendered as)

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


//Standard instructions popup hyperlink (arg specifies
//help page)

function popupInstructions(sArg)
{
	var sURL = "../MCCM/InstructionsPopUp.aspx" + sDbURL + "&Type=HelpFile&URL=" + sArg;
	var oInstruct = window.open(sURL, "Instruct", "width=450,height=450,resizable=yes,status=yes", true);
	oInstruct.focus();
}


//Standard clear behavior (assumes a local routine exists -- 
//clearSpecificItems)

function clearInputs(oControl)
{
	var iArgs = arguments.length;
	var bClear = true;

	//Note facility before clear -- used at end of function
	var sFacility = DbComboGetValue("comboFacility");

	//Do a general clear on all elements in the current frame
	for(var i=0 ; i < document.forms[0].elements.length ; i++)
	{
		//Get each element
		var oElement = document.forms[0].elements[i];

		//Clear it if EITHER no arguments passed in
		//or it has the same base name as one of the arguments
		//passed in
		if(iArgs > 0 && oControl != null)
		{
			if(getBaseName(oElement) == getBaseName(oControl))
			{
				bClear = true;
			}
			else
			{
				bClear = false;
			}	
		}

		//Whether and how to clear element depends on type
		if(bClear)
		{
			switch(oElement.type)
			{
				case "checkbox" :
					oElement.checked = false;
					break;
				case "radio" :
					oElement.checked = false;
					break;
				case "text" :
					oElement.value = "";
					break;
				case "select-one" :
					oElement.text = "";
					oElement.value = "";
					oElement.selectedIndex = -1;
					if(oElement == oSearch)
					{
						oElement.options.length = 0;
						syncFormData();
					}
					else if( getBaseName(oElement).indexOf('combo') >= 0 )
					{
						if( getBaseName(oElement) != "comboSavedSearch" )
						{
							DbComboClear(getBaseName(oElement));
						}
					}
					break;
			}
		}
	}

	//On clear all, reset tab strip to first multipage panel (0 indexed)
	window.mpageSearch.setTabActive('PageView1');
	
	//If facility is newly blanked out gotta do postback to 
	//reformulate serverstate has tables
	if( sFacility.length > 0 )
	{
       // Also clear the comboFacility value so that the postback will disable all other dbcombos
        DbComboClear('comboFacility');
        __doPostBack('comboFacility','');
	}
	else
	{
		//Postback refreshes iframes and other local elements; so if
		//no postback -- explicitly handle local requirements like iframes
		doLocalClear(oControl);
	}
}

function EVMProcessCombo()
{
	//Determine which control fired this event
	//var oControl = this.event.srcElement;
	var oControl = this;

	//Add a condition
	if( DbComboGetValue(getBaseName(oControl)) != '' )
	{
		addCriteria(oControl, DbComboGetValue(getBaseName(oControl)));
		DbComboClear(getBaseName(oControl));
	}

	//Peform a good return
	return true;
}


function checkParentheses(source, arguments)
{
	//Start out assuming everything is ok
	var bUnbalanced = false;		//Uneven parentheses flag
	var bAmbiguous = false;			//Ambigous AND/OR combination flag
	var iLevel = 0;				//Corresponds to how deep we are nested in parentheses
	var sAndOrTypes = new Array();		//Bylevel, indicates whether conditions are ANDed or ORed
	sAndOrTypes[0] = "";

	//If conditions are specified, make sure 1) parentheses are balanced, 
	//and 2) that there is not a mixture of and's and or's whose evaluation
	//might seem ambiguous (and which are likely not what the user intended)
	//parentheses are balanced AND there is no ambiguity in ANDing and ORing
	//conditions
	if(oSearch.options.length > 0)
	{
		//Loop through all the conditions
		for(var i=0 ; i < oSearch.options.length ; i++)
		{
			//Parse the current condition
			parseCondition(i);	//Sets sLeft, sRight, sJoin
			
			//Adjust the current level for both "(" and ")" in the current conditions
			//and define/clear AND/OR flag for any new levels
			var iLevelChange = sLeft.length - sRight.length;
			while( iLevelChange > 0 )
			{
				iLevelChange = iLevelChange - 1;
				iLevel = iLevel + 1;
				sAndOrTypes[iLevel] = "";
			}
			iLevel = iLevel + iLevelChange;	//Necessary when iLevelChange was < 0

			//If the current level is < 0 (meaning we have more ")" than "(" so
			//far, we are unbalanced, else check for AND/OR ambiguity at the same level
			if( iLevel < 0 )
			{
				bUnbalanced = true;
				break;
			}
			else
			{
				if( sAndOrTypes[iLevel] == "" )
				{
					sAndOrTypes[iLevel] = sJoin
				}
				else if( sJoin != "" && sJoin != sAndOrTypes[iLevel] )
				{
					bAmbiguous = true;
					//break;   -- Have to continue (unbalanced is the overriding check)
				}
			}

		}
	}

	//If our level is not 0, we are unbalanced
	if( iLevel != 0 )
	{
		bUnbalanced = true;
	}


	//If any validation condition set, invalidate page and tell user, else validate it
	if( bUnbalanced || bAmbiguous )
	{
		arguments.IsValid = false;
		if( bUnbalanced )
		{
			alert("Parentheses are unbalanced.");
		}
		else if( bAmbiguous )	//This message could be confusing if the parentheses are not even
		{
			if( window.confirm("---------------------------------------------------------------------\n" + 
					   "This Search cannot be saved or used to build a Work List.\n" +
					   "---------------------------------------------------------------------\n" +  
					   "Take the following steps to make it work:\n" + 
					   "  - Place   (   )   around sets of 'And' or 'Or' conditions.\n" + 
					   "  - Do not mix 'And' and 'Or' conditions in the same   (   ).\n\n" + 
					   "Click OK for Work List Criteria Instructions or Cancel.\n") )
			{
				popupInstructions("../MCCM/Help/wlCriteria.html");	
			}
		}
	}
	else
	{
		arguments.IsValid = true;
	}
}


function zoomCriteria()
{
	document.getElementById('tbFormDataDisplay').value = 
		document.getElementById('tbFormData').value.replace(/ And;/g," And\r").replace(/ Or;/g," Or\r");
	zoomValue('Work List Criteria','tbFormDataDisplay', 0, false);
}

function ProcessID(oActionArgs)
{
    switch(oActionArgs.ActionMethodControl)
	    {
		    case "hEncounter" :
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.EncEncounterNo;
             break;
            case "hPatient":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PatientMedicalRecordNo;
             break;
            case "hMedicalRecordNo":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PatientMedicalRecordNo;
             break;
            case "hPatientMPI":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PatientMasterPatientIndex;
             break;
            case "hAttendingMD":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PhysicianStaffID;
             break;
            case "hPCPMD":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PhysicianStaffID;
             break;             
            case "hPCPPractice":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PhysicianStaffID;
             break;
            case "hStaffMD":
             document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PhysicianStaffID;
             break;             
        }
    processPick(document.getElementById(oActionArgs.ActionMethodControl));
}

function encSearch() {
	try {
           
		var oElement1 = document.getElementById("tbEncounter");
        eval(AppRoot.GetAJAXResult('MCCM', 'SearchHelper', 'GetEncNoMRNoMPI', 'SearchFieldName=EncEncounterNo&SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hEncounter&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID'));
		oElement1.value = "";
        }
	catch(e) { }
}

function patSearchMPI() {
	try {
		var oElement1 = document.getElementById("tbPatientMPI");
        eval(AppRoot.GetAJAXResult('MCCM', 'SearchHelper', 'GetEncNoMRNoMPI', 'SearchFieldName=PatientMasterPatientIndex&SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPatientMPI&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID'));
		oElement1.value = "";
	}
	catch(e) { }
}

function patSearch() {
	try {
		var oElement1 = document.getElementById("tbPatient");
          eval(AppRoot.GetAJAXResult('MCCM', 'SearchHelper', 'GetEncNoMRNoMPI', 'SearchFieldName=PatientMedicalRecordNo&SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPatient&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID'));
		oElement1.value = "";
	}
	catch(e) { }
}

function mrnSearch() {
	try {
		var oElement1 = document.getElementById("tbMedicalRecordNo");
         eval(AppRoot.GetAJAXResult('MCCM', 'SearchHelper', 'GetEncNoMRNoMPI', 'SearchFieldName=PatientMedicalRecordNo&SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hMedicalRecordNo&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID'));
		oElement1.value = "";
		fPatEncSearchURL(sSearchURL);
	}
	catch(e) { }
}


function staffSearch() {
	try {
		var oElement1 = document.getElementById("tbAttendingMD");
         eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hAttendingMD&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

function staffPCPSearch() {
	try {
		var oElement1 = document.getElementById("tbPCPMD");
		 eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPCPMD&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

function staffPCP2Search() {
	try {
		var oElement1 = document.getElementById("tbPCPMD2");
		 eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPCPMD&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

function staffSearchPCPPractice() {
	try {
		var oElement1 = document.getElementById("tbPCPPractice");
        eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPCPPractice&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

function staffSearchPCPMD() {
	try {
		var oElement1 = document.getElementById("tbPCPMD");
         eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hPCPMD&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

function staffSearchPQ() {
	try {
		var oElement1 = document.getElementById("tbStaffMD");
         eval(AppRoot.GetAJAXResult('MCCM', 'StaffSearchHelper', 'GetStaff', 'SearchText=' + oElement1.value + '&FacCode=' + DbComboGetValue("comboFacility") +
                                            '&ReturnControl=hStaffMD&ReturnFrameID=' + window.AppFrameId + '&ReturnMethod=ProcessID&FixedFacility=False'));
		oElement1.value = "";
	}
	catch(e) { }
}

// Distribute saved search: Call up Worklist Manager with the given search and type fields pre-populated
function distributeSavedSearch(wlType) {
    var oSavedSearch = document.getElementById("tbSaveName").value;
    if (oSavedSearch != '*(current)*') {
        window.parent.location = "../mccm/MTrEStandard.aspx?SubTask=WorkListManager.aspx&wlt=" + wlType + "&ss=" + oSavedSearch;
    }
}

function setIframeSrc(sIframeId_in, sSrcValue_in) {
    var oIframe = document.getElementById(sIframeId_in);
    if (oIframe !== null) oIframe.src = sSrcValue_in;
}
