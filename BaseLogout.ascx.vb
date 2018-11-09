Imports System.Web.Security

Public Class BaseLogout
    Inherits MTrE.BaseUserControl

    Public Sub Define()
        With BindSpec
            Me.linkLogOut.ActionMethod = AddressOf Me.LogOut
        End With
    End Sub

    Private Sub LogOut(oActionInfoIn As Core.Vector)
        'BaseDbConn.FreeSessionResourcesWithoutEndingResponse()
        'Me.BaseTask.Frames.Action.Script.AddLine("window.top.location = 'TOCLogin.aspx';")
    End Sub

End Class