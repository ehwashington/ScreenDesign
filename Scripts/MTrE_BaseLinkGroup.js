function SetupGroupBaseLink(sLinkID, sExpandedRegionID, sExpanderGroup, bIsExpandedRegionActive )
{
    //Get link we're working with
    var oLink = document.getElementById(sLinkID);
    if( oLink )
    {
        //If needed, setup objects to track all base link groups
        if( !window.BaseLinkGroups )
        {
            window.BaseLinkGroups = new Object();
        }

        //If needed, setup this group
        if( !window.BaseLinkGroups[sExpanderGroup] )
        {
            window.BaseLinkGroups[sExpanderGroup] = new Object();
            window.BaseLinkGroups[sExpanderGroup].FirstLink = oLink;            //The first link encountered
            window.BaseLinkGroups[sExpanderGroup].InitialActiveLink = null;     //The first explicit marked active link encountered
            window.BaseLinkGroups[sExpanderGroup].ActiveLink = null;            //The currently active link

            //Create handler for activating current link or clicked link as specified
           window.BaseLinkGroups[sExpanderGroup].ActivateLink = 
                function(oEvent)
                {
                    var oNewActiveLink;
                    if( window.BaseLinkGroups[sExpanderGroup].FirstLink ) 
                    {
                        oNewActiveLink = 
                            window.BaseLinkGroups[sExpanderGroup].InitialActiveLink ? 
                                window.BaseLinkGroups[sExpanderGroup].InitialActiveLink : 
                                window.BaseLinkGroups[sExpanderGroup].FirstLink;
                        window.BaseLinkGroups[sExpanderGroup].FirstLink = null;    //Now load event has run
                    }
                    else if( oEvent.srcElement )
                    {
                        oNewActiveLink = oEvent.srcElement;
                    }
                    else
                    {
                        oNewActiveLink = oEvent.target;
                    }

                    //Only if load event had run, is running activate anything
                    if( oNewActiveLink && !window.BaseLinkGroups[sExpanderGroup].FirstLink )
                    {
                        //Deactivate any currently active link
                        if( window.BaseLinkGroups[sExpanderGroup].ActiveLink && 
                            window.BaseLinkGroups[sExpanderGroup].ActiveLink != oNewActiveLink )
                        {
                            if( window.BaseLinkGroups[sExpanderGroup].ActiveLink.ExpandedRegionID )
                            {
                                    document.getElementById(window.BaseLinkGroups[sExpanderGroup].ActiveLink.ExpandedRegionID).style.display = 'none';
                            }
                            window.BaseLinkGroups[sExpanderGroup].ActiveLink.setAttribute('GroupLinkActive', 'N');
                            delete window.BaseLinkGroups[sExpanderGroup].ActiveLink;
                        }

                        //Activate the new active link
                        if( oNewActiveLink && !window.BaseLinkGroups[sExpanderGroup].ActiveLink )
                        {

                            if( oNewActiveLink.ExpandedRegionID )
                            {
                                document.getElementById(oNewActiveLink.ExpandedRegionID).style.display = '';
                            }
                            oNewActiveLink.setAttribute('GroupLinkActive', 'Y');
                            window.BaseLinkGroups[sExpanderGroup].ActiveLink = oNewActiveLink;
                        }
                    }
                }

            //Invoke handler on page load to active the first link to be active
            if( window.document.attachEvent ) window.attachEvent("onload", window.BaseLinkGroups[sExpanderGroup].ActivateLink);
            else window.addEventListener("onload", window.BaseLinkGroups[sExpanderGroup].ActivateLink, false);
        }

        //Note if link is first one marked active
        if( bIsExpandedRegionActive && !window.BaseLinkGroups[sExpanderGroup].InitialActiveLink ) 
        {
            window.BaseLinkGroups[sExpanderGroup].InitialActiveLink = oLink;
        }

        //Preserve handle to expander region
        if( sExpandedRegionID ) oLink.ExpandedRegionID = sExpandedRegionID;

        //Add activation handler on click to active the first link to be active
        if( window.document.attachEvent ) oLink.attachEvent("onclick", window.BaseLinkGroups[sExpanderGroup].ActivateLink);
        else oLink.addEventListener("onclick", window.BaseLinkGroups[sExpanderGroup].ActivateLink, false);
    }
}

var PANEL_ANIMATION_DELAY = 20; 
var PANEL_ANIMATION_STEPS = 10;

function animateTogglePanel(sExpandedRegionID, bExpand)
{
	// find the .panelcontent div
	var panel = document.getElementById(sExpandedRegionID);
	
	// make sure the content is visible before getting its height
	panel.style.display = "block";
	
	// get the height of the content
	var contentHeight = panel.offsetHeight;
	
	// if panel is collapsed and expanding, we must start with 0 height
	if (bExpand)
		panel.style.height = "0px";
	
	var stepHeight = contentHeight / PANEL_ANIMATION_STEPS;
	var direction = (!bExpand ? -1 : 1);
	
	setTimeout(function(){animateStep(panel,1,stepHeight,direction)}, PANEL_ANIMATION_DELAY);
}

function animateStep(panelContent, iteration, stepHeight, direction)
{
	if (iteration<PANEL_ANIMATION_STEPS)
	{
		panelContent.style.height = Math.round(((direction>0) ? iteration : 10 - iteration) * stepHeight) +"px";
		iteration++;
		setTimeout(function(){animateStep(panelContent,iteration,stepHeight,direction)}, PANEL_ANIMATION_DELAY);
	}
	else
	{
		// clear inline styles
		panelContent.style.display = panelContent.style.height = "";
	}
}
