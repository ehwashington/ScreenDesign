Public Class Index
    Inherits System.Web.UI.Page

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Me.Response.Redirect("Main.aspx", True)
    End Sub

End Class