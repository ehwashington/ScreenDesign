function GetAJAXResult(sAssembly, sClass, sMethod, sURLArguments, oXML, bReturnXML, oCallback) //Args after method optional
{
	var oHTTPRequest;
	try
	{
		oHTTPRequest = new ActiveXObject('Msxml2.XMLHTTP');
	}
	catch(e)
	{
		oHTTPRequest = new ActiveXObject('Microsoft.XMLHTTP');
	}
	
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
					if( oHttpRequest.readyState == 4 )
					{
						if( oHttpRequest.status == 200 )
						{
							oCallback();
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

function Wait(iMilliseconds)
{
    GetAJAXResult('MTrE', 'ControlLibrary', 'Wait', 'WaitTime=' + iMilliseconds);
}
