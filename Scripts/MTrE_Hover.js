var oHoverTimer, oHoverOffTimer, bHoverUnavailable = false, oHoverPending;
function HoverIn(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop)
{
	iWidth += 10; //Unfudge for borders, etc.
	if( iOffsetTop == -1 )
	{
		//Try to center on the vertical mouse position, as much as possible
		iOffsetTop = window.event.clientY - iHeight/2;
		if( iOffsetTop < 0 )
		{
			iOffsetTop = 0;
		}
		else if( iOffsetTop > 0 && iOffsetTop + iHeight > AppRoot.GetFrameWidth(window) )
		{
			iOffsetTop -= Math.min(iOffsetTop, iOffsetTop + iHeight - AppRoot.GetFrameHeight(window));
		}
		
		//Don't go too close to the top or bottom if we can avoid it
		if( iOffsetTop < 30 && AppRoot.GetFrameHeight(window) - iOffsetTop - iHeight > 30 - iOffsetTop )
		{
			iOffsetTop += (30 - iOffsetTop)/2;
		}
		else if( AppRoot.GetFrameHeight(window) - iOffsetTop - iHeight < 30 && 
				iOffsetTop > 30 - (AppRoot.GetFrameHeight(window) - iOffsetTop - iHeight) )
		{
			iOffsetTop -= (30 - (AppRoot.GetFrameHeight(window) - iOffsetTop - iHeight))/2;
		}
	}
	if( iOffsetLeft == -1 )
	{
		if( AppRoot.GetFrameWidth(window) - iWidth - 30 > window.event.clientX )
		{
			iOffsetLeft = window.event.clientX + 15;
		}
		else if( window.event.clientX - 30 > iWidth )
		{
			iOffsetLeft = window.event.clientX - iWidth - 15;
		}
		else if( AppRoot.GetFrameWidth(window) - iWidth > window.event.clientX )
		{
			iOffsetLeft = window.event.clientX + (AppRoot.GetFrameWidth(window) - window.event.clientX - iWidth)/2;
		}
		else if( window.event.clientX > iWidth )
		{
			iOffsetLeft = window.event.clientX - iWidth - (window.event.clientX - iWidth - 1)/2;
		}
		else if( AppRoot.GetFrameWidth(window) >= iWidth )
		{
			iOffsetLeft = (AppRoot.GetFrameWidth(window) - iWidth)/2;
			if( AppRoot.GetFrameHeight(window) - iHeight - 10 > window.event.clientY )
			{
				iOffsetTop = window.event.clientY + 10;
			}
			else if( window.event.clientY - iHeight - 10 > 0 )
			{
				iOffsetTop = window.event.clientY - iHeight - 10;
			}
			else
			{
				iOffsetTop = window.event.clientY + 10;
			}
		}
		else 
		{
			iOffsetLeft = window.event.clientX + 15;
		}
	}
	iWidth -= 10; //Unfudge

	if( bHoverUnavailable )
	{
		oHoverPending = function(){ HoverPerform(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop); };
	}
	else
	{
		HoverPerform(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop);
	}
}

function HoverPerform(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop)
{
	try
	{
		HoverOff();
		oHoverTimer = window.setTimeout( 
			function()
			{ 
				oHoverTimer = null; 
				HoverDisplay(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop); 
			}, __oHoverDelayTime); //__oHoverDelayTime in var in web page set from sys opt 
	}
	catch(e){}
}

function HoverDisplay(sASPXQuery, iWidth, iHeight, iOffsetLeft, iOffsetTop)
{
	try
	{
		window.__Hover.location = sASPXQuery;
        var oHover = window.document.getElementById("__Hover");
        oHover.style.width = iWidth + 'px';
        oHover.style.height = iHeight + 'px';
        oHover.style.left = iOffsetLeft + 'px';
        oHover.style.top = iOffsetTop + 'px';
        oHover.style.visibility = 'visible';
	}
	catch(e){}
}

function HoverOut(iDelay)
{
	if( bHoverUnavailable )
	{
		oHoverPending = null;
	}
	else
	{
		if( arguments.length > 0 )
		{
			bHoverUnavailable = true;
			oHoverOffTimer = window.setTimeout(function(){ HoverOutImmediate(); },iDelay);
		}
		else
		{
			HoverOutImmediate();
		}
	}
}

function HoverOutImmediate()
{
	try
	{
		HoverOff();
		try{ window.__Hover.resizeTo(0,0); } catch(e){}
		var oHover = window.document.getElementById("__Hover");
		oHover.style.visibility = 'hidden';
		if( oHoverPending != null )
		{
			var oPending = oHoverPending;
			oHoverPending = null;
			oPending();
		}
	}
	catch(e){}
}

function HoverOff()
{
	bHoverUnavailable = false;
	if( oHoverTimer ) 
	{
		window.clearTimeout(oHoverTimer);
		oHoverTimer = null;
	}
	if( oHoverOffTimer ) 
	{
		window.clearTimeout(oHoverOffTimer);
		oHoverOffTimer = null;
	}
}

function HoverHold()
{
	if( oHoverOffTimer ) 
	{
		window.clearTimeout(oHoverOffTimer);
		oHoverOffTimer = null;
		if( bHoverUnavailable )
		{
			bHoverUnavailable = false;
		}
	}
}

function HoverStick()
{
	HoverHold();
	bHoverUnavailable = true;
	
	var oExitButton = window.__Hover.document.getElementById('__HoverExit');
	if( oExitButton )
	{
		oExitButton.style.visibility = 'visible';
		oExitButton.style.position = 'absolute';
		oExitButton.style.top = '3px';
		oExitButton.style.left = (AppRoot.GetFrameWidth(window.__Hover) - 15).toString() + 'px';
	}
}

function HoverLeave()
{
	HoverOut(500);
}

function HoverExit()
{
	bHoverUnavailable = false;
	window.setTimeout(function(){ HoverOutImmediate(); }, 0);
}
