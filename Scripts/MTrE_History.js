window.onerror = function(){ return true; };
window.document.onkeypress = function(){ event.returnValue = false; return false; };
window.document.onkeyup = function(){ event.returnValue = false; return false; };
window.document.onclick = function(){ ResetMessages(); event.returnValue = false; return false; };

var AppRoot = window;
var AppCurrentFrames = new Object();
AppCurrentFrames.Item = new Object();
var oFrame = window;

function $(sControlID){ i$ += 1; o$[i$] = window.document.getElementById(sControlID); return o$[i$]; }
function $_(sControlID){ i$ += 1; o$[i$] = window.document.getElementById(sControlID); return o$[i$]; }
function $$(sControlID){ i$$ += 1; o$$[i$$] = window.document.getElementById(sControlID); return o$$[i$$]; }
function $$$(){} //A way to include a line in the history request script

function EvalNextScript(sScript)
{
	eval(sScript);
}

var o$ = new Array(); var i$ = -1;
var o$$ = new Array(); var i$$ = -1;
function SequenceEventScripts(oUserChanges, oResponse, sClickControlID)
{
	o$ = new Array(); i$ = -1;
	o$$ = new Array(); i$$ = -1;

	var iDelay = 0;
	if( oUserChanges )
	{
		setTimeout(function(){ oUserChanges(); Blink(o$$); }, iDelay);
		iDelay += 1200;
	}
	if( sClickControlID )
	{
		setTimeout(function(){ DisplayLinkBlink(document.getElementById(sClickControlID)); }, iDelay);
		iDelay += 1200;
	}
	if( oResponse )
	{
		setTimeout(function(){ oResponse(); Blink(o$); }, iDelay);
	}
}

function UpdateVisibility(sValue, oControlArray)
{
	for( var iControl = 0; iControl < oControlArray.length; iControl++ )
	{
		oControlArray[iControl].style.visibility = sValue;
	}	
	
}
function Blink(oControlArray)
{
	if( oControlArray.length > 0 )
	{
		UpdateVisibility('hidden', oControlArray);
		setTimeout(function(){ UpdateVisibility('visible', oControlArray); },200);
		setTimeout(function(){ UpdateVisibility('hidden', oControlArray); },400);
		setTimeout(function(){ UpdateVisibility('visible', oControlArray); },600);
		setTimeout(function(){ UpdateVisibility('hidden', oControlArray); },800);
		setTimeout(function(){ UpdateVisibility('visible', oControlArray); },1000);
	}
}
function DisplayLinkBlink(oLinkControl)
{
	if( oLinkControl )
	{
		if( oLinkControl.offsetParent != window.document )
		{
			var oDiv = oLinkControl.offsetParent;
			while( oDiv && oDiv != window && oDiv != window.document && 
				oDiv.tagName.toLowerCase() != "body" && oDiv.tagName.toLowerCase() != "div" )
			{
				oDiv = oDiv.offsetParent;
			}
			if( oDiv.tagName.toLowerCase() == "div" )
			{
				ScrollToElement(oDiv, oLinkControl.offsetParent);
			}
		}
		Blink([oLinkControl]);
	}
}


//Modified from MTrE_AppLibrary.js
function GetPointer(iFrame, sControlID)
{
	return $(sControlID);
}
function IsPageAvailable()
{
	return false;
}

//Unmodified from MTrE_AppLibrary.js
var IsIE = true;
try
{
	if( navigator.appName != "Microsoft Internet Explorer" )
	{
		IsIE = false;
		AppRoot = window;
	}
}
catch(e){}
function IsEmpty(oValue)
{
	if( oValue === "" || oValue == null || oValue == undefined )
	{
		return true;
	}
	else
	{
		return false;
	}
}
function ScrollToElement(oScrollDiv, oChildElement)
{
	var iAdjustment = oChildElement.offsetTop - oScrollDiv.scrollTop;
	if( iAdjustment > 0 )
	{
		iAdjustment += Math.min(oChildElement.offsetHeight, oScrollDiv.offsetHeight) - oScrollDiv.offsetHeight;
		if( iAdjustment > 0 )
		{
			oScrollDiv.scrollTop += iAdjustment + 2;
		}
	}
	else if( iAdjustment < 0 )
	{
		oScrollDiv.scrollTop += iAdjustment - 2;
	}
}

//MTrE_AppLibrary.js:  dummied functions
function BaseComboSetup(){}
