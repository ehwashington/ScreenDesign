/* Related to datagrids with details sections that toggle open, closed */

function BaseDataGridProcessExpander()
{
    var oLink = window.document.activeElement;
    var oImage = oLink.children[0];  //The image tag inside of the anchor tag
    var oRowControl = oLink;
    while( oRowControl && oRowControl.tagName.toLowerCase() != "tr" )
    {
        oRowControl = oRowControl.parentElement;
    }
    var oRowDiplayed = oRowControl;
    if( oRowControl ) oRowControl = oRowControl.nextSibling;
    if( oRowControl && oRowControl.tagName.toLowerCase() == "tr" && oImage )
    {
        var oDetailDiv = oRowControl.children[0].children[0]; //The detail section div inside the tr/td tags
        if( oDetailDiv.innerHTML.indexOf("<!--") == 0 )
        {
            var sCommentedHTML = oDetailDiv.innerHTML;
            sCommentedHTML = sCommentedHTML.substr(4);
            oDetailDiv.innerHTML = sCommentedHTML.substr(0, sCommentedHTML.length - 3);
        }
        if( oDetailDiv )
        {
            if( oRowControl.style.display == "" )
            {
                oRowControl.style.display = "none";
                oImage.setAttribute("src", oDetailDiv.getAttribute("OpenImageURL"));
                oDetailDiv.setAttribute("IsOpen", false);
                oLink.parentElement.setAttribute("title", oDetailDiv.getAttribute("OpenToolTip") ? oDetailDiv.getAttribute("OpenToolTip") : "");
            }
            else
            {
                oRowControl.style.display = "";
                oImage.setAttribute("src", oDetailDiv.getAttribute("CloseImageURL"));
                oDetailDiv.setAttribute("IsOpen", true);
                oLink.parentElement.setAttribute("title", oDetailDiv.getAttribute("CloseToolTip") ? oDetailDiv.getAttribute("CloseToolTip") : "");

                //Find the scroll div associated with the datagrid and position the opened detail section to be seen
                while( oRowControl && oRowControl.tagName.toLowerCase() != "div" )
                {
                    oRowControl = oRowControl.parentElement;
                }
            }
        }
    }
}
