function BaseMenuMouseUp()
{
    //Clear any time that might be about to close the menu when opening a child menu
    if( this.RootMenu.CloseMenuTimer && this.ChildMenu && (!AppRoot.IsFireFox || !this.RootMenu.IsInProgress) )
    {
        clearTimeout(this.RootMenu.CloseMenuTimer);
        this.RootMenu.CloseMenuTimer = null;
        this.RootMenu.MenuFocus.focus();
    }
    if( AppRoot.IsFireFox )
    {
        this.RootMenu.SetInProgress(true);
        setTimeout(this.RootMenu.SetInProgress,0);
    }
    else
    {
        window.event.cancelBubble = true;
    }
}
function BaseMenuOver()
{
    this.setAttribute("IsMenuItemSelected", "Y");
    if( this.RootMenu.IE7ActiveColor ) this.style.backgroundColor = this.RootMenu.IE7ActiveColor;
    if( !this.RootMenu.IsInProgress )
    {
        var oMenuToBeOpen = (this.ChildMenu ? this.ChildMenu : this.PulldownContainer);
        var oCurrentMenuOpen = this.RootMenu.OpenMenu;
        if( oMenuToBeOpen != oCurrentMenuOpen && (oMenuToBeOpen != this.RootMenu || oCurrentMenuOpen ) )
        {
            //Mark as on the path for the menu to be open, both the menu to be open and all parent menus
            var oMenuToBeOpenPath = oMenuToBeOpen;
            while( oMenuToBeOpenPath && oMenuToBeOpenPath != this.RootMenu )
            {
                oMenuToBeOpenPath.MenuToBeOpenPath = oMenuToBeOpen;
                oMenuToBeOpenPath = oMenuToBeOpenPath.ParentPulldown.PulldownContainer;
            }

            //Close from the outside any any open menus not currently on the menu to be open path
            while( oCurrentMenuOpen && oCurrentMenuOpen != this.RootMenu )
            {
                if( !oCurrentMenuOpen.MenuToBeOpenPath || oCurrentMenuOpen.MenuToBeOpenPath != oMenuToBeOpen )
                {
                    oCurrentMenuOpen.style.display = 'none';
                    if( oCurrentMenuOpen == this.RootMenu.OpenMenu )
                    {
                        this.RootMenu.OpenMenu = oCurrentMenuOpen.ParentPulldown.PulldownContainer;
                    }
                    oCurrentMenuOpen = oCurrentMenuOpen.ParentPulldown.PulldownContainer;
                }
                else
                {
                    oCurrentMenuOpen = null;
                }
            }

            //Cause any child menu to display and note it as current
            if( this.ChildMenu )
            {
                if( this.ChildMenu.className == "MenuTableSubRight" && AppRoot.IsFireFox )
                {
                    this.ChildMenu.style.top = this.offsetTop + this.offsetParent.offsetTop - 3 + 'px';
                }
                this.ChildMenu.style.display = '';
                this.RootMenu.OpenMenu = this.ChildMenu;
                this.RootMenu.MenuFocus.focus();
            }
        }
    }
    this.RootMenu.SetInProgress(true);
    setTimeout(this.RootMenu.SetInProgress,0);
}
function BaseMenuOut()
{
    this.setAttribute("IsMenuItemSelected", "N");
    if( this.RootMenu.IE7ActiveColor ) this.style.backgroundColor = '';
}
function BaseMenuClick()
{
    if( this.LinkInfo )
    {
        if( this.PreliminaryAssembly && this.PreliminaryClass && this.PreliminaryMethod )
        {
            var sResumeScript;
            if( this.LinkInfo.indexOf("javascript:") == 0 )
            {
                sResumeScript = this.LinkInfo.substring(11).replace(/'/g, "\\'");
            }
            else
            {
                sResumeScript = (this.LinkTarget ? this.LinkTarget : 'window') + 
                    '.location.replace("' + this.LinkInfo.replace(/'/g, "\\'") + '")';
            }
            sResumeScript = 'oFrame.setTimeout(\'' + sResumeScript + '\', 0);';
            AppRoot.DoAction(window, 'ActionPrelim?ActionMethodControl=' + this.RootMenu.id +
                '&PreliminaryAssembly=' + this.PreliminaryAssembly + 
                '&PreliminaryClass=' + this.PreliminaryClass + 
                '&PreliminaryMethod=' + this.PreliminaryMethod + 
                '&PendingScript=' + encodeURIComponent(sResumeScript));
        }
        else
        {
            if( this.LinkInfo.indexOf("javascript:") == 0 )
            {
                if( AppRoot.IsIE && !AppRoot.IsHTML5 && AppRoot.BrowserVsn < 7 )
                {
                    window.setTimeout(this.LinkInfo.substring(11), 0);
                }
                else
                {
                    eval(this.LinkInfo.substring(11));
                }
            }
            else
            {
                var oLinkFrame;
                if( this.LinkTarget )
                {
                    oLinkFrame = eval(this.LinkTarget);
                }
                else
                {
                    oLinkFrame = window;
                }
                oLinkFrame.location.replace(this.LinkInfo);
            }
        }
    }
    else this.onmouseover();     //supports touch which does not fire mouseover
}
function BaseMenuInitialize(oMenu, oParentPulldown, oControl, oPulldownContainer)
{
    //If ie7 have to hardcode some styling but want to at least look it up in the css
    if( !oMenu.IE7ActiveColor && AppRoot.IsIE && !AppRoot.IsHTML5 )
    {
        oMenu.IE7ActiveColor = AppRoot.GetImportedCssStyle(window, "BaseMenu.css", "[IsMenuItemSelected='Y'].MenuItemSelected").backgroundColor;
    }

    //Setup mouse events
	if( oControl.className && (' ' + oControl.className + ' ').indexOf(' MenuItemSelected ') >= 0 )
	{
        oControl.onmouseover = BaseMenuOver;
        oControl.onmouseout = BaseMenuOut;
        oControl.onmouseup = BaseMenuMouseUp;
        if( oControl.onmousedown )
        {
            var oControlMouseDown = oControl.onmousedown;
            oControl.onmousedown = function(){ oControl.onmouseover(); oControlMouseDown(); };
        }
        else 
        {
            oControl.onmousedown = BaseMenuClick;
        }
        oParentPulldown = oControl;
        oParentPulldown.PulldownContainer = oPulldownContainer;
        oParentPulldown.RootMenu = oMenu;
	}
    else if( oParentPulldown && oControl.tagName && oControl.tagName.toUpperCase() == "TABLE" )
    {
        oControl.ParentPulldown = oParentPulldown;
        oParentPulldown.ChildMenu = oControl;
        oPulldownContainer = oControl;
    }
    else if( oParentPulldown && oControl.tagName && oControl.tagName.toUpperCase() == "A" && oControl.href )
    {
        oParentPulldown.LinkInfo = oControl.href;
        if( AppRoot.IsIpad || AppRoot.IsSafari || AppRoot.IsHTML5 )
        {
            oParentPulldown.LinkInfo = oParentPulldown.LinkInfo.replace(/\%20/g, ' ');
        }
        oParentPulldown.LinkTarget = oControl.target;
        if( oControl.parentElement.getAttribute('PreliminaryMethod') )
        {
            oParentPulldown.PreliminaryAssembly = oControl.parentElement.getAttribute('PreliminaryAssembly');
            oParentPulldown.PreliminaryClass = oControl.parentElement.getAttribute('PreliminaryClass');
            oParentPulldown.PreliminaryMethod = oControl.parentElement.getAttribute('PreliminaryMethod');
        }
        oControl.removeAttribute("href");
    }
 
    var oDescendentControls = oControl.children;
	for( var iControl = 0; iControl < oDescendentControls.length; iControl++ )
	{
		BaseMenuInitialize(oMenu, oParentPulldown, oDescendentControls[iControl], oPulldownContainer);
	}

    if( !oMenu.SetInProgress )
    {
        oMenu.SetInProgress = 
            function(bFlag)
            {
                oMenu.IsInProgress = (arguments.length < 1 ? false : bFlag);
            }
    }
}
function BaseMenuOpen(oMenu)
{
    var bNeedsInitialization = false;
    if( !oMenu.MenuFocus )
    {
        oMenu.MenuOpen = document.getElementById(oMenu.id + "__open");
        oMenu.MenuContents = document.getElementById(oMenu.id + "__table");
        oMenu.MenuFocus = document.getElementById(oMenu.id + "__focus");
        oMenu.MenuCharacteristics = oMenu.Characteristics;
        bNeedsInitialization = true;
    }

    if( oMenu.Characteristics )
    {
       	//Construct URL type string for the characteristics to fetch query via AJAX (as necessary):
        //start with versioning terms -- caching is on the combined URL
        var sCharacteristics = "Version=" + AppRoot.AppVersion + "&UserID=" + AppRoot.AppUserId + "&UsrVsn=" + AppRoot.AppUserVersion;
        for( var sCharacteristicKey in oMenu.Characteristics )
        {
            sCharacteristics += "&" + sCharacteristicKey + "=" + oMenu.Characteristics[sCharacteristicKey];
        }
        if( oMenu.LastContentTerms != sCharacteristics )
        {
            sReplacementContents = 
                "<table id=\"" + oMenu.id + "__table\" class=\"MenuTable\" style=\"position:absolute;top:0px;left:0px;display:none\">" +
                AppRoot.GetAJAXResult("MTrE", "BaseMenu", "GetAJAXMenuHTML", sCharacteristics);
            oMenu.MenuContents.outerHTML = sReplacementContents;
            oMenu.MenuContents = document.getElementById(oMenu.id + "__table");
            oMenu.LastContentTerms = sCharacteristics;
        }
    }

    if( bNeedsInitialization )
    {
        BaseMenuInitialize(oMenu, null, oMenu, oMenu);
    }

    oMenu.MenuOpen.style.display = 'none';
    oMenu.MenuFocus.style.display = '';
    oMenu.MenuFocus.onblur = function(){ BaseMenuClose(oMenu); };
    setTimeout(function(){ oMenu.MenuFocus.focus() }, 0);
    oMenu.MenuContents.style.display = '';
}
function BaseMenuClose(oMenu)
{
    oMenu.CloseMenuTimer = setTimeout(
        function()
        {
            //Close from the outside-in any any open menus not currently on the menu to be open path
            oMenu.MenuFocus.style.display = 'none';
            oMenu.CloseMenuTimer = null;
            while( oMenu.OpenMenu )
            {
                if( oMenu.OpenMenu == oMenu || !oMenu.OpenMenu.ParentPulldown )
                {
                    oMenu.OpenMenu = null;
                }
                else
                {
                    oMenu.OpenMenu.style.display = 'none';
                    oMenu.OpenMenu = oMenu.OpenMenu.ParentPulldown.PulldownContainer;
                }
            }

            oMenu.MenuOpen.style.display = '';
            oMenu.MenuContents.style.display = 'none';
        }, (AppRoot.IsIpad ? 1000 : 200));  //Ipad responds to the touch type of click slower (if there's a link under it that gets pushed otherwise)
}
