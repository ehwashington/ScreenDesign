function BaseTreeOpen(oTree, sNodeID)
{
	BaseTreeApplyCoupling("1", oTree, sNodeID);
    if( oTree.getUserData(sNodeID, '__expand') == 1 )
    {
		oTree.openAllItems(sNodeID);
    }
    else
    {
		var sChildNodeIDs = oTree.getAllSubItems(sNodeID);
		if( !AppRoot.IsEmpty(sChildNodeIDs) )
		{
			oChildNodeIDs = sChildNodeIDs.split(",");
			for( var iChild in oChildNodeIDs )
			{
				if( oTree.getUserData(oChildNodeIDs[iChild], '__openwparent') == 1 )
				{
					oTree.openItem(oChildNodeIDs[iChild]);
				}

			}
		}
    }
}

function BaseTreeApplyCoupling(sTrigger, oTree, sNodeID)
{
	//valid input values for sTrigger:  1 - Open, 2 - Select
	var sCouplings = oTree.getUserData(sNodeID, '__coupling');
	if( !AppRoot.IsEmpty(sCouplings) )
	{
		oCouplings = sCouplings.split("\n");
		for( var iCoupling in oCouplings )
		{
			var oCouplingTerms = oCouplings[iCoupling].split(":");
			if( (AppRoot.IsEmpty(oCouplingTerms[0]) || oCouplingTerms[0] == "0" || oCouplingTerms[0] == sTrigger) && 
			    (!AppRoot.IsEmpty(oCouplingTerms[3]) || oCouplingTerms[4] == "7") )
			{
				var sResultAction;
				var oTargetTree = document.getElementById(oCouplingTerms[2]).Tree; 
				if( !oCouplingTerms[4] || oCouplingTerms[4] == "" || oCouplingTerms[4] == "0" )
				{
					sResultAction = sTrigger;
				}
				else
				{
					sResultAction = oCouplingTerms[4];
				}
				switch(sResultAction) //Resulting action
				{
					case "1":		//Open
						oTargetTree.openItem(oCouplingTerms[3]);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "2":		//Close
						oTargetTree.closeItem(oCouplingTerms[3]);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "3":		//Select
						oTargetTree.selectItem(oCouplingTerms[3], true);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "4":		//SelectAndOpen
						oTargetTree.openItem(oCouplingTerms[3]);
						oTargetTree.selectItem(oCouplingTerms[3], true);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "5":		//MarkSelected
						oTargetTree.selectItem(oCouplingTerms[3], false);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "6":		//MarkSelectedAndOpen
						oTargetTree.openItem(oCouplingTerms[3]);
						oTargetTree.selectItem(oCouplingTerms[3], false);
						oTargetTree.focusItem(oCouplingTerms[3]);
						break;
					case "7":		//Deselect
						oTargetTree.clearSelection(oTargetTree.getSelectedItemId());
						break;
				}			
			}
		}
	}
}

function BaseTreeExpandNode(iFrameId, sTreeUniqueID, oTree, sExpandNodeID, sExpandMethodType, sExpandMethod)
{
   //Setup query args to pass along that context
    var sExpandNodeContext = 
        'ControlID=' + sTreeUniqueID + 
            '&FramesetId=' + AppRoot.AppFramesetId + 
            '&FrameId=' + iFrameId + 
            '&ExpandNodeID=' + sExpandNodeID;
    if( !AppRoot.IsEmpty(sExpandMethodType) &&
	    !AppRoot.IsEmpty(sExpandMethod) )
    {
        sExpandNodeContext +=
            '&Type=' + sExpandMethodType +
            '&Method=' + sExpandMethod;
    }

    return AppRoot.GetAJAXResult('MTrE', 'BaseTree', 'DynamicLoadSubTree', sExpandNodeContext);
}

function BaseTreeSetItem(oTree, sNodeID)
{
	oTree.selectItem(sNodeID,true,false);
	oTree.focusItem(sNodeID);
}

function BaseTreeMouseIn(oTree, sNodeID)
{
    var sTooltipOrg = oTree.getItemTooltip(sNodeID);
    if( AppRoot.IsEmpty(sTooltipOrg) )
    {
        sTooltipOrg = oTree.getItemText(sNodeID);
    }
    if( sTooltipOrg.replace )
    {
		var sTooltip = sTooltipOrg.replace(/<\/?[^>]+(>|$)/g, '').replace(/\x26nbsp;/g, ' ');
		if( sTooltip != sTooltipOrg )
		{
			oTree.setItemText(sNodeID,oTree.getItemText(sNodeID),sTooltip);
		}
    }
}

function BaseTreeDrop(sDraggedNodeID, sDropNodeID, sSiblingDropNodeID, oSourceTree, oTargetTree)
{
    if( oTargetTree.parentElement.disabled ) return false;

    var bReturn;
    if( oTargetTree.HasWaitOnDrop )
    {
        AppRoot.StartWait(AppTopFrame, oTargetTree.WaitOnDropText);
    }
	if( oTargetTree.BaseTreeMoveOccurring )
	{
		oTargetTree.BaseTreeMoveOccurring = null;
		bReturn = true;
	}
	else if( oTargetTree.parentElement.DisableDrop )
	{
		bReturn = false;
	}
	else if( oSourceTree != oTargetTree && oSourceTree.parentElement.DisableDragToOtherTrees )
	{
		bReturn = false;
	}
	else if( oSourceTree != oTargetTree && oTargetTree.parentElement.DisableDropFromOtherTrees )
	{
		bReturn = false;
	}
	else
	{
		//Prep the action
		var sOnLoadArgs = 'ActionPlaceNode?ActionMethodControl=' + oTargetTree.parentElement.id +  
			'&Source=' + sDraggedNodeID + '&Drop=' + sDropNodeID ;
		if( sSiblingDropNodeID )
		{
			sOnLoadArgs += '&Sibling=' + sSiblingDropNodeID;
		}
		if( oSourceTree != oTargetTree )
		{
			sOnLoadArgs += '&Tree=' + oSourceTree.parentElement.id
			var oSourceWindow = oSourceTree.parentWindow;
			if( oSourceWindow != window )
			{
				sOnLoadArgs += '&Frame=' + oSourceWindow.AppFrameId;
				if( oSourceWindow.AppRoot != window.AppRoot ) //Browser security doesn't allow this possibility
				{
					sOnLoadArgs += '&Frameset=' + oSourceWindow.AppRoot.AppFramesetId;
				}
			}
		}	 
		
		//Perform the action
		setTimeout(function(){ AppRoot.DoAction(window, sOnLoadArgs); }, 0);
		bReturn = false; //ALWAYS return false to suppress client side drop -- MTrE handles everything
	}
	return bReturn;
}

function BaseTreeOnCheck(oTree, sNodeID, bChecked)
{
    //Prep the action
    var sOnLoadArgs = 'ActionClickCheckbox?ActionMethodControl=' + oTree.parentElement.id +
		'&NodeID=' + sNodeID + '&Chk=' + (bChecked ? '1' : '0');
    AppRoot.DoAction(window, sOnLoadArgs);
}

function BaseConvertTree(oTree)
{
	var oTreeConverter = new BaseTreeConverter(oTree);
	return oTreeConverter.GetReturnXML();
}

//Create a js class to serialize only the info in a tree that needs to travel 
function BaseTreeConverter(oTree)
{
	this.Tree = oTree;
	this.Info = "";
	this.SelectedNodeID = "";
}
BaseTreeConverter.prototype.GetReturnXML =
	function()
	{
		if( AppRoot.IsEmpty(this.Tree) )
		{
			this.SelectedNodeID = "";
		}
		else
		{
			this.SelectedNodeID = this.Tree.getSelectedItemId();
		}

		this.Info = "<tree id=\"0\">";
		
		//Process the root node
		this.ProcessNodeChildren("0");
		
		//Close the tree tag and return the serialzed info
		this.Info += "</tree>";
		return escape(this.Info);
	}
BaseTreeConverter.prototype.ProcessNodeChildren =
	function(sNodeID)
	{ 
		var sChildNodeIDList = this.Tree.getSubItems(sNodeID);
		if( !AppRoot.IsEmpty(sChildNodeIDList) )
		{
			var oChildNodeIDs = sChildNodeIDList.split(',');
			for(var iChild in oChildNodeIDs)
			{
				//Open the node with the node id
				this.Info += "<item id=\"" + oChildNodeIDs[iChild] + "\"";
				
				//Add in various dynamic attributes we might care about on the server
				this.Info += " checked=\"";
				if( AppRoot.IsTrue(this.Tree.isItemChecked(oChildNodeIDs[iChild])) ) this.Info += "1";
				this.Info += "\"";

				this.Info += " open=\"";
				if( AppRoot.IsTrue(this.Tree.getOpenState(oChildNodeIDs[iChild])) ) this.Info += "1";
				this.Info += "\"";
				
				this.Info += " select=\"";
				if( oChildNodeIDs[iChild] == this.SelectedNodeID ) this.Info += "1";
				this.Info += "\"";
				
				//Close the tag opening the current node
				this.Info += ">";
		
				this.ProcessNodeChildren(oChildNodeIDs[iChild]);

				//Close the node
				this.Info += "</item>";
			}
		}
	}
