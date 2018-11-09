//Declare application root, version, etc. (set by BaseApplication shell)
var AppRoot = window;	//Used to reference application js library and state info
try //Classic page running inside another domain
{
    if( window.parent != window && !window.parent.AppRoot )
    {
	    window.parent.AppRoot = window;
    }
} catch(e){}

var IsIE = true;        //Historical default
var IsHTML5 = false;    //Historical default

try
{
    //Set browser flags
	if( navigator.appName == "Microsoft Internet Explorer" )
    {
        AppRoot.BrowserVsn = parseInt(navigator.appVersion.split("MSIE")[1], 10);
        AppRoot.CompatibilityMode = ( AppRoot.BrowserVsn <= 7 && navigator.userAgent.toLowerCase().indexOf("trident") >= 0 );
        AppRoot.IsHTML5 = (!AppRoot.CompatibilityMode && AppRoot.BrowserVsn >= 10);
    }
    else
	{
		IsIE = false;
        IsHTML5 = true;
        if( navigator.userAgent.toLowerCase().indexOf("ipad") >= 0 )
        {
            AppRoot.IsIpad = true;
        }
        else if( navigator.userAgent.toLowerCase().indexOf("safari") >= 0 )
        {
            AppRoot.IsSafari = true;
        }
        else if( navigator.userAgent.toLowerCase().indexOf("firefox") >= 0 )
        {
            AppRoot.IsFireFox = true;
        }
	}
}
catch(e){}

var AppFramesetId = (new Date()).getTime() % 86400000;	//The session frameset in vb, normed to milliseconds since today

var AppVersion;											//Appended to URL so, after upgrade, pages will not load from cache
var AppUserId;											//Appended to URL so one user's cached pages don't appear to another user
var AppUserVersion;										//Appended to URL so when user security changes, cached pages no longer apply
var AppPopupPostfix = AppFramesetId;					//Used to make popup windows distinct if user is running two instances of application

var AppEnvironment;										//Test, prod, archive URL strings -- menu uses (when it calls other apps)
var AppEnvURLKey;										//Used to pass AppEnvironment via URL

var AppGhostFrameReady = true;
var AppMainFrame = window.parent.frames['Task'];		//Points to Main application frame

var AppTopFrame = null;									//Always null -- so when a task looks here it will see that IT is the top

var AppTimeout;											//Indicates how many milliseconds of non-use before a timeout occurs
var AppTimeoutURL;										//Where we go on timeout
var AppTimeoutInterval;									//The recurring interval that checks for a timeout
var AppGenerateStateUnavailableSession;

var AppRelatedBrowsers = new Object();					//Handles to browsers with related applications

var AppFrameFocus;										//Last frame getting keyboard focus
var AppFrameActionLinkInfo;								//Info for the link triggering action

function HTMLEncode(sText)
{
	return sText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n/g, '<br>').replace(/\r/g, '<br>').replace(/\n/g, '<br>')
}

function LoadInitialTask()
{
    LogToDebugger('>> LoadInitialTask cookie = ' + document.cookie);
	var sTask;
	if( document.cookie.indexOf("__TaskPlusArgs=") >= 0 )
	{
		sTask = unescape(document.cookie.split("__TaskPlusArgs=")[1].split(';')[0]);
	}
	var sTaskArgs = "";
	var sActionPlusArgs;
	if( !sTask || sTask.length < 1 )
	{
		sTask = window.parent.TaskPlusArgs.split("?")[0];
		if( window.parent.TaskPlusArgs.indexOf("?") >= 0 )
		{
			sTaskArgs = window.parent.TaskPlusArgs.substr(window.parent.TaskPlusArgs.indexOf("?") + 1);
		}
		sActionPlusArgs = window.parent.ActionPlusArgs;
	}
	else
	{
		if( sTask.indexOf("?") >= 0 )
		{
			sTaskArgs = sTask.split("?")[1];
			sTask = sTask.split("?")[0];
		}
		if( document.cookie.indexOf("__ActionPlusArgs=") >= 0 )
		{
			sActionPlusArgs = unescape(document.cookie.split("__ActionPlusArgs=")[1].split(';')[0]);
		}
	}

	var sContainerURL = window.parent.location.toString();
	if( sContainerURL.indexOf("FromApp=") >= 0 )
	{
		var sOpenerApp = sContainerURL.split("FromApp=")[1].split("&")[0];
		if( sOpenerApp )
		{
			AppRelatedBrowsers[sOpenerApp] = window.opener;
		}
	}

	//Load the initial task
	PrepMainCall('', '');
	OpenFrame(AppMainFrame, sTask, sTaskArgs, sActionPlusArgs ? sActionPlusArgs : 'GetData');
}
function LoadUserData()
{
	try
	{
		var oUserData = document.cookie.split("MTrE__Data=")[1].split(';')[0].split("&");
		for( var iDatum in oUserData )
		{
			var oKeyValue = oUserData[iDatum].split("=");
			switch(oKeyValue[0])
			{
				case "UserID":  AppUserId = unescape(oKeyValue[1]); break;
				case "UsrVsn":  AppUserVersion = unescape(oKeyValue[1]); break;
				case "Env":  AppEnvironment = unescape(oKeyValue[1]); break;
				case "Timeout":  AppTimeout = unescape(oKeyValue[1]); break;
				case "Regen":  AppGenerateStateUnavailableSession = (unescape(oKeyValue[1]) == 'Y' ? true : false); break;
				case "Debug":  window.AllowAJAXDebugging = (unescape(oKeyValue[1]) == 'Y' ? true : false); break;
			}
		}
	}
	catch(e){}
}
function PrepMainCall(sTaskPlusArgs, sActionPlusArgs)
{
    document.cookie = '__TaskPlusArgs=' + escape(sTaskPlusArgs) + '; path=/;';
    document.cookie = '__ActionPlusArgs=' + escape(sActionPlusArgs) + '; path=/;';
	return;
}
function OnIntercept(oFrame)
{
	if( oFrame.event.keyCode == 116 ||
	    (oFrame.event.ctrlKey && oFrame.event.keyCode == 82) ||
	    (oFrame.event.ctrlKey && oFrame.event.keyCode == 78) )
	{
		PrepMainForRefresh();
	}
	return true;
}
function SetFramesetId()
{
    AppRoot.document.cookie = '__FramesetId=' + AppFramesetId.toString() + '; path=/;';
}
function PrepMainForRefresh()
{
	var oFrameInfo = AppCurrentFrames.Item[AppMainFrame.AppFrameId];
	if( oFrameInfo.ReturnTaskPlusArgs )
	{
		PrepMainCall(oFrameInfo.ReturnTaskPlusArgs, oFrameInfo.ReturnActionPlusArgs ? oFrameInfo.ReturnActionPlusArgs : '');
	}
	else
	{
		PrepMainCall(oFrameInfo.TaskName + '?' + oFrameInfo.TaskArgList, '');
	}
}
function SetSpecialMode(iMode)
{
	AppRoot.document.cookie = '__Mode=' + iMode.toString() + '; path=/;';
	AppUserVersion = AppUserVersion.split("-")[0] + '-' + iMode.toString();
	ResetCookieFromAppRoot();
	PrepMainForRefresh();
	window.top.location.reload();
}
function UnsetSpecialMode(iMode)
{
	AppUserVersion = AppUserVersion.split("-")[0];
	ResetCookieFromAppRoot();
	PrepMainForRefresh();
	window.top.location.reload();
}
function ResetCookieFromAppRoot()
{
	AppRoot.document.cookie =
		'MTrE__Data=' +
			'UserID=' + escape(AppUserId) + '&' +
			'UsrVsn=' + escape(AppUserVersion) + '&' +
			'Env=' + escape(AppEnvironment) + '&' +
			'Timeout=' + escape(AppTimeout) + '&' +
			'Regen=' + ( AppGenerateStateUnavailableSession ? 'Y' : 'N' ) + '&' +
			'Debug=' + ( window.AllowAJAXDebugging ? 'Y' : 'N' ) + '&' +
		'; path=/;';
}

//Create a new HTTP request
function GetNewHttpRequest()
{
	if( !AppRoot.IsIE || AppRoot.IsHTML5 || window.XMLHttpRequest ) //IE7 has this method
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

//Unload frameset
var AppSuppressUnload = false;
function UnloadSession()
{
   if( AppSuppressUnload ) return;
   var oHttpRequest = GetNewHttpRequest();
   oHttpRequest.open("POST", "Controller.aspx?UnloadFrameset=" + AppFramesetId, true);
   oHttpRequest.send(null);
}

function SetTitle(oFrame, sTitle)
{
	//Get type of frame
	var iPopupType = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).PopupType();
	if( iPopupType == 0 )
	{
		//Determine top frame
		var oTopFrame = oFrame;
		while( oTopFrame.parent != oTopFrame )
		{
			oTopFrame = oTopFrame.parent;
		}
		oTopFrame.document.title = sTitle;
	}
	else if( iPopupType == 2 )
	{
		var oTitlebar = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OT'));
		if( oTitlebar )
		{
			oTitlebar.innerText = sTitle;
		}
	}
}

//Setup a function that determines the logical application parent frame of the specified frame
function GetAppParent(oFrame)
{
	if( oFrame == oFrame.parent )
	{
		return oFrame.opener;
	}
	else
	{
		return oFrame.parent;
	}
}

//Setup a function that determines whether something is empty
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
function IfEmpty(oValue, oConsequentValue)
{
	if( IsEmpty(oValue) )
	{
		return oConsequentValue;
	}
	else
	{
		return oValue;
	}
}

//Setup a function that determines whether something is true (parallels Library)
function IsTrue(oValue)
{
	if( oValue === "" ||
	    oValue == null ||
	    oValue == undefined ||
	    oValue.toString().substr(1,1).toUpperCase() == "N" ||
	    oValue.toString().toUpperCase() == "FALSE" ||
		oValue.toString().toUpperCase() == "OFF" )
	{
		return false;
	}
	else if(oValue.toString().substr(1,1).toUpperCase() == "Y" ||
			oValue.toString().toUpperCase() == "TRUE" ||
			oValue.toString().toUpperCase() == "ON")
	{
		return true;
	}
	else if( isFinite(oValue) )
	{
		return ( parseFloat(oValue) != 0 )
	}
	else if( oValue )
	{
		return true;
	}
	else
	{
		return false;
	}
}

//Constructs a ghost frame input for a given control (typical case)
function $$(sControlName, sControlValue) //formerly GetGFInput
{
	if( sControlValue )
	{
		return encodeURIComponent(sControlName) + "=" + encodeURIComponent(sControlValue) + "&";
	}
	else
	{
		return '';
	}
}

//Constructs a ghost frame input for a given radio button group
function $$Group(oFrame, sGroupName, sClientName)
{
	//Initialize the value of the currently checked radio button in the specified group
	var sRadioGroupValue = '';

	//Loop through all component radio buttons and look for which is checked
	//(it's that one whose value is really the value for the whoe group)
	var oComponentRadioButtons = oFrame.document.getElementsByName(sGroupName);
	for(var iComponentRadioButton = 0;
			iComponentRadioButton < oComponentRadioButtons.length;
			iComponentRadioButton ++)
	{
		if( oComponentRadioButtons[iComponentRadioButton].tagName.toUpperCase() != "TABLE" )
		{
			if( oComponentRadioButtons[iComponentRadioButton].checked )
			{
				sRadioGroupValue = oComponentRadioButtons[iComponentRadioButton].value;
				break;
			}
		}
	}

	//Output a ghost frame hidden field to return the value of the radio group
	return $$(sClientName, sRadioGroupValue);
}

function Wait(iMilliseconds)
{
    GetAJAXResult('MTrE', 'ControlLibrary', 'Wait', 'WaitTime=' + iMilliseconds);
}

function ReportClientError(sErrorMsg, oXML)
{
    CallAJAX('MTrE', 'ControlLibrary', 'ReportClientError', 'Msg=' + encodeURIComponent(sErrorMsg), oXML);
}

//Returns false if the ghost frame is locked -- used as an event handler on all
//normal pages
function IsPageAvailable(oFrame)
{
	ResetTimeoutInterval();
	window.status = "";	//Always clear the last status line message when user does something

	//Return true iff the ghost frame is not in use and the page is loaded
	return( AppGhostFrameReady && oFrame.AppPageReady );
}

//Create a js class to characterize a timeout
function FrameTimeout(oTimeoutHandle, iTrackingNo)
{
	this.TimeoutHandle = oTimeoutHandle;
	this.TrackingNo = iTrackingNo;
}

//Create a js class to characterize a frame
function FrameLoadInfo(oFrame, iFrameId, sTaskName, sTaskArgList)
{
	this.Frame = oFrame;				//Window handle for this frame
	this.FrameId = iFrameId;			//Frame id for this frame
	this.TaskName = sTaskName;			//Task name for this frame
	this.TaskArgList = sTaskArgList;	//Arg list for this frame
	this.Popup = null;					//Window handle for this frame's popup
	this.Overlay = '';					//Notation for current overlay (target frameid + '.' + overlay id)
	this.ParentFrameId = 0;				//Parent frame id (indicates this is a subtask)
	this.SubTaskIdList = new Array();	//Subtask id list
	this.Controls = new Object();		//Pointers to various controls
	this.FrameTimeouts = new Object();	//Pointers to various named timeout handles
	this.TimeoutTrackingNo = 0;			//Incremented each time a Timeout is set
	this.IsLoaded = false;				//If true indicates that we know aspx is loaded server side
	this.TaskInputs = new Object();		//Contains current task input values should we need to refresh session state
    this.IsBaseASPX = false;            //Indicates a non-MTrE aspx living inside an MTrE frameset
}
FrameLoadInfo.prototype.PopupType =
	function()
	{
        if( this.Frame != this.Frame.parent && this.Frame.name.length > 4 && this.Frame.name.substr(0,4) == '__OI' )
		{
			return 2; //It's an overlay iframe
		}
		else if( this.Frame.top != window.top )
		{
			return 1; //If top window not the same top window of AppRoot, it's a regular popup
		}
		else
		{
			return 0; //It's not a popup or overlay
		}
	}
FrameLoadInfo.prototype.Parent =
	function()
	{
		return AppRoot.AppCurrentFrames.GetFrameLoadInfo(this.ParentFrameId).Frame;
	}
FrameLoadInfo.prototype.Child =
	function()
	{
		return AppRoot.AppCurrentFrames.GetFrameLoadInfo(this.SubTaskIdList[0]).Frame;
	}
FrameLoadInfo.prototype.Top =
	function()
	{
		return this.Frame.AppTopFrame;
	}
FrameLoadInfo.prototype.Opener =
	function()
	{
		switch(this.PopupType())
		{
			case 1: return this.Frame.top.opener; break;
			case 2: return this.Frame.parent; break;
			default: return null;
		}
	}
FrameLoadInfo.prototype.PopupOpenerId =
	function()
	{
		switch(this.PopupType())
		{
			case 1: return this.Frame.top.opener.AppFrameId; break;
			case 2: return this.Frame.parent.AppFrameId; break;
			default: return '';
		}
	}
FrameLoadInfo.prototype.ClosePopup =
	function()
	{
		if( !AppRoot.IsEmpty(this.Popup) )
		{
			try	//If it's not actually there we don't care that we can't close it
			{
				this.Popup.close()
			}
			catch(e){}
		}
		this.Popup = null;

		if( this.Overlay && this.Overlay.split('.').length > 1 )
		{
			//Get iframe and close it out
			var oOverlayFrame = AppCurrentFrames.GetFrameLoadInfo(this.Overlay.split('.')[0]);
			if( oOverlayFrame )
			{
				var sOverlayId = this.Overlay.substring(this.Overlay.indexOf('.') + 1);
				var oOverlayIframe = oOverlayFrame.Frame.frames['__OI' + sOverlayId];
				if( oOverlayIframe )
				{
					try	//If it's not actually there we don't care that we can't close it
        			{
        			    CloseFrame(oOverlayIframe, true);
        			}
					catch (e) { }
            	}
			}
		}
		this.Overlay = '';
	}
FrameLoadInfo.prototype.ResetControlPointer =
	function(sControlID)
	{
		if( this.Controls[sControlID] )
		{
			delete this.Controls[sControlID];
		}
	}
FrameLoadInfo.prototype.GetControlPointer =
	function(sControlID)
	{
		if( this.Controls[sControlID] == null )
		{
			this.Controls[sControlID] = this.Frame.document.getElementById(sControlID);
			if( this.Controls[sControlID] == null )
			{
				this.Controls[sControlID] = new Object();
				this.Controls[sControlID].style = new Object();
				this.Controls[sControlID].setAttribute = function(sID, sValue){};
				this.Controls[sControlID].Link = function(){};
                this.Controls[sControlID].Tree = new Object();
                this.Controls[sControlID].Tree.lockTree = function(){};

				try
				{
					//ReportClientError("Control not found on page " + this.Frame.AppTaskInfo + ": " + sControlID,
					//	ReportFrame(this.Frame, "tf"));
				}
				catch(e){}
			}
		}
		return this.Controls[sControlID];
	}
FrameLoadInfo.prototype.GetControlPointerOrFail =
	function(sControlID)
	{
		if( this.Controls[sControlID] == null )
		{
			this.Controls[sControlID] = this.Frame.document.getElementById(sControlID);
		}
		return this.Controls[sControlID];
	}
FrameLoadInfo.prototype.SetNextTimeoutTrackingNo =
	function()
	{
		this.TimeoutTrackingNo += 1;
		return this.TimeoutTrackingNo;
	}
FrameLoadInfo.prototype.SetTimeout =
	function(sTimeoutId, sCode, iDelay, oWindowOverride, iTrackingNo)
	{
		//Resolve window and clear any existing timeout
		var oFrame;
		if( arguments.length < 5 )
		{
			iTrackingNo = this.SetNextTimeoutTrackingNo();
		}
		if( arguments.length > 3 )
		{
			oFrame = oWindowOverride;
			this.ResetTimeout(sTimeoutId, oWindowOverride);
		}
		else
		{
			oFrame = this.Frame;
			this.ResetTimeout(sTimeoutId);
		}

		//Adjust code to clear handle when the timeout occurs
		sCode = "AppRoot.AppCurrentFrames.GetFrameLoadInfo(" +
			this.FrameId + ").FrameTimeouts['" + sTimeoutId + "'] = null; " + sCode;

		//Setup timeout and return it
		var oFrameTimeout = new FrameTimeout(oFrame.setTimeout(sCode, iDelay), iTrackingNo);
		this.FrameTimeouts[sTimeoutId] = oFrameTimeout;
		return oFrameTimeout;
	}
FrameLoadInfo.prototype.SetTimeoutWithoutHandleClear =
	function(sTimeoutId, sCodeOrFunctionPointer, iDelay, oWindowOverride, iTrackingNo)
	{
		//Resolve window and clear any existing timeout
		var oFrame;
		if( arguments.length < 5 )
		{
			iTrackingNo = this.SetNextTimeoutTrackingNo();
		}
		if( arguments.length > 3 )
		{
			oFrame = oWindowOverride;
			this.ResetTimeout(sTimeoutId, oWindowOverride);
		}
		else
		{
			oFrame = this.Frame;
			this.ResetTimeout(sTimeoutId);
		}

		//Setup timeout and return it
		var oFrameTimeout = new FrameTimeout(oFrame.setTimeout(sCodeOrFunctionPointer, iDelay), iTrackingNo);
		this.FrameTimeouts[sTimeoutId] = oFrameTimeout;
		return oFrameTimeout;
	}
FrameLoadInfo.prototype.ResetTimeout =
	function(sTimeoutId, oWindowOverride)
	{
		//Resolve window
		var oFrame;
		if( arguments.length > 1 )
		{
			oFrame = oWindowOverride;
		}
		else
		{
			oFrame = this.Frame;
		}

		if( !IsEmpty(this.FrameTimeouts[sTimeoutId]) )
		{
			try
			{
				oFrame.clearTimeout(this.FrameTimeouts[sTimeoutId].TimeoutHandle);
			}
			catch(e) {}
			this.FrameTimeouts[sTimeoutId] = null;
		}
	}
FrameLoadInfo.prototype.ResetTimeoutOnceReady =
	function(sTimeoutId, oWindowOverride)	//Reset timeout after current events process
	{
		//Resolve window
		var oFrame;
		if( arguments.length > 1 )
		{
			oFrame = oWindowOverride;
		}
		else
		{
			oFrame = this.Frame;
		}

		sCode = "AppRoot.AppCurrentFrames.GetFrameLoadInfo(" +
			this.FrameId + ").ResetTimeout('" + sTimeoutId + "', window);";
		oFrame.setTimeout(sCode, 0);
	}

//Create a js class to track current application frames,
//with shared methods immediately following
function AppTrackFrames()
{
	this.NextFrameId = 1;				//Id to be assinged to next frame added (0 will be kept for no frame)
	this.Count = 0;						//Total current frames being tracked
	this.Item = new Object();			//All current frames being tracked
}
AppTrackFrames.prototype.Add =
	function(oFrame, sTaskName, sTaskArgList)
	{
        var iFrameId;
        if( oFrame.PopoutFrameId )
        {
            iFrameId = oFrame.PopoutFrameId;
            this.Item[iFrameId].Frame = oFrame;
            this.Item[iFrameId].Overlay = '';
            this.Item[iFrameId].Controls = new Object();
            this.Item[iFrameId].FrameTimeouts = new Object();
            this.Item[iFrameId].Retain = false;
        }
        else
        {
		    //Add a new frame and bump up the next frame id by 1
		    iFrameId = this.NextFrameId++;
		    this.Item[iFrameId] = new FrameLoadInfo(oFrame, iFrameId, sTaskName, sTaskArgList);
		    this.Count += 1;

            //Resolve owner id for the overlay (if any)
            var oParent = GetAppParent(oFrame);
            if( oParent )
            {
                try //Classic page running inside another domain
                {
                    oFrame.AppOwnerFrameId = oParent.ChildLoadOwnerId; //AppOwnerFrameId needs to be defined, even if set to null
                    oParent.ChildLoadOwnerId = null;
                } catch(e){}
            }

            //Main frame -- may need to resize iframe its in by tickling the container frame
            if( oFrame == AppMainFrame && AppRoot.onresize ) setTimeout(function(){ AppRoot.onresize(); }, 0);
        }

		//Return the frame id
        LogToDebugger(' AppTrackFrames.Add  FrameId = ' + iFrameId + '  ' + sTaskName + '?' + sTaskArgList);
		return iFrameId;
	}
AppTrackFrames.prototype.AddBaseASPX =
	function(oFrame, sTaskName, sTaskArgList, iOriginalFrameId, iOwnerFrameId)
	{
        var iFrameId;
        if( arguments.length > 3 && iOriginalFrameId )
        {
            //Preserve the original frame id that was posted back
            iFrameId = iOriginalFrameId;
            this.Item[iFrameId] = new FrameLoadInfo(oFrame, iFrameId, sTaskName, sTaskArgList);
            this.Count += 1;
            oFrame.AppOwnerFrameId = (arguments.length > 4 ? iOwnerFrameId : null);
        }
        else
        {
		    //Add a new frame and bump up the next frame id by 1
            iFrameId = this.Add(oFrame, sTaskName, sTaskArgList);
        }
        this.Item[iFrameId].IsBaseASPX = true;
		return iFrameId;
	}
AppTrackFrames.prototype.GetFrame =
	function(iFrameId)
    {
        var oFrameInfo = this.GetFrameLoadInfo(iFrameId);
        if( oFrameInfo ) return oFrameInfo.Frame;
    }
AppTrackFrames.prototype.GetFrameLoadInfo =
	function(iFrameId){ return this.Item[iFrameId]; }
AppTrackFrames.prototype.Remove =
	function(iFrameId)
	{
		//Close any popups (note that child frames unload automatically)
		var oFrameLoadInfo = this.GetFrameLoadInfo(iFrameId);
        if( oFrameLoadInfo ) //We know from ad hoc testing that pre-IE9 this might be null
        {
		    oFrameLoadInfo.ClosePopup();

		    //If it has a parent, remove its parent's reference to it
		    if( oFrameLoadInfo.ParentFrameId !== 0 )
		    {
			    var oParentFrameLoadInfo = this.GetFrameLoadInfo(oFrameLoadInfo.ParentFrameId);
			    for( var iSubTask = oParentFrameLoadInfo.SubTaskIdList.length - 1; iSubTask >= 0; iSubTask-- )
			    {
				    if( oParentFrameLoadInfo.SubTaskIdList[iSubTask] == iFrameId )
				    {
					    oParentFrameLoadInfo.SubTaskIdList.splice(iSubTask,1);
				    }
			    }
		    }

		    //If it has subtasks, remove their references to it (they should already have removed themselves)
		    for( var iSubTask = 0; iSubTask < oFrameLoadInfo.SubTaskIdList.length; iSubTask++ )
		    {
			    var oSubTaskFrameLoadInfo = this.GetFrameLoadInfo(oFrameLoadInfo.SubTaskIdList[iSubTask]);
			    if( oSubTaskFrameLoadInfo.ParentFrameId == iFrameId )
			    {
				    oSubTaskFrameLoadInfo.ParentFrameId = 0;
			    }
		    }

		    //Remove this frame from the list of current frames
            if( !oFrameLoadInfo.Retain )
            {
                delete this.Item[iFrameId];
		        this.Count -= 1;
            }
        }
	}
AppTrackFrames.prototype.ProcessHotkey =
	function(iFrameId, e, bCheckParent, iOriginatingChildId)
	{
		//Get the relevant frame info
		var oFrameLoadInfo = this.GetFrameLoadInfo(iFrameId);

		//See if the hotkey applies to the current frame
		var bKeyProcessed = oFrameLoadInfo.Frame.ProcessKeystroke(e);

		//If not, see if the hotkey applies to any subframe or parent (recursively)
		if( !bKeyProcessed )
		{
			for( var iSubTask = 0; iSubTask < oFrameLoadInfo.SubTaskIdList.length; iSubTask++ )
			{
				//Check the subframes (excepting the child frame from which this request originated)
				var iChildId = oFrameLoadInfo.SubTaskIdList[iSubTask];
				if( iChildId != iChildId )
				{
					bKeyProcessed = this.ProcessHotkey(iChildId, e, false, 0);
					if( bKeyProcessed )
					{
						break;
					}
				}
			}

			//As necessary check the parent
			if( !bKeyProcessed && bCheckParent && oFrameLoadInfo.ParentFrameId != 0 )
			{
				bKeyProcessed = this.ProcessHotkey(oFrameLoadInfo.ParentFrameId, e, true, iFrameId);
			}
		}

		//Return false iff the key was processed
		return bKeyProcessed;
	}
AppTrackFrames.prototype.ClosePopupsOnAppUnload =
	function(iFrameId)
	{
		//Loop through all frames and defeat unload processing
		//that tries to maintain FrameLoadInfo.
		//Reason:  the js engine does not appear and if we
		//don't suppress the ununload logic it fires after
		//FrameLoadInfo has already been emptied of elements.
		for( var iFrameId in this.Item )
		{
			try	//If it's not actually there we can ignore it
			{
				this.Item[iFrameId].Frame.unload = function(){};
			}
			catch(e){}
		}

		//Loop through all frames being tracked, and close any popus
		for( var iFrameId in this.Item )
		{
			var oPopup = this.Item[iFrameId].Popup;
			if( !AppRoot.IsEmpty(oPopup) )
			{
				try	//If it's not actually there we don't care that we can't close it
				{
					oPopup.close()
				}
				catch(e){}
			}
		}
	}
//Instantiate the class just defined to track current frames,
var AppCurrentFrames = new AppTrackFrames();

//Shorthand way to reference AppCurrentFrames.GetFrameLoadInfo.GetControlPointer
function GetPointer(iFrame, sControlID)
{
    var oPointerFrameInfo = AppCurrentFrames.GetFrameLoadInfo(iFrame);
    if( oPointerFrameInfo )
    {
    	return oPointerFrameInfo.GetControlPointer(sControlID);
    }
    else
    {
		var oResult = new Object();
		oResult.style = new Object();
		oResult.setAttribute = function(sID, sValue){};
		oResult.Link = function(){};
        oResult.Tree = new Object();
        oResult.Tree.lockTree = function(){};
        return oResult;
    }
}
function ResetPointer(iFrame, sControlID)
{
	void AppCurrentFrames.GetFrameLoadInfo(iFrame).ResetControlPointer(sControlID);
}
function RefreshPointer(iFrame, sControlID)
{
	AppCurrentFrames.GetFrameLoadInfo(iFrame).ResetControlPointer(sControlID);
	void AppCurrentFrames.GetFrameLoadInfo(iFrame).GetControlPointer(sControlID);
}

//Shorthand way to reference AppCurrentFrames.GetFrameLoadInfo.GetControlPointer
function GetPointerOrFail(iFrame, sControlID)
{
	return AppCurrentFrames.GetFrameLoadInfo(iFrame).GetControlPointerOrFail(sControlID);
}

//Timeout handling
function DoTimeout()
{
	//Close all our popups
	AppCurrentFrames.ClosePopupsOnAppUnload();

    //Cripple the last activity cookie
    AppRoot.document.cookie = '__LastActivity=-1; path=/;';

	//Redirect to a timeout message
	AppRoot.AppSuppressUnload = true; //Let cleanup agent release resources (don't want to cause session state to persist)

    LogToDebugger('>> Timeout to ' + AppTimeoutURL);

	AppRoot.parent.location.replace(AppTimeoutURL);
}
function GetLapseSinceLastActivity()
{
	var iLapseSinceActivity = 0;
	var sCookieInfo = AppRoot.document.cookie;
	var bCookieFound = false;
	if( sCookieInfo )
	{
		var oLastActivity = sCookieInfo.split('__LastActivity=');
		if( oLastActivity.length > 1 )
		{
			bCookieFound = true;
            iLastActivity = parseInt(oLastActivity[1].split(';')[0],10);
			iLapseSinceActivity = (new Date()).getTime() - iLastActivity;
			if( iLastActivity < 0 || iLapseSinceActivity >= AppTimeout )
			{
				DoTimeout();
			}
            else if( iLapseSinceActivity < 0 ) ResetTimeoutInterval();
		}
	}
	if( !bCookieFound )
	{
		ResetTimeoutInterval();
	}
	return iLapseSinceActivity;
}
function ResetTimeoutInterval()
{
	AppRoot.document.cookie = '__LastActivity=' + (new Date()).getTime() + '; path=/;';
}
function OnInterval()	//Checks for timeout
{
	var iLapseSinceActivity = GetLapseSinceLastActivity();
	if( AppTimeout - iLapseSinceActivity <= 60000 ) //1 minute warning
	{
		window.status = "Window will close in less than 1 minute ...";
	}
	else if( AppTimeout - iLapseSinceActivity <= 120000 ) //2 minute warning
	{
		window.status = "Window will close in less than 2 minutes ...";
	}
	else if( AppTimeout - iLapseSinceActivity <= 180000 ) //3 minute warning
	{
		window.status = "Window will close in less than 3 minutes ...";
	}
	else if( AppTimeout - iLapseSinceActivity <= 240000 ) //4 minute warning
	{
		window.status = "Window will close in less than 4 minutes ...";
	}
}

//Facilitate loaded the current frame or its popup with a given task
function DoAction(oFrame, sOnLoadArguments)	//Assumes the current loaded task in oFrame
{
	var oFrameLoadInfo = null;
    if( oFrame.AppFrameId ) oFrameLoadInfo = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId);
    if( !oFrameLoadInfo || oFrameLoadInfo.IsBaseASPX )
    {
        try
        {
            var oJavascriptAction = oFrame.eval(sOnLoadArguments.split('?')[0]);
            var oActionArgs = new Object();
            var iActionArgs = sOnLoadArguments.indexOf('?') + 1;
            if( iActionArgs > 0 && sOnLoadArguments.length > iActionArgs )
            {
                var sActionArgs = sOnLoadArguments.substr(iActionArgs).split('&');
			    for( var iArg in sActionArgs )
			    {
                    var iEqual = sActionArgs[iArg].indexOf('=');
                    if( iEqual > 0 )  //If the = is in position 0 we have no argument key to work with, if < no = found
                    {
    				    oActionArgs[sActionArgs[iArg].substr(0, iEqual)] = ((sActionArgs[iArg].length > (iEqual + 1)) ? sActionArgs[iArg].substr(iEqual + 1) : '');
                    }
			    }
            }
            if( oJavascriptAction ) oJavascriptAction(oActionArgs);
        }
        catch(ex){}
    }
    else if( oFrameLoadInfo )
    {
    	OpenFrame(oFrame, oFrameLoadInfo.TaskName, '', sOnLoadArguments, oFrameLoadInfo.TaskArgList);
    }
}

function OpenFrame(oFrame, sTaskName, sUncompiledTaskArgList, sOnLoadArguments, sCompiledTaskArgList, oOnLoadFunction)
{
	//Do the work only if the ghost frame is ready
	if( AppGhostFrameReady )
	{
		//Preserve the link that trigger the action (if any)
		if( AppFrameFocus && (!AppFrameActionLinkInfo || AppFrameActionLinkInfo.split('|').length != 2 ) )
		{
			try
			{
				var oActiveElement = AppFrameFocus.document.activeElement;
				if( oActiveElement && oActiveElement.tagName.toLowerCase() == 'a' )
				{
					AppFrameActionLinkInfo =
						AppFrameFocus.AppFrameId + '|' +
						AppFrameFocus.document.activeElement.id + '|' +
						AppFrameFocus.document.activeElement.innerText.replace(/\x7c/g, ' ') + '|' +
						AppFrameFocus.document.activeElement.title.replace(/\x7c/g, ' ');
				}
			}
			catch(e){}
		}

	    if( OpenFrame.StickyLinkTimer )
	    {
	        setTimeout(function(){try{ oFrame.clearTimeout(OpenFrame.StickyLinkTimer); } catch(e){} try{ delete OpenFrame.StickyLinkTimer; } catch(e){} }, 50);
	    }

		//Determine parent frame as needed
		var oParentFrame = GetAppParent(oFrame);

		//Determine the net task arg list (certain terms are always added)
		var sTaskArgList;
		if( arguments.length < 5 )
		{
			sTaskArgList = CompileTaskArgList(sUncompiledTaskArgList, oParentFrame);
		}
		else
		{
			sTaskArgList = sCompiledTaskArgList;
		}

		//Save the child task, arg list, and onload arguments
		oParentFrame.ChildLoadTaskName = sTaskName;
		oParentFrame.ChildLoadTaskArgList = sTaskArgList;
		oParentFrame.ChildLoadOnLoadArguments = sOnLoadArguments;
		if( arguments.length < 6 || !oOnLoadFunction )
		{
			oParentFrame.ChildLoadOnLoadFunction = null;
		}
		else
		{
			oParentFrame.ChildLoadOnLoadFunction = oOnLoadFunction;
		}

		//Determine if this task is already loaded -- if so load instance info immediately
		//(else we'll set the URL accordingly which when done will load the instance data)
		var bLoadNow = false;
		if( !IsEmpty(oFrame.AppFrameId) )
		{
			var oFrameLoadInfo = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId);
			if( oFrameLoadInfo && oFrameLoadInfo.TaskName && !oFrameLoadInfo.IsBaseASPX )
			{
				if( oFrameLoadInfo.TaskName == sTaskName && oFrameLoadInfo.TaskArgList == sTaskArgList )
				{
					bLoadNow = true;
				}
				else if( oFrameLoadInfo.TaskName == sTaskName &&
						decodeURIComponent(oFrameLoadInfo.TaskArgList) == sTaskArgList )
				{
					bLoadNow = true;
				}
				if( bLoadNow && sOnLoadArguments && sOnLoadArguments.search("Reload=true") > -1 )
				{
					bLoadNow = false;
				}
			}
		}

		//Load instance info or set to URL as appropriate
		if( bLoadNow )
		{
   			LoadFrameInstanceInfo(oFrame.AppFrameId, sTaskName, sTaskArgList, sOnLoadArguments);
		}
		else
		{
            LogToDebugger('>> Load Task?TaskArgs = ' + sTaskName + '?' + sTaskArgList);

            oFrame.AppPageReady = false;
			oFrame.location.replace(sTaskName + '?' + sTaskArgList);
		}
	}
}
function OpenFrameById(iFrameId, sTaskName, sUncompiledTaskArgList, sOnLoadArguments)
{
	OpenFrame(AppCurrentFrames.GetFrameLoadInfo(iFrameId).Frame,
			  sTaskName, sUncompiledTaskArgList, sOnLoadArguments)
}

var iOverlayZIndexOffset = 9990;
var iNextPopupDistinguisher = 1;
function OpenFramePopup(oFrame, sTaskName, sUncompiledTaskArgList, sOnLoadArguments, iWidth, iHeight, sPopupFeatures, bIsBaseASPX)
{
	//Do the work only if the ghost frame is ready
	if( AppGhostFrameReady || !sOnLoadArguments ) //No onload args --> not a BaseTask
	{
		//If not specified use default popup features
		var bIsOverlay;
		var oFeatures;
		if( arguments.length < 7 || !sPopupFeatures )
		{
			sPopupFeatures = "resizable=yes";
			bIsOverlay = false;
		}
		else
		{
			oFeatures = sPopupFeatures.split(',');
			bIsOverlay = (oFeatures[0].split('=')[0] == 'overlay');
		}
        if( arguments.length < 8 ) bIsBaseASPX = false;

		//Close any existing true popups
        var oOverlayProperties = new Object();
        var bIsWebForm = true;
		if( bIsOverlay )
        {
			//Determine overlay characteristics
			for( var iOverlayProperty in oFeatures )
			{
                if( oFeatures[iOverlayProperty].split("=")[0] == 'html' )
                {
                    bIsWebForm = false;
                }
                else
                {
				    oOverlayProperties[oFeatures[iOverlayProperty].split("=")[0]] =
					    oFeatures[iOverlayProperty].split("=")[1];
                }
			}
            var oOwnerFrame;
            if( oOverlayProperties.owner && AppCurrentFrames.GetFrameLoadInfo(oOverlayProperties.owner)) oOwnerFrame = AppCurrentFrames.GetFrameLoadInfo(oOverlayProperties.owner).Frame;
            if( !oOwnerFrame ) oOwnerFrame = oFrame;
            if( bIsWebForm && oOwnerFrame.top != AppRoot && (!oOverlayProperties.overlaymode || oOverlayProperties.overlaymode != '1') )
            {
                bIsOverlay = false;
                oFrame = oOwnerFrame;
                AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ClosePopup();
            }
        }
        else
        {
            AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ClosePopup();
        }

		//Save the child task, arg list, and onload arguments
        if( bIsWebForm )
        {
		    //Determine the net task arg list (certain terms are always added)
		    var sTaskArgList;
            if( bIsBaseASPX ) sTaskArgList = sUncompiledTaskArgList;
            else
            {
                sTaskArgList = CompileTaskArgList(sUncompiledTaskArgList, oFrame);

		        oFrame.ChildLoadTaskName = sTaskName;
		        oFrame.ChildLoadTaskArgList = sTaskArgList;
		        oFrame.ChildLoadOnLoadArguments = sOnLoadArguments;
		        oFrame.ChildLoadOnLoadFunction = null;
            }
        }

		//Open new window (construct name to be distinct to this session of the application
		//in case the user is running more than one instance)
		if( bIsOverlay )
		{
            //Preserve actual owner so when overlay frame loads it can know its owner (on exit handling needs this)
            if( bIsWebForm ) oFrame.ChildLoadOwnerId = oOverlayProperties.owner;

			var iLeft = 0;
			var iTop = 0;
			if( oOverlayProperties.centered )
			{
				iLeft = (GetFrameWidth(oFrame) - iWidth)/2;
				iTop = (GetFrameHeight(oFrame) - iHeight)/2;
			}
			if( oOverlayProperties.left )
			{
				iLeft += parseInt(oOverlayProperties.left,10);
			}
			if( oOverlayProperties.top )
			{
				iTop += parseInt(oOverlayProperties.top,10);
			}
			iLeft = Math.max(0, iLeft);
			iTop = Math.max(0, iTop);

			var iBorderSpace = 2 * (oOverlayProperties.border ? oOverlayProperties.border : 0);

			//See if overlay already available and open
			var oExistingIframe = oFrame.frames['__OI' + sTaskName];
            var bIsUIElement = (oOverlayProperties.overlaymode && (oOverlayProperties.overlaymode == '2' || oOverlayProperties.overlaymode == '3'));
            var bIsAutoExit = (oOverlayProperties.overlaymode && oOverlayProperties.overlaymode == '3');
			if( oExistingIframe )
			{
                var oExistingIframeContainer = oFrame.document.getElementById('__OI' + sTaskName);
                if( oExistingIframeContainer )
                {
                    oExistingIframeContainer.style.width = (iWidth + iBorderSpace) + 'px';
                    oExistingIframeContainer.style.height = (iHeight + iBorderSpace) + 'px';
					var oExitButton = oFrame.document.getElementById('__OX' + sTaskName);
					if( oExitButton ) oExitButton.style.left = (iWidth + iBorderSpace - 16) + 'px';
                }

				//Open frame and activated related html
                if( bIsWebForm && !bIsBaseASPX )
                {
				    OpenFrame(oExistingIframe, sTaskName, sUncompiledTaskArgList, sOnLoadArguments, sTaskArgList,
                        bIsUIElement ? null :
					        function()
					        {
						        PrepDrag(oFrame, sTaskName,
							        (oOverlayProperties.title ? 'true' : 'false'),
							        (oOverlayProperties.resizable ? 'true' : 'false'));
					        });
                }
                else
                {
                    oExistingIframe.location.reload(sTaskName + '?' + sUncompiledTaskArgList);
                }
				var oOpacityDiv = oFrame.document.getElementById('__OH' + sTaskName);
				if( oOpacityDiv )
				{
					 oOpacityDiv.style.display = '';
					 oOpacityDiv.style.zIndex = (iOverlayZIndexOffset++).toString();
				}
				var oOverlayContainer = oFrame.document.getElementById('__OC' + sTaskName);
				if( oOverlayContainer )
				{
					oOverlayContainer.style.top = iTop + 'px';
					oOverlayContainer.style.left = iLeft + 'px';
					oOverlayContainer.style.display = '';
					oOverlayContainer.style.zIndex = (iOverlayZIndexOffset++).toString();
				}

				//Restore overlay pointer
				if( bIsWebForm ) try{ AppCurrentFrames.GetFrameLoadInfo(oOverlayProperties.owner).Overlay = oFrame.AppFrameId.toString() + '.' + sTaskName; } catch(e){}
			}
			else
			{
                var sZIndexOffset = (iOverlayZIndexOffset++).toString();
				var sIframeHTML =
					'<div id ="__OC' + sTaskName + '" ' +
						'style="z-index:' + sZIndexOffset + ';position:absolute;top:' + iTop + 'px;left:' + iLeft + 'px' +
							((oOverlayProperties.resizable && !bIsUIElement) ? ';border:solid 6px Silver;background-color:Silver" ' : '"') +
						((oOverlayProperties.resizable && !bIsUIElement) ?
							(' onmouseover="AppRoot.PrepDrag(window,\'' + sTaskName + '\',' +
								(oOverlayProperties.title ? 'true' : 'false') + ',true)"') :
							'') +
						'>' +
						((oOverlayProperties.title && !bIsUIElement) ?
							('<div id="__OT' + sTaskName + '" ' +
								((oOverlayProperties.resizable && !bIsUIElement) ? '' :
									('onmouseover="AppRoot.PrepDrag(window,\'' + sTaskName + '\',true,false)" ')) +
								'style="color:White;background-color:#000066;' +
									'font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:12px;font-weight:bold;' +
									'border: solid 1px gray;border-left: solid 1px gray;border-bottom-width: 0px">&nbsp;' +
							'</div>') :
							'') +
						'<iframe id="__OI' + sTaskName + '" name="__OI' + sTaskName + '" ' +
							'src="' + sTaskName + '?' + sTaskArgList + '" ' +
                            ((oOverlayProperties.border && !bIsUIElement) ? '' : 'frameborder=0 ') +
                            (bIsAutoExit ?
                                'onblur="' +
    						        (oOverlayProperties.exitfunction ? ('window.frames[\'__OI' + sTaskName + '\'].' + oOverlayProperties.exitfunction) : 'AppRoot.CloseFrame') +
						            '(window.frames[\'__OI' + sTaskName + '\'], true);" ' :
                                '') +
							'style="width:' + (iWidth + iBorderSpace) + 'px;height:' + (iHeight + iBorderSpace) + 'px;' +
								((oOverlayProperties.border && !bIsUIElement) ? ('border-width:' + oOverlayProperties.border + 'px;') : '') +
								'overflow:hidden;z-index:999"' +
                                (oOverlayProperties.overlayallowstransparency ? ' ALLOWTRANSPARENCY=true' : '') +
                                '>' +
						'</iframe>' +
                        (((AppRoot.IsIE && !AppRoot.IsHTML5) || bIsUIElement) ? '' :
						    '<div id="__OF' + sTaskName + '" name="__OF' + sTaskName + '" ' +
							    'style="position:absolute; top:' + (iBorderSpace + 15) + 'px; left:' + iBorderSpace + 'px; width:' + (iWidth - 16) +
                                    'px;height:' + (iHeight - iBorderSpace - 1) + 'px; opacity:0.02; background-color:Pink; z-index:9999; display:none">' +
						    '</div>') +
					'</div>';
	            if( (oOverlayProperties.opacity || oOverlayProperties.title || oOverlayProperties.resizable) && !bIsUIElement )
				{
                    var sOpacityStyling;
                    if( AppRoot.IsIE && !AppRoot.IsHTML5 )
                    {
                        sOpacityStyling =
                            oOverlayProperties.opacity ?
								('filter:alpha(opacity=' + oOverlayProperties.opacity + ')') :
								('visibility:hidden;filter:alpha(opacity=2)');
                    }
                    else
                    {
                        sOpacityStyling =
                            oOverlayProperties.opacity ?
								('opacity:' + (oOverlayProperties.opacity/100)) :
								('visibility:hidden;opacity:0.02');
                    }
					sIframeHTML =
						'<div id ="__OH' + sTaskName + '" ' +
							'style="z-index:' + sZIndexOffset + ';position:absolute;top:0px;left:0px;width:100pc;height:100pc;' + sOpacityStyling + ';background-color:Smoke">' +
						'</div>' +
						sIframeHTML;
				}
				oFrame.document.body.insertAdjacentHTML('BeforeEnd', sIframeHTML);
				if( (oOverlayProperties.opacity || oOverlayProperties.title || oOverlayProperties.resizable) && !bIsUIElement )
				{
					oFrame.document.getElementById('__OH' + sTaskName).style.backgroundColor = 'White';
				}
				if( bIsWebForm ) try{ AppCurrentFrames.GetFrameLoadInfo(oOverlayProperties.owner).Overlay = oFrame.AppFrameId.toString() + '.' + sTaskName; } catch(e){}

				//Float in an exit button
				if( bIsWebForm && oOverlayProperties.title && oOverlayProperties.toolbar && !bIsUIElement )
				{
					var oContainer = oFrame.document.getElementById('__OC' + sTaskName);
					var oExitButton = oFrame.document.createElement('a'); //Anchor
					oExitButton.innerHTML = '<img src="Images/Close.gif" border=0/>';
					oExitButton.style.position = 'absolute';
					oExitButton.style.top = '3px';
					oExitButton.style.left = (oContainer.clientWidth - 16) + 'px';
					oExitButton.setAttribute('id', '__OX' + sTaskName);
					oExitButton.setAttribute('title', 'Close this window');
					oExitButton.setAttribute('href', 'javascript:' +
						(oOverlayProperties.exitfunction ? ('window.frames["__OI' + sTaskName + '"].' + oOverlayProperties.exitfunction) : 'AppRoot.CloseFrame') +
						'(window.frames["__OI' + sTaskName + '"], true);');
					oExitButton.setAttribute('tabIndex', -1);
					oContainer.appendChild(oExitButton);

                    if( oOverlayProperties.popout && AppRoot.IsIE && !AppRoot.IsHTML5 && bIsWebForm && !bIsBaseASPX )
                    {
					    var oMaxButton = oFrame.document.createElement('a'); //Anchor
					    oMaxButton.innerHTML = '<img src="Images/Popout.png" border=0 onmousedown="AppRoot.PopupOverlay(window.frames[\'__OI' + sTaskName + '\']);"/>';
					    oMaxButton.style.position = 'absolute';
                        oMaxButton.style.cursor = 'hand';
					    oMaxButton.style.top = '3px';
					    oMaxButton.style.left = (oContainer.clientWidth - 32) + 'px';
					    oMaxButton.setAttribute('id', '__OMax' + sTaskName);
    					oMaxButton.setAttribute('title', 'Pop out');
					    oMaxButton.setAttribute('onmousedown', 'AppRoot.PopupOverlay(window.frames["__OI' + sTaskName + '"]);');
					    oMaxButton.setAttribute('tabIndex', -1);
					    oContainer.appendChild(oMaxButton);
                    }
				}
			}
		}
		else
		{
            var bIsAutoClose = (sPopupFeatures.indexOf("autoclose=false") < 0);
            if( !bIsAutoClose ) sPopupFeatures.replace(/autoclose=false/, "").replace(/,,/, "");
            oFrame.focus(); //Take focus before opening child popup (so any closing overlay will not set focus to parent AFTER the true popup has focus)
            var oChildPopup =
				oFrame.open(sTaskName + '?' + sTaskArgList,
							"P" + AppPopupPostfix + "_" + iNextPopupDistinguisher++,
							"width=" + iWidth + ",height=" + iHeight +
								"," + sPopupFeatures,
							true);
	        AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Popup = (bIsAutoClose ? oChildPopup : null);
		}
	}
}
function PopupOverlay(oFrame) //exitfunction is not supported
{
    ResetMessages();

    var sPopupFeatures = 'resizable=yes';
    var iWidth = GetFrameWidth(oFrame);
    var iHeight = GetFrameHeight(oFrame);
    var iTop = Math.max(oFrame.parent.event.screenY - 30, 10); //A little up from the mouse click if possible
    var iLeft = Math.max(oFrame.parent.event.screenX - iWidth, -10) + 30; //A little right form the mouse click if possible
    if( iLeft + iWidth > window.screen.availWidth ) iLeft = 10;
    if( iLeft < 0 ) iLeft = 10;
      var oChildPopup = ((oFrame.top == AppRoot) ? oFrame.AppTopFrame : oFrame.top).open("Empty.html", "P" + AppPopupPostfix + "_" + iNextPopupDistinguisher++,
        "top=" + iTop + ",left=" + iLeft + ",width=" + iWidth + ",height=" +iHeight + "," + sPopupFeatures, true);

    AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Retain = true;
    AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).OriginalFrame = oFrame;
    var oAppOwnerFrameId = oFrame.AppOwnerFrameId;

    //Remove overlay reference and resolve new popup owner
    if( oFrame.AppOwnerFrameId && AppCurrentFrames.GetFrameLoadInfo(oFrame.AppOwnerFrameId) )
    {
         AppCurrentFrames.Item[oFrame.AppOwnerFrameId].Overlay = '';
         AppCurrentFrames.Item[oFrame.AppOwnerFrameId].Popup = oChildPopup;
    }

   	//Find hosted and related divs and remove from body
	var oOpacityDiv = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OH'));
	if( oOpacityDiv )
	{
		oOpacityDiv.style.display = 'none';
		oOpacityDiv.style.zIndex = 999;
	}
	var oOverlayContainer = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OC'));
	if( oOverlayContainer )
	{
		oOverlayContainer.style.display = 'none';
		oOverlayContainer.style.zIndex = 999;
	}

    oChildPopup.document.open();
    oChildPopup.document.write("<script language=javascript>window.PopoutFrameId = " + oFrame.AppFrameId + ";</script>");
    oChildPopup.document.write(oFrame.document.documentElement.innerHTML);
    oChildPopup.document.close();
    oChildPopup.AppOwnerFrameId = oAppOwnerFrameId;

   	//Eliminate overlay markup
    delete AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).OriginalFrame;
	if( oOpacityDiv ) oOpacityDiv.parentElement.removeChild(oOpacityDiv);
	if( oOverlayContainer ) oOverlayContainer.parentElement.removeChild(oOverlayContainer);
}
function OverlayDragInfo(oFrame, sOverlayId)
{
	//Fixed properties related to this overlay
	this.Frame = oFrame;			//Frame which hosts the overlay iframe
	this.OverlayId = sOverlayId;	//Unique id of overlay

	this.Iframe = null;				//Iframe window that contains the overlay
	this.IframeElement = null;		//Iframe html tag
	this.OriginalWidth = 0;			//Original width of the iframe
	this.OriginalHeight = 0;		//Original height of the iframe

	this.OverlayDiv = null;			//Div that overlays underlying screen
	this.ContainerDiv = null;		//Div tag contains header and iframe and allows resizing
	this.TitlebarDiv = null;		//Div tag that holds the title
    this.CoveringDiv = null;        //For non-IE, covers the overlay iframe being moved
	this.ExitButton = null;
	this.MaxButton = null;

	//Dynamic values
	this.IsDragging = false;
	this.IsResizing = false;

	this.MouseStartX = 0;
	this.MouseStartY = 0;
	this.StartX = 0;
	this.StartY = 0;
	this.StartWidth = 0;
	this.StartHeight = 0;
	this.MaxX = 0;
	this.MaxY = 0;
	this.DragType = '';
}
OverlayDragInfo.prototype.EvalCursor =
	function()
	{
		//Figure out where the mouse went over relative to the container
		try
		{
			var iRelativeX = this.Frame.event.x - parseInt(this.ContainerDiv.style.left,10);
			var iRelativeY = this.Frame.event.y - parseInt(this.ContainerDiv.style.top,10);
			if( iRelativeX <= 20 && iRelativeY <= 20 )
			{
				this.DragType = 'nw';
			}
			else if( iRelativeX > (this.ContainerDiv.clientWidth - 16)  && iRelativeY <= 20 )
			{
				this.DragType = 'ne';
			}
			else if( iRelativeY <= 20 )
			{
				this.DragType = 'n';
			}
			else if( iRelativeX <= 20 && iRelativeY > (this.ContainerDiv.clientHeight - 16) )
			{
				this.DragType = 'sw';
			}
			else if( iRelativeX <= 20 )
			{
				this.DragType = 'w';
			}
			else if( iRelativeX > (this.ContainerDiv.clientWidth - 16) &&
						iRelativeY > (this.ContainerDiv.clientHeight - 16) )
			{
				this.DragType = 'se';
			}
			else if( iRelativeX > (this.ContainerDiv.clientWidth - 16) )
			{
				this.DragType = 'e';
			}
			else
			{
				this.DragType = 's';
			}
			this.Frame.document.body.style.cursor = this.DragType + '-resize';
		}
		catch(e){}
	}
OverlayDragInfo.prototype.MoveMouse =
	function(oMouseFrame)
	{
		if( this.IsDragging )
		{
			if( oMouseFrame.event.button || oMouseFrame.event.button == 0 )
			{
				var iChangeX = oMouseFrame.event.screenX - this.MouseStartX;
				var iChangeY = oMouseFrame.event.screenY - this.MouseStartY;
				this.TitlebarDiv.parentElement.style.left =
					Math.min(Math.max(0,this.StartX + iChangeX),this.MaxX) + 'px';
				this.TitlebarDiv.parentElement.style.top =
					Math.min(Math.max(0,this.StartY + iChangeY),this.MaxY) + 'px';
				if( !this.Frame.document.selection ) this.Frame.document.selection = this.Frame.getSelection();
				this.Frame.document.selection.empty();
			}
			else
			{
				this.IsDragging = false;
				try
				{
					if( oDragInfo && oDragInfo.OverlayDiv )
					{
						oOverlayDiv.style.visibility = 'hidden';
					}
				}
				catch(e){}
			}
		}
		else if( this.IsResizing )
		{
			if( oMouseFrame.event.button || oMouseFrame.event.button == 0 )
			{
				if( this.DragType.indexOf('e') >= 0 )
				{
					var iChangeX = oMouseFrame.event.screenX - this.MouseStartX;
					if( iChangeX > 0 || (this.StartWidth + iChangeX) > this.OriginalWidth )
					{
						this.IframeElement.style.width = (this.StartWidth + iChangeX) + 'px';
					}
					else
					{
						this.IframeElement.style.width = this.OriginalWidth + 'px';
					}
					if( this.ExitButton )
					{
						this.ExitButton.style.left = (this.ContainerDiv.clientWidth - 17) + 'px';
					}
					if( this.MaxButton )
					{
						this.MaxButton.style.left = (this.ContainerDiv.clientWidth - 32) + 'px';
					}
				}
				if( this.DragType.indexOf('w') >= 0 )
				{
					var iChangeX = oMouseFrame.event.screenX - this.MouseStartX;
					if( iChangeX < 0 || (this.StartWidth - iChangeX) > this.OriginalWidth )
					{
						this.IframeElement.style.width = (this.StartWidth - iChangeX) + 'px';
						this.ContainerDiv.style.left = (this.StartX + iChangeX) + 'px';
					}
					else
					{
						this.IframeElement.style.width = this.OriginalWidth + 'px';
						this.ContainerDiv.style.left = (this.StartX + this.StartWidth - this.OriginalWidth) + 'px';
					}
					if( this.ExitButton )
					{
						this.ExitButton.style.left = (this.ContainerDiv.clientWidth - 16) + 'px';
					}
					if( this.MaxButton )
					{
						this.MaxButton.style.left = (this.ContainerDiv.clientWidth - 32) + 'px';
					}
				}
				if( this.DragType.indexOf('n') >= 0 )
				{
					var iChangeY = oMouseFrame.event.screenY - this.MouseStartY;
					if( iChangeY < 0 || (this.StartHeight - iChangeY) > this.OriginalHeight )
					{
						this.IframeElement.style.height = (this.StartHeight - iChangeY) + 'px';
						this.ContainerDiv.style.top = (this.StartY + iChangeY) + 'px';
					}
					else
					{
						this.IframeElement.style.height = this.OriginalHeight + 'px';
						this.ContainerDiv.style.top = (this.StartY + this.StartHeight - this.OriginalHeight) + 'px';
					}
				}
				if( this.DragType.indexOf('s') >= 0 )
				{
					var iChangeY = oMouseFrame.event.screenY - this.MouseStartY;
					if( iChangeY > 0 || (this.StartHeight + iChangeY) > this.OriginalHeight )
					{
						this.IframeElement.style.height = (this.StartHeight + iChangeY) + 'px';
					}
					else
					{
						this.IframeElement.style.height = this.OriginalHeight + 'px';
					}
				}
				if( !this.Frame.document.selection ) this.Frame.document.selection = this.Frame.getSelection();
				this.Frame.document.selection.empty();
			}
			else
			{
				this.IsResizing = false;
				try
				{
					if( oDragInfo && oDragInfo.OverlayDiv )
					{
						oOverlayDiv.style.visibility = 'hidden';
                        if( oDragInfo.CoveringDiv ) oDragInfo.CoveringDiv.style.display = 'none';
					}
				}
				catch(e){}
			}
		}
		return true;
	}
function PrepDrag(oFrame, sOverlayId, bHasTitlebar, bIsResizable)
{
	var oDragInfo = new OverlayDragInfo(oFrame, sOverlayId);
	oDragInfo.Iframe = oDragInfo.Frame.frames['__OI' + sOverlayId];

	if( bIsResizable || bHasTitlebar )
	{
		var oOverlayDiv	= oFrame.document.getElementById('__OH' + sOverlayId);
		if( oOverlayDiv && oOverlayDiv.style.visibility == 'hidden' ) //If modal we need not manipulate it
		{
			oDragInfo.OverlayDiv = oOverlayDiv;
		}
	}

	if( bIsResizable )
	{
		oDragInfo.IframeElement = oDragInfo.Frame.document.getElementById('__OI' + sOverlayId);
		oDragInfo.ContainerDiv = oDragInfo.IframeElement.parentElement;
        if( !oDragInfo.ContainerDiv.PrepDragFunction ) oDragInfo.ContainerDiv.PrepDragFunction = oDragInfo.ContainerDiv.onmouseover;

		if( oDragInfo.IframeElement.__NormalWidth )
		{
			oDragInfo.OriginalWidth = oDragInfo.IframeElement.__NormalWidth;
		}
		else
		{
			oDragInfo.OriginalWidth = parseInt(oDragInfo.IframeElement.style.width,10);
			oDragInfo.IframeElement.__NormalWidth = oDragInfo.OriginalWidth;
		}
		if( oDragInfo.IframeElement.__NormalHeight )
		{
			oDragInfo.OriginalHeight = oDragInfo.IframeElement.__NormalHeight;
		}
		else
		{
			oDragInfo.OriginalHeight = parseInt(oDragInfo.IframeElement.style.height,10);
			oDragInfo.IframeElement.__NormalHeight = oDragInfo.OriginalHeight;
		}

		oDragInfo.ContainerDiv.onmousedown =
			function()
			{
                if( oDragInfo.Frame.document.getSelection )
                {
                    var oRange = oDragInfo.Frame.document.getSelection();
                    if( oRange ) oRange.removeAllRanges();
                }
                else if( oDragInfo.Frame.document.selection ) oDragInfo.Frame.document.selection.empty();

				oDragInfo.EvalCursor();
                if( oDragInfo.CoveringDiv ) oDragInfo.CoveringDiv.style.display = '';
				oDragInfo.IsResizing = true;
				oDragInfo.MouseStartX = oDragInfo.Frame.event.screenX;
				oDragInfo.MouseStartY = oDragInfo.Frame.event.screenY;
				oDragInfo.StartX = parseInt(oDragInfo.TitlebarDiv.parentElement.style.left,10);
				oDragInfo.StartY = parseInt(oDragInfo.TitlebarDiv.parentElement.style.top,10);
				oDragInfo.StartWidth = parseInt(oDragInfo.IframeElement.style.width,10);
				oDragInfo.StartHeight = parseInt(oDragInfo.IframeElement.style.height,10);
				if( oDragInfo.OverlayDiv )
				{
					oOverlayDiv.style.visibility = 'visible';
				}
				return true;
			};

		oDragInfo.ContainerDiv.onmouseover =
			function()
			{
				if( !oDragInfo.IsResizing && !oDragInfo.IsDragging )
				{
					oDragInfo.EvalCursor();
				}
				return true;

			}; oDragInfo.ContainerDiv.onmouseover();

		oDragInfo.ContainerDiv.onmousemove =
			function()
			{
				if( !oDragInfo.IsResizing && !oDragInfo.IsDragging )
				{
					oDragInfo.EvalCursor();
					StopEventPropogation(oDragInfo.Frame);
				}
				return true;
			};

		oDragInfo.ContainerDiv.onmouseout =
			function()
			{
				if( !oDragInfo.IsResizing && !oDragInfo.IsDragging )
				{
					oDragInfo.Frame.document.body.style.cursor = 'auto';
				}
			};
	}

    if( !AppRoot.IsIE || AppRoot.IsHTML5 )
    {
        oDragInfo.CoveringDiv = oDragInfo.Frame.document.getElementById('__OF' + sOverlayId);
    }
	if( bHasTitlebar )
	{
		oDragInfo.TitlebarDiv = oDragInfo.Frame.document.getElementById('__OT' + sOverlayId);
        var oContainerDiv = oDragInfo.Frame.document.getElementById('__OC' + sOverlayId);
        if( !bIsResizable && !oContainerDiv.PrepDragFunction ) oContainerDiv.PrepDragFunction = oDragInfo.TitlebarDiv.onmouseover;
		oDragInfo.ExitButton = oDragInfo.Frame.document.getElementById('__OX' + sOverlayId);
		oDragInfo.MaxButton = oDragInfo.Frame.document.getElementById('__OMax' + sOverlayId);

		oDragInfo.TitlebarDiv.onmousedown =
			function()
			{
				if( !oDragInfo.Frame.document.selection ) oDragInfo.Frame.document.selection = oDragInfo.Frame.getSelection();
				oDragInfo.Frame.document.selection.empty();
                if( oDragInfo.CoveringDiv ) oDragInfo.CoveringDiv.style.display = '';
				oDragInfo.IsDragging = true;
				oDragInfo.MouseStartX = oDragInfo.Frame.event.screenX;
				oDragInfo.MouseStartY = oDragInfo.Frame.event.screenY;
				oDragInfo.StartX = parseInt(oDragInfo.TitlebarDiv.parentElement.style.left,10);
				oDragInfo.StartY = parseInt(oDragInfo.TitlebarDiv.parentElement.style.top,10);
				oDragInfo.MaxX = Math.max(GetFrameWidth(oDragInfo.Frame) - 10,oDragInfo.StartX);
				oDragInfo.MaxY = Math.max(GetFrameHeight(oDragInfo.Frame) - 10,oDragInfo.StartY);
				StopEventPropogation(oDragInfo.Frame);
				if( oDragInfo.OverlayDiv )
				{
					oOverlayDiv.style.visibility = 'visible';
				}
				return true;
			};

		if( bIsResizable )
		{
			oDragInfo.TitlebarDiv.onmouseover =
				function()
				{
					if( !oDragInfo.IsResizing )
					{
						oDragInfo.Frame.document.body.style.cursor = 'auto';
					}
					StopEventPropogation(oDragInfo.Frame);
				};
			oDragInfo.TitlebarDiv.onmouseout =
				function()
				{
					if( !oDragInfo.IsResizing )
					{
						oDragInfo.Frame.document.body.style.cursor = 'auto';
					}
					StopEventPropogation(oDragInfo.Frame);
				};
			oDragInfo.TitlebarDiv.onmousemove =
				function()
				{
					if( !oDragInfo.IsResizing && !oDragInfo.IsDragging )
					{
						StopEventPropogation(oDragInfo.Frame);
					}
				};
		}
		else
		{
			oDragInfo.TitlebarDiv.onmouseover = null;
		}
	}

	oDragInfo.Frame.document.onmousemove = function(){ return oDragInfo.MoveMouse(oDragInfo.Frame) };
	oDragInfo.Iframe.document.onmousemove = function(){ return oDragInfo.MoveMouse(oDragInfo.Iframe) };

	oDragInfo.Iframe.document.onmouseup = oDragInfo.Frame.document.onmouseup =
		function()
		{
			oDragInfo.IsDragging = false;
			oDragInfo.IsResizing = false;
			if( oDragInfo.OverlayDiv ) oOverlayDiv.style.visibility = 'hidden';
            if( oDragInfo.CoveringDiv ) oDragInfo.CoveringDiv.style.display = 'none';
			oDragInfo.Frame.document.body.style.cursor = 'auto';
			return true;
		}

    oDragInfo.Frame.top.document.onmouseout =
        function()
        {
            try{ if( oDragInfo && oDragInfo.Iframe && oDragInfo.Iframe.document.onmouseup ) oDragInfo.Iframe.document.onmouseup(); } catch(e){}
        };
}
function StopEventPropogation(oFrame)
{
	if( oFrame.event.stopPropagation )
	{
		oFrame.event.stopPropagation();
	}
	else
	{
		oFrame.event.cancelBubble = true;
	}
}
function CloseFrame(oFrame, bAutoClose)
{
    if( !oFrame ) return;

    LogToDebugger(' CloseFrame  FrameId = ' + oFrame.AppFrameId);

    if( oFrame.AppFrameId ) PropagateChangesIfNeeded();

	//Determine  if overlay (we have to delete the related elements) or not (we just close the window)
	if( !oFrame.AppFrameId )
    {
        var oOpacityDiv = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OH'));
		if( oOpacityDiv )
		{
				oOpacityDiv.style.display = 'none';
				oOpacityDiv.style.zIndex = 999;
		}
		var oOverlayContainer = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OC'));
		if( oOverlayContainer )
		{
				oOverlayContainer.style.display = 'none';
				oOverlayContainer.style.zIndex = 999;
		}
    }
    else if( oFrame.AppFrameId &&
		     (!AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId) ||
		      AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).PopupType() == 2) )
	{
        //Flag if non-mtre aspx
        var bIsASPX;
        try
        {
            bIsASPX = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).IsBaseASPX;
            if( oFrame.parent.document.activeElement == oFrame.parent.document.getElementById(oFrame.name) )
            {
                oFrame.parent.focus(); //Else though overlay disappears cursor shows through!
            }
        }
        catch(e)
        {
            bIsASPX = true;
        }

		//Trigger frame unload
		if( oFrame.onunload )
		{
		    oFrame.onunload();
		    oFrame.onunload = null;
		    oFrame.document.getElementsByTagName('BODY')[0].innerHTML = '';
		}
        else
        {
            try
            {
                AppCurrentFrames.Remove(oFrame.AppFrameId);
                oFrame.WhenExit();
            }
            catch(e){}
            oFrame.AppOnPopupExitHandlingEnabled = false;   //Suppress onunload from occurring after the fact (outside frame doesn't see onunload apparently)
        }

		//Detach from any other frameinfo records
		for( var iFrameId in AppCurrentFrames.Item )
		{
			if( AppCurrentFrames.Item[iFrameId].Overlay &&
				AppCurrentFrames.Item[iFrameId].Overlay.indexOf('.' + oFrame.AppFrameId) >= 0 )
			{
				AppCurrentFrames.Item[iFrameId].Overlay = '';
			}
		}

		//Find hosted and related divs and remove from body
		var oOpacityDiv = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OH'));
		if( oOpacityDiv )
		{
			//if( arguments.length > 1 && bAutoClose )
			//{
				oOpacityDiv.style.display = 'none';
				oOpacityDiv.style.zIndex = 999;
			//}
			//else
			//{
            //  oOpacityDiv.parentElement.removeChild(oOpacityDiv);
			//}
		}
		var oOverlayContainer = oFrame.parent.document.getElementById(oFrame.name.replace('__OI','__OC'));
		if( oOverlayContainer )
		{
			//if( arguments.length > 1 && bAutoClose )
			//{
				oOverlayContainer.style.display = 'none';
				oOverlayContainer.style.zIndex = 999;
			//}
			//else
			//{
            //  oOverlayContainer.parentElement.removeChild(oOverlayContainer);
			//}
		}

        //If non-MTrE aspx, close the window to prevent javascript errors
        if( bIsASPX ) oFrame.onerror = function(){ return true };

        //"Reactivate" the previous overlay in effect (if any)
        if( oFrame.parent.frames.length > 0 )
        {
            var iTopOverlayZIndex = 0;
            var oTopOverlayContainer = null;
            for( var iFrame = 0; iFrame < oFrame.parent.frames.length; iFrame++ )
            {
                if( oFrame.parent.frames[iFrame].name.length > 4 && oFrame.parent.frames[iFrame].name.substr(0,4) == "__OI" )
                {
                    //Get container
                    var oNextOverlayContainer = oFrame.parent.document.getElementById(oFrame.parent.frames[iFrame].name.replace('__OI','__OC'));
                    if( oNextOverlayContainer &&
                        oOverlayContainer != oNextOverlayContainer &&
                        oNextOverlayContainer.style.zIndex &&
                        parseInt(oNextOverlayContainer.style.zIndex, 10) > iTopOverlayZIndex )
                    {
                        iTopOverlayZIndex = parseInt(oNextOverlayContainer.style.zIndex, 10);
                        oTopOverlayContainer = oNextOverlayContainer;
                    }

                }
            }
            if( oTopOverlayContainer && oTopOverlayContainer.PrepDragFunction ) oTopOverlayContainer.PrepDragFunction();
        }
	}
	else
	{
		oFrame.top.close();
	}
}

function OpenEmptyFramePopup(oFrame, iWidth, iHeight, sPopupFeatures)
{
	//Do the work only if the ghost frame is ready
	if( AppGhostFrameReady )
	{
		//If not specified use default popup features
		if( arguments.length < 4 )
		{
			sPopupFeatures = "resizable=yes";
		}

		//Close any existing popups
		AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ClosePopup();

		//Open new window (construct name to be distinct to this session of the application
		//in case the user is running more than one instance)
        var bIsAutoClose = (sPopupFeatures.indexOf("autoclose=false") < 0);
        if( !bIsAutoClose ) sPopupFeatures.replace(/autoclose=false/, "").replace(/,,/, "");

        var oChildPopup =
			oFrame.open("", "P" + AppPopupPostfix + "_" + iNextPopupDistinguisher++,
						"width=" + iWidth + ",height=" + iHeight +
							"," + sPopupFeatures,
						true);
		AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Popup = (bIsAutoClose ? oChildPopup : null);
	}
}
function OpenFramePopupByURL(oFrame, sPopupURL, iWidth, iHeight, sPopupFeatures)
{
	//If not specified use default popup features
	if( arguments.length < 5 )
	{
		sPopupFeatures = "resizable=yes";
	}

	//Close any existing popups
	AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ClosePopup();

	//Open new window (construct name to be distinct to this session of the application
	//in case the user is running more than one instance)
    var bIsAutoClose = (sPopupFeatures.indexOf("autoclose=false") < 0);
    if( !bIsAutoClose ) sPopupFeatures.replace(/autoclose=false/, "").replace(/,,/, "");

    oFrame.focus(); //Take focus before opening child popup (so any closing overlay will not set focus to parent AFTER the true popup has focus)
    var oChildPopup =
		oFrame.open(sPopupURL,
					"P" + AppPopupPostfix + "_" + iNextPopupDistinguisher++,
					"width=" + iWidth + ",height=" + iHeight +
						"," + sPopupFeatures,
					true);
	AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Popup = (bIsAutoClose ? oChildPopup : null);
}
function OpenNewBrowswerFromFrame(oFrame, sBrowserURL, iWidth, iHeight, sBrowserApp, sScrollbars)
{
	//We only need a new browser if their is no browser open for the specified application,
	//or there is no specified application
	if( arguments.length < 5 ||
	    IsEmpty(sBrowserApp) ||
	    IsEmpty(AppRelatedBrowsers[sBrowserApp]) ||
	    IsFrameClosed(AppRelatedBrowsers[sBrowserApp]) )
	{
		//Open new window (construct name to be distinct to this session of the application
		//in case the user is running more than one instance)
		var oBrowser =
			oFrame.open(sBrowserURL,
						"P" + AppPopupPostfix + "_" + iNextPopupDistinguisher++,
						"width=" + iWidth + ",height=" + iHeight +
							",resizable=yes,location=yes,status=yes,menubar=yes" +
							",titlebar=yes,toolbar=yes,scrollbars=" + (sScrollbars === "yes" ? "yes" : "no") +
							",left=" + Math.max(0,(screen.width - iWidth)/2) +
							",top=" + Math.max(0,((screen.height - iHeight)/2)-20));
		if( !IsEmpty(sBrowserApp) )
		{
			AppRelatedBrowsers[sBrowserApp] = oBrowser;
		}
	}
	else
	{
		AppRelatedBrowsers[sBrowserApp].location = sBrowserURL;
		AppRelatedBrowsers[sBrowserApp].focus();
	}
}

var bIsTimeSent = false;
function LoadFrameInstanceInfo(iFrameId, sTaskName, sTaskArgList, sOnLoadArguments, iRetry)
{
	//Put cursor in wait mode and lock ghost frame
	AppCurrentFrames.Item[iFrameId].Frame.document.body.style.cursor = 'wait';
	bIsLoaded = AppCurrentFrames.Item[iFrameId].IsLoaded;
	AppGhostFrameReady = false;
    if( arguments.length < 5 ) iRetry = 0;

	//Update last load info
	if( sOnLoadArguments && (sOnLoadArguments == 'GetData' || sOnLoadArguments.indexOf('GetData?') == 0) )
	{
		AppCurrentFrames.Item[iFrameId].ReturnTaskPlusArgs =
			AppCurrentFrames.Item[iFrameId].TaskName + '?' + AppCurrentFrames.Item[iFrameId].TaskArgList;
		AppCurrentFrames.Item[iFrameId].ReturnActionPlusArgs = sOnLoadArguments;
	}

	//Disable autorefresh feature...
	if( AppCurrentFrames.Item[iFrameId].Frame.AutoRefresh )
	{
		AppCurrentFrames.Item[iFrameId].Frame.clearTimeout(AppCurrentFrames.Item[iFrameId].Frame.AutoRefresh);
		AppCurrentFrames.Item[iFrameId].Frame.AutoRefresh = null;
	}

	//If ghost frame not there just ignore whatever click gave rise to this (for now)
	var oHTTPRequest = null;
	try
	{
		//Compile current frame info and pass to ghost frame
		var sCurrentFramesInfo = '';
		for( var iFrameIdIndex in AppCurrentFrames.Item )
		{
			//If "closed" frame, don't include it but clean it up
			var oFrameLoadInfo = AppCurrentFrames.Item[iFrameIdIndex];
			if( IsFrameClosed(oFrameLoadInfo.Frame) )
			{
				AppCurrentFrames.Remove(oFrameLoadInfo.FrameId);
			}
			else
			{
				sCurrentFramesInfo +=
					'~' + oFrameLoadInfo.FrameId + '|' +
						oFrameLoadInfo.TaskName + '|' +
						oFrameLoadInfo.TaskArgList + '|' +
						oFrameLoadInfo.ParentFrameId + '|' +
						oFrameLoadInfo.SubTaskIdList.join() + '|' +
						oFrameLoadInfo.PopupType() + '|' +
						oFrameLoadInfo.PopupOpenerId();
				if( oFrameLoadInfo.TaskInputs )
				{
					sCurrentFramesInfo += '|' + oFrameLoadInfo.IsLoaded + '|';
					if( oFrameLoadInfo.TaskInputs )
					{
						for( var sKey in oFrameLoadInfo.TaskInputs )
						{
							//Already escaped appropriately from server :)
							sCurrentFramesInfo += sKey + "=" + oFrameLoadInfo.TaskInputs[sKey] + '&';
						}
					}
				}
			}
		}

		//Submit the ghost frame for processing
		var sRequestURL;
		if( bIsLoaded )
		{
			sRequestURL = 'Controller.aspx?FramesetInstanceID=' + AppRoot.AppFramesetId;
            if( AppRoot.AllowAJAXDebugging && AppFrameActionLinkInfo ) sRequestURL += '&Ctrl=' + encodeURIComponent(AppFrameActionLinkInfo.split('|')[1]);
		}
		else
		{
			sRequestURL = sTaskName + '?' + sTaskArgList;
			if( sTaskArgList )
			{
				sRequestURL += '&';
			}
			sRequestURL += 'FramesetInstanceID=' + AppRoot.AppFramesetId;
		}
        LogToDebugger('>> LoadFrameInstanceInfo  RequestURL = ' + sRequestURL);

		oHTTPRequest = GetNewHttpRequest();
		oHTTPRequest.open('POST', sRequestURL, true);
		oHTTPRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var sRequestText = AppCurrentFrames.Item[iFrameId].Frame.LoadGhostFrame()  //Returns an array (large strings not good in js)

        if(AppFrameFocus)
		{
			sRequestText.push($$("__CurrentFramePage", AppFrameFocus.location.href.split("?")[0]))
		}
		sRequestText.push(
			$$("__ActionInfo", iFrameId + '|' + sTaskName + '|' + sTaskArgList + '|' + sOnLoadArguments));
		if( AppFrameActionLinkInfo )
		{
			sRequestText.push($$("__ClickInfo", AppFrameActionLinkInfo));
			AppFrameActionLinkInfo = null;
		}
		sRequestText.push(encodeURIComponent("__FramesInfo") + "=" + encodeURIComponent(sCurrentFramesInfo));
        if( !bIsTimeSent )
        {
            var oNow = new Date();
            bIsTimeSent = true;
		    sRequestText.push("&" + encodeURIComponent("__ClientTime") + "=" +
                oNow.getFullYear() + "." + (oNow.getMonth() + 1) + "." + oNow.getDate() + "." +
                oNow.getHours() + "." + oNow.getMinutes() + "." + oNow.getSeconds());
        }
		try
		{
			IsAjaxDebugger() && AppRoot.AJAXDebugger.PostHTTPOut(sRequestText.join(""));
		}
		catch(e){}
		oHTTPRequest.send(sRequestText.join(""));
		oHTTPRequest.onreadystatechange =
			function()
				{
					if( oHTTPRequest.readyState == 4 )
					{
						if( oHTTPRequest.status == 200 )
						{
							var oFrame, iAppFrame, oActionFrame, sNextLink;
							var $ = function(sControlID){ return GetPointer(iAppFrame, sControlID); };
							var oErrors = [], $L = 0;
							if( IsAjaxDebugger() )
							{
								var iLineNumber = 0;
								function DoLineHandling(sLineFeed)
								{
									iLineNumber += 1;
									return sLineFeed + "$L=" + iLineNumber.toString() + ";";
								}
								try
								{
									eval("$L=0;" + oHTTPRequest.responseText.replace(/\n/g, DoLineHandling));
									try
									{
										AppRoot.AppGhostFrameReady = true;
										AppRoot.ProcessNextLink(oActionFrame, sNextLink);
									}
									catch(e){}
								}
								catch(ex){}
								try
								{
									AppRoot.AJAXDebugger.PostHTTPIn(oHTTPRequest.responseText, oErrors);
								}
								catch(e){}
							}
							else try
							{
								eval(oHTTPRequest.responseText);
								try
								{
									AppRoot.AppGhostFrameReady = true;
									AppRoot.ProcessNextLink(oActionFrame, sNextLink);
								}
								catch(e){}
							}
							catch(ex){}

                            //Special logic for autosize windows after each data load -- auto-size
                            if( AppCurrentFrames.Item[iFrameId] )
                            {
                                var oAdjustToSizeDiv = AppCurrentFrames.Item[iFrameId].Frame.document.getElementById("__MTrEAdjustToSize");
                                if( oAdjustToSizeDiv )
                                {
                                    var oIframe = AppCurrentFrames.Item[iFrameId].Frame.parent.document.getElementById(AppCurrentFrames.Item[iFrameId].Frame.name);
                                    if( oIframe )
                                    {
                                        AppCurrentFrames.Item[iFrameId].Frame.setTimeout(
                                            function()
                                                {
                                                    if( AppRoot.IsIE && !AppRoot.IsHTML5 )
                                                    {
                                                        oIframe.style.width = (oAdjustToSizeDiv.offsetLeft + oAdjustToSizeDiv.offsetWidth) + 'px';
                                                        oIframe.style.height = (oAdjustToSizeDiv.offsetTop + oAdjustToSizeDiv.offsetHeight) + 'px';
                                                    }
                                                    else
                                                    {
                                                        oIframe.style.width = (oAdjustToSizeDiv.scrollWidth + 20) + 'px';
                                                        oIframe.style.height = (oAdjustToSizeDiv.scrollHeight + 20) + 'px';
                                                    }
                                                }, 0);
                                    }
                                }
                            }
						}
                        else //Attempt retry a few times after staggered waits
                        {
                    	    iRetry += 1;
                            if( iRetry < 4 )
	                        {
    	                        window.setTimeout(
    			                    function()
    				                    {
    					                    LoadFrameInstanceInfo(iFrameId, sTaskName, sTaskArgList, sOnLoadArguments, iRetry);
    				                    },
    			                    iRetry*iRetry*50);
	                        }
                            else
                            {
			                    try
			                    {
				                    window.alert('A server or communication error has occurred -- action failed');
				                    //ReportClientError('A communication error has occurred -- no response from server for ' +
				                    //	AppCurrentFrames.Item[iFrameId].Frame.AppTaskInfo + ".\n" + e + ": " + e.message);
			                    }
			                    catch(ex){}
                            }
                        }

						//Return frame to ready state and turn off any wait behavior -- although retry may kick off
						var oCurrentFrame = AppCurrentFrames.Item[iFrameId];
						if( oCurrentFrame )
						{
							oCurrentFrame.Frame.document.body.style.cursor = 'auto';
						}
						AppGhostFrameReady = true;
                        try{ EndWait(); } catch(eWait){}
					}
				};
	}
	catch(e)
	{
		//Reset the http connection (not available before ie7)
		try
		{
			if( oHTTPRequest ) oHTTPRequest.abort();
		}
		catch(ex){}

	    //Try again, once anyway -- else clear cursor and reset ghost frame
	    iRetry += 1;
        if( iRetry < 4 )
	    {
    	    window.setTimeout(
    			function()
    				{
    					LoadFrameInstanceInfo(iFrameId, sTaskName, sTaskArgList, sOnLoadArguments, iRetry);
    				},
    			iRetry*iRetry*50);
	    }
	    else
	    {
			try
			{
				window.status = 'A communication error has occurred -- no response from server';
				//ReportClientError('A communication error has occurred -- no response from server for ' +
				//	AppCurrentFrames.Item[iFrameId].Frame.AppTaskInfo + ".\n" + e + ": " + e.message);
			}
			catch(ex){}

			//Reload frameset (first preventing a premature unload because we need the server side info for the reload
			AppRoot.AppSuppressUnload = true;

            LogToDebugger('>> Reload ' + sTaskName + '?' + sTaskArgList);

			window.top.location.replace(
				'Controller.aspx?FramesetInstanceID=' + AppRoot.AppFramesetId +
					'&Task=' + encodeURIComponent(sTaskName) +
					'&TaskArgList=' + encodeURIComponent(sTaskArgList) +
					'&OnLoadArguments=' + encodeURIComponent(sOnLoadArguments) +
					'&Frame=' + iFrameId + '&MainFrame=' + AppMainFrame.AppFrameId +
					'&UnloadFrameset=' + AppRoot.AppFramesetId + '&Reload=true');

			//Kind of vestigial
		    AppGhostFrameReady = true;
		    AppCurrentFrames.Item[iFrameId].Frame.document.body.style.cursor = 'auto';
	    }
	}
}


function IsFrameClosed(oFrame)
{
    var bFrameIsClosedOrUnavailable = false;
    if( oFrame.closed ) bFrameIsClosedOrUnavailable = true;
    else
    {
        try{ if( oFrame.status ) ; } //Check if frame DOM is available -- else check of status has Permission denied
        catch(e){ bFrameIsClosedOrUnavailable = true; }
    }
    return bFrameIsClosedOrUnavailable;
}
function LogToDebugger(sText)
{
    IsAjaxDebugger() && AppRoot.AJAXDebugger.LogText(sText);
}
function IsAjaxDebugger()
{
	var bIsDebugger = false;
	if( AppRoot.AllowAJAXDebugging )
	{
		if( !AppRoot.AJAXDebugger )
		{
			oOpener = AppRoot.top.opener;
			while( !AppRoot.AJAXDebugger && oOpener && !IsFrameClosed(oOpener) )
			{
			    try
                {
 				    if( oOpener.location.toString().toLowerCase().indexOf("debug.html") < 0 )
				    {
					    oOpener = oOpener.top.opener;
				    }
				    else
				    {
					    AppRoot.AJAXDebugger = oOpener;
				    }
			    }
	            catch (e)
                {
	                AppRoot.AJAXDebugger = oOpener;
                }
			}
		}
		if( AppRoot.AJAXDebugger && !IsFrameClosed(AppRoot.AJAXDebugger) )
		{
			bIsDebugger = true;
		}
		else
		{
			AppRoot.AllowAJAXDebugging = false;
		}
	}
	return bIsDebugger;
}
function OnLoadBaseTask(oFrame)
{
    var oParentFrame = GetAppParent(oFrame);
    if( oParentFrame.ChildLoadTaskName )
    {
        var iLastFolder = oParentFrame.ChildLoadTaskName.lastIndexOf("/") + 1;
        if( iLastFolder > 0 && oParentFrame.ChildLoadTaskName.length > iLastFolder )
        {
            //Sometimes we load a relative path -- one module accesses another
            oParentFrame.ChildLoadTaskName = oParentFrame.ChildLoadTaskName.substr(iLastFolder);
        }
    }

	//Determine if this is a top-level task or not
	if( oFrame == oFrame.AppTopFrame )
	{
		//Get and clear application task load information
		var sTaskName = oParentFrame.ChildLoadTaskName;
		var sTaskArgList = oParentFrame.ChildLoadTaskArgList;
		var sOnLoadArguments = oParentFrame.ChildLoadOnLoadArguments;
		if( oParentFrame.ChildLoadOnLoadFunction )
		{
			oParentFrame.setTimeout(oParentFrame.ChildLoadOnLoadFunction, 10);
		}
		oParentFrame.ChildLoadTaskName = "";
		oParentFrame.ChildLoadTaskArgList = "";
		oParentFrame.ChildLoadOnLoadArguments = "";
		oParentFrame.ChildLoadOnLoadFunction = null;

		//Trigger task to process GetData or other method for specific criteria
		if( !IsEmpty(sTaskName) && !IsEmpty(sOnLoadArguments) )
		{
			LoadFrameInstanceInfo(oFrame.AppFrameId, sTaskName, sTaskArgList, sOnLoadArguments);
		}
	}
	else
	{
		//Register this child frame with the top task frame and vice versa
		//AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ParentFrameId = oFrame.AppTopFrame.AppFrameId;
        AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).ParentFrameId = oFrame.parent.AppFrameId;
		AppCurrentFrames.GetFrameLoadInfo(oFrame.parent.AppFrameId).SubTaskIdList.push(oFrame.AppFrameId);

		//Load data if this is not part of a larger load
		var sTaskName = oParentFrame.ChildLoadTaskName;
		var sTaskArgList = oParentFrame.ChildLoadTaskArgList;
		var sTaskInfo = sTaskName + "?" + sTaskArgList;
		if( oParentFrame.ChildLoadOnLoadFunction )
		{
			oParentFrame.setTimeout(oParentFrame.ChildLoadOnLoadFunction, 10);
		}
		if( oFrame.AppTaskInfo == sTaskInfo || decodeURIComponent(oFrame.AppTaskInfo) == sTaskInfo )
		{
			//Get load arguments and clear application task load information
			var sOnLoadArguments = oParentFrame.ChildLoadOnLoadArguments;
			oParentFrame.ChildLoadTaskName = "";
			oParentFrame.ChildLoadTaskArgList = "";
			oParentFrame.ChildLoadOnLoadArguments = "";
			oParentFrame.ChildLoadOnLoadFunction = null;

			//Get the data
			LoadFrameInstanceInfo(oFrame.AppFrameId, sTaskName, sTaskArgList, sOnLoadArguments);
		}
	}
}
function ProcessNextLink(oActionFrame, sLinkId)
{
	if( !IsEmpty(sLinkId) && !IsFrameClosed(oActionFrame) )
	{
		//Construct script to launch next link (in a try link in case action frame
		//or the next link is not available any more)
		var sScript = "try{ ";
		sScript += "var oLinkHref = document.getElementById('" + sLinkId + "_Anchor'); ";
		sScript += "if( AppRoot.IsEmpty(oLinkHref.onclick) || oLinHref.onclick() ){ if( !AppRoot.IsEmpty(oLinkHref.href) )  window.location = oLinkHref.href; }";
		sScript += "} catch(e){}";

		//Run the script on a timeout (so we're not still connected to the ghost frame)
		oActionFrame.setTimeout(sScript, 0);
	}
}
function ProcessNextScript(oActionFrame, sScript)
{
	if( !IsEmpty(sScript) && !IsFrameClosed(oActionFrame) )
	{
		//Set location on a timer
		oActionFrame.setTimeout(sScript, 0);
	}
}
function CompileTaskArgList(sUncompiledTaskArgList, oParentFrame)
{
	var sTaskArgList;
	if( IsEmpty(sUncompiledTaskArgList) )
	{
		sTaskArgList = '';
	}
	else
	{
		sTaskArgList = sUncompiledTaskArgList + '&';
	}
	sTaskArgList += 'Version=' + AppRoot.AppVersion + '&';
	sTaskArgList += 'UserID=' + escape(AppRoot.AppUserId) + '&';
	sTaskArgList += 'UsrVsn=' + AppRoot.AppUserVersion;

	//If navigation set then add on AppFramesetId
	if( sUncompiledTaskArgList.indexOf("&Nav=") > 0 || sUncompiledTaskArgList.indexOf("Nav=") == 0 )
	{
		sTaskArgList += '&AppFramesetId=' + AppRoot.AppFramesetId;
		if( !IsEmpty(oParentFrame) && !IsEmpty(oParentFrame.AppFrameId) )
		{
			sTaskArgList += '&AppParentId=' + oParentFrame.AppFrameId;
		}
	}

	//Return resolved task arg list
	return sTaskArgList;
}

function Resize(oFrame, bIsInitialLoad, sFormId)
{
	var iStretchWidth = Math.max(0, GetFrameWidth(oFrame) - oFrame.AutoExpand.NormalWidth);
	var iStretchHeight = Math.max(0, GetFrameHeight(oFrame) - oFrame.AutoExpand.NormalHeight);
	if( iStretchWidth != 0 || iStretchHeight != 0 || arguments.length < 2 || !bIsInitialLoad )
	{
		ResizeChildControls(oFrame, oFrame.AppFrameId, oFrame.AutoExpand, iStretchWidth, iStretchHeight, oFrame.AutoExpand);
	}
	if( arguments.length > 2 && bIsInitialLoad && sFormId )
	{
		oFrame.document[sFormId].style.visibility = 'visible';
	}
}
function ResizeChildControls(oFrame, iAppFrameId, oParentAutoExpand, iStretchWidth, iStretchHeight, oAutoExpand)
{
	if( oAutoExpand.Index && oAutoExpand.Index.length > 0 )
	{
		for( var iChildIndex = 0; iChildIndex < oAutoExpand.Index.length; iChildIndex++ )
		{
			var sControlID = oAutoExpand.Index[iChildIndex];
			var oChildExpand = oAutoExpand.Child[sControlID];

			var iControlStretchWidth = 0;
			if( oChildExpand.StretchWidth )
			{
				var iStretchWidthAdjusted = iStretchWidth;
				if( iStretchWidthAdjusted > 0 && oChildExpand.DeferX )
				{
					for( var iDeferIndex = 0; iDeferIndex < oChildExpand.DeferX.length; iDeferIndex++ )
					{
						var iDeferChangeInWidth = oParentAutoExpand.Child[oChildExpand.DeferX[iDeferIndex]].ChangeInWidth;
						if( iDeferChangeInWidth >= iStretchWidthAdjusted )
						{
							iStretchWidthAdjusted = 0;
							break;
						}
						else
						{
							iStretchWidthAdjusted -= iDeferChangeInWidth;
						}
					}
				}
				iControlStretchWidth = Math.round(iStretchWidthAdjusted * oChildExpand.StretchWidth/100);
				if( oChildExpand.MaxWidthIncrease )
				{
					iControlStretchWidth = Math.min(iControlStretchWidth, oChildExpand.MaxWidthIncrease);
				}
			}

			var iControlStretchHeight = 0;
			if( oChildExpand.StretchHeight )
			{
				var iStretchHeightAdjusted = iStretchHeight;
				if( iStretchHeightAdjusted > 0 && oChildExpand.DeferY )
				{
					for( var iDeferIndex = 0; iDeferIndex < oChildExpand.DeferY.length; iDeferIndex++ )
					{
						var iDeferChangeInHeight = oParentAutoExpand.Child[oChildExpand.DeferY[iDeferIndex]].ChangeInHeight;
						if( iDeferChangeInHeight >= iStretchHeightAdjusted )
						{
							iStretchHeightAdjusted = 0;
							break;
						}
						else
						{
							iStretchHeightAdjusted -= iDeferChangeInHeight;
						}
					}
				}
				iControlStretchHeight = Math.round(iStretchHeightAdjusted * oChildExpand.StretchHeight/100);
				if( oChildExpand.MaxHeightIncrease )
				{
					iControlStretchHeight = Math.min(iControlStretchHeight, oChildExpand.MaxHeightIncrease);
				}
			}

			var oControl = null;
			if( oChildExpand.Id )
			{
				try{ oControl = GetPointer(iAppFrameId, oChildExpand.Id); }
                catch(e){ oControl = oFrame.document.getElementById(oChildExpand.Id); }
			}
			if( oControl && oChildExpand.Function )
			{
				oChildExpand.Function(iAppFrameId, oControl, iControlStretchWidth, iControlStretchHeight, oChildExpand);
			}
			else if( oControl && oChildExpand.Type == 2 )
			{
				ResizePosition(iAppFrameId, oControl, iControlStretchWidth, iControlStretchHeight, oChildExpand);
			}
			else if( oControl )
			{
				ResizeStyle(iAppFrameId, oControl, iControlStretchWidth, iControlStretchHeight, oChildExpand);
			}
			if( oControl && oChildExpand.Type == 1 )
			{
				oControl.__AutoExpand = oChildExpand;
			}

			oChildExpand.ChangeInWidth = iControlStretchWidth;
			oChildExpand.ChangeInHeight = iControlStretchHeight;
			ResizeChildControls(oFrame, iAppFrameId, oChildExpand, iControlStretchWidth, iControlStretchHeight, oChildExpand);
		}
	}
}
function Left(oControl)
{
	return parseInt(Offset(oControl).style.left,10);
}
function Top(oControl)
{
	return parseInt(Offset(oControl).style.top,10);
}
function Offset(oControl)
{
	var oContainer = oControl;
	while( !oContainer.style.left )
	{
		oContainer = oContainer.offsetParent
		if( !oContainer || !oContainer.style || oContainer.tagName.toLowerCase() == 'body' )
		{
			oContainer = oControl;
			break;
		}
	}
	return oContainer;
}
function ResizePosition(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	if( oChildExpand.NormalWidth ) Offset(oControl).style.left = (oChildExpand.NormalWidth + iStretchWidth) + 'px';
	if( oChildExpand.NormalHeight ) Offset(oControl).style.top = (oChildExpand.NormalHeight + iStretchHeight) + 'px';
}
function ResizeStyle(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	if( oChildExpand.NormalWidth ) oControl.style.width = (oChildExpand.NormalWidth + iStretchWidth) + 'px';
	if( oChildExpand.NormalHeight ) oControl.style.height = (oChildExpand.NormalHeight + iStretchHeight) + 'px';
}
function ResizeProperty(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	if( oChildExpand.NormalWidth ) oControl.width = (oChildExpand.NormalWidth + iStretchWidth) + 'px';
	if( oChildExpand.NormalHeight ) oControl.height = (oChildExpand.NormalHeight + iStretchHeight) + 'px';
}
function ResizeFrame(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	ResizeProperty(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand);
	oControl.__NormalWidth = oChildExpand.NormalWidth;
	oControl.__NormalHeight = oChildExpand.NormalHeight;
	var oIframe = AppCurrentFrames.Item[iAppFrameId].Frame.frames[oControl.name];
	if( oIframe && oIframe.onresize )
	{
		oIframe.onresize();
	}
}
function ResizeIframe(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand)
{
	ResizeStyle(iAppFrameId, oControl, iStretchWidth, iStretchHeight, oChildExpand);
	oControl.__NormalWidth = oChildExpand.NormalWidth;
	oControl.__NormalHeight = oChildExpand.NormalHeight;
	var oIframe = AppCurrentFrames.Item[iAppFrameId].Frame.frames[oControl.name];
	if( oIframe && oIframe.onresize )
	{
		oIframe.onresize();
	}
}
function GetFrameBaseWidth(oFrame)
{
	if( oFrame.name && oFrame.parent && oFrame.parent != oFrame )
	{
		var oIframe;
        if( oFrame.name && oFrame.parent.document.frames ) oIframe = oFrame.parent.document.frames[oFrame.name];
		if( oIframe )
		{
			var oIframeElement = oFrame.parent.document.getElementById(oFrame.name);
			if( oIframeElement && oIframeElement.__NormalWidth )
			{
				return oIframeElement.__NormalWidth;
			}
			else if( oIframeElement && oIframeElement.style && oIframeElement.style.width )
			{
				return parseInt(oIframeElement.style.width,10);
			}
			else
			{
				return oIframeElement.width;
			}
		}
		else
		{
			return GetFrameWidth(oFrame);
		}
	}
	else
	{
		return GetFrameWidth(oFrame);
	}
}
function GetFrameBaseHeight(oFrame)
{
	if( oFrame.name && oFrame.parent && oFrame.parent != oFrame )
	{
		var oIframe;
        if( oFrame.name && oFrame.parent.document.frames ) oIframe = oFrame.parent.document.frames[oFrame.name];
		if( oIframe )
		{
			var oIframeElement = oFrame.parent.document.getElementById(oFrame.name);
			if( oIframeElement && oIframeElement.__NormalHeight )
			{
				return oIframeElement.__NormalHeight;
			}
			else if( oIframeElement && oIframeElement.style && oIframeElement.style.height )
			{
				return parseInt(oIframeElement.style.height,10);
			}
			else
			{
				return oIframeElement.height;
			}
		}
		else
		{
			return GetFrameHeight(oFrame);
		}
	}
	else
	{
		return GetFrameHeight(oFrame);
	}
}

//Maxlength handler for Textareas
function SetupMaxLength(oFrame, oControl, iSpecifiedMaxLength)
{
	if( iSpecifiedMaxLength > 0 && iSpecifiedMaxLength != 999999 && iSpecifiedMaxLength != '999999') //999999 is special value that is really unlimited
	{
		oControl.SpecifiedMaxLength = iSpecifiedMaxLength;
		oControl.onkeyup = oControl.onmouseup =
			function()
			{
				oFrame.setTimeout(
					function()
					{
						if( oControl.SpecifiedMaxLength < oControl.value.length ) oControl.value = oControl.value.substr(0, oControl.SpecifiedMaxLength);
					},0);
			}
	}
	else
	{
		oControl.onkeyup = null;
		oControl.onmouseup = null;
		if( oControl.SpecifiedMaxLength ) delete oControl.SpecifiedMaxLength;
	}
}

//Allow only numbers
function NumericOnKeyDown(oFrame)
{
	if( !oFrame.event.altKey && !oFrame.event.ctrlKey &&
		(oFrame.event.keyCode == 32 ||
		 (oFrame.event.keyCode >= 41 && oFrame.event.keyCode <= 44) ||
		 (oFrame.event.keyCode == 45 && oFrame.event.shiftKey ) ||
		 (oFrame.event.keyCode == 46 && oFrame.event.shiftKey ) ||
		 (oFrame.event.keyCode >= 58 && oFrame.event.keyCode <= 90) ||
		 oFrame.event.keyCode == 47 ||
		 (oFrame.event.keyCode >= 48 && oFrame.event.keyCode <= 57 && oFrame.event.shiftKey) ||
		 (oFrame.event.keyCode >= 58 && oFrame.event.keyCode <= 95) ||
		 (oFrame.event.keyCode >= 106 && oFrame.event.keyCode <= 107) ||
		 oFrame.event.keyCode == 111 ||
		  oFrame.event.keyCode == 186 ||
		 (oFrame.event.keyCode >= 187 && oFrame.event.keyCode <= 188) ||
		 (oFrame.event.keyCode >= 189 && oFrame.event.keyCode <= 190 && oFrame.event.shiftKey ) ||
		 (oFrame.event.keyCode >= 191 && oFrame.event.keyCode <= 192) ||
		 (oFrame.event.keyCode >= 219 && oFrame.event.keyCode <= 222)) )
	{
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
	}
	else if( oFrame.event.keyCode == 109 || oFrame.event.keyCode == 189 )
	{
		if( oFrame.document.activeElement.value.indexOf('-') < 0 )
		{
			oFrame.document.activeElement.value = '-' + oFrame.document.activeElement.value;
		}
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
	}
	else
	{
		oFrame.event.returnValue = true;
	}
}

//Dialog handling -- oCallback will be passed an argument corresponding to the user selection, or empty if nothing chosen
function Dialog(oFrame, oCallback, sTitle, sHTMLText, sChoices, sDefault, iWidth, iHeight)
{
    if( AppRoot.IsPageAvailable(oFrame) )
    {
        //Preserve the inputs (except width and height which are used immediately)
        AppRoot.Dialog.Inputs =
            {Frame:oFrame,
             Callback:(oCallback ? oCallback : function(sAppDialogSelection){}),
             Title:(sTitle ? sTitle : 'Dialog'),
             HTMLText:sHTMLText,
             Choices:sChoices,
             Default:sDefault};

        //Reset any stick link, retry click timers :)
        if( OpenFrame.StickyLinkTimer )
        {
            try{ oFrame.clearTimeout(OpenFrame.StickyLinkTimer); } catch(e){}
            try{ delete OpenFrame.StickyLinkTimer; } catch(e){}
        }

        //Open dialog
        OpenFramePopup(oFrame.AppTopFrame, 'Dialog.html', '', '', iWidth, iHeight, "overlay=true,centered=yes,opacity=45,title=true,scrollbars=no,border=3,html");
    }
}

//Printer friendly window
function PopupPrinterFriendlyGrid(oFrame, sGridID, sTitle, iWidth, iHeight)
{
	//Obtain the contents of the datagrid
	var sContents = oFrame.document.getElementById(sGridID).outerHTML;

	//Open a popop for this frame
	OpenEmptyFramePopup(oFrame, iWidth, iHeight);
	var oPopup = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId).Popup;

 	//Initialize html before and after the contents we wanna display
	var sBefore = "<HTML>";
	var sAfter = "</HTML>";

	//Add printer friendly style sheet reference
	sBefore = sBefore + " <HEAD><LINK href=Morrisey_PF.css rel=stylesheet></HEAD>";

	//Prepare to add body
	sBefore = sBefore + "<BODY>";
	sAfter = " </BODY>" + sAfter;

	//Add print, close hyperlinks
	var now = new Date();
	sBefore = sBefore + " <table id=tblReportHdr width=" + iWidth + "><tr><td width=20%></td><td align=center width=60% class=pfTitle>" + sTitle
	sBefore = sBefore + " (" + (now.getMonth() + 1).toString() + "/" + now.getDate().toString()
	sBefore = sBefore + "/" + now.getFullYear().toString() + "  " + ("00" + now.getHours().toString()).slice(-2)
	sBefore = sBefore + ":" + ("00" + (now.getMinutes()).toString()).slice(-2) + ")</td><td width=20% align=right>"
	sBefore = sBefore + " </td></tr></table><br>"

	//Populate the specified window specified contents
	oPopup.document.open();
	oPopup.document.write(sBefore + sContents + sAfter);
	oPopup.document.close();

	//We have decided to automatically print then close the window
	oPopup.print();
	oPopup.close();
}

//Standard copy, paste and zoom functionality
function CopyText(oFrame, oControl, sTooltipContentDescription)
{
	//Obtain window and activating button
	var oLinkSpan = oFrame.document.activeElement.parentElement;
	if( !oLinkSpan.__OriginalTooltip && oLinkSpan.title && !IsEmpty(oLinkSpan.title) )
	{
		oLinkSpan.__OriginalTooltip = oLinkSpan.title;
	}
	oLinkSpan.setAttribute(
		"title",
		(arguments.length > 1 && sTooltipContentDescription
			? sTooltipContentDescription
			: 'Value') + " copied to clipboard");
	oFrame.setTimeout(function(){ try{ oLinkSpan.setAttribute("title", oLinkSpan.__OriginalTooltip); } catch(e){} },1000);

    var sCopyText;
	if( oControl.tagName.toUpperCase() == "DIV" ||
		oControl.tagName.toUpperCase() == "SPAN" ||
		oControl.tagName.toUpperCase() == "TD")
	{
        sCopyText = oControl.innerText;
	}
	else
	{
        sCopyText = oControl.value;
	}
    if( AppRoot.IsIE )
    {
		void clipboardData.setData("Text", sCopyText);
    }
    else
    {
        oFrame.alert('This feature is not supported in the current browser -- you should select and copy the text yourself');
    }
}

function PasteText(oFrame, oControl)
{
    if( AppRoot.IsIE )
    {
	    var sPasteText;
        sPasteText = clipboardData.getData("Text");
	    if( oControl.tagName.toUpperCase() == "DIV" ||
		    oControl.tagName.toUpperCase() == "SPAN" ||
		    oControl.tagName.toUpperCase() == "TD")
	    {
            oControl.innerText = sPasteText;
	    }
	    else
	    {
            oControl.value = sPasteText;
	    }
    }
    else
    {
        oFrame.alert('This feature is not supported in the current browser -- you should select and copy the text yourself');
    }
}
function Zoom(oFrame, sControlID, sPopupHeaderTitle)
{
	//Determine if user can edit value or not
	//based on whether or not control is enabled -- if the control
	//doesn't have a disabled property it's not an input in the first
	//place
	var oControl = oFrame.document.getElementById(sControlID);
    var bEditable;
    var sControlProperty = "value";
    var sDisplayControl = "txtZoom";
    var iMaxLength = 0;

	if( oControl.tagName.toUpperCase() == "DIV" )
	{
	    bEditable = IsTrue(oControl.getAttribute("contentEditable"));
        sDisplayControl = "txtZoomRTF";
        sControlProperty = "innerHTML";
	}
    else if( oControl.tagName.toUpperCase() == "SPAN" ||
    		 oControl.tagName.toUpperCase() == "TD")
    {
		bEditable = false;
        sControlProperty = "innerText";
    }
	else
	{
		try{ bEditable = !oControl.disabled; }
		catch(e){ bEditable = false; }

		if( bEditable )
		{
			try{ bEditable = !oControl.readOnly; }
			catch(e){} //Error ignored since we don't have a read only control
		}
	}

	//If max length not specified OR text not editable, set to 0.
	if( bEditable )
	{
		try
		{
			if( oControl.SpecifiedMaxLength && oControl.SpecifiedMaxLength > 0 )
			{
				iMaxLength = oControl.SpecifiedMaxLength;
			}
			else if( oControl.maxLength && oControl.maxLength > 0 )
			{
				iMaxLength = oControl.maxLength;
			}
		}
		catch(e){}
	}

    //Zoom the overlay
    OpenFramePopup(oFrame,
        'PopupZoom.aspx', 'DisplayControl=' + sDisplayControl + '&IsEditable=' + bEditable.toString() + '&MaxLength=' + iMaxLength.toString(),
        'GetData?ControlFrame=' + oFrame.AppFrameId + '&ControlID=' + sControlID + '&ControlProperty=' + sControlProperty +
            '&Title=' + sPopupHeaderTitle.replace(/'/g, '\\\''),
        800, 460, 'popout=true,opacity=45,border=2,title=true,resizable=yes,centered=yes,owner=' + oFrame.AppFrameId);
}

//ZOOM adapted to display ghost frame
function ZoomText(sText)	//Max len and Edit flag are optional -- see code
{
	//Popup comments window
	var oZoomPopup = window.open("Empty.html","");

	//Populate zoom window with the source
	oZoomPopup.document.open();
	oZoomPopup.document.write("<HTML><BODY><FORM><bold><p id=P1></p></bold></FORM></BODY></HTML>");
	oZoomPopup.document.close();

	//Populate the text area
	var oTextContainer = oZoomPopup.document.getElementById("P1");
	oTextContainer.innerText = sText;

	//Set focus to the zoom window; further if field editable set focus to it, else disable it
	oZoomPopup.focus();
}

function EnforceRadioGroupReadOnly()
{
	oControl = this;
	if( oControl.Table.readOnly )
	{
		oFrame = oControl.parentWindow;
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
		oControl.disabled = true;
		oFrame.setTimeout(function(){ oControl.disabled = false; }, 0);
	}
}

function SupportRadioGroupReadOnly(oFrame, sGroupName)
{
	//Loop through all component radio buttons and add support for readonly behavior
	var oComponentTable = oFrame.document.getElementById(sGroupName);
	var oComponentRadioButtons = oFrame.document.getElementsByName(sGroupName);
	for(var iComponentRadioButton = 0;
			iComponentRadioButton < oComponentRadioButtons.length;
			iComponentRadioButton ++)
	{
		if( oComponentRadioButtons[iComponentRadioButton].tagName.toUpperCase() != "TABLE" )
		{
			oComponentRadioButtons[iComponentRadioButton].Table = oComponentTable;
			oComponentRadioButtons[iComponentRadioButton].parentWindow = oFrame;
			oComponentRadioButtons[iComponentRadioButton].onmousedown = EnforceRadioGroupReadOnly;
			oComponentRadioButtons[iComponentRadioButton].onkeydown = EnforceRadioGroupReadOnly;
			oComponentRadioButtons[iComponentRadioButton].onmouseup = EnforceRadioGroupReadOnly;
			oComponentRadioButtons[iComponentRadioButton].onkeyup = EnforceRadioGroupReadOnly;

			var oSiblings = oComponentRadioButtons[iComponentRadioButton].parentElement.children;
			for(var iSibling = 0;
					iSibling < oSiblings.length;
					iSibling ++)
			{
				if( oSiblings[iSibling].tagName.toUpperCase() == "LABEL" )
				{
					oSiblings[iSibling].outerHTML = oSiblings[iSibling].innerHTML;
					break;
				}
			}
		}
	}
}

function $$Grid(oFrame, sGridID, bIsDetailSection)
{
	var sGFInputs = '';
	var oGridInputs = oFrame.document.getElementById(sGridID).getElementsByTagName("INPUT");
	if( oGridInputs )
	{
		for(var iElement = 0; iElement < oGridInputs.length; iElement++)
		{
			var oInput = oGridInputs[iElement];
			if( oInput.type && oInput.type == "checkbox" )
			{
				sGFInputs += $$(oInput.name, oInput.checked);
			}
			else if( oInput.type && oInput.type == "radio" )
			{
				if( oInput.checked ) sGFInputs += $$(oInput.name, oInput.value);
			}
			else
			{
				sGFInputs += $$(oInput.name, oInput.value);
			}
		}
	}

    //Text areas are not inputs per se
	oGridInputs = oFrame.document.getElementById(sGridID).getElementsByTagName("TEXTAREA");
	if( oGridInputs )
	{
		for(var iElement = 0; iElement < oGridInputs.length; iElement++)
		{
			var oInput = oGridInputs[iElement];
            sGFInputs += $$(oInput.name, oInput.value);
		}
	}

    if( bIsDetailSection )
    {
        //Track for each row if detail section open or not
	    oDetailDivs = oFrame.document.getElementById(sGridID).getElementsByTagName("DIV");
	    if( oDetailDivs )
	    {
		    for(var iElement = 0; iElement < oDetailDivs.length; iElement++)
		    {
                var oDetailDiv = oDetailDivs[iElement];
                if( oDetailDiv.id && oDetailDiv.id.indexOf('__dtl') >= 0 && IsTrue(oDetailDiv.getAttribute("IsOpen")) )
                {
                    sGFInputs += $$(oDetailDiv.id, 'true');
                }
		    }
	    }
    }
    return sGFInputs;
}

//Constructs a ghost frame input for a given radio button group
function $$ListBox(oFrame, sListBoxID, sDelimiter)
{
	//Initialize the overall value
	var sListBoxOverallValue = '';
	var bFirstItemFound = false;

	//Loop through all listbox options and join selected options into a string
	var oListBox = oFrame.document.getElementById(sListBoxID);
	for(var iOption = 0; iOption < oListBox.length; iOption ++)
	{
		var oListBoxOption = oListBox.options[iOption];
		if( oListBoxOption.selected )
		{
			if( bFirstItemFound )
			{
				sListBoxOverallValue += sDelimiter;
			}
			else
			{
				bFirstItemFound = true;
			}
			sListBoxOverallValue += oListBoxOption.value;
		}
	}

	//Output a ghost frame hidden field to return the value of the listbox
	return $$(sListBoxID, sListBoxOverallValue);
}

//Display the date selector for the given popup
function DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear)
{
    var bRelativeFrame = true;
    var iOriginalPositioning = iPositioning;
    if ( iPositioning == 7 )
    {
        //Treat the frame as top frame even if it is an IFrame
        bRelativeFrame = false;
        //Set the positioning to Auto
        iPositioning = 5;
    }
    else if ( iPositioning == 8 )
    {
        //Top Frame - Below Text Box
        bRelativeFrame = false;
        iPositioning = 0;
    }
    else if ( iPositioning == 9 )
    {
        //Top Frame - Above Text Box
        bRelativeFrame = false;
        iPositioning = 1;
    }
    else if ( iPositioning == 10 )
    {
        //Top Frame - Right Text Box
        bRelativeFrame = false;
        iPositioning = 2;
    }
    else if ( iPositioning == 11 )
    {
        //Top Frame - Left Text Box
        bRelativeFrame = false;
        iPositioning = 4;
    }

	//Get control for which we need a calendar
	var oTextbox = oFrame.document.getElementById(sControlID);

	//Go no further if the textbox itself is disabled or read only else preserve original frame and get the value
	if( oTextbox.disabled || oTextbox.readOnly ) return;
    DisplayDateSelector.Frame = oFrame;
	DisplayDateSelector.RelativeFrame = bRelativeFrame;
    DisplayDateSelector.Control = oTextbox;
    DisplayDateSelector.CalendarDivId = "__cal_div";
	var sTextboxValue = oTextbox.value;

    var iLeft = iAdditionalOffsetLeft;
    var iTop = iAdditionalOffsetTop;
	if( iPositioning < 6 )	//Adjust relative positioning -- excludes only AbsFrame positioning
	{
	    var oTextboxPosition = GetPosition(oTextbox.parentElement, false, bRelativeFrame, oFrame);
		iLeft += oTextboxPosition[0];
		iTop += oTextboxPosition[1];
        if( iPositioning == 5 ) //Auto
        {
            //Does it fit below, else flip it above as much as possible and move right so the left calendar is visible (closest we can came)
            var iWindowHeight = GetFrameHeight(oFrame.top);
            if( iLeft < 1 ) iLeft = 1;
            if( iTop + 145 > iWindowHeight ) iTop = Math.max(1, oTextboxPosition[1] - 155);
        }
	}

    //Repoint the frame to the one where the calendar will appear -- we want the highest frame that has a body (is not a frameset)
	if ( oFrame != oFrame.top && bRelativeFrame )
    {
        var oCalendarTopFrame = (oFrame.AppTopFrame ? oFrame.AppTopFrame : oFrame.top);
        if( oCalendarTopFrame.document.getElementsByTagName("body")[0] ) oFrame = oCalendarTopFrame;
        else
        {
           var oCalendarTopFrame = oFrame.parent;
           while( oCalendarTopFrame && oCalendarTopFrame.document.getElementsByTagName("body")[0] )
           {
              oFrame = oCalendarTopFrame;
              if( oCalendarTopFrame == oCalendarTopFrame.parent ) break;
              else oCalendarTopFrame = oCalendarTopFrame.parent;
           }
        }
    }
    oFrame.CalendarAppRootFrame = window;
	var oCalendarDiv = oFrame.document.getElementById(DisplayDateSelector.CalendarDivId);
	if( !oCalendarDiv )
	{
		oCalendarDiv = oFrame.document.createElement("div");
		oCalendarDiv.setAttribute("id", DisplayDateSelector.CalendarDivId);
		oCalendarDiv.setAttribute("style", "position: absolute");
		oCalendarDiv.setAttribute("z-index", "999");

		oFrame.document.getElementsByTagName("body")[0].appendChild(oCalendarDiv);
	}

	var sPreviousLink = DisplayDateSelector.CalendarDivId + "_Prev";
	var sNextLink = DisplayDateSelector.CalendarDivId + "_Next";

	var oCurrentDate = new Date();
	var iCurrentDate = oCurrentDate.getDate();
	var iCurrentMonth = oCurrentDate.getMonth() + 1;
	var iCurrentYear = oCurrentDate.getFullYear();

	var oSelectedDate;
	var iSelectedDate;
	var iSelectedMonth;
	var iSelectedYear;

	var sStartMonth;

	//Attempt to parse the textbox value as a date
	if( !IsEmpty(sTextboxValue) )
	{
		try
		{
            var oSelectedDate = ParseBaseDate(sTextboxValue, false, false);
			if( oSelectedDate )
			{
				iSelectedDate = oSelectedDate.getDate();
				iSelectedMonth = oSelectedDate.getMonth() + 1;
				iSelectedYear = oSelectedDate.getFullYear();
			}
		}
		catch(e) {}
	}

	//Set start month and year if not passed in
	if( arguments.length < 6 )
	{
		//Start month and year will reflect the selected date or if none the current date
		if( IsEmpty(oSelectedDate) )
		{
			iStartMonth = iCurrentMonth;
			iStartYear = iCurrentYear;
		}
		else
		{
			iStartMonth = iSelectedMonth;
			iStartYear = iSelectedYear;
		}
	}

	//Map start month to string representation
	switch(iStartMonth)
	{
		case 1: sStartMonth = "January"; break;
		case 2: sStartMonth = "February"; break;
		case 3:	sStartMonth = "March"; break;
		case 4:	sStartMonth = "April"; break;
		case 5:	sStartMonth = "May"; break;
		case 6:	sStartMonth = "June"; break;
		case 7:	sStartMonth = "July"; break;
		case 8:	sStartMonth = "August"; break;
		case 9: sStartMonth = "September"; break;
		case 10: sStartMonth = "October"; break;
		case 11: sStartMonth = "November"; break;
		case 12: sStartMonth = "December"; break;
	}

	//Deduce what the previous and next months would be
	var iPreviousMonth = iStartMonth - 1;
	var iPreviousYear = iStartYear;
	if( iPreviousMonth < 1 )
	{
		iPreviousMonth = 12;
		iPreviousYear -= 1;
	}

	var iNextMonth = iStartMonth + 1;
	var iNextYear = iStartYear;
	if( iNextMonth > 12 )
	{
		iNextMonth = 1;
		iNextYear += 1;
	}

	//Determine the start day for the current month, and from that setup
	//values used to display our calendar
	var iDayInMilliseconds = 1000 * 60 * 60 * 24;
	var oStartMonthDay1 = new Date(iStartYear, iStartMonth - 1);
	var oNextMonthDay1 = new Date(iNextYear, iNextMonth - 1);
	var oStartMonthDayLast = new Date(oNextMonthDay1.getTime() - iDayInMilliseconds);
	var iDisplayYear;
	var iDisplayMonth;
	var iDisplayMonthOffset;
	var iDisplayDate;
	var iDisplayMonthMaxDate;
	var iNextDisplayMonthMaxDate;
	if( oStartMonthDay1.getDay() == 0 )
	{
		iDisplayMonthOffset = 0;
		iDisplayDate = 1;
		iDisplayMonthMaxDate = oStartMonthDayLast.getDate();
		iNextDisplayMonthMaxDate = 99;
	}
	else
	{
		iDisplayMonthOffset = -1;
		var oPreviousMonthDayLast = new Date(oStartMonthDay1.getTime() - iDayInMilliseconds);
		iDisplayMonthMaxDate = oPreviousMonthDayLast.getDate();
		iNextDisplayMonthMaxDate = oStartMonthDayLast.getDate();
		iDisplayDate = iDisplayMonthMaxDate - oStartMonthDay1.getDay() + 1;
	}

	//Construct html for calendar header (with current Month and Year)
	var sContents =
		"<div id=" + DisplayDateSelector.CalendarDivId + " " +
			 "class=BaseDateCalendar " +
			 "style='Z-INDEX: 999999; LEFT: " + iLeft + "px; POSITION: absolute; TOP: " + iTop + "px'>" +
			"<table class=BaseDateTable cellSpacing=0 cellPadding=1 " +
                "onmouseover=\"window.cursor = 'pointer';\" onmouseout=\"window.cursor = 'auto';\">" +
				"<tr>" +
					"<td class=BaseDateHdrCell>" +
						"<a id=" + sPreviousLink +
							" href=\"javascript:void CalendarAppRootFrame.DisplayDateSelector(" +
								"CalendarAppRootFrame.DisplayDateSelector.Frame,'" + sControlID + "'," +
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," +
									iOriginalPositioning + "," + iPreviousMonth + "," + iPreviousYear + ");\"" +
							" onkeydown=\"CalendarAppRootFrame.DateSelectorOnKeyDown(" +
								"CalendarAppRootFrame.DisplayDateSelector.Frame,'" + sControlID + "'," +
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," +
									iOriginalPositioning + "," + iStartMonth + "," + iStartYear + ");\"" +
                            " style=\"outline:none\"" +
							">" +
								"<img src=Images/MonthDown.gif style='border: none'>" +
						"</a>" +
					"</td>" +
					"<td class=BaseDateHdrCell colSpan=5>" + sStartMonth + " " + iStartYear + "</td>" +
					"<td class=BaseDateHdrCell>" +
						"<a id=" + sNextLink +
							" href=\"javascript:void CalendarAppRootFrame.DisplayDateSelector(" +
								"CalendarAppRootFrame.DisplayDateSelector.Frame,'" + sControlID + "'," +
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," +
									iOriginalPositioning + "," + iNextMonth + "," + iNextYear + ");\"" +
							" onkeydown=\"CalendarAppRootFrame.DateSelectorOnKeyDown(" +
								"CalendarAppRootFrame.DisplayDateSelector.Frame,'" + sControlID + "'," +
									iAdditionalOffsetLeft + "," + iAdditionalOffsetTop + "," +
									iOriginalPositioning + "," + iStartMonth + "," + iStartYear + ");\"" +
                            " style=\"outline:none\"" +
							">" +
								"<img src=Images/MonthUp.gif style='border: none'>" +
						"</a>" +
					"</td>" +
				"</tr>" +
				"<tr class=BaseDateDayOfWeekRow>" +
					"<td width=22>Sun</td>" +
					"<td width=22>Mon</td>" +
					"<td width=22>Tue</td>" +
					"<td width=22>Wed</td>" +
					"<td width=22>Thu</td>" +
					"<td width=22>Fri</td>" +
					"<td width=22>Sat</td>" +
				"</tr>";
	for( var iRow = 0; iRow < 6; iRow++ )
	{
		sContents += "<tr>";
		for( var iCell = 0; iCell < 7; iCell++ )
		{
			//Format current cell
			iDisplayYear = iStartYear;
			iDisplayMonth = iStartMonth + iDisplayMonthOffset;
			if( iDisplayMonth > 12 )
			{
				iDisplayMonth = 1;
				iDisplayYear += 1;
			}
			else if( iDisplayMonth < 1 )
			{
				iDisplayMonth = 12;
				iDisplayYear -= 1;
			}
			sContents += "<td onmousedown=\"CalendarAppRootFrame.PickFromDateSelector('" +
                iDisplayMonth + "/" + iDisplayDate + "/" + iDisplayYear + "');\" class=";
			if( iDisplayMonthOffset == 0 )
			{
				if( iCurrentYear == iStartYear && iCurrentMonth == iStartMonth && iCurrentDate == iDisplayDate )
				{
					if( iSelectedYear == iStartYear && iSelectedMonth == iStartMonth && iSelectedDate == iDisplayDate )
					{
						sContents += "BaseDateSelectedCurrentDayCell";
					}
					else
					{
						sContents += "BaseDateCurrentDayCell";
					}
				}
				else if( iSelectedYear == iStartYear && iSelectedMonth == iStartMonth && iSelectedDate == iDisplayDate )
				{
					sContents += "BaseDateSelectedDayOfMonthCell";
				}
				else
				{
					sContents += "BaseDateDayOfMonthCell";
				}
			}
			else
			{
				sContents += "BaseDateDayOutsideOfMonthCell";
			}
			sContents += " style=\"cursor:default\">" + iDisplayDate + "</td>";

			//Move date pointer
			iDisplayDate += 1;
			if( iDisplayDate > iDisplayMonthMaxDate )
			{
				iDisplayMonthOffset += 1;
				iDisplayMonthMaxDate = iNextDisplayMonthMaxDate;
				iDisplayDate = 1;
			}
		}
		sContents += "</tr>";
	}

	//Close out tags
	sContents += "</table></div>";

	//If IE6 and IE6 hide select elements flag set, then do so
	if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 &&
		IsTrue(oTextbox.getAttribute("HideSelectElementsInIE6")) )
	{
		var oSelectElements = DisplayDateSelector.Frame.document.getElementsByTagName("select");
		for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
		{
			oSelectElements[iElement].style.visibility = "hidden";
		}
	}

	//Display the calendar
	try
	{
		oCalendarDiv.outerHTML = sContents;
	}
	catch(e)
	{
		oCalendarDiv.outerHTML = "";
		oCalendarDiv = oFrame.document.createElement("div");
		oCalendarDiv.setAttribute("id", DisplayDateSelector.CalendarDivId);
		oCalendarDiv.setAttribute("style", "position: absolute");
		oCalendarDiv.setAttribute("z-index", "999");
		oFrame.document.getElementsByTagName("body")[0].appendChild(oCalendarDiv);
		oCalendarDiv.outerHTML = sContents;
	}

	//Set focus, blur, and onkeydown handling on prev and next buttons
	oPreviousLink = oFrame.document.getElementById(sPreviousLink);
	oNextLink = oFrame.document.getElementById(sNextLink);
	oPreviousLink.onmousedown = function(){ oNextLink.onblur = null; };
	oNextLink.onmousedown = function(){ oNextLink.onblur = null; };
	oNextLink.onblur = ResetDateSelector;
	oFrame.setTimeout(function(){ oNextLink.focus(); }, 200);
}
function ResetDateSelector()
{
    var oFrame = DisplayDateSelector.Frame;
    var bRelativeFrame = DisplayDateSelector.RelativeFrame;
    if ( oFrame != oFrame.top && bRelativeFrame )
    {
        var oCalendarTopFrame = (oFrame.AppTopFrame ? oFrame.AppTopFrame : oFrame.top);
        if( oCalendarTopFrame.document.getElementsByTagName("body")[0] ) oFrame = oCalendarTopFrame;
        else
        {
           var oCalendarTopFrame = oFrame.parent;
           while( oCalendarTopFrame && oCalendarTopFrame.document.getElementsByTagName("body")[0] )
           {
              oFrame = oCalendarTopFrame;
              if( oCalendarTopFrame == oCalendarTopFrame.parent ) break;
              else oCalendarTopFrame = oCalendarTopFrame.parent;
           }
        }
    }

	//If IE6 and IE6 hide select elements flag set, then do so
	if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 )
	{
		if( IsTrue(DisplayDateSelector.Control.getAttribute("HideSelectElementsInIE6")))
		{
			var oSelectElements = DisplayDateSelector.Frame.document.getElementsByTagName("select");
			for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
			{
				oSelectElements[iElement].style.visibility = "visible";
			}
		}
	}

    if( AppRoot.IsIpad)
    {
        oFrame.setTimeout(
            function()
            {
	            var oCalendarDiv = oFrame.document.getElementById(DisplayDateSelector.CalendarDivId);
	            oCalendarDiv.outerHTML = "<div id=" + DisplayDateSelector.CalendarDivId + " style='POSITION: absolute'></div>";
            }, 100);
    }
    else
    {
	    var oCalendarDiv = oFrame.document.getElementById(DisplayDateSelector.CalendarDivId);
	    oCalendarDiv.outerHTML = "<div id=" + DisplayDateSelector.CalendarDivId + " style='POSITION: absolute'></div>";
    }
}
function DateSelectorOnKeyDown(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear)
{
	switch(oFrame.event.keyCode)
	{
		case 36:	//Home
			DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear + 1);
			break;
		case 35:	//End
			DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear - 1);
			break;
		case 33:	//Page up
			iStartMonth += 1;
			if( iStartMonth > 12 )
			{
				iStartMonth = 1;
				iStartYear += 1;
			}
			DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear);
			break;
		case 34:	//Page down
			iStartMonth -= 1;
			if( iStartMonth < 1 )
			{
				iStartMonth = 12;
				iStartYear -= 1;
			}
			DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning, iStartMonth, iStartYear);
			break;
	}
}
function PickFromDateSelector(sPickValue)
{
	if( !AppRoot.IsIpad) DisplayDateSelector.Control.focus();
    DisplayDateSelector.Control.value = sPickValue;
	if( AppRoot.IsIpad) oFrame.setTimeout(function(){ DisplayDateSelector.Control.value = sPickValue; BaseDateProcessChange(DisplayDateSelector.Frame, DisplayDateSelector.Control.id); }, 10);
    else DisplayDateSelector.Control.blur();

    ResetDateSelector();
}
function BaseDateOnKeyDown(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning)
{
	var oBaseDate = oFrame.document.getElementById(sControlID);
	if( AppRoot.IsPageAvailable(oFrame) && (!oBaseDate.readOnly || oFrame.event.keyCode == 9 ) )
	{
		switch(oFrame.event.keyCode)
		{
			case 33:	//Page up
				var oParsedDate = ParseBaseDate(oBaseDate.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Get current month, date, and year
					var iMonth = oParsedDate.getMonth() + 1;
					var iDate = oParsedDate.getDate();
					var iYear = oParsedDate.getFullYear();

					//Increment the month
					iMonth += 1;
					if( iMonth > 12 )
					{
						iMonth = 1;
						iYear += 1;
					}

					//If date > 28 make sure when we add a month we adjust it so that it fits,
					//e.g., if 31 and we adjust the month to one that doesn't have 31 days we
					//go with the max # it does have (note new Date accepts a 0 indexed month so
					//our iMonth used in this context refers to the next month)
					if( iDate > 28 )
					{
						var iDayInMilliseconds = 1000 * 60 * 60 * 24;
						iDate = Math.min(iDate, new Date(new Date(iYear, iMonth).getTime() - iDayInMilliseconds).getDate());
					}

					//Reset contents of BaseDate
					var oNewDate = new Date(iYear, iMonth - 1, iDate);
					oBaseDate.value =
						(oNewDate.getMonth() + 1) + "/" +
						oNewDate.getDate() + "/" +
						oNewDate.getFullYear();
				}
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 34:	//Page down
				var oParsedDate = ParseBaseDate(oBaseDate.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Get current month, date, and year
					var iMonth = oParsedDate.getMonth() + 1;
					var iDate = oParsedDate.getDate();
					var iYear = oParsedDate.getFullYear();

					//Increment the month
					iMonth -= 1;
					if( iMonth < 1 )
					{
						iMonth = 12;
						iYear -= 1;
					}

					//If date > 28 make sure when we add a month we adjust it so that it fits,
					//e.g., if 31 and we adjust the month to one that doesn't have 31 days we
					//go with the max # it does have (note new Date accepts a 0 indexed month so
					//our iMonth used in this context refers to the next month)
					if( iDate > 28 )
					{
						var iDayInMilliseconds = 1000 * 60 * 60 * 24;
						iDate = Math.min(iDate, new Date(new Date(iYear, iMonth).getTime() - iDayInMilliseconds).getDate());
					}

					//Reset contents of BaseDate
					var oNewDate = new Date(iYear, iMonth - 1, iDate);
					oBaseDate.value =
						(oNewDate.getMonth() + 1) + "/" +
						oNewDate.getDate() + "/" +
						oNewDate.getFullYear();
				}
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 187:	//+ key (which is shift=)
				if( !oFrame.event.shiftKey )
				{
					oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
					break;
				}
			case 107:	//Keypad + button
			case 38:	//Arrow up
				var oParsedDate = ParseBaseDate(oBaseDate.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Increment the current date by 1 day AND 1 hr, the hr to deal with fall daylight savings time
					var iDayInMilliseconds = 1000 * 60 * 60 * 25;
					var oNewDate = new Date(oParsedDate.getTime() + iDayInMilliseconds);

					//Reset contents of BaseDate
					oBaseDate.value =
						(oNewDate.getMonth() + 1) + "/" +
						oNewDate.getDate() + "/" +
						oNewDate.getFullYear();
				}
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 189:	//- key
				if( oFrame.event.shiftKey ) //shift- is underscore
				{
					oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
					break;
				}
			case 109:	//Keypad - button
			case 40:	//Arrow down
				var oParsedDate = ParseBaseDate(oBaseDate.value, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Decrement the current midnight date by half a day land us some in the previous day, with or without daylight saving time.
					var iDayInMilliseconds = 1000 * 60 * 60 * 12;
					var oNewDate = new Date(oParsedDate.getTime() - iDayInMilliseconds);

					//Reset contents of BaseDate
					oBaseDate.value =
						(oNewDate.getMonth() + 1) + "/" +
						oNewDate.getDate() + "/" +
						oNewDate.getFullYear();
				}
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 67:	//Calendar
                if( !oFrame.event.altKey && !oFrame.event.ctrlKey )
                {
                    oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				    DisplayDateSelector(oFrame, sControlID, iAdditionalOffsetLeft, iAdditionalOffsetTop, iPositioning)
                }
				break;
			case 84:	//Today
				var oCurrentDate = new Date();
				oBaseDate.value =
					(oCurrentDate.getMonth() + 1) + "/" +
					oCurrentDate.getDate() + "/" +
					oCurrentDate.getFullYear();
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 89:	//Yesterday - first set day then take away 12 hours (works with daylight savings time)
				var oCurrentDate = new Date();
				var sTodayExpression =
					(oCurrentDate.getMonth() + 1) + "/" +
					oCurrentDate.getDate() + "/" +
					oCurrentDate.getFullYear();
				var oParsedDate = ParseBaseDate(sTodayExpression, true, true);
				if( !IsEmpty(oParsedDate) )
				{
					//Decrement the current midnight date by half a day land us some in the previous day, with or without daylight saving time.
					var iDayInMilliseconds = 1000 * 60 * 60 * 12;
					var oNewDate = new Date(oParsedDate.getTime() - iDayInMilliseconds);

					//Reset contents of BaseDate
					oBaseDate.value =
						(oNewDate.getMonth() + 1) + "/" +
						oNewDate.getDate() + "/" +
						oNewDate.getFullYear();
				}
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 8:  //Allow backspace to process
				break;
			case 9:  //Allow tab key to process
				break;
			case 37:  //Allow left arrow to process
				break;
			case 39:  //Allow right arrow to process
				break;
			case 45:  //Allow insert key to process
				break;
			case 46:  //Allow delete key to process
				break;
			case 191:  //Allow / to process
				break;
			case 111:  //Allow keypad / to process
				break;
			default:
				//Otherwise, unless a special key, allow only #s -- chars 48-57 or keypad 96-105;
				//suppress all other characters
				if( !oFrame.event.altKey && !oFrame.event.ctrlKey )
				{
					if( oFrame.event.keyCode < 48 ||
                        oFrame.event.keyCode > 57 ||
                        (oFrame.event.shiftKey && oFrame.event.keyCode >= 48 && oFrame.event.keyCode <= 57) )
					    {
						if( oFrame.event.keyCode < 96 || oFrame.event.keyCode > 105 )
						{
                            oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
						}
					}
				}
		}
	}
	else
	{
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
	}
}
function BaseDateProcessChange(oFrame, sControlID)
{
	//Set the value and process a change if a
	var oBaseDate = oFrame.document.getElementById(sControlID);
    if( !oFrame.AppFrameValues ) oFrame.AppFrameValues = new Object();
	if( IfEmpty(oBaseDate.value, "") != IfEmpty(oFrame.AppFrameValues[sControlID], "") )
	{
		oFrame.AppFrameValues[sControlID] = oBaseDate.value;

		//Trigger change handling, if any
		var sOnChangeScript = oBaseDate.getAttribute("ClientOnChangeFunction");

		if( !IsEmpty(sOnChangeScript) )
		{
			if( sOnChangeScript.indexOf("(") < 0 &&
				sOnChangeScript.indexOf(";") < 0 &&
				sOnChangeScript.indexOf(" ") < 0 &&
				sOnChangeScript.indexOf("=") < 0 ) //typeof(oOnSelectScript) == "function" didn't work
			{
                try
                {
				    oOnChangeScript = eval(sOnChangeScript); //NOT supported inside MTrE
				    oOnChangeScript.call(oBaseDate); //Sets this keyword if called this way
                }
                catch(e)
                {
				    oOnChangeScript = oFrame.eval(sOnChangeScript); //NOT supported inside MTrE
				    oOnChangeScript.call(oBaseDate); //Sets this keyword if called this way
                }
			}
			else
			{
				oFrame.eval(sOnChangeScript);
			}
		}
	}
}
function BaseDateOnBlur(oFrame, sControlID, bIssueMsgIfBadDate)
{
	//First validate
	var oBaseDate = oFrame.document.getElementById(sControlID);
	var oParsedDate = ParseBaseDate(oBaseDate.value, false, bIssueMsgIfBadDate, oBaseDate);
	if( !IsEmpty(oParsedDate) )
	{
		oBaseDate.value =
			(oParsedDate.getMonth() + 1) + "/" +
			oParsedDate.getDate() + "/" +
			oParsedDate.getFullYear();
	}

	//Process any change
	BaseDateProcessChange(oFrame, sControlID);
}
function ParseBaseDate(sDateExpression, bIfEmptyUseToday, bIssueMsgIfBadDate, oDateControl)
{
	//Initialize our return
	var oRtnDate = null;

    if( sDateExpression.replace(/[01-9]/g, "").replace(/\//g, "") != "" ) sDateExpression = "";

	//If no / separators and > 2 digits infer some separators
	if( sDateExpression.indexOf("/") < 0 && sDateExpression.length > 2 )
	{
		if( sDateExpression.length > 5 )
		{
			sDateExpression = sDateExpression.substr(0,2) + '/' +
							  sDateExpression.substr(2,2) + '/' +
							  sDateExpression.substr(4);
		}
		else if( sDateExpression.length == 5 )
		{
			sDateExpression = sDateExpression.substr(0,1) + '/' +
							  sDateExpression.substr(1,2) + '/' +
							  sDateExpression.substr(3);
		}
		else if( sDateExpression.length == 4 )
		{
			sDateExpression = sDateExpression.substr(0,2) + '/' +
							  sDateExpression.substr(2);
		}
		else
		{
			sDateExpression = sDateExpression.substr(0,1) + '/' +
							  sDateExpression.substr(1);
		}
	}

	try
	{
		//If empty expression return today, if flag so set
		if( IsEmpty(sDateExpression) )
		{
			if( bIfEmptyUseToday )
			{
				oRtnDate = new Date();
			}
		}
		else if( sDateExpression.indexOf("/") < 0 )
		{
			//We have one piece to work with -- assume it's the day of the current month
			var oCurrentDate = new Date();
			var iMonth = oCurrentDate.getMonth() + 1;
			var iYear = oCurrentDate.getFullYear();

			var iDayInMilliseconds = 1000 * 60 * 60 * 24;
			var iLastDayOfMonth = new Date(new Date(iYear, iMonth).getTime() - iDayInMilliseconds).getDate();

			if( sDateExpression < 1 || sDateExpression > iLastDayOfMonth )
			{
				throw new Error();
			}
			else
			{
				oCurrentDate.setDate(sDateExpression);
				oRtnDate = oCurrentDate;
			}
		}
		else
		{
			//Split into pieces
			var oDatePieces = sDateExpression.split("/");
			if( oDatePieces.length == 2 || (oDatePieces.length == 3 && oDatePieces[0].length == 0 ) )
			{
				//Make sure the month is in range and day is at least between 1 and 31
				if( oDatePieces[0] < 1 || oDatePieces[0] > 12 ||
				    oDatePieces[1] < 1 || oDatePieces[1] > 31 )
				{
					throw new Error();
				}
				else
				{
					//Get the current year and see if our day of month is really valid for the month and year
					var oCurrentDate = new Date();
					var iYear = oCurrentDate.getFullYear();

					var iDayInMilliseconds = 1000 * 60 * 60 * 24;
					var iLastDayOfMonth = new Date(new Date(iYear, oDatePieces[0]).getTime() - iDayInMilliseconds).getDate();

					if( oDatePieces[1] > iLastDayOfMonth )
					{
						throw new Error();
					}
					else
					{
						oRtnDate = new Date(iYear, oDatePieces[0] - 1, oDatePieces[1]);
					}
				}
			}
			else if( oDatePieces.length = 3 )
			{
				//Make sure the month is in range, the day is at least between 1 and 31,
				//and the year has no more than 4 digits
				if( oDatePieces[0] < 1 || oDatePieces[0] > 12 ||
					oDatePieces[1] < 1 || oDatePieces[1] > 31 ||
					oDatePieces[2].length > 4 )
				{
					throw new Error();
				}
				else
				{
					//Adjust year
					if( oDatePieces[2].length < 2 )
					{
						oDatePieces[2] = "0" + oDatePieces[2];
					}
					if( oDatePieces[2].length == 2 )
					{
						if( oDatePieces[2] < 50 )
						{
							oDatePieces[2] = "20" + oDatePieces[2];
						}
						else
						{
							oDatePieces[2] = "19" + oDatePieces[2];
						}
					}

					//See if our day of month is really valid for the month and year
					var iDayInMilliseconds = 1000 * 60 * 60 * 24;
					var iLastDayOfMonth =
						new Date(new Date(oDatePieces[2], oDatePieces[0]).getTime() - iDayInMilliseconds).getDate();

					if( oDatePieces[1] > iLastDayOfMonth )
					{
						throw new Error();
					}
					else
					{
						oRtnDate = new Date(oDatePieces[2], oDatePieces[0] - 1, oDatePieces[1]);
					}
				}
			}
			else if( bIssueMsgIfBadDate )
			{
				if( oDateControl )
				{
					setTimeout(function(){ alert('The date is invalid'); oDateControl.focus(); }, 50);
				}
				else
				{
					setTimeout(function(){ alert('The date is invalid'); }, 50);
				}
			}
		}
	}
	catch(e)
	{
		if( bIssueMsgIfBadDate )
		{
			if( oDateControl )
			{
				setTimeout(function(){ alert('The date is invalid'); oDateControl.focus(); }, 50);
			}
			else
			{
				setTimeout(function(){ alert('The date is invalid'); }, 50);
			}
		}
	}
	return oRtnDate;
}

function BaseTimeOnKeyDown(oFrame, sControlID, bUseMilitaryTime, bPadHourToTwoDigits)
{
	var oBaseTime = oFrame.document.getElementById(sControlID);
	if( AppRoot.IsPageAvailable(oFrame) && !oBaseTime.readOnly )
	{
		switch(oFrame.event.keyCode)
		{
			case 78:	//Now
				var oCurrentDate = new Date();
				iHour = oCurrentDate.getHours();
				iMinutes = oCurrentDate.getMinutes();
				sPartOfDayDesignation = '';
				if( !bUseMilitaryTime )
				{
					if( iHour < 12 || (iHour == 12 && iMinutes == 0) )
					{
						sPartOfDayDesignation = ' AM'
					}
					else
					{
						sPartOfDayDesignation = ' PM'
						if( iHour > 12 )
						{
							iHour -= 12
						}
					}
				}
				if( bPadHourToTwoDigits && iHour < 10 )
				{
					iHour = '0' + iHour;
				}
				if( iMinutes < 10 )
				{
					iMinutes = '0' + iMinutes;
				}

				oBaseTime.value = iHour + ':' + iMinutes + sPartOfDayDesignation;
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
                oBaseTime.onchange();
				break;
			default:
				break;
		}
	}
	else
	{
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
	}
}

//Use global root to facilitate testing
function BaseComboSetup(oFrame, oCombo, bUseGlobalRoot, oPostBackFunction)
{
    if( !oCombo ) return; //Avoids js error when closing classic popup immediately after a postback

	//Localize combo functions, if necessary
	oCombo.autocomplete = "off";
	if( !oFrame.AppFrameId ) //Non-MTrE combo
	{
		InitMTrEFrameSettings(oFrame);
		oCombo.Root = oFrame;
	}
	else
	{
		 //Run combo in the context of its frame
        oCombo.Root = ( (arguments.length > 2 && bUseGlobalRoot) ? AppRoot : oFrame);
		if( (arguments.length < 3 || !bUseGlobalRoot) && !oFrame.IsBaseComboDefined )
		{
			if( !oFrame.IsEmpty ) oFrame.eval(IsEmpty.toString());
			if( !oFrame.IfEmpty ) oFrame.eval(IfEmpty.toString());
			if( !oFrame.GetNewHttpRequest ) oFrame.eval(GetNewHttpRequest.toString());
			if( !oFrame.GetPosition ) oFrame.eval(GetPosition.toString());
			if( !oFrame.ScrollToElement ) oFrame.eval(ScrollToElement.toString());

			oFrame.eval(BaseComboGetHttpRequest.toString());
			oFrame.eval(BaseComboGetSelectorGIF.toString());
			oFrame.eval(BaseComboGetResultsDiv.toString());
			oFrame.eval(BaseComboGetComboXML.toString());
			oFrame.eval(BaseComboGetHiddenValue.toString());
			oFrame.eval(BaseComboGetXMLControl.toString());
			oFrame.eval(BaseComboGetResults.toString());
			oFrame.eval(BaseComboHighlightCurrentResult.toString());
			oFrame.eval(BaseComboOpenResults.toString());
			oFrame.eval(BaseComboDisplayResults.toString());
			oFrame.eval(BaseComboRecoverFocus.toString());
			oFrame.eval(BaseComboResetSelector.toString());
			oFrame.eval(BaseComboEvaluateState.toString());
			oFrame.eval(BaseComboOnFocus.toString());
			oFrame.eval(BaseComboOnKeyDown.toString());
			oFrame.eval(BaseComboComponentOnBlur.toString());
			oFrame.eval(BaseComboCheckForUpdate.toString());
			oFrame.eval(BaseComboComponentOnFocus.toString());
			oFrame.eval(BaseComboResetOnBlurTimeout.toString());
			oFrame.eval(BaseComboImplicitSelect.toString());

			//This only need be done once per page, not per control
			oFrame.IsBaseComboDefined = true;
		}

        if( oFrame.PopoutFrameId && AppCurrentFrames.Item[oFrame.PopoutFrameId] && AppCurrentFrames.Item[oFrame.PopoutFrameId].OriginalFrame )
        {
            oCombo.ClientState = AppCurrentFrames.Item[oFrame.PopoutFrameId].OriginalFrame.document.getElementById(oCombo.id).ClientState;

	        var oSelectorGIF = oCombo.Root.BaseComboGetSelectorGIF(oFrame, oCombo);
		    if( oSelectorGIF.src != "Images/ComboDown.gif" )
		    {
			    oSelectorGIF.src = "Images/ComboDown.gif";
		        var oDropdownDiv = oCombo.Root.BaseComboGetResultsDiv(oFrame, oCombo);
		        oDropdownDiv.style.visibility = "hidden";
                oCombo.Root.BaseComboOpenResults(oCombo, false);
            }
        }
        else oCombo.ClientState = new Object();
	}

	//Setup properties and events for this control
	oCombo.FrameInfo = AppCurrentFrames.GetFrameLoadInfo(oFrame.AppFrameId);
	oCombo.ResultsDisplayed = false;
	oCombo.ResultsQuery = ""
	oCombo.HasFocus = false;
	oCombo.LastValue = oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value;
	oCombo.LastText = oCombo.value;
	oCombo.LastValueText = oCombo.value;  //Used to determine when to clear value on text change
    oCombo.onblur =
		function()
			{
				oCombo.Root.BaseComboComponentOnBlur(oFrame, this);
			}
    oCombo.onfocus =
		function()
			{
				oCombo.Root.BaseComboOnFocus(oFrame, this);
			}
    oCombo.onmouseover =
		function()
			{
				if( !oCombo.ToolTipPreserved )
				{
					oCombo.ToolTip = oCombo.title;
					oCombo.ToolTipPreserved = true;
				}
				if( IsEmpty(oCombo.ToolTip) )
				{
					oCombo.title = oCombo.value;
				}
				else if( IsEmpty(oCombo.value) )
				{
					oCombo.title = oCombo.ToolTip;
				}
				else
				{
					oCombo.title = oCombo.value + "\n" + oCombo.ToolTip;
				}
			}
    oCombo.onkeydown =
		function()
			{
				oCombo.Root.BaseComboOnKeyDown(oFrame, this);
			}
    oCombo.GetResults =
		function()
			{
				oCombo.Root.BaseComboGetResults(oFrame, oCombo, true, oCombo.TrackingNo, oCombo.value);
			}
    oCombo.ClearResults =
		function()
			{
				var oDropdownDiv = oCombo.Root.BaseComboGetResultsDiv(oFrame, oCombo);
				oDropdownDiv.style.visibility = "hidden";
                oCombo.Root.BaseComboOpenResults(oCombo, false);
				oDropdownDiv.innerHTML = "";
			}
    oCombo.Clear =
		function()
			{
				oCombo.ClearResults();
				BaseComboGetHiddenValue(window, oCombo).value = '';
				oCombo.value = '';
				oCombo.LastValue = '';
				oCombo.LastText = '';
				oCombo.LastValueText = '';
				oCombo.ResultsQuery = '';
				document.body.style.cursor = 'auto';
			}
    oCombo.Enable =
		function()
			{
				if( IsEmpty(oCombo.Selector) )
				{
					oCombo.Selector = oFrame.document.getElementById(oCombo.id + "_ulbSearchButton");
				}
				if( arguments.length < 1 || arguments[0] )
				{
					oCombo.disabled = false;
					oCombo.Selector.style.display = "";
				}
				else
				{
					oCombo.disabled = true;
					oCombo.Selector.style.display = "none";
				}
			}
    oCombo.Unlock =
		function()
			{
				if( IsEmpty(oCombo.Selector) )
				{
					oCombo.Selector = oFrame.document.getElementById(oCombo.id + "_ulbSearchButton");
				}
				if( arguments.length < 1 || arguments[0] )
				{
					oCombo.readOnly = false;
					oCombo.Selector.style.display = "";
				}
				else
				{
					oCombo.readOnly = true;
					oCombo.Selector.style.display = "none";
				}
			}
    oCombo.Hide =
		function()
			{
				if( IsEmpty(oCombo.Selector) )
				{
					oCombo.Selector = oFrame.document.getElementById(oCombo.id + "_ulbSearchButton");
				}
				if( arguments.length < 1 || arguments[0] )
				{
					oCombo.style.display = "none";
					oCombo.Selector.style.display = "none";
				}
				else
				{
					oCombo.style.display = "";
					oCombo.Selector.style.display = "";
				}
			}
    oCombo.Root.BaseComboGetResultsDiv(oFrame, oCombo).onmousedown =
		function()
			{
				oCombo.Root.BaseComboComponentOnFocus(oFrame, oCombo);
			}

	if( arguments.length > 3 && oPostBackFunction )
	{
		oCombo.PostBack = oPostBackFunction;
	}
}
function BaseComboGetHttpRequest(oFrame, oCombo)
{
	if( !oCombo.HttpRequest )
	{
		oCombo.HttpRequest = GetNewHttpRequest();
	}
	return oCombo.HttpRequest;
}
function BaseComboGetSelectorGIF(oFrame, oCombo)
{
	if( IsEmpty(oCombo.SelectorGIF) )
	{
		oCombo.SelectorGIF = oFrame.document.getElementById(oCombo.id + "_selectorgif");
	}
	return oCombo.SelectorGIF;
}
function BaseComboGetResultsDiv(oFrame, oCombo)
{
	if( IsEmpty(oCombo.ResultsDiv) )
	{
		oCombo.ResultsDiv = oFrame.document.getElementById(oCombo.id + "_div");
	}
	return oCombo.ResultsDiv;
}
function BaseComboGetComboXML(oFrame, oCombo)
{
	if( IsEmpty(oCombo.ComboXML) )
	{
		oCombo.ComboXML = AppRoot.CreateXMLDocument(unescape(BaseComboGetXMLControl(oFrame, oCombo).value));
	}
	return oCombo.ComboXML;
}
function BaseComboGetHiddenValue(oFrame, oCombo)
{
	if( IsEmpty(oCombo.HiddenValue) )
	{
		oCombo.HiddenValue = oFrame.document.getElementById(oCombo.id + "_ulbValueHidden");
	}
	return oCombo.HiddenValue;
}
function BaseComboGetXMLControl(oFrame, oCombo)
{
	if( IsEmpty(oCombo.XMLControl) )
	{
		oCombo.XMLControl = oFrame.document.getElementById(oCombo.id + "_ulbXML");
	}
	return oCombo.XMLControl;
}
function BaseComboOnClickSelector(oFrame, sComboID)
{
	//Combo can only be available if page is available
	var bComboIsAvailable = AppRoot.IsPageAvailable(oFrame);
	if( bComboIsAvailable )
	{
		//Make sure control itself is enabled, and if so...
		var oCombo = oFrame.document.getElementById(sComboID);
		if( oCombo.disabled || oCombo.readOnly )
		{
			bComboIsAvailable = false;
		}
		if( bComboIsAvailable )
		{
			//Acknowledge that combo still has control (irrelevant when control disabled)
			oCombo.HasFocus = true;
			oCombo.Root.BaseComboResetOnBlurTimeout(oFrame, oCombo);

			//If the control is available toggle the list (drop it down
			//if it's not down, clear the list if it's already down),
			//and adjust the GIF to toggle back
			if( oCombo.ResultsDisplayed )
			{
				oCombo.Root.BaseComboResetSelector(oFrame, oCombo);
			}
			else
			{
				oCombo.Root.BaseComboGetResults(oFrame, oCombo, false, null, "");
			}

			//Always return focus to the textbox, after any text
			oFrame.setTimeout(function(){ oCombo.Root.BaseComboRecoverFocus(oFrame, oCombo); }, 0);
		}
	}
}
function BaseComboOnMore(oFrame, sComboID, sQuery, sStartingAfterValue, sStartingAfterColumn1, iStartingAfterRow, bSelectNextRecord)
{
	//Make sure control itself is enabled, and if so...
	var oCombo = oFrame.document.getElementById(sComboID);

	//Acknowledge that combo still has control
	oCombo.HasFocus = true;
	oCombo.Root.BaseComboResetOnBlurTimeout(oFrame, oCombo);

	//Get more results
	oCombo.Root.BaseComboGetResults(oFrame, oCombo, false, null, sQuery, sStartingAfterValue, sStartingAfterColumn1, iStartingAfterRow, bSelectNextRecord);

	//Always return focus to the textbox, after any text
	if( !AppRoot.IsIpad ) oCombo.Root.BaseComboRecoverFocus(oFrame, oCombo);
}
function BaseComboGetResults(oFrame,oCombo,bProcessingKeystroke,iTrackingNo,sQuery,sStartingAfterValue,sStartingAfterColumn1,iStartingAfterRow,bSelectNextRecord)
{
	if( IsEmpty(oCombo.LastDisplayedResultsTrackingNo) )
	{
		oCombo.LastDisplayedResultsTrackingNo = -1;
	}

	//Update client state
	BaseComboEvaluateState(oFrame, oCombo);

	//Passing the basic combo characteristics we need to get our results into an xml document,
	//get results via HTTP request, passing in characteristics of combo and last value obtained
	var oComboXML = BaseComboGetComboXML(oFrame, oCombo);

	//Add in dynamic info
	var oXMLRoot = oComboXML.documentElement;
	oXMLRoot.setAttribute("Query", sQuery);
	oXMLRoot.setAttribute("SelectedValue", BaseComboGetHiddenValue(oFrame, oCombo).value);
	if( arguments.length >= 8 )
	{
		oXMLRoot.setAttribute("LastKnownValue", sStartingAfterValue);
		oXMLRoot.setAttribute("LastKnownColumn1", sStartingAfterColumn1);
		oXMLRoot.setAttribute("LastKnownRow", iStartingAfterRow);
	}
	else
	{
		oXMLRoot.setAttribute("LastKnownValue", "");
		oXMLRoot.setAttribute("LastKnownColumn1", "");
		oXMLRoot.setAttribute("LastKnownRow", "");
	}

	//Construct url to fetch query via AJAX (as necessary)
	if( !oCombo.AjaxURL )
	{
		oCombo.AjaxURL = "AJAXServer.aspx?InvokeAssembly=MTrE&InvokeClass=Combo&InvokeMethod=GetFormattedResults";
	}

	var oHttpRequest = BaseComboGetHttpRequest(oFrame, oCombo);
	try //Available in IE7
	{
		oHttpRequest.abort();
	}
	catch(e){}
	oHttpRequest.open("POST", oCombo.AjaxURL);
	oHttpRequest.onreadystatechange =
		function()
			{
				if( oHttpRequest.readyState == 4 )
				{
					if( oHttpRequest.status == 200 )
					{
						if( bProcessingKeystroke )
						{
							//Make sure the frame is still around
							var bFrameInfoAvailable = true;
							try
							{
								var oFrameInfo = oCombo.FrameInfo;
							}
							catch(e){ bFrameInfoAvailable = false; }

							if( bFrameInfoAvailable )
							{
								var oCurrentDisplayResultsTimeout =
									oCombo.FrameInfo.FrameTimeouts[oCombo.id + "__Results"];
								if( !IsEmpty(oCurrentDisplayResultsTimeout) &&
									iTrackingNo > oCombo.LastDisplayedResultsTrackingNo )
								{
									oCombo.LastDisplayedResultsTrackingNo = iTrackingNo;
									oCombo.KnockCount = 0;
									if( oCurrentDisplayResultsTimeout.TrackingNo == iTrackingNo )
									{
										oCombo.FrameInfo.FrameTimeouts[oCombo.id + "__Results"] = null;
									}
									try
									{
										BaseComboDisplayResults(oFrame, oCombo, oComboXML, oHttpRequest.responseText, bSelectNextRecord);
									}
									catch(e){}
								}
							}
						}
						else
						{
							BaseComboDisplayResults(oFrame, oCombo, oComboXML, oHttpRequest.responseText, bSelectNextRecord);
						}
					}
				}
			}
	oHttpRequest.setRequestHeader("Content-Type", "text/xml");
	oHttpRequest.send(oComboXML);
}
function BaseComboHighlightCurrentResult(oFrame, oCombo, iHighlightRow)
{
	if( oCombo.SelectedRow != iHighlightRow )
	{
		if( oCombo.SelectedRow >= 0 )
		{
		oCombo.ResultsTable.rows[oCombo.SelectedRow].style.backgroundColor =
			oCombo.ResultsTable.rows[iHighlightRow].style.backgroundColor;
		oCombo.ResultsTable.rows[oCombo.SelectedRow].style.color =
			oCombo.ResultsTable.rows[iHighlightRow].style.color;
		}
		oCombo.SelectedRow = iHighlightRow;
		oCombo.ResultsTable.rows[oCombo.SelectedRow].style.backgroundColor = "RoyalBlue";
		oCombo.ResultsTable.rows[oCombo.SelectedRow].style.color = "White";
	}
}
function BaseComboOpenResults(oCombo, bIsOpen)
{
  	oCombo.ResultsDisplayed = bIsOpen;
    if( !AppRoot.IsIE || AppRoot.IsHTML5 )
    {
        if( bIsOpen )
        {
            if( !oCombo.__zIndexNoted )
            {
                oCombo.__zIndexOriginal = oCombo.parentElement.style.zIndex;
                oCombo.__zIndexNoted = true;
            }
            oCombo.parentElement.style.zIndex = '9999';
        }
        else if( oCombo.__zIndexNoted )
        {
            oCombo.parentElement.style.zIndex = oCombo.__zIndexOriginal;
        }
    }
}
function BaseComboDisplayResults(oFrame, oCombo, oComboXML, sResultsText, bSelectNextRecord)
{
	//Determine whether we want to display new results (Y), replace old results (R), or add on (+)
	if( sResultsText.length > 1 )
	{
		//Determine action type and row info -- on a more (+) only process if last row > current last row
		var sActionType = sResultsText.substr(0, 1);
		var iDelimiter = sResultsText.indexOf("|");
		var sRowInfo = sResultsText.substr(1, iDelimiter - 1);
        var iHorizontalOffset = 0;
        var iRowInfoDelimiter = sRowInfo.indexOf("_");
        if( iRowInfoDelimiter >= 0 )
        {
            if( iRowInfoDelimiter < sRowInfo.length - 1 ) iHorizontalOffset = parseInt(sRowInfo.substr(iRowInfoDelimiter + 1), 10);
		    sRowInfo = sRowInfo.substr(0, iRowInfoDelimiter - 1);
        }
		if( sActionType == "+" && parseInt(sRowInfo.split(",")[0]) <= parseInt(oCombo.LastResultRow) )
		{
			return; //We tried to fetch the same next set of records twice
		}
		oCombo.LastResultRow = sRowInfo.split(",")[0];
		var iHighlightRow = IfEmpty(sRowInfo.split(",")[1], -1);
		sResultsText = sResultsText.substr(iDelimiter + 1);
		oCombo.ResultsQuery = oComboXML.documentElement.getAttribute("Query");

		//Display results in div region positioned just under text box
		var oComboPosition, iLeft, iTop;
		if( AppRoot.IsIE && !AppRoot.IsHTML5 )
		{
			oComboPosition = GetPosition(oCombo.parentElement);
			iLeft = oComboPosition[0] +
				parseInt(IfEmpty(oComboXML.documentElement.getAttribute("ResultsOffsetHorizontal"),"0"));
			iTop = oComboPosition[1] + oCombo.offsetHeight - 1 +
				parseInt(IfEmpty(oComboXML.documentElement.getAttribute("ResultsOffsetVertical"),"0"));
		}
		else
		{
			iTop = iLeft = 0;
		}

		var oDropdownDiv = BaseComboGetResultsDiv(oFrame, oCombo);

		//If necessary formulate results table html
		var sTableBeforeHTML = "";
		var sTableAfterHTML = "</tbody></table></div>";
		if( sActionType == "Y" || sActionType == "R" )
		{
			sTableBeforeHTML =
				"<div id=" + oCombo.id + "_scrolldiv>" +
					"<table id=" + oCombo.id + "_table" +
						" class='" + oComboXML.documentElement.getAttribute("ResultsCssClass") +
						"' cellSpacing=0 cellPadding=1" +
						" onmouseover='document.body.style.cursor = &#39;hand&#39;;'" +
						" onmouseout='document.body.style.cursor = &#39;auto&#39;;'" +
						"><tbody>";
		}

		switch(sActionType)
		{
			case "Y":
				//Display the fresh results
				if( AppRoot.IsIE && !AppRoot.IsHTML5 )
				{
					oDropdownDiv.style.left = iLeft + iHorizontalOffset + "px";
					oDropdownDiv.style.top = iTop + "px";
				}
                else if( iHorizontalOffset != 0 ) oDropdownDiv.style.left = iHorizontalOffset + "px";

				oDropdownDiv.style.height = null;
				oDropdownDiv.style.overflow = "hidden";

				oDropdownDiv.innerHTML = sTableBeforeHTML + sResultsText + sTableAfterHTML;
				oCombo.SelectedRow = -1;
				var oSelectorGIF = BaseComboGetSelectorGIF(oFrame, oCombo);
				if( oSelectorGIF.src != "Images/ComboUp.gif" )
				{
					oSelectorGIF.src = "Images/ComboUp.gif";
					if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 &&
						oComboXML.documentElement.getAttribute("HideSelectElementsInIE6") == "Y" )
					{
						oFrame.setTimeout(
							function()
							{
								var oSelectElements = oFrame.document.getElementsByTagName("select");
								for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
								{
									oSelectElements[iElement].style.visibility = "hidden";
								}
							},
							75);
					}
				}
				oCombo.ResultsTable = oFrame.document.getElementById(oCombo.id + "_table");
				oCombo.ScrollDiv = null;
				break;
			case "R":  //No break causes us to flow into next block -- this is intentional
				oCombo.SelectedRow = -1;
			case "+":
				//As necessary set height of scrolling div tag
				var sHeight = oDropdownDiv.style.height;
				if( IsEmpty(sHeight) )
				{
					sHeight = oDropdownDiv.offsetHeight + "px";
					oDropdownDiv.style.height = sHeight;
				}

				//Display the additional (or refreshed) results (highlighting the first one)
				var iNewSelectRow = oCombo.ResultsTable.rows.length - 1;
				if( sActionType == "+" )
				{
					var sContents = oDropdownDiv.innerHTML;
					var sLastRowMarker;
					if( AppRoot.IsIE && !AppRoot.IsHTML5 )
					{
						sLastRowMarker = '<TR ';
					}
					else
					{
						sLastRowMarker = '<tr ';
					}

                    if( !AppRoot.IsIE || !AppRoot.IsHTML5 || AppRoot.BrowserVsn < 11 )
                    {
					    oDropdownDiv.innerHTML =
						    sContents.substr(0, sContents.lastIndexOf(sLastRowMarker)) +
						    sResultsText +
						    sTableAfterHTML;
                    }
				}
				else if( sActionType == "R" )
				{
					oDropdownDiv.innerHTML = sTableBeforeHTML + sResultsText + sTableAfterHTML;
				}
				oCombo.ResultsTable = oFrame.document.getElementById(oCombo.id + "_table");

				var	oScrollDiv = oFrame.document.getElementById(oCombo.id + "_scrolldiv");
				oCombo.ScrollDiv = oScrollDiv;
				oScrollDiv.style.overflow = "auto";
				var oLastRow = oCombo.ResultsTable.rows[oCombo.ResultsTable.rows.length - 1];
				if( oLastRow.id == (oCombo.id + "_MoreRow") )
				{
					var iLastRowHeight = oLastRow.offsetHeight;
					var sLastRowContents = oLastRow.cells[0].innerHTML;
					oLastRow.cells[0].innerHTML = "";
					oScrollDiv.style.height = (parseInt(sHeight) - iLastRowHeight - 4) + "px";
					oDropdownDiv.insertAdjacentHTML("BeforeEnd",
						"<div" +
							" style='position: absolute" +
								  "; top: " + oScrollDiv.style.height + "'" +
							" onmouseover='document.body.style.cursor = &#39;hand&#39;;'" +
							" onmouseout='document.body.style.cursor = &#39;auto&#39;;'" +
						">" +
							sLastRowContents +
						"</div>");
					ScrollToElement(oScrollDiv, oCombo.ResultsTable.rows[oCombo.ResultsTable.rows.length - 2]);
				}
				else
				{
					oScrollDiv.style.height = sHeight;
					ScrollToElement(oScrollDiv, oLastRow);
				}
				var oSelectRow = oCombo.ResultsTable.rows[iNewSelectRow];
				if( bSelectNextRecord && oSelectRow && oSelectRow.onmousedown )
				{
					var sSelectScript = oSelectRow.onmousedown.toString();
					var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
					sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
					var iFunctionEnds = sSelectScript.lastIndexOf(");");
					sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
					oFrame.eval(sSelectScript);
					break;
				}
		}

		//Highlight the currently selected row if it's in our list of results
		if( iHighlightRow >= 0 && iHighlightRow != oCombo.SelectedRow )
		{
			oCombo.Root.BaseComboHighlightCurrentResult(oFrame, oCombo, iHighlightRow)
		}

		//Size the div tag appropriately
		var iResultsDisplayWidth = Math.max(oCombo.ResultsTable.offsetWidth, oCombo.offsetWidth);
		if( iResultsDisplayWidth > oCombo.ResultsTable.offsetWidth )
		{
			oCombo.ResultsTable.style.width = iResultsDisplayWidth + "px";
		}
		if( oDropdownDiv.style.height )	//Height set indicates we have to allow for a scrollbar
		{
			iResultsDisplayWidth += 20;
		}
		oDropdownDiv.style.width = iResultsDisplayWidth + "px";

		var oMoreButton = oFrame.document.getElementById(oCombo.id + "_MoreBtn");
		if( !IsEmpty(oMoreButton) )
		{
			oMoreButton.style.width = oDropdownDiv.style.width;
		}

		//Adjust combo to display up, if that property is set
		var bResultsDisplayUp = AppRoot.IsTrue(oComboXML.documentElement.getAttribute("ResultsDisplayUp"));
		if( bResultsDisplayUp )
		{
			oDropdownDiv.style.top = (iTop + 2 - ((AppRoot.IsIE && !AppRoot.IsHTML5) ? oCombo.offsetHeight : 0) - oDropdownDiv.offsetHeight) + "px";
		}

		//Adjust combo to display left, if that property is set
        if( iHorizontalOffset == 0 )
        {
		    var bResultsDisplayLeft = AppRoot.IsTrue(oComboXML.documentElement.getAttribute("ResultsDisplayLeft"));
		    if( bResultsDisplayLeft )
		    {
			    oDropdownDiv.style.left = (iLeft + Math.min(0, oCombo.clientWidth + 15 - oDropdownDiv.clientWidth)) + "px";
		    }
        }

		//If combo has focus, let its results display otherwise implicitly set value
		if( oCombo.HasFocus )
		{
            oCombo.Root.BaseComboOpenResults(oCombo, true);
            oDropdownDiv.style.visibility = "visible";
		}
		else
		{
			oCombo.Root.BaseComboImplicitSelect(oFrame, oCombo);
		}
	}
}
function BaseComboRecoverFocus(oFrame, oCombo)
{
	//Set focus to the textbox such that the cursor is after any text entered
	oCombo.focus();
	oCombo.KnockCount = 0;
	if( oCombo.value.length > 0 ) oCombo.select();
}
function BaseComboResetSelector(oFrame, oCombo)
{
	oCombo.FrameInfo.FrameTimeouts[oCombo.id] = null;
	if( oCombo.ResultsDisplayed )
	{
		var oDropdownDiv = BaseComboGetResultsDiv(oFrame, oCombo);
		oDropdownDiv.style.visibility = "hidden";
        oCombo.Root.BaseComboOpenResults(oCombo, false);
		//oDropdownDiv.innerHTML = "";	-- decide to retain the contents
		var oSelectorGIF = BaseComboGetSelectorGIF(oFrame, oCombo);
		if( oSelectorGIF.src != "Images/ComboDown.gif" )
		{
			oSelectorGIF.src = "Images/ComboDown.gif";
			if( parseInt(oFrame.clientInformation.appVersion.split("MSIE")[1]) < 7 &&
				BaseComboGetComboXML(oFrame, oCombo).documentElement.getAttribute("HideSelectElementsInIE6") == "Y" )
			{
				var oSelectElements = oFrame.document.getElementsByTagName("select");
				for( var iElement = 0; iElement < oSelectElements.length; iElement++ )
				{
					oSelectElements[iElement].style.visibility = "visible";
				}
			}
		}
	}
}
function BaseComboEvaluateState(oFrame, oCombo)
{
	var oComboXML = BaseComboGetComboXML(oFrame, oCombo);
	var sClientState = oComboXML.documentElement.getAttribute("ClientStateFunction");
    var oClientState;
	if( IsEmpty(sClientState) )
    {
        oClientState = oCombo.ClientState;
    }
    else
	{
		try
		{
			oClientState = eval(sClientState);
		}
		catch(e)
		{
			try
			{
				oClientState = eval("oFrame." + sClientState);
			}
			catch(e)
			{
				return; //AJAXReplacement rendering otherwise fails (when all the stuff works come back here)
			}
		}
		if( sClientState.indexOf("(") < 0 ) //Test used to be via typeof which proved unreliable
		{
			oClientState = oClientState.call(oCombo);
		}
    }

	var oXMLRoot = oComboXML.documentElement;
	var oOverrides = oXMLRoot.getElementsByTagName("Overrides")[0];
	for( var iAttribute = oOverrides.attributes.length - 1; iAttribute >= 0; iAttribute-- )
	{
		oOverrides.attributes.removeNamedItem(oOverrides.attributes[iAttribute].name)
	}

    if( oClientState )
    {
		if( typeof(oClientState) == "object" && !IsEmpty(oClientState) )
		{
			//Add in dynamic info
			var bChangesFound = false;
			for( var sOverride in oClientState )
			{
				var oClientStateItem = oClientState[sOverride];
				if( typeof oClientStateItem == 'function' )
				{
					oClientStateItem = oClientStateItem();
				}
				if( oOverrides.getAttribute(sOverride) != oClientStateItem )
				{
					bChangesFound = true;
					oOverrides.setAttribute(sOverride, oClientStateItem);
				}
			}

			//Sync state function as necessary
			if( bChangesFound )
			{
                if( AppRoot.IsIE && !AppRoot.IsHTML5 )  //The following a) doesn't seem to work outside IE and b) doesn't seem to be necessary outside of IE
                {
				    BaseComboGetXMLControl(oFrame, oCombo).value =
					    escape(BaseComboGetComboXML(oFrame, oCombo).xml).replace(/\x2f/g,"%2f");
                }
			}
		}
    }
}
function BaseComboOnFocus(oFrame, oCombo)
{
	oCombo.KnockCount = 0;
	oCombo.HasFocus = true;
}
function BaseComboOnKeyDown(oFrame, oCombo)
{
	if( oFrame.event.altKey ||
	    (oFrame.event.ctrlKey && oFrame.event.keyCode != 86 && oFrame.event.keyCode != 88) )
	{
		oFrame.event.returnValue = true;	//If page not available should be trapped elsewhere
	}
	else if( AppRoot.IsPageAvailable(oFrame) && !oCombo.readOnly )
	{
		switch(oFrame.event.keyCode)
		{
			case 13:	//On enter
				//Do special handling while still allowing key to process
				oCombo.Root.BaseComboImplicitSelect(oFrame, oCombo, false);
				oFrame.event.keyCode = 9; //Tab to next field
				break;
			case 14:	//Case in
			case 15:	//Case out
			case 16:	//Shift
				//For all the above, do NO special handling, simply process the keystroke
				//so that they don't fall through to the default case below
				break;
			case 9:	//Tab handling
				//Do special handling while still allowing key to process
				oCombo.Root.BaseComboImplicitSelect(oFrame, oCombo, false);
				break;
			case 27:	//Escape
				oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = "";
				oCombo.LastValueText = "";
				oCombo.value = "";
				oCombo.Root.BaseComboResetSelector(oFrame, oCombo);
				BaseComboCheckForUpdate(oFrame, oCombo);
				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				oFrame.setTimeout(function(){ oCombo.Root.BaseComboRecoverFocus(oFrame, oCombo); }, 0);
				break;
			case 33:	//Page up
				if( oCombo.ResultsDisplayed )
				{
					//Determine how many rows we page on and then set row on the first page break found
					//before the current row
					if( oCombo.SelectedRow > 0 )
					{
						var iDropDownRows =
							Number(IfEmpty(BaseComboGetComboXML(oFrame, oCombo).documentElement.getAttribute("DropDownRows"), 10));
						var iSelectRow = oCombo.SelectedRow;
						if( iSelectRow%iDropDownRows == 0 )
						{
							iSelectRow -= iDropDownRows;
						}
						else
						{
							iSelectRow -= oCombo.SelectedRow%iDropDownRows;
						}
						var oSelectRow = oCombo.ResultsTable.rows[iSelectRow];
						if( oSelectRow && oSelectRow.onmousedown )
						{
							var sSelectScript = oSelectRow.onmousedown.toString();
							var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
							sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
							var iFunctionEnds = sSelectScript.lastIndexOf(");");
							sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
							if( oCombo.ScrollDiv )
							{
								ScrollToElement(oCombo.ScrollDiv, oSelectRow);
							}
							oFrame.eval(sSelectScript);
						}
					}
				}

				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 34:	//Page down
				if( oCombo.ResultsDisplayed )
				{
					//Determine how many rows we page on and then set row on the first page break found
					//before the current row
					if( oCombo.SelectedRow < oCombo.ResultsTable.rows.length - 1 )
					{
						var iDropDownRows =
							Number(IfEmpty(BaseComboGetComboXML(oFrame, oCombo).documentElement.getAttribute("DropDownRows"), 10));
						var iSelectRow = Math.max(0, oCombo.SelectedRow) + iDropDownRows;
						if( iSelectRow >= oCombo.ResultsTable.rows.length )
						{
							iSelectRow = oCombo.ResultsTable.rows.length - 1;
						}
						var oSelectRow = oCombo.ResultsTable.rows[iSelectRow];
						if( oSelectRow.id == (oCombo.id + "_MoreRow") )
						{
							var sMoreScript = oFrame.document.getElementById(oCombo.id + "_MoreBtn").onclick.toString();
							var iFunctionStarts = sMoreScript.indexOf("AppRoot.BaseComboOnMore");
							sMoreScript = sMoreScript.substr(iFunctionStarts, sMoreScript.length - iFunctionStarts);
							var iFunctionEnds = sMoreScript.lastIndexOf(");");
							sMoreScript = sMoreScript.substr(0, iFunctionEnds) + ", true);";
							oFrame.eval(sMoreScript);
						}
						else
						{
							var sSelectScript = oSelectRow.onmousedown.toString();
							var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
							sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
							var iFunctionEnds = sSelectScript.lastIndexOf(");");
							sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
							if( oCombo.ScrollDiv )
							{
								ScrollToElement(oCombo.ScrollDiv, oSelectRow);
							}
							oFrame.eval(sSelectScript);
						}
					}
				}

				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 35:	//End
			case 36:	//Home
				//Allow default functionality without prompting lookup
				oFrame.event.returnValue = true;
				return true;
				break;
			case 38:	//Arrow up
				if( oCombo.ResultsDisplayed )
				{
					//Select the previous item in the list (or the last one displaying)
					var iSelectRow;
					if( oCombo.SelectedRow > 0 )
					{
						iSelectRow = oCombo.SelectedRow - 1;
					}
					else if( oCombo.SelectedRow < 0 && oCombo.ResultsTable && oCombo.ResultsTable.rows.length > 0 )
					{
						iSelectRow = oCombo.ResultsTable.rows.length - 1;
					}
					if( iSelectRow >= 0 )
					{
						var oSelectRow = oCombo.ResultsTable.rows[iSelectRow];
						if( oSelectRow && oSelectRow.onmousedown )
						{
							var sSelectScript = oSelectRow.onmousedown.toString();
							var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
							sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
							var iFunctionEnds = sSelectScript.lastIndexOf(");");
							sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
							if( oCombo.ScrollDiv )
							{
								ScrollToElement(oCombo.ScrollDiv, oSelectRow);
							}
							oFrame.eval(sSelectScript);
						}
					}
				}
				else
				{
					var oDropdownDiv = BaseComboGetResultsDiv(oFrame, oCombo);
					if( IsEmpty(oDropdownDiv.innerHTML) )
					{
						oFrame.setTimeout("AppRoot.BaseComboOnClickSelector(window, '" + oCombo.id + "');", 0);
					}
					else
					{
                        oCombo.Root.BaseComboOpenResults(oCombo, true);
						oDropdownDiv.style.visibility = "visible";
					}
				}

				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			case 40:	//Arrow down
				if( oCombo.ResultsDisplayed )
				{
					//Select the previous item in the list (or the last one displaying)
					var iSelectRow = parseInt(oCombo.SelectedRow) + 1;
					if( iSelectRow < oCombo.ResultsTable.rows.length )
					{
						var oSelectRow = oCombo.ResultsTable.rows[iSelectRow];
						if( oSelectRow.id == (oCombo.id + "_MoreRow") )
						{
							var oMoreButton = oFrame.document.getElementById(oCombo.id + "_MoreBtn");
							oFrame.setTimeout(oMoreButton.onclick, 0);
						}
						else
						{
							if( oSelectRow.onmousedown )
							{
								var sSelectScript = oSelectRow.onmousedown.toString();
								var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
								sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
								var iFunctionEnds = sSelectScript.lastIndexOf(");");
								sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
								if( oCombo.ScrollDiv )
								{
									ScrollToElement(oCombo.ScrollDiv, oSelectRow);
								}
								oFrame.eval(sSelectScript);
							}
						}
					}
				}
				else
				{
					var oDropdownDiv = BaseComboGetResultsDiv(oFrame, oCombo);
					if( IsEmpty(oDropdownDiv.innerHTML) )
					{
						oFrame.setTimeout("AppRoot.BaseComboOnClickSelector(window, '" + oCombo.id + "');", 0);
					}
					else
					{
                        oCombo.Root.BaseComboOpenResults(oCombo, true);
						oDropdownDiv.style.visibility = "visible";
					}
				}

				oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
				break;
			default:
				//Once combo text tracking value does not match that set with the last value or is clear,
				//clear its tracking value and the value (we have to do this on a timeout because
				//the value of the text box has not yet factored in the keystroke,
				//until the event is processed
				oFrame.setTimeout(
					function()
						{
							if( oCombo.value == "" || oCombo.LastValueText != oCombo.value )
							{
								oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = "";
								oCombo.LastValueText = "";
							}
						},
					0);
				if( !IsEmpty(oCombo.FrameInfo.FrameTimeouts[oCombo.id + "__Results"]) )
				{
					//If the user types fast, every several characters narrow the list
					//even though the query string is continuing to change -- we
					//do this by not clearing the timeout (which implicitly happens
					//with SetTimeout) but rather clearing the handle to the timeout
					if( oCombo.KnockCount >= 3 )
					{
						oCombo.FrameInfo.FrameTimeouts[oCombo.id + "__Results"] = null;
						oCombo.KnockCount = 0;
					}
					else
					{
						oCombo.KnockCount += 1;
					}
				}
				oCombo.TrackingNo = oCombo.FrameInfo.SetNextTimeoutTrackingNo();
				oCombo.FrameInfo.SetTimeoutWithoutHandleClear(
					oCombo.id + "__Results", oCombo.GetResults, 300, oFrame, oCombo.TrackingNo);
				oFrame.event.returnValue = true;
				return true;
		}
	}
	else
	{
		oFrame.event.preventDefault ? oFrame.event.preventDefault() : oFrame.event.returnValue = false;
	}
}
function BaseComboComponentOnBlur(oFrame, oCombo)
{
    if( oCombo.value == '' ) oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = '';
    if( oCombo.FrameInfo )
    {
	oCombo.FrameInfo.SetTimeoutWithoutHandleClear(
		oCombo.id,
		function()
			{
				oCombo.HasFocus = false;
				oCombo.Root.BaseComboResetSelector(oFrame, oCombo);
				oCombo.Root.BaseComboImplicitSelect(oFrame, oCombo);

				//Clear any existing attempt to GetResults and reissue immediately and
				//only if necesary
				oCombo.FrameInfo.ResetTimeout(oCombo.id + "__Results", oFrame);
				if( !IsEmpty(oCombo.value) &&
					IsEmpty(oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value) &&
					oCombo.value != oCombo.ResultsQuery )
				{
					oCombo.TrackingNo = oCombo.FrameInfo.SetNextTimeoutTrackingNo();
					oCombo.FrameInfo.SetTimeoutWithoutHandleClear(
						oCombo.id + "__Results", oCombo.GetResults, 0, oFrame, oCombo.TrackingNo);
				}
				else if( !IsEmpty(oCombo.value) )
				{
                    try
                    {
    					oCombo.scrollLeft = 0;
                    }
                    catch(e){} //It's not worth blowing up other
				}
			},
		75,
		oFrame);
}
}
function BaseComboCheckForUpdate(oFrame, oCombo)
{
	if( oCombo.LastText != oCombo.value ||
		oCombo.LastValue != oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value )
	{
		if( oCombo.LastText != oCombo.value ||
			oCombo.LastValue.replace(/\r\n/g,"\n") !=
				oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value.replace(/\r\n/g,"\n") )
		{
            if( oCombo.value == '' ) oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = '';

			//Check for on select script / function
            var sOnSelectScript = oCombo.getAttribute("ClientOnSelectFunction");
			if( !IsEmpty(sOnSelectScript) )
			{
				var oOnSelectScript;
				try
				{
					oOnSelectScript = oFrame.eval(sOnSelectScript);
				}
				catch(e)
				{
					oOnSelectScript = eval("oFrame." + sOnSelectScript);
				}

				if( sOnSelectScript.indexOf("(") < 0 ) //Test used to be  typeof(oOnSelectScript) == "function"
				{
					oOnSelectScript.call(oCombo, oCombo.value, oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value);
				}
			}

			oCombo.LastText = oCombo.value;
			oCombo.LastValue = oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value;
			if( oCombo.PostBack )
			{
				oFrame.setTimeout(oCombo.PostBack, 0);
			}
		}
	}
}
function BaseComboComponentOnFocus(oFrame, oCombo)
{
	oCombo.HasFocus = true;
	BaseComboResetOnBlurTimeout(oFrame, oCombo);
	oFrame.setTimeout(function(){ oCombo.Root.BaseComboRecoverFocus(oFrame, oCombo); }, 25);
}
function BaseComboResetOnBlurTimeout(oFrame, oCombo)
{
	oCombo.FrameInfo.ResetTimeoutOnceReady(oCombo.id, oFrame);
}
function BaseComboOnSelect(oFrame, sComboID, sValue, sText, iRow, bResetSelector)
{
	//Make sure control itself is enabled, and if so...
	var oCombo = oFrame.document.getElementById(sComboID);
	oCombo.Root.BaseComboHighlightCurrentResult(oFrame, oCombo, iRow);
	oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = sValue;
	oCombo.LastValueText = sText;
	oCombo.value = sText;
	if( arguments.length < 6 || bResetSelector )
	{
		oCombo.Root.BaseComboResetSelector(oFrame, oCombo);
		oCombo.focus();
		BaseComboCheckForUpdate(oFrame, oCombo);
	}
}
function BaseComboOnValueEntry(oFrame, sComboID, sValue, sText, iRow, bResetSelector)
{
	//Make sure control itself is enabled, and if so...
	var oCombo = oFrame.document.getElementById(sComboID);
	var bValueSet = false;
	if( sValue.replace(/^\s*/, "").replace(/\s*$/, "").toUpperCase() ==
			oCombo.value.replace(/^\s*/, "").replace(/\s*$/, "").toUpperCase() )
	{
		oCombo.Root.BaseComboHighlightCurrentResult(oFrame, oCombo, iRow);
		oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value = sValue;
		oCombo.LastValueText = sText;
		oCombo.value = sText;
		var bValueSet = true;
		if( arguments.length < 6 || bResetSelector )
		{
			oCombo.Root.BaseComboResetSelector(oFrame, oCombo);
			oCombo.focus();
			BaseComboCheckForUpdate(oFrame, oCombo);
		}
	}
	return bValueSet;
}
function BaseComboImplicitSelect(oFrame, oCombo, bExactValueMatchOnly)
{
	if( arguments.length < 3 )
	{
		bExactValueMatchOnly = true;
	}

	//We try to do an implicit select (on tab / after leaving control altogether and
	//thereafter if new results come in, if there is text but value is not set
	if( !IsEmpty(oCombo.value) &&
	    IsEmpty(oCombo.Root.BaseComboGetHiddenValue(oFrame, oCombo).value) )
	{
		if( IsEmpty(oCombo.ResultsQuery) || oCombo.value == oCombo.ResultsQuery )
		{
			//We can set the value if there is only a single result row
			if( oCombo.ResultsTable && oCombo.ResultsTable.rows.length > 0 &&
				(oCombo.ResultsTable.rows.length == 1 || bExactValueMatchOnly) )
			{
				for( var iRow = 0; iRow < oCombo.ResultsTable.rows.length; iRow++ )
				{
					var oSelectRow = oCombo.ResultsTable.rows[iRow];
					if( oSelectRow.onmousedown )
					{
						var sSelectScript = oSelectRow.onmousedown.toString();
						var iFunctionStarts = sSelectScript.indexOf("AppRoot.BaseComboOnSelect");
						sSelectScript = sSelectScript.substr(iFunctionStarts, sSelectScript.length - iFunctionStarts);
						var iFunctionEnds = sSelectScript.lastIndexOf(");");
						sSelectScript = sSelectScript.substr(0, iFunctionEnds) + ", false);";
						if( bExactValueMatchOnly )
						{
							sSelectScript = sSelectScript.replace(/BaseComboOnSelect/, "BaseComboOnValueEntry");
						}
						var bReturned = oFrame.eval(sSelectScript);
						if( !bExactValueMatchOnly || bReturned )
						{
							break;
						}
					}
				}
			}
		}
	}
	BaseComboCheckForUpdate(oFrame, oCombo);
}

//Minimally scrolls so as to make visible a child element
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

function RetryClick(oFrame, oControl, iRetryCount)
{
    if( !EndWait.WaitFrame )
    {
	    if( oControl.tagName.toUpperCase() == 'BUTTON' )
        {
            EndWait.StartTime = new Date();
            EndWait.MinTime = 750;
            StartWait(oFrame.AppTopFrame, '** Busy Processing -- Please Wait and Try Again **', 0, '', true, 750);
        }
	    else
        {
            StartWait(oFrame.AppTopFrame, 'Processing -- Please Wait', 0, '', true, 0,
                function()
                {
				    if( IsPageAvailable(oFrame) )
				    {
					    if( oControl.onclick ) void oControl.onclick() && oControl.click();
					    else oControl.click();
				    }
                });
        }
    }
}

//Returns the current frame position (left, top) of the given control,
//terminating on a multipage by dft (absolute positioning seems to
//be relative to a multipage, despite the meaning of absolute)
function GetPosition(oControl, bRelativeToContainingTag, bRelativeToTopFrame, oControlFrame)
{
	//By default get position relative to the multipage in which a
	//control resides (if any)
	if( arguments.length < 2 )
	{
		bRelativeToContainingTag = true;
        bRelativeToTopFrame = false;
	}
	else if( arguments.length < 3 )
	{
        bRelativeToTopFrame = false;
	}
	else if( bRelativeToTopFrame )
	{
        bRelativeToContainingTag = false;
	}

	var oOffsetControl = oControl;
	var iLeft = oOffsetControl.offsetLeft - (bRelativeToContainingTag ? 0 : oOffsetControl.scrollLeft);
	var iTop = oOffsetControl.offsetTop - (bRelativeToContainingTag ? 0 : oOffsetControl.scrollTop);
	var bContainingTableFound = false;
	while( oOffsetControl = oOffsetControl.offsetParent )
	{
		var sTagName = oOffsetControl.tagName.toLowerCase();
		if( bRelativeToContainingTag )
		{
			if( sTagName == "multipage" ||
				oOffsetControl.style.position.toLowerCase() == 'relative' ||
				oOffsetControl.style.position.toLowerCase() == 'absolute' ||
				oOffsetControl.style.top != '' ||
				oOffsetControl.style.left != '' ||
				oOffsetControl.style.overflow == "scroll" ||
				oOffsetControl.style.overflow == "auto" ||
				(oOffsetControl.style.overflow == "" &&
				(!AppRoot.IsIE || AppRoot.IsHTML5 ||
				 (oOffsetControl.currentStyle.overflow == "scroll" ||
				  oOffsetControl.currentStyle.overflow == "auto"))) ||
				IsEmpty(oOffsetControl.offsetParent) )
			{
				break;
			}
		}
		iLeft += oOffsetControl.offsetLeft - (bRelativeToContainingTag ? 0 : oOffsetControl.scrollLeft);
		iTop += oOffsetControl.offsetTop - (bRelativeToContainingTag ? 0 : oOffsetControl.scrollTop);
		if( bContainingTableFound && oOffsetControl && AppRoot.IsIE && !AppRoot.IsHTML5 )
		{
			if( oOffsetControl.currentStyle.borderLeftStyle.toLowerCase() != "none" )
			{
				switch(oOffsetControl.currentStyle.borderLeftWidth.toLowerCase())
				{
					case "thin":
						iLeft += 1;
						break;
					case "medium":
						iLeft += 2;
						break;
					case "thick":
						iLeft += 4;
						break;
					default:
						iLeft += parseInt(oOffsetControl.currentStyle.borderLeftWidth);
						break;
				}
			}
			if( oOffsetControl.currentStyle.borderTopStyle.toLowerCase() != "none" )
			{
				switch(oOffsetControl.currentStyle.borderTopWidth.toLowerCase())
				{
					case "thin":
						iTop += 1;
						break;
					case "medium":
						iTop += 2;
						break;
					case "thick":
						iTop += 4;
						break;
					default:
						iTop += parseInt(oOffsetControl.currentStyle.borderTopWidth);
						break;
				}
			}
		}
		if( sTagName == "table" )
		{
			bContainingTableFound = true;
		}
	}

    //Get relative position inside frames
    if( bRelativeToTopFrame )
    {
        if( oControlFrame && oControlFrame != oControlFrame.top && (!oControlFrame.AppTopFrame || oControlFrame != oControlFrame.AppTopFrame) && oControlFrame.parent )
        {
            var oIframe = oControlFrame.frameElement;
            if( oIframe && oIframe.tagName.toUpperCase() == "IFRAME" )
            {
                var oFramePosition = GetPosition(oIframe, false, true, oControlFrame.parent);
	            iLeft += oFramePosition[0];
	            iTop += oFramePosition[1];
            }
        }
    }
	return [iLeft, iTop];
}
function AddPositionOffset(oPosition, oOffset)
{
	return [oPosition[0] + oOffset[0], oPosition[1] + oOffset[1]];
}

function GetScrollOffset(oFrame, oControl)
{
	var oOffsetControl = oControl;
	var iTop = 0;
	while( oOffsetControl = oOffsetControl.offsetParent )
	{
		iTop = oOffsetControl.scrollTop;
		if( oOffsetControl.scrollTop &&
			oOffsetControl.tagName != "BODY" &&
		    oOffsetControl.scrollTop > 0 )
		{
			iTop = oOffsetControl.scrollTop;
			break;
		}
	}
	return iTop;
}

//Strings an objects properties together in a delimited list
function GetPropertyValueList(oObject, sListDelimiter, sItemDelimiter)
{
	if( arguments.length < 3 )
	{
		sItemDelimiter = "=";
		if( arguments.length < 2 )
		{
			sListDelimiter = "&";
		}
	}

	var sPropertyValueList = "";
	for( var sProperty in oObject )
	{
		if( !IsEmpty(oObject[sProperty]) )
		{
			if( !IsEmpty(sPropertyValueList) )
			{
				sPropertyValueList += sListDelimiter;
			}
			sPropertyValueList += sProperty + sItemDelimiter + IfEmpty(oObject[sProperty], "");
		}
	}
	return sPropertyValueList;
}

//Gets the control base name (stripping anything like :ulb...)
function GetControlBaseName(oControl)
{
	var sBaseName = oControl.name;
	var iIndex = sBaseName.indexOf(":");
	if( iIndex > 0)
	{
		sBaseName = sBaseName.substring(0,iIndex);
	}
	return sBaseName;
}

function GetImportedCssStyle(oFrame, sURLMatch, sSelector)
{
    //Loop through style sheets
    var oStyleSheet;
    var oStyle;
    for( var iSheet in oFrame.document.styleSheets )
    {
        if( oFrame.document.styleSheets[iSheet].href && oFrame.document.styleSheets[iSheet].href.toUpperCase().indexOf(sURLMatch.toUpperCase()) >= 0 )
        {
            oStyleSheet = oFrame.document.styleSheets[iSheet];
            break;
        }
    }
    if( oStyleSheet )
    {
        for( var iRule in oStyleSheet.rules )
        {
            if( oStyleSheet.rules[iRule].selectorText == sSelector )
            {
                oStyle = oStyleSheet.rules[iRule].style;
                break;
            }
        }
    }
    return (oStyle ? oStyle : new Object());
}

//Resizers a browser to accomodate a particular min size
function SetMinBrowserSize(oFrame, iWidth, iHeight, bOpensToMinSize)
{
	var iWidthChange = iWidth - GetFrameWidth(oFrame.top);
	var iHeightChange = iHeight - GetFrameHeight(oFrame.top);
	if( arguments.length < 4 || !bOpensToMinSize )
    {
        iWidthChange = Math.max(0, iWidthChange);
	    iHeightChange = Math.max(0, iHeightChange);
    }
    if( iWidthChange != 0 || iHeightChange != 0 )
	{
		try
		{
		    oFrame.parent.resizeBy(iWidthChange, iHeightChange);
		}
		catch(e)
		{
			 //Sometimes frame not ready so we try again after a short delay
			 //but if it fails again it's not really a big deal -- maybe user is
			 //actively sizing or moving the browser
			oFrame.setTimeout(
				function()
					{
						try
						{
							oFrame.parent.resizeBy(iWidthChange, iHeightChange);
						}
						catch(e){}
					}, 500);
		}
	}
}

function GetFrameWidth(oFrame)
{
    var iWidth = oFrame.document.documentElement.clientWidth;
    if( iWidth == 0 && oFrame.document.body )
    {
        iWidth = oFrame.document.body.clientWidth;
    }
    return iWidth;
}

function GetFrameHeight(oFrame)
{
    var iHeight = oFrame.document.documentElement.clientHeight;
    if( iHeight == 0 && oFrame.document.body )
    {
        iHeight = oFrame.document.body.clientHeight;
    }
    return iHeight;
}

//If necessary, localize MTrE to the current page
function InitMTrEFrameSettings(oFrame)
{
	if( !oFrame.AppFrameId )
	{
		oFrame.AppRoot = oFrame;
		oFrame.AppFrameId = AppCurrentFrames.AddBaseASPX(window, "", "");
        oFrame.AppFrameValues = new Object();
        oFrame.AppPageReady = true;
	}
}

//Common on focus routine
function DoFocus()
{
    PropagateChangesIfNeeded();  //Delay to allow any explicit actions to run
}

function PropagateChangesIfNeeded()
{
    //Will not run if another action in progress -- which is fine because it will cause the refresh
    var sChanges = document.cookie.split("__RequestPropogation=");
    if( sChanges.length > 1 )
    {
        sChanges = sChanges[1].split(";")[0];
        if( sChanges )
        {
            AppRoot.AppMainFrame.focus();
            setTimeout(function(){ DoAction(AppRoot.AppMainFrame, 'OnRefresh?TablesChanged=' + sChanges); }, 50);
        }
    }
}

function RequestInfo(sHTTPMethod, sHTTPHeaderRequestDataContentType, sResponseTypeTextOrXMLOrJSON)
{
    this.HTTPMethod = sHTTPMethod;
    this.HTTPHeaderRequestDataContentType = sHTTPHeaderRequestDataContentType;
    this.ResponseType = sResponseTypeTextOrXMLOrJSON;
}

function GetAJAXResult(sAssembly, sClass, sMethod, sURLArguments, oRequestData, oRequestInfo, oCallback) //Args after method optional
{
	var oHTTPRequest = GetNewHttpRequest();
    var sHTTPMethod = (arguments.length > 6 && oCallback) ? 'POST' : 'GET';
    var sHTTPHeaderRequestDataContentType = (arguments.length > 4 && oRequestData) ? 'text/xml' : null;
    var sResponseType = "TEXT";

    if( arguments.length > 5 && oRequestInfo )
    {
        if( oRequestInfo.HTTPMethod ) sHTTPMethod = oRequestInfo.HTTPMethod;
        if( oRequestInfo.HTTPHeaderRequestDataContentType ) sHTTPHeaderRequestDataContentType = oRequestInfo.HTTPHeaderRequestDataContentType;
        if( oRequestInfo.ResponseType ) sResponseType = (oRequestInfo.ResponseType === true ) ? "XML" : oRequestInfo.ResponseType.toUpperCase();
    }

	var sCall = 'AJAXServer.aspx?InvokeAssembly=' + sAssembly + '&InvokeClass=' + sClass + '&InvokeMethod=' + sMethod;
	if( arguments.length > 3 && sURLArguments ) sCall += "&" + sURLArguments;

	var oCallData = (arguments.length > 4 && oRequestData) ? oRequestData : null;
    if( arguments.length > 6 && oCallback )
	{
		oHTTPRequest.open(sHTTPMethod, sCall, true);
        if( sHTTPHeaderRequestDataContentType ) oHTTPRequest.setRequestHeader("Content-Type", sHTTPHeaderRequestDataContentType);
		oHTTPRequest.send(oCallData);
		oHTTPRequest.onreadystatechange =
			function()
				{
					if( oHTTPRequest.readyState == 4 && oHTTPRequest.status == 200 )
					{
                        PropagateChangesIfNeeded();
		                switch(sResponseType)
		                {
			                case "XML": oCallback(oHTTPRequest.responseXML); break;
			                case "JSON":
                                var sJSON = oHTTPRequest.responseText;
                                var oJSON = null;
                                if( sJSON ) eval('oJSON = ' + sJSON + ';');
                                oCallback(oJSON);
                                break;
			                default: oCallback(oHTTPRequest.responseText);
		                }
					}
				};
	}
	else
	{
		oHTTPRequest.open(sHTTPMethod, sCall, false);
        if( sHTTPHeaderRequestDataContentType ) oHTTPRequest.setRequestHeader("Content-Type", sHTTPHeaderRequestDataContentType);
        oHTTPRequest.send(oCallData);
        PropagateChangesIfNeeded();
		switch(sResponseType)
		{
			case "XML": return oHTTPRequest.responseXML; break;
			case "JSON":
                var sJSON = oHTTPRequest.responseText;
                var oJSON = null;
                if( sJSON ) eval('oJSON = ' + sJSON + ';');
                return oJSON;
                break;
			default: return oHTTPRequest.responseText;
		}
	}
}

function CallAJAX(sAssembly, sClass, sMethod, sURLArguments, oRequestData, sHTTPHeaderRequestDataContentType) //Args after method optional
{
    var oRequestInfo = new RequestInfo("", sHTTPHeaderRequestDataContentType, "");
    GetAJAXResult(sAssembly, sClass, sMethod, sURLArguments, oRequestData, oRequestInfo, function(){});
}

function GetJSON(sAssembly, sClass, sMethod, sURLArguments, oRequestData, sHTTPHeaderRequestDataContentType) //Args after method optional
{
    var oRequestInfo = new RequestInfo("", sHTTPHeaderRequestDataContentType, "JSON");
    return GetAJAXResult(sAssembly, sClass, sMethod, sURLArguments, oRequestData, oRequestInfo);
}

// Support for synchronous out-of-band posting of data
function GetAJAXResultsWithFormInputs(oFrame, sAssembly, sClass, sMethod, sURLArguments, sResponseTypeTextOrXMLOrJSON)
{
    var oRequestInfo = new RequestInfo("POST", "application/x-www-form-urlencoded", sResponseTypeTextOrXMLOrJSON);
    return GetAJAXResult(sAssembly, sClass, sMethod, sURLArguments, PackagePageInputsForSubmission(oFrame), oRequestInfo);
}

function PackagePageInputsForSubmission(oFrame)
{
    var sPageKeyValueExpressions = '';
    var oProcessedControlIDs = new Object();  //PDF forms may have redundant controls (each having same value) but we don't want to include multiple times so they have to be tracked
    var oSetKeyValue =
        function(oControl, sValue)
        {
            if( sValue )
            {
                var sControlID = IfEmpty(oControl.name, oControl.id);
                if( !oProcessedControlIDs[sControlID] )
                {
                    sPageKeyValueExpressions += encodeURIComponent(sControlID) + "=" + encodeURIComponent(sValue) + "&";
                    oProcessedControlIDs[sControlID] = true;
                }
            }
        }

    var oInputs = oFrame.document.getElementsByTagName('input');
    for( var iItem = 0; iItem < oInputs.length; iItem++ )
    {
        if( oInputs[iItem].type == 'checkbox' ) oSetKeyValue(oInputs[iItem], oInputs[iItem].checked);
        else oSetKeyValue(oInputs[iItem], oInputs[iItem].value);
    }

    var oTextAreas = oFrame.document.getElementsByTagName('textarea');
    for (var iItem = 0; iItem < oTextAreas.length; iItem++) oSetKeyValue(oTextAreas[iItem], oTextAreas[iItem].value);

    return sPageKeyValueExpressions;
}

function ReportFrame(oFrame, sXMLTagName, oXML) //As xml
{
	var oXML;
	if( oFrame )
	{
		try
		{
			//Get frame text
			var sFrameText= oFrame.document.body.parentElement.outerHTML;

			//Creat xml doc as necessary
			if( arguments.length < 3 || !oXML )
			{
				oXML = CreateXMLDocument('<info></info>');
			}

			//Stuff text into xml
			oXML.documentElement.appendChild(
				oXML.createElement(sXMLTagName)).appendChild(
					oXML.createTextNode(sFrameText));
		}
		catch(e){}
	}
	return oXML;
}

function CreateXMLDocument(sXML)
{
	var oXML;
	if( !AppRoot.IsIE || AppRoot.IsHTML5 || window.DOMParser ) //IE8 and above has this method
	{
		var oXMLParser = new DOMParser();
		oXML = oXMLParser.parseFromString(sXML,"text/xml");
	}
	else
	{
		oXML = new ActiveXObject("MSXML2.DOMDocument");
		oXML.loadXML(sXML);
	}
	return oXML;
}

function GetComputedStyle(oFrame, oControl)
{
    if( oFrame.getComputedStyle )
    {
        return oFrame.getComputedStyle(oControl, null);
    }
    else
    {
        return (oControl.currentStyle ? oControl.currentStyle : oControl.style);
    }
}

function EndWait()
{
    var iMinTimeRemaining = (EndWait.MinTime ? (new Date().getTime() - EndWait.StartTime.getTime()): 0);
    if( iMinTimeRemaining > 0 )
    {
        EndWait.MinTime = null;
        EndWait.StartTime = null;
        setTimeout(EndWait, iMinTimeRemaining);
    }
    else
    {
        var oWaitContents = EndWait.WaitContents;
        if( oWaitContents ) try{ oWaitContents.style.display = 'none'; } catch(e){}
        EndWait.WaitContents = null;

        var oWaitUpdateTimer = EndWait.WaitUpdateTimer;
        var oWaitFrame = EndWait.WaitFrame;
        if( oWaitUpdateTimer && oWaitFrame ) try{ oWaitFrame.clearTimeout(oWaitUpdateTimer); } catch(e){}
        EndWait.WaitUpdateTimer = null;
        EndWait.WaitFrame = null;

        EndWait.RefreshRate = null;
        EndWait.RefreshInfo = null;
        EndWait.MinTime = null;
        EndWait.StartTime = null;
        if( EndWait.OnEndWait )
        {
            var oOnEndWait = EndWait.OnEndWait;
            EndWait.OnEndWait = null;
            try{ oOnEndWait(); } catch(e){}
        }
    }
}
function UpdateWaitInfo()
{
    if( EndWait.WaitFrame && EndWait.RefreshRate > 0 && EndWait.RefreshInfo )
    {
        try
        {
            var oWaitFrame = EndWait.WaitFrame;
            var sRefreshInfo = EndWait.RefreshInfo;
            var iRefreshRate = EndWait.RefreshRate;
            if( EndWait.WaitUpdateTimer && oWaitFrame ) try{ oWaitFrame.clearTimeout(EndWait.WaitUpdateTimer); } catch(e){}
            EndWait.WaitUpdateTimer = null;
            var oWaitUpdateTimer;
            function UpdateWait(sUpdatedWaitMessage)
            {
                if( oWaitFrame == EndWait.WaitFrame &&
                    sRefreshInfo == EndWait.RefreshInfo &&
                    iRefreshRate == EndWait.RefreshRate &&
                    EndWait.WaitUpdateTimer == oWaitUpdateTimer )
                {
                    oWaitFrame.setTimeout(function(){ StartWait(oWaitFrame, sUpdatedWaitMessage, iRefreshRate, sRefreshInfo, true); }, 0);
                }
            }
            oWaitUpdateTimer = oWaitFrame.setTimeout(function(){ GetAJAXResult("MTrE", "BaseLink", "GetCurrentWaitText", sRefreshInfo, null, false, UpdateWait); }, iRefreshRate);
            EndWait.WaitUpdateTimer = oWaitUpdateTimer;
        }
        catch(e){}
    }
}
function StartWait(oFrame, sWaitHTMLText, iRefreshRate, sRefreshInfo, bIsContinue, iMinimumDisplayTime, oOnEndWait)
{
    //ie7 timing fix (true classic context -- while page loads)
    if( arguments.length < 5 && AppRoot.IsIE && !AppRoot.IsHTML5 && AppRoot.BrowserVsn < 8 && !AppRoot.CompatibilityMode )
    {
        oFrame.setTimeout(function(){ StartWait(oFrame, sWaitHTMLText, iRefreshRate, sRefreshInfo, false, iMinimumDisplayTime, oOnEndWait); }, 0);
        return;
    }

	//Do the work only if the ghost frame is ready
    if (arguments.length < 5) bIsContinue = false;

    if( AppGhostFrameReady || bIsContinue )
	{
        //End any current wait -- could be on a different frame
        if( !bIsContinue ) EndWait();

        //Default text if necessary
        if( arguments.length < 2 || !sWaitHTMLText ) sWaitHTMLText = "Processing..."

 		//See if overlay already available and open
        var oWaitContents = oFrame.document.getElementById('__WaitContents');
        if (oWaitContents)
        {
		    if( !bIsContinue ) oWaitContents.style.visibility = 'hidden';
		    oWaitContents.style.display = '';
        }
        else
		{
            var sWaitHTML = '<span id="__WaitContents" class="Wait" style="position:absolute; visibility:hidden">' + sWaitHTMLText + '</span>';
			oFrame.document.body.insertAdjacentHTML('BeforeEnd', sWaitHTML);
            oWaitContents = oFrame.document.getElementById('__WaitContents');
        }
        oWaitContents.innerHTML = sWaitHTMLText;
        oWaitContents.style.top = (Math.max(GetFrameHeight(oFrame) - oWaitContents.offsetHeight,0)/2).toString() + 'px';
        oWaitContents.style.left = (Math.max(GetFrameWidth(oFrame) - oWaitContents.offsetWidth, 0)/2).toString() + 'px';
        oWaitContents.style.zIndex = (iOverlayZIndexOffset++).toString();
		oWaitContents.style.visibility = 'visible';
        EndWait.WaitContents = oWaitContents;
        EndWait.WaitUpdateTimer = null;
        EndWait.WaitFrame = oFrame;
        EndWait.RefreshRate = (arguments.length > 2 ? iRefreshRate : null);
        EndWait.RefreshInfo = (arguments.length > 3 ? sRefreshInfo : null);
        EndWait.MinTime = ((arguments.length > 5 && iMinimumDisplayTime > 0) ? iMinimumDisplayTime : null);
        EndWait.StartTime = ((arguments.length > 5 && iMinimumDisplayTime > 0) ? new Date() : null);
        EndWait.OnEndWait = ((arguments.length > 6 && oOnEndWait) ? oOnEndWait : null);
        UpdateWaitInfo();
	}
}

var IsEPrint = false;
function PopupEPrint(sFileName)
{
    if( sFileName ) StartWait(AppRoot.AppMainFrame, 'Loading Print File ' + sFileName);
    AppRoot.setTimeout(
        function()
        {
            OpenFramePopup(AppRoot.AppMainFrame, 'PopupEPrint.aspx', '', 'UpdateGrid?', 900, 420,
                'overlay=true,opacity=45,border=2,title=true,toolbar=yes,resizable=yes,centered=yes');
        }, 50);
}

function QueryEPrint(oFileInfoInput, oFileContentInput)
{
    try
    {
        //Sets up everything
        AppRoot.document.PrintToWebApp1.CalculateWatchFolderChanges();

        oFileInfoInput.value = AppRoot.document.PrintToWebApp1.GetWatchFolderChanges();

        var sChunk, sChunks = [];
        while( sChunk = AppRoot.document.PrintToWebApp1.GetWatchFolderContentChunk() ) sChunks.push(sChunk);
        oFileContentInput.value = sChunks.join("");
    }
    catch(e){ alert('Unable to upload print files.'); }
}

function LoadScript(oFrame, sScriptURL, oFunctionToTestOn)
{
    if( !oFunctionToTestOn )
    {
        var oScript= oFrame.document.createElement('SCRIPT');
        oScript.type= 'text/javascript';
        oScript.src= sScriptURL;
        oFrame.document.getElementsByTagName('HEAD')[0].appendChild(oScript);
    }
}

function RemovePromptText(oTextBox)
{
    if (oTextBox.value == oTextBox.title)
    {
        oTextBox.value = "";
        oTextBox.style.color = "#000000";
        oTextBox.style.fontStyle = "normal";
    }
}
function SetPromptText(oTextBox)
{
    if (oTextBox.value == "")
    {
        oTextBox.value = oTextBox.title;
        oTextBox.style.color = "#888888";
        oTextBox.style.fontStyle = "italic";
    }
}

function ShowActiveElement(oFrame)
{
    DoAction(oFrame, "DisplayActiveElementInfo?InputID=" + oFrame.document.activeElement.id);
}
