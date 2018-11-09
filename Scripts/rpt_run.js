//Shared JavaScript Library for MCCM Reports


//Process change to textbox

function processText()
{
	//If a value specified add to listbox
	if( this.value != "" )
	{
		//Add a selection then clear the combo
		addSelection(this.id.split("txtParm")[0], this.value, this.value);
		this.value = "";
	}

	//No matter what clear the value and peform a good return
	this.value = "";
	return true;
}


//Process change (in state at least) to dbCombo control

function processCombo()
{
	//Determine which control fired this event
	var oControl = this;

	//If an actual selection was made, proceed
	if( DbComboGetValue(oControl.id) != '' )
	{
		//Add a selection then clear the combo
		addSelection(oControl.id.split("dbcParm")[0], DbComboGetValue(oControl.id), oControl.value);
		DbComboClear(this.id);
		this.value = "";
	}

	//Peform a good return
	return true;
}


//Add a selection to the hidden selections field and multiselect
//listbox with a particular prefix (the prefix is common for 
//all elements of the same user control)

function addSelection(sControlPrefix, sValue, sText)
{
	//Add the option with text to the listbox
	var oControl = document.getElementById(sControlPrefix + "lboSelections");
	var iLengthBefore = oControl.options.length;
	var oOption = new Option();
	oOption.text = sText;
	oOption.value = sValue;	
	oControl.options[iLengthBefore] = oOption;
	
	//Add the value alone to the hidden selections text field
	oControl = document.getElementById(sControlPrefix + "hSelections");
	if( iLengthBefore > 0 )
	{
		oControl.value = oControl.value + "|";
	}
	var sArray = new Array(sValue);
	oControl.value = oControl.value + sArray.join("|");
}


//Remove all items currently selected

function removeSelections()
{
	//Clear the listbox options which are selected
	var sRowPrefix = this.id.split("hlDeleteSelections")[0];
	var oControl = document.getElementById(sRowPrefix + "lboSelections");
	for(var iOpt = oControl.options.length - 1 ; iOpt >= 0 ; iOpt--)
	{
		if( oControl.options[iOpt].selected )
		{
			oControl.options.remove(iOpt);
		}
	}

	//Loop through the listbox options and rebuild selection list -- pull values into an array
	var sArray = new Array();
	for(var iOpt = 0 ; iOpt < oControl.options.length ; iOpt++)
	{
		sArray[iOpt] = oControl.options[iOpt].value;	
	}

	//Set the selections list to the join on the array
	oControl = document.getElementById(sRowPrefix + "hSelections");
	oControl.value = sArray.join("|"); 
}


//Remove all items selected or not

function clearSelections(sRowPrefix)
{
	//Clear the selections list
	var sRowPrefix = this.id.split("hlClearSelections")[0];
	var oControl = document.getElementById(sRowPrefix + "hSelections");
	oControl.value = "";

	//Clear the listbox
	oControl = document.getElementById(sRowPrefix + "lboSelections");
	while( oControl.options.length > 0 )
	{
		oControl.options.remove(oControl.options.length - 1);
	}
}



//When combo is changed without a selection made, clears the combo
//and triggers a postback

function postCombo()
{
	//Peform a good return
	__doPostBack('','');
	return true;
}


//React to go button (postback with current id info)

function processGoBtn()
{
	__doPostBack('Go Button Pushed', this.id);
}

function ProcessValueSelected(oActionArgs) 
{
    var sID = oActionArgs.EncEncounterNo ? oActionArgs.EncEncounterNo : oActionArgs.PatientMedicalRecordNo;
    document.getElementById(oActionArgs.ActionMethodControl).value = sID;
    var sControlID = oActionArgs.ReturnControl;
    __doPostBack('Go Button Accepted', sControlID);
}

function ProcessValueSelectedMulti(oActionArgs)
{
	//Add a selection then clear the combo
    var sID = oActionArgs.EncEncounterNo ? oActionArgs.EncEncounterNo : oActionArgs.PatientMedicalRecordNo;
    addSelection(oActionArgs.ActionMethodControl.split("txtParm")[0], sID, sID);
	return true;
}

function ProcessStaffValueSelected(oActionArgs) {
    document.getElementById(oActionArgs.ActionMethodControl).value = oActionArgs.PhysicianStaffID
    var sControlID = oActionArgs.ReturnControl;
    __doPostBack('Go Button Accepted', sControlID);
}

function ProcessStaffValueSelectedMulti(oActionArgs) {
    //Add a selection then clear the combo
    addSelection(oActionArgs.ActionMethodControl.split("txtParm")[0], oActionArgs.PhysicianStaffID, oActionArgs.PhysicianStaffID);
    return true;
}

function getValueSelectedFromGoButton(sControlID)
{
	__doPostBack('Go Button Accepted', sControlID);
}

function getMultiValueSelectedFromGoButton(sControlID)
{
	//If a value specified add to listbox
	var sValue = document.getElementById(sControlID).value;
	if( sValue != "" )
	{
		//Add a selection then clear the combo
		addSelection(sControlID.split("txtParm")[0], sValue, sValue);
		this.value = "";
	}

	//No matter what clear the value and peform a good return
	document.getElementById(sControlID).value = "";
	return true;
}
