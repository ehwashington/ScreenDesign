function SetupCorePassword(oCorePassword_In, sAttributesXML_In, sPostBackScript_In)
{
	//Get hold of control
	if( oCorePassword_In )
	{
		//Figure out relevant attribute values
		if( !AppRoot.IsEmpty(sAttributesXML_In) )
		{
			//Turn it into an XML document
			var oAttributeXML = new ActiveXObject("MSXML2.DOMDocument"); 
			oAttributeXML.loadXML(unescape(sAttributesXML_In));
			
			//Transfer to extended properties of the control
			oCorePassword_In.ClientOnChangeFunction =
				oAttributeXML.documentElement.getAttribute("ClientOnChangeFunction")
			oCorePassword_In.AutoConfirm =
				oAttributeXML.documentElement.getAttribute("AutoConfirm")
			oCorePassword_In.ConfirmationWindowTitle = 
				oAttributeXML.documentElement.getAttribute("ConfirmationWindowTitle")
			oCorePassword_In.ConfirmationPrompt = 
				oAttributeXML.documentElement.getAttribute("ConfirmationPrompt")
			oCorePassword_In.ConfirmationWindowHeight = 
				oAttributeXML.documentElement.getAttribute("ConfirmationWindowHeight")
			oCorePassword_In.ConfirmationWindowWidth = 
				oAttributeXML.documentElement.getAttribute("ConfirmationWindowWidth")
		}
		
		//Remember post back script, if any specified
		if( arguments.length > 2 )
		{
			oCorePassword_In.PostBackScript = sPostBackScript_In;
		}
		
		//Attach on change event to the control (see what it does below)
		oCorePassword_In.onchange = CorePasswordOnChange;
	}
}

function CorePasswordResetChangedFlag(oCorePassword_In)
{
	//If there is a changed flag then reset it (no change flag is the same as flag = N)
	if( oCorePassword_In.ChangedFlag ) 
	{
		oCorePassword_In.ChangedFlag.value = "N";
	}
}

function CorePasswordOnChange()
{
	//"this" will be a core password control
	var oCorePassword = this;
	
	//If not already there create a hidden input that will carry back a changed flag
	if( oCorePassword.ChangedFlag )
	{
		oCorePassword.ChangedFlag.value = 'Y';
	}
	else
	{
		oCorePassword.insertAdjacentHTML("AfterEnd", "<input type=hidden value=Y id='" + this.id + "__Changed'/>");	
		oCorePassword.ChangedFlag = document.getElementById(oCorePassword.id + "__Changed");
	}
	
	//If a non-trivial password entered and auto confirmation is on, confirm it
	if( AppRoot.IsTrue(oCorePassword.AutoConfirm) )
	{
		if( oCorePassword.value != "" )
		{
			//User has entered something (the holding place asterisks are no longer there) SO
			//collect together the elements of the dialog we need to confirm the entry
			var oDialogArgs = new Object();
			oDialogArgs["Title"] = oCorePassword.ConfirmationWindowTitle;
			oDialogArgs["Text"] = AppRoot.IfEmpty(oCorePassword.ConfirmationPrompt, "Confirm Password:");

			//Popup the dialog with appropriate width and height
			//AND return from here whatever value the modal dialog returns
			var sConfirmationEntry = 
				window.showModalDialog("ConfirmPassword.html", 
									   oDialogArgs,
									   "status:no;edge:sunken;scroll:no;" + 
									   "dialogWidth:" + oCorePassword.ConfirmationWindowWidth + "px;" + 
									   "dialogHeight:" + oCorePassword.ConfirmationWindowHeight + "px;");
										
			//If confirmation matches, this is now our password -- else tell the user no deal
			if( oCorePassword.value != sConfirmationEntry )
			{
				oCorePassword.value = "";
				window.status = "Password cleared because the confirmation value did not match."
			}
		}
	}
	
	//Process any client on change handler
	if( !AppRoot.IsEmpty(oCorePassword.ClientOnChangeFunction) )
	{
		var oOnChangeScript;
		try
		{
			oOnChangeScript = eval(oCorePassword.ClientOnChangeFunction);
		}
		catch(e)
		{
			oOnChangeScript = eval("oFrame." + oCorePassword.ClientOnChangeFunction);
		}

		if( oCorePassword.ClientOnChangeFunction.indexOf("(") < 0 ) //typeof(...) == "function" doesn't seem to work
		{
			oOnChangeScript.call(oCorePassword);
		}
	}

	//If necessary autopostback
	if( !AppRoot.IsEmpty(oCorePassword.PostBackScript) )
	{
		window.setTimeout(oCorePassword.PostBackScript, 0);
	}
}
