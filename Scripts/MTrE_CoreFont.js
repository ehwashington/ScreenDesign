function CoreFontUp(sRelatedControl)
{
	CoreFontAdjust(sRelatedControl, true);
}

function CoreFontDown(sRelatedControl)
{
	CoreFontAdjust(sRelatedControl, false);
}

function CoreFontAdjust(sRelatedControl, bIncreaseFontSize)
{
	oControl = document.getElementById(sRelatedControl);
	var sFontSize = oControl.currentStyle.fontSize;
	var iFontSize;
	if( sFontSize.search("px") < 0 )
	{
		iFontSize = parseInt(sFontSize);
	}
	else //Assume points
	{
		iFontSize = (Math.round(parseInt(sFontSize)*144/96))/2;
	}
	if( bIncreaseFontSize )
	{
		if( iFontSize >= 12 )
		{
			iFontSize += 2;
		}
		else
		{
			iFontSize += 1;
		}
	}
	else
	{
		if( iFontSize <= 14 )
		{
			iFontSize -= 1;
		}
		else
		{
			iFontSize -= 2;
		}
	}
	iFontSize = Math.max(Math.min(iFontSize,24),6);
	oControl.style.fontSize = iFontSize + 'pt';
}
