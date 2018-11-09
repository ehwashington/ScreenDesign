Imports System.Web.SessionState
Imports App = MTrE.BaseApplication

Public Class Global_asax
    Inherits System.Web.HttpApplication

    Sub Application_Start(ByVal sender As Object, ByVal e As EventArgs)
        ' Fires when the application is started

        App.AppRegistryFileName = "C:\MCCM\MCCMRun\Register.xml"
        App.AppStartupTask = "Main.aspx"
        App.AppStartupAction = MTrE.Controller.ActionGetData

        If App.AppAssemblyName.IsEmpty Then App.AppAssemblyName = "MCCMExagoReports"
        If App.AppName.IsEmpty Then App.AppName = "MCCMExagoReports"
        If App.AppMasterDomain.IsEmpty Then App.AppMasterDomain = "MCCMExagoReports"
        App.AppDbConnSessionKey = "dbConn"

        App.InitApp()
    End Sub

    Sub Session_Start(ByVal sender As Object, ByVal e As EventArgs)
        App.LoadAppSession()
    End Sub

    Sub Application_BeginRequest(ByVal sender As Object, ByVal e As EventArgs)
        ' Fires at the beginning of each request
    End Sub

    Sub Application_AuthenticateRequest(ByVal sender As Object, ByVal e As EventArgs)
        ' Fires upon attempting to authenticate the use
    End Sub

    Sub Application_Error(ByVal sender As Object, ByVal e As EventArgs)
#If DEBUG Then
        If System.Diagnostics.Debugger.IsAttached Then
            System.Diagnostics.Debugger.Break()
        End If
#End If

        ' Fires when an error occurs
        On Error Resume Next 'Ignore any error is our last chance error handler!

        If Not Server Is Nothing AndAlso Not Server.GetLastError Is Nothing Then
            Dim oDbConn As MTrE.DbConn = Session(App.AppDbConnSessionKey)
            If Not oDbConn Is Nothing Then
                MTrE.BaseLibrary.ProcessException(Server.GetLastError)
            End If
        End If
    End Sub

    Sub Session_End(ByVal sender As Object, ByVal e As EventArgs)
        App.UnloadAppSession(Session.SessionID)
    End Sub

    Private Sub Application_PreRequestHandlerExecute(ByVal sender As Object, ByVal e As System.EventArgs) Handles MyBase.PreRequestHandlerExecute
        App.BeginAppRequest()
    End Sub

    Private Sub Application_PostRequestHandlerExecute(ByVal sender As Object, ByVal e As System.EventArgs) Handles MyBase.PostRequestHandlerExecute
        App.EndAppRequest()
    End Sub

    Sub Application_End(ByVal sender As Object, ByVal e As EventArgs)
        ' Fires when the application ends
        App.EndApp()
    End Sub
End Class