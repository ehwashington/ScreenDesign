function StringBuilder()
{
    this.Value = '';
    this.Delimiter = '';

    this.Append = function(sAppendText)
    {
        if( this.Value )
        {
            this.Value += this.Delimiter + sAppendText;
        }
        else
        {
            this.Value = sAppendText;
        }
    }
}

function PopupInfo(oLink) 
{
    this.Link = oLink; 

    this.IsOverlay = true;
    this.OverlayMode = 0;
    this.OverlayAllowsTransparency = false;
    this.OverlayModalOpacity = 45;
    this.OverlayBorderWidth = 2;
    this.OverlayDisplaysTitleBar = true;
    this.OverlayOwner = null;
    this.IsAutoClose = true;
    this.AllowScrolling = false;
    this.DisplayMenuBar = false;
    this.DisplayNavigationBar = false;
    this.DisplayStatusBar = false;
    this.DisplayToolBar = null;
    this.IsResizable = true;
    this.Left = 0;
    this.Top = 0;
    this.Width = 800;
    this.Height = 600;
    this.IsCentered = true;
};
PopupInfo.prototype.GetFeaturesExpression = function()
{
    var oFeatures = new StringBuilder();
    oFeatures.Delimiter = ',';
    if( this.IsOverlay )
    {
        oFeatures.Append('overlay=true');
        if( this.OverlayMode > 0 ) oFeatures.Append('overlaymode=' + this.OverlayMode);
        if( this.OverlayAllowsTransparency ) oFeatures.Append('overlayallowstransparency=true');
        if( this.OverlayModalOpacity > 0 ) oFeatures.Append('opacity=' + this.OverlayModalOpacity);
        if( this.OverlayBorderWidth > 0 ) oFeatures.Append('border=' + this.OverlayBorderWidth);
        if( this.OverlayDisplaysTitleBar ) oFeatures.Append('title=true');
    }
    if( !this.IsAutoClose )
    {
        oFeatures.Append('autoclose=false');
    }
    if( this.AllowScrolling ) oFeatures.Append('scrollbars=yes');
    if( this.DisplayMenuBar ) oFeatures.Append('menubar=yes');
    if( this.DisplayNavigationBar ) oFeatures.Append('location=yes');
    if( this.DisplayStatusBar ) oFeatures.Append('status=yes');
    if( this.DisplayToolBar || (this.DisplayToolBar === null && this.IsOverlay) )
    {
        oFeatures.Append('toolbar=yes');
    }
    if( this.IsResizable ) oFeatures.Append('resizable=yes');
    else if( !this.IsOverlay ) oFeatures.Append('resizable=no');
    if( !this.IsCentered )
    {
        oFeatures.Append('left=' + this.Left);
        oFeatures.Append('top=' + this.Top);
    }
    else if( this.IsOverlay )
    {
        oFeatures.Append('centered=yes');
    }
    else
    {
        oFeatures.Append('left=' + this.Left + Math.max(0, (screen.width - this.Width) / 2));
        oFeatures.Append('top=' + this.Top + Math.max(0, (screen.height - this.Height) / 2));
    }
    if( this.IsOverlay)
    {
        if( !this.OverlayOwner ) oFeatures.Append('owner=' + this.Link.Frame.AppFrameId);
        else if( parseInt(this.OverlayOwner,10) > 0 ) oFeatures.Append('owner=' + parseInt(this.OverlayOwner,10).toString());
        else oFeatures.Append('owner=' + this.OverlayOwner.AppFrameId);
    }

    //Return features expression
    return oFeatures.Value;
}; 

function Link(oFrame)
{
    this.Frame = oFrame;
    this.LinkActionEnum = new function()
    {
        this.Action = 1;
        //this.Javascript = 2;  Not yet supported
        //this.Report = 3;      Not yet supported
        //this.URL = 4;         Not yet supported
    };
    this.LinkAction = this.LinkActionEnum.Action;

    this.Task = '';
    this.TaskArgItems = new Object();
    this.Action = '';
    this.ActionArgItems = new Object();
    this.LinkURL = '';
    this.Target = null;
    this.OnPopupExitLink = '';

    this.IsPopup = false;
    this.PopupInfo = new PopupInfo(this);
}
Link.prototype.Link = function()
{ 
    switch(this.LinkAction)
    {
        case this.LinkActionEnum.Action:
            var oTaskArgsBuilder = new StringBuilder();
            oTaskArgsBuilder.Delimiter = '&';
            for( var sTaskArg in this.TaskArgItems ) oTaskArgsBuilder.Append(sTaskArg + '=' + this.TaskArgItems[sTaskArg]);

            var oActionBuilder = new StringBuilder();
            oActionBuilder.Value = (this.Action ? this.Action : 'GetData') + '?';
            oActionBuilder.Delimiter = '&';
            for( var sActionArg in this.ActionArgItems ) oActionBuilder.Append(sActionArg + '=' + this.ActionArgItems[sActionArg]);

            if( this.OnPopupExitLink )  this.ActionArgItems.WhenExit = this.OnPopupExitLink;

            var oTarget = this.Target ? this.Target : (this.IsPopup && this.IsOverlay ? this.Frame.AppTopFrame : this.Frame);
            if( !this.Task ) AppRoot.DoAction(oTarget, oActionBuilder.Value);
            else if( this.IsPopup )
            {
                AppRoot.OpenFramePopup(oTarget, this.Task, oTaskArgsBuilder.Value, oActionBuilder.Value, this.PopupInfo.Width, this.PopupInfo.Height, this.PopupInfo.GetFeaturesExpression());
            }
            else AppRoot.OpenFrame(oTarget, this.Task, oTaskArgsBuilder.Value, oActionBuilder.Value);

            //Done with that case!
            break;
        default:
            alert('The MTrE javascript Link object does not support the specified LinkAction');
    }
};
