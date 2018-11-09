self.onerror = f1nogo;
parentObj = window.parent;
function mnNewWindow(sTask) {
	parentObj.frames[1].fnNewWindow(sTask)
}
function F2Top() {
	try {
		parentObj.frames[1].goTop();
	}
	catch(e) { }
}
function F2jumpTo(x,y) {
	try {
		parentObj.frames[1].jumpTo(x,y);
	}
	catch(e) { }
}
function f1nogo() {
	return true;
}
function fnMCCMCsw(sURL) {
	var w = window.open(sURL,"MCCMCsw","resizable=yes,scrollbars=yes,status=yes");
}
function fnMCCMHelp() {
	var obj=document.getElementById('hlHelp');
	if (obj != null) {
		obj.value='goHelp';
		document.Form1.submit();
	}
}
function fnNewWindowF1(sURL,iWidth,iHeight,sWinName) {
	if(arguments.length < 2)
		iWidth = 800;
	if(arguments.length < 3)
		iHeight = 630;
	if(arguments.length < 4)
	{
		if(sURL.substr(0,8) == '../MCCM/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,8) == '../mccm/') 
			sWinName = 	sURL.substr(8,5);
		else if(sURL.substr(0,5) == 'help/') 
			sWinName = 	sURL.substr(5,5);
		else if(sURL.substr(0,5) == 'WBIR.') 
			sWinName = 	'wbirwizard';
		else if(sURL.substr(0,5) == 'http:') 
			sWinName = 	'cerme';
		else
			sWinName = 	sURL.substr(0,5);
	}	

	var iX = Math.max(0,(screen.width - iWidth)/2); 
	var iY = Math.max(0,((screen.height - iHeight)/2)-20);
	var oPopUpWin = window.open(sURL, sWinName  , "width=" + iWidth + ",height=" + iHeight + 
			",left=" + iX + ",top=" + iY + ",resizable=yes,scrollbars=yes,status=yes", true);
						 
	//Give it focus
	oPopUpWin.focus();
}

function whichBlueButton(sElem) {
	// Parameter looks like this:   javascript:F2jumpTo(2,'EP2')
	try {
		var sE1 = sElem + "";	// Implicitly convert to a string
		var i1 = sE1.indexOf(",'");
		if (i1 == -1) return "";
		var i2 = sE1.lastIndexOf("'");
		if (i2 == -1) return "";
		return sE1.substr(i1+2,i2-i1-2);	// Return the EPx part of the param
	}
	catch(e) {return ""; }
}
