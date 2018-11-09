//Shared JavaScript Library for Session Timeouts

//In-line code to attach an unload event
var TO=null, TOIncr=1, TMsg;

function DoClassicTimeout()
{
	//Redirect to a timeout message

	if (window.parent.parent.opener!=null) {	// A popup has timed out
		window.parent.parent.onunload = null;
		window.parent.parent.close();
	}
	else					// A main page is timing out
	{
		try
		{
			window.parent.parent.onunload = null;
			window.parent.parent.location.replace(TOUrl);
		}
		catch(e){} //Seems to prevent some kind of hiccup
	}
}
function GetClassicLapseSinceLastActivity()
{
	var iLapseSinceActivity = 0;
	var sCookieInfo = window.document.cookie;
	var bCookieFound = false;
	if( sCookieInfo )
	{
		var oLastActivity = sCookieInfo.split('__LastActivity=');
		if( oLastActivity.length > 1 )
		{
			bCookieFound = true;
			iLapseSinceActivity = (new Date()).getTime() - parseInt(oLastActivity[1].split(';')[0],10);
			if( iLapseSinceActivity >= TOValue )
			{
				DoClassicTimeout();
			}
		}
	}
	if( !bCookieFound )
	{
		ResetClassicTimeoutInterval();
	}
	return iLapseSinceActivity;
}
function ResetClassicTimeoutInterval()
{
	window.document.cookie = '__LastActivity=' + (new Date()).getTime() + '; path=/;';
}

function fnSetTimeOut()
{
	void GetClassicLapseSinceLastActivity();
	window.setInterval(chkSetTimeOut, 60000);
}

function chkSetTimeOut() {
	var iLapseSinceActivity = GetClassicLapseSinceLastActivity();
	if( TOValue - iLapseSinceActivity <= 60000 ) //1 minute warning
	{
		window.status = "Window will close in less than 1 minute ...";
	}
	else if( TOValue - iLapseSinceActivity <= 120000 ) //2 minute warning
	{
		window.status = "Window will close in less than 2 minutes ...";
	}
	else if( TOValue - iLapseSinceActivity <= 180000 ) //3 minute warning
	{
		window.status = "Window will close in less than 3 minutes ...";
	}
	else if( TOValue - iLapseSinceActivity <= 240000 ) //4 minute warning
	{
		window.status = "Window will close in less than 4 minutes ...";
	}
}

function fnClearTimeOut() {} //Still referenced in pages

// Function called on every key press; resets timer and clears warning messages
function fnKeyPressTimeOut() {
	ResetClassicTimeoutInterval();
	window.status = "";
}
window.status = "";

if( window.document.attachEvent )
{
    window.document.attachEvent("onmouseup", fnKeyPressTimeOut);
}
else
{
    window.document.addEventListener("onmouseup", fnKeyPressTimeOut, false);
}

// Function called to check length of entry on multiline text boxes
function fnCheckMaxLength(field,sMaxLength) {
	if (field.value.length > sMaxLength)
		field.value = field.value.substring(0, sMaxLength);
} 

// Generic MTrE invocation functions from classic aspx shelled in MTrEStandard.aspx
function goMTrE(sTaskPlusArgs, sActionPlusArgs)
{
    var iTaskPlusArgsDelimiter = sTaskPlusArgs.indexOf('?');
    var sTask = (iTaskPlusArgsDelimiter < 0) ? sTaskPlusArgs : sTaskPlusArgs.substr(0,iTaskPlusArgsDelimiter);
    var sTaskArgs = (iTaskPlusArgsDelimiter < 0 || iTaskPlusArgsDelimiter == (sTaskPlusArgs.length - 1)) ? '' : sTaskPlusArgs.substr(iTaskPlusArgsDelimiter + 1);
    window.top.AppRoot.OpenFrame(window.top.AppRoot.AppMainFrame, sTask, sTaskArgs, sActionPlusArgs);
}
function prepMain(sTaskPlusArgs, sActionPlusArgs)
{
    document.cookie = '__TaskPlusArgs=' + escape(sTaskPlusArgs) + '; path=/;';
    document.cookie = '__ActionPlusArgs=' + escape(sActionPlusArgs) + '; path=/;';
	return;
}
function goMain(sTaskPlusArgs, sActionPlusArgs, sQueryArgs, oTargetFrame)
{
    AppRoot.OpenFrame(AppRoot.AppMainFrame, sTaskPlusArgs.split("?")[0], (sTaskPlusArgs.split("?").length > 1 ? sTaskPlusArgs.split("?")[1] : 0), sActionPlusArgs);
}

//Create a new HTTP request
function GetClassicNewHttpRequest()
{
	if( window.XMLHttpRequest ) //IE7 has this method
	{
		return new XMLHttpRequest();
	}
	else
	{
		try
		{
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
}

function GetClassicAJAXResult(sAssembly, sClass, sMethod, sURLArguments, oXML, bReturnXML, oCallback) //Args after method optional
{
	var oHTTPRequest = GetClassicNewHttpRequest();
	
	var sCall = 'AJAXServer.aspx?InvokeAssembly=' + sAssembly + '&InvokeClass=' + sClass + '&InvokeMethod=' + sMethod;
	if( arguments.length > 3 && sURLArguments && sURLArguments != '' )
	{
		sCall += "&" + sURLArguments;
	}

	var oCallData = null;
	if( arguments.length > 4 && oXML )
	{
		oCallData = oXML;
		oHTTPRequest.setRequestHeader("Content-Type", "text/xml");
	}
	
	if( arguments.length > 6 && oCallback )
	{
		oHTTPRequest.open('POST', sCall, true);
		oHTTPRequest.send(oCallData);
		oHTTPRequest.onreadystatechange = 
			function()
				{
					if( oHTTPRequest.readyState == 4 )
					{
						if( oHTTPRequest.status == 200 )
						{
							if( arguments.length > 5 && bReturnXML )
							{
								oCallback(oHTTPRequest.responseXML);
							}
							else
							{
								oCallback(oHTTPRequest.responseText);
							}
						}
					}
				};
	}
	else
	{
		oHTTPRequest.open('GET', sCall, false);
		oHTTPRequest.send(oCallData);
		if( arguments.length > 5 && bReturnXML )
		{
			return oHTTPRequest.responseXML;
		}
		else
		{
			return oHTTPRequest.responseText;
		}
	}
}
