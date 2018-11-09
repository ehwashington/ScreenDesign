Imports Dbc = MCCMTrE.Classic.DBConn
Imports MLib = MCCMTrE.Classic.Library
Imports Usr = MCCMTrE.Classic.User
Imports Err = MCCMTrE.Classic.ErrorClass
Imports System.IO
Imports MCCMTrE


<MTrE.Security(LicenseTermMask:=OptionFlags.Scanning Or OptionFlags.RACOnly)>
Partial Class ImagePopup
    ' Inherits MTrE.BaseScreen
    Inherits MTrE.BaseTask

#Region " Web Form Designer Generated Code "

    'This call is required by the Web Form Designer.
    <System.Diagnostics.DebuggerStepThrough()> Private Sub InitializeComponent()

    End Sub

    'NOTE: The following placeholder declaration is required by the Web Form Designer.
    'Do not delete or move it.
    Private designerPlaceholderDeclaration As System.Object

    Private Sub Page_Init(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Init
        'CODEGEN: This method call is required by the Web Form Designer
        'Do not modify it using the code editor.
        InitializeComponent()
    End Sub

#End Region
    Private oDBConn As Dbc
    Public taskCaption As String = "", returnCmd As String = "", ImageDisplayIFrameURL As String = ""

    '  Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
    'Initiate task (get connection object, validate user, etc)
    Public Overrides Sub Define()
        'MTrE.BaseApplication.InitApp()
        'MTrE.BaseLibrary.ProcessState.Item("DbConn") = New MCCMTrE.Classic.DBConn()

        'oDBConn = Session.Item("dbConn")
        'If oDBConn Is Nothing Then Exit Sub
        'oDBConn.TaskDescr = "ImagePopup.aspx"
        'Dim oUser As New Usr(oDBConn, oDBConn.UserID)
        'If Not IsPostBack Then
        '    ' oDBConn = oUser.ValidateUser(Me.Response)
        '    Session.Remove("dbConn")
        '    Session.Add("dbConn", oDBConn)
        'End If
        'Field-level control (must be outside of "Not IsPostBack")
        'oUser.FieldLevelControls(Me)
        'oUser = Nothing

        Try
            'Extract from URL the mccm_id for image we want to display
            Dim iImgMCCM_ID As Integer = CInt(MLib.fQNz(Request.QueryString("RecID"), "0"))
            If iImgMCCM_ID = 0 Then
                'No id, no display
                returnCmd = "window.close(); window.parent.alert('No image was specified.');"
            Else
                'Attempt to get image




                With New ExagoReports
                    .BindColumns(.ExagoReportImage, .ExagoReportName)
                    If Request.QueryString("ePrintFrame").Int > 0 Then
                        'Use Connection owned by frame -- it's data that's not committed yet
                        .Connection = DirectCast(
                            MTrE.BaseLibrary.GetFrameset.Item(Request.QueryString("ePrintFrame").Int).TaskBindSpec.TaskInstance,
                            MCCM.PopupEPrint).InProgressTransaction

                    End If
                    .ExagoRecordID.Constraint = iImgMCCM_ID
                    .GetByPrimaryKey(iImgMCCM_ID)
                    '  .Fetch()
                    Dim x As String = .ExagoReportName.Value
                    If MLib.fNz(.ExagoReportImage.Value) Then
                        'No image no display
                        returnCmd = "window.close(); window.parent.alert('There is no image to display.');"
                    Else
                        'Clear the response object so we can just stream in the image (setting the 
                        'MIME type appropriately)
                        Me.Response.Clear()
                        ' Me.Response.ContentType = MLib.fNz(MTrE.BaseLibrary.AdjustToOffice2007Docs("application/pdf"), "")
                        Me.Response.ContentType = MLib.fNz(MTrE.BaseLibrary.AdjustToOffice2007Docs("sample"), "")
                        'Display image in an appropriate fasion
                        If Not MLib.fNz(.ExagoReportImage.Value) Then
                            If InStr(Me.Response.ContentType.ToLower, "image") = 1 Then
                                'Write any kind of bit image AS a pdf (note all multipage images already 
                                'saved as a pdf so these are single page images) -- setting type and streaming
                                'its bytes
                                Me.Response.ContentType = "application/pdf"
                                Me.Response.BinaryWrite(MTrE.BaseLibrary.PackImagesIntoPDF(New MemoryStream(.ExagoReportImage.Value)).ToArray)

                                Me.Response.BinaryWrite(.ExagoReportImage.Value)
                            ElseIf InStr(Me.Response.ContentType.ToLower, "sample")
                                Me.Response.BinaryWrite(.ExagoReportImage.Value)
                            Else
                                If Not MTrE.ControlLibrary.Browser.IsIE OrElse MTrE.ControlLibrary.Browser.MajorRelease >= 9 Then Me.Response.Cache.SetCacheability(HttpCacheability.NoCache)
                                Me.Response.AddHeader("Content-Length", .ExagoReportImage.Value.Length)
                                Me.Response.AddHeader("Pragma", "token")
                                Me.Response.AddHeader("Content-Transfer-Encoding", "binary")
                                If MTrE.BaseLibrary.InferExtensionFromMIMEType(Me.Response.ContentType).ToLower <> "unknown" Then
                                    Me.Response.AddHeader("Content-disposition", "attachment; filename=MorriseyDownload." &
                                        MTrE.BaseLibrary.InferExtensionFromMIMEType(Me.Response.ContentType))
                                End If
                                Me.Response.BinaryWrite(.ExagoReportImage.Value)
                            End If

                        Else
                            'In case where image is missing, send plain text to that account
                            Me.Response.ContentType = "text/plain"
                            Me.Response.Write("No image was found.")
                        End If
                    End If
                End With
            End If
        Catch ex As Exception
            Dim eObj As New Err(ex, oDBConn.UserID, oDBConn, Me.Response, "Page_Load")
        End Try
    End Sub

End Class