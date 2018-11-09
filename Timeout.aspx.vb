Imports MLib = MTrE.BaseLibrary
Imports Bind = MTrE.BindLibrary

Partial Public Class Timeout
    Inherits System.Web.UI.Page

    Protected Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        'Cache the page -- if user times out why reset the session clock so their session state resources will take up memory that much longer?
        Me.Response.Cache.SetExpires(Now.AddDays(365))    'Not forever, but at least doesn't keep session state alive every time out
        Me.Response.Cache.SetCacheability(Web.HttpCacheability.Public)
        Me.Response.Cache.VaryByParams.Item("*") = True
        Me.divLogo.Visible = False
        Me.lblErrorMessage.Text = If(Request.QueryString("ErrMsg").IsBlank, "Your session has timed out. You must exit.", Request.QueryString("ErrMsg"))

        If MLib.IsTrue(Me.Request.QueryString("Logoff")) Then
            Me.lblErrorMessage.Text = "You have logged off."
            Me.divLogo.Visible = True
        End If

        'Clear authentication cache (and once done, report back to server to free up resources)
        Dim oLiteralScript As New LiteralControl("<script language=javascript>document.execCommand('ClearAuthenticationCache');</script>")
        Me.Form1.Controls.Add(oLiteralScript)
    End Sub
End Class