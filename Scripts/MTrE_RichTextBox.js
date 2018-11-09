function BaseRichTextSetupLoad(oControl)
{
    oControl.LoadValue = 
        function(sValue)
            {
                if( sValue.replace(/\s+$/,"").replace(/\r\n/g, "\n") != 
                    oControl.innerHTML.replace(/\s+$/,"").replace(/\r\n/g, "\n") )
                {
                    if( !(sValue.indexOf('<P') == 0 || sValue.lastIndexOf('</P>') == (sValue.length - 4)) )
                    {
                        sValue = '<P>' + sValue + '</P>';
                    }
                    sValue = sValue.replace(/\<P\>/g, '<P style="margin:0px">').replace(/&nbsp;\<\/P\>/g, '</P>').replace(/\<\/P\>/g, '&nbsp;</P>');
                    if( oControl.innerHTML ) 
                    {
                        var oRange;
	                    if( oControl.isContentEditable == true && 
                            document.selection && 
	                        document.selection.type == 'Text' )
	                    {
	                        //Get handle on object that tracks with selected text
	                        oRange = document.selection.createRange();

                            //Determine if the selected text is in range
	                        var bRangeIsInControl = false;
	                        if( oRange && oRange.parentElement() )
	                        {
	                            var oContainedIn = oRange.parentElement();
	                            while( oContainedIn )
	                            {
	                                if( oContainedIn == oControl )
	                                {
	                                    bRangeIsInControl = true;
	                                    break;
	                                }
	                                else if( oContainedIn == window )
	                                {
	                                    break;
	                                }
	                                else
	                                {
	                                    oContainedIn = oContainedIn.parentElement;
	                                }
	                            }
	                        }
	    
	                        if( bRangeIsInControl )
	                        {
		                        var oCommandResult = document.execCommand(sCommand, true, sOption);
		                        if( sCommand == 'CreateLink' )
		                        {
		                            if( oRange.htmlText.search(/\x3CA\s*href\x3D/i) >= 0 )
		                            {
		                                oControl.innerHTML = oControl.innerHTML.replace(/\x3CA\s*href\x3D/gi, "<A target=\"_new\" href=");
		                                oRange.collapse();
		                            }
		                        }
                                oControl.SetValue = false;
                                oControl.focus();
                                oRange.select();
	                        }
                        }
                    }
                    oControl.innerHTML = sValue;
                }
            };     
}

function BaseRichTextSetup(oControl, oOnChangeHandler, bStripPasteFormatting)
{
    oControl.SetValue = true;
    oControl.onfocus = 
        function()
            {
                if( oControl.SetValue )
                {
                    oControl.CurrentValue = oControl.innerHTML;
                }
                else
                {
                    oControl.SetValue = true;
                }
            };
            
    BaseRichTextSetupLoad(oControl);
    
    oControl.GetRequestData = 
        function()
            {
                if( oControl.innerHTML == '' )
                {
                    return '';
                }
                else
                {
                    return encodeURI(oControl.innerHTML.replace(/&nbsp;\<\/P\>/g, '</P>')).replace(/\+/g, "%2B");
                }
            };
            
   oControl.OnChangeHandler = oOnChangeHandler;

    oControl.onblur = 
        function()
            {
                if( oControl.innerHTML != oControl.CurrentValue )
                {
                    oControl.CurrentValue = oControl.innerHTML;
                    if( oControl.OnChangeHandler )
                    {
                        oControl.OnChangeHandler();
                    }
                }
            };

            oControl.onkeyup =
        function () {
            switch (event.keyCode) {
                case 13: //Enter
                    if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
                        var oOriginalRange = document.selection.createRange();
                        var oControlPosition = AppRoot.GetPosition(oOriginalRange, false);
                        var iLeft = oOriginalRange.offsetLeft;
                        var iTop = oOriginalRange.offsetTop;
                        var bIsList = (oOriginalRange.queryCommandState('insertOrderedList') || oOriginalRange.queryCommandState('insertUnorderedList'));
                        if (!bIsList) {
                            setTimeout(
                                    function () {
                                        oControl.innerHTML = oControl.innerHTML.replace(/\<P\>/g, '<P style="margin:0px">').replace(/&nbsp;\<\/P\>/g, '</P>').replace(/\<\/P\>/g, '&nbsp;</P>');
                                        var oRange = document.selection.createRange();
                                        oRange.moveToPoint(iLeft, iTop+1);
                                        oRange.collapse();
                                        oRange.select();
                                    }, 0);
                        }
                        event.returnValue = true;
                        break;
                    }
            }
        }

	if( bStripPasteFormatting )
	{
		function StripWordFormatting(sText)
		{
			//BASED ON http://www.1stclassmedia.co.uk/developers/clean-ms-word-formatting.php (3/26/11)
			sText = sText.replace(/<o:p>\s*<\/o:p>/g, "") ;
			sText = sText.replace(/<o:p>.*?<\/o:p>/g, "&nbsp;") ;
			sText = sText.replace( /\s*mso-[^:]+:[^;"]+;?/gi, "" ) ;
			sText = sText.replace( /\s*MARGIN: 0cm 0cm 0pt\s*;/gi, "" ) ;
			sText = sText.replace( /\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"" ) ;
			sText = sText.replace( /\s*TEXT-INDENT: 0cm\s*;/gi, "" ) ;
			sText = sText.replace( /\s*TEXT-INDENT: 0cm\s*"/gi, "\"" ) ;
			sText = sText.replace( /\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"" ) ;
			sText = sText.replace( /\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"" ) ;
			sText = sText.replace( /\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"" ) ;
			sText = sText.replace( /\s*tab-stops:[^;"]*;?/gi, "" ) ;
			sText = sText.replace( /\s*tab-stops:[^"]*/gi, "" ) ;
			sText = sText.replace( /\s*face="[^"]*"/gi, "" ) ;
			sText = sText.replace( /\s*face=[^ >]*/gi, "" ) ;
			sText = sText.replace( /\s*FONT-FAMILY:[^;"]*;?/gi, "" ) ;
			sText = sText.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3") ;
			sText = sText.replace( /<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3" ) ;
			sText = sText.replace( /\s*style="\s*"/gi, '' ) ; 
			sText = sText.replace( /<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;' ) ; 
			sText = sText.replace( /<SPAN\s*[^>]*><\/SPAN>/gi, '' ) ; 
			sText = sText.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3") ; 
			sText = sText.replace( /<SPAN\s*>(.*?)<\/SPAN>/gi, '$1' ) ; 
			sText = sText.replace( /<FONT\s*>(.*?)<\/FONT>/gi, '$1' ) ;
			sText = sText.replace(/<\\?\?xml[^>]*>/gi, "") ; 
			sText = sText.replace(/<\/?\w+:[^>]*>/gi, "") ; 
			sText = sText.replace( /<H\d>\s*<\/H\d>/gi, '' ) ;
			sText = sText.replace( /<H1([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<H2([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<H3([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<H4([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<H5([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<H6([^>]*)>/gi, '' ) ;
			sText = sText.replace( /<\/H\d>/gi, '<br>' ) ; //remove this to take out breaks where Heading tags were 
			sText = sText.replace( /<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;' ) ;
			sText = sText.replace( /<(B|b)>&nbsp;<\/\b|B>/g, '' ) ;
			sText = sText.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
			sText = sText.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
			sText = sText.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
			
			//some RegEx code for the picky browsers
			var oRegex1 = new RegExp("(<P)([^>]*>.*?)(<\/P>)","gi") ;
			sText = sText.replace( oRegex1 , "<div$2</div>" ) ;
			var oRegEx2 = new RegExp("(<font|<FONT)([^*>]*>.*?)(<\/FONT>|<\/font>)","gi") ; 
			sText = sText.replace( oRegEx2, "<div$2</div>") ;
			sText = sText.replace( /size|SIZE = ([\d]{1})/g, '' );
            sText = sText.replace(/\<P\>/g, '<P style="margin:0px">').replace(/&nbsp;\<\/P\>/g, '</P>').replace(/\<\/P\>/g, '&nbsp;</P>');
			return sText;
		}
		
		oControl.onpaste = 
			function()
				{
					//Message paste data to remove Word formatting
					window.clipboardData.setData("Text", StripWordFormatting(window.clipboardData.getData("Text")));
					return true;
				}
	}
}

function BaseRichTextCommand(sCommand, oControl, sOption)
{
    if( window.getSelection )
    {
        var oRange = window.getSelection().getRangeAt(0);
        if( oRange )
        {
            var oRangeParent = oRange.commonAncestorContainer.parentNode;
            while( oRangeParent )
            {
                if( oRangeParent == oControl )
                {
                    try
                    {
		                var oCommandResult = document.execCommand(sCommand, true, sOption);
                        if( sCommand == 'CreateLink' )
		                {
		                    oControl.innerHTML = oControl.innerHTML.replace(/\x3CA\s*href\x3D/gi, "<A target=\"_new\" href=");
		                    oRange.collapse();
		                }
                        oControl.SetValue = false;
                        oControl.focus();
                        oRange.selectNodeContents();                        
                    }
                    catch(e){}
                    oRangeParent = null;
                }
                else oRangeParent = oRangeParent.parentElement;
            }    
        }
    }
    else
    {
	    if( oControl.isContentEditable == true && 
	        document.selection.type == 'Text' )
	    {
	        //Get handle on object that tracks with selected text
	        oRange = document.selection.createRange();

            //Determine if the selected text is in range
	        var bRangeIsInControl = false;
	        if( oRange && oRange.parentElement() )
	        {
	            var oContainedIn = oRange.parentElement();
	            while( oContainedIn )
	            {
	                if( oContainedIn == oControl )
	                {
	                    bRangeIsInControl = true;
	                    break;
	                }
	                else if( oContainedIn == window )
	                {
	                    break;
	                }
	                else
	                {
	                    oContainedIn = oContainedIn.parentElement;
	                }
	            }
	        }
	    
	        if( bRangeIsInControl )
	        {
		        var oCommandResult = document.execCommand(sCommand, true, sOption);
		        if( sCommand == 'CreateLink' )
		        {
		            if( oRange.htmlText.search(/\x3CA\s*href\x3D/i) >= 0 )
		            {
		                oControl.innerHTML = oControl.innerHTML.replace(/\x3CA\s*href\x3D/gi, "<A target=\"_new\" href=");
		                oRange.collapse();
		            }
		        }
                oControl.SetValue = false;
                oControl.focus();
                oRange.select();
	        }
        }
    } 
}
