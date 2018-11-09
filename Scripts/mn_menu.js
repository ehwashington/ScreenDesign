addMenu("MN_Menu","MN_Menu"); 

addStylePad("pad", "pad-css:MenuPad; offset-left:0; offset-top:0;");
addStyleItem("item", "css:MenuItemOff, MenuItemOn; width:actual; sub-menu:mouse-over;");
addStyleFont("font", "css:MenuFont, MenuFont;");
addStyleTag("tag", "css:MenuTagMain, MenuTagMain;");
addStyleTag("tag1", "css:MenuTagSub, MenuTagSub;");
addStyleSeparator("separator", "css:MenuSeparator;");

addStyleMenu("menu", "pad", "item", "font", "tag", "", "separator");
addStyleMenu("submenu", "pad", "item", "font", "tag1", "", "separator");

addStyleGroup("style", "menu", "MN_Menu");
addStyleGroup("style", "submenu", "Sub-Menu A1",  "Sub-Menu A2", "Sub-Menu A3", "Sub-Menu A4", "Sub-Menu A5");
addStyleGroup("style", "submenu", "Sub-Menu A6",  "Sub-Menu A7");
addStyleGroup("style", "submenu", "Sub-Menu A51", "Sub-Menu A52", "Sub-Menu A53", "Sub-Menu A54");
addStyleGroup("style", "submenu", "Sub-Menu A55", "Sub-Menu A56", "Sub-Menu A71", "Sub-Menu A72");


// =============================
// Functions referenced by Menus

function Casesummary() {
	parent.location="../MCCM/Casesummary.aspx";
}

function CovNotice(sUrl) {
	var obj = document.getElementById("txtRevMCCMID")
	if (obj != null) {
		sUrl = sUrl + "?ResultID=" + document.Form1.txtRevMCCMID.value;	
	}
	fnNewWindow(sUrl, 800, 580);
}

function fnNewWindow(sURL,iWidth,iHeight,sWinName) {
	if(arguments.length < 2)
		iWidth = 800;
	if(arguments.length < 3)		iHeight = 630;
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

function fnNewWindowNoScroll(sURL,iWidth,iHeight,sWinName) {
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
			",left=" + iX + ",top=" + iY + ",resizable=no,scrollbars=no,status=yes", true);
	//Give it focus
	oPopUpWin.focus();
}

function DoMCCMAction(sTask, sTaskArgs, sActionPlusArgs, bIsPopup, iPopupWidth, iPopupHeight)
{
	if( typeof AppRoot == "undefined" || 
		typeof AppRoot.AppMainFrame == "undefined" || 
		!AppRoot || 
		!AppRoot.AppMainFrame )
	{
		document.cookie = '__TaskPlusArgs=' + escape(sTask + '?' + sTaskArgs) + '; path=/;';
		document.cookie = '__ActionPlusArgs=' + escape(sActionPlusArgs) + '; path=/;';
	
		if( bIsPopup )
		{
			fnNewWindowNoScroll('../mccm/main.aspx', iPopupWidth, iPopupHeight, 'Main');
		}
		else
		{
			parent.location='../mccm/main.aspx';
		}
	}
	else
	{
		if( bIsPopup )
		{
			AppRoot.OpenFramePopup(AppRoot.AppMainFrame, sTask, sTaskArgs, sActionPlusArgs, iPopupWidth, iPopupHeight, "resizable=yes");
		}
		else
		{
			AppRoot.OpenFrame(AppRoot.AppMainFrame, sTask, sTaskArgs, sActionPlusArgs);
		}
	}
}

function prepMain(sTaskPlusArgs, sActionPlusArgs)
{
    document.cookie = '__TaskPlusArgs=' + escape(sTaskPlusArgs) + '; path=/;';
    document.cookie = '__ActionPlusArgs=' + escape(sActionPlusArgs) + '; path=/;';
	return;
}
function goMain(sTaskPlusArgs, sActionPlusArgs, sQueryArgs, oTargetFrame)
{
	if( !oTargetFrame )
	{
		oTargetFrame = window.top;
	}
	prepMain(sTaskPlusArgs, sActionPlusArgs);
	oTargetFrame.location = "Main.aspx" + (sQueryArgs ? sQueryArgs : '');
	return;
}
