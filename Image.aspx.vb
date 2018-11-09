Imports MLib = MTrE.BaseLibrary
Imports System.Drawing
Imports System.IO

Partial Class Image
    Inherits Web.UI.Page

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

    Protected Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        'Set dbconn and declare a flag that indicates if we have an image
        Dim bImageFound As Boolean = False

        'Initialize our response
        Me.Response.Clear()

        'If query string has a data image specification attempt to look up an
        'image
        If Not MLib.IsEmpty(Request.QueryString("DataImageSpecification")) Then
            'Materializae the data image specification
            Dim oDataImageSpecification As MTrE.ControlLibrary.BaseDisplayedDataImageSpecification =
                MLib.UnstringObj(Request.QueryString("DataImageSpecification").Replace(" ", "+"))

            'If sufficiently specified attempt to lookup the image
            If Not MLib.IsEmpty(oDataImageSpecification.DatabaseTableAssemblyName) AndAlso
               Not MLib.IsEmpty(oDataImageSpecification.DatabaseTableName) AndAlso
               Not MLib.IsZero(oDataImageSpecification.DatabaseIDKeyValue) Then
                'Get instance of database table to fetch image
                Dim oImageDatabaseTable As MTrE.DatabaseImageTable =
                    MLib.GetInstance(oDataImageSpecification.DatabaseTableAssemblyName, oDataImageSpecification.DatabaseTableName)
                With oImageDatabaseTable
                    'Make sure the database table will get the text and binary type objects
                    'and fetch by primary key value
                    .DatabaseTable.BindColumns(.ImageColumn, .ContentTypeColumn, .TextColumn)
                    .DatabaseTable.GetByPrimaryKey(oDataImageSpecification.DatabaseIDKeyValue)
                    If .DatabaseTable.Rows.Count > 0 Then
                        'Get the content type, text representation if any, and binary representation if any
                        .DatabaseTable.CurrentRow = oImageDatabaseTable.DatabaseTable.Rows(0)
                        Dim sContentType As String = MLib.AdjustToOffice2007Docs(.ContentTypeColumn.Value),
                            sTextImage As String = .TextColumn.Value,
                            oBinaryImage As Byte() = MLib.IfNull(.ImageColumn.Value, New Byte() {})

                        'What we do depends on whether we're zooming 
                        '(in which case, whenever possible we want to treat it as 
                        'a pdf) or not (in which case, whenever possible we want to
                        'treat it as an image and size it, if possible, else do nothing)
                        Dim bIsZoom As Boolean =
                            MLib.IsTrue(Request.QueryString("Zoom"))
                        If bIsZoom Then 'Present it full size, in a pdf if possible
                            If InStr(sContentType.ToLower, "image") = 1 Then
                                'Display any kind of image AS a pdf 
                                '(we don't save multipage tiffs as such, so 
                                'the call to PackImagesIntoPDF is ok)
                                If oBinaryImage.Length > 0 Then
                                    Me.Response.ContentType = "application/pdf"
                                    Me.Response.BinaryWrite(
                                        MLib.PackImagesIntoPDF(New MemoryStream(oBinaryImage)).ToArray)
                                    bImageFound = True
                                End If
                            Else    'it's already saved as a pdf or other application
                                'Keep the mime type and stream the binary or if unavailable the text representation
                                If MLib.IsNull(oBinaryImage) OrElse oBinaryImage.Length < 1 Then
                                    If sContentType = "text/plain" Then 'IE doesn't trust text/plain
                                        Me.Response.ContentType = "text/html"
                                        Me.Response.Write(MLib.HTMLRepresent(sTextImage))
                                    Else
                                        Me.Response.ContentType = sContentType
                                        Me.Response.Write(sTextImage)
                                    End If
                                    bImageFound = True
                                Else
                                    Me.Response.ContentType = sContentType
                                    Me.Response.BinaryWrite(oBinaryImage)
                                    bImageFound = True
                                End If
                            End If
                        ElseIf oBinaryImage.Length > 0 Then
                            'Present images/pdfs to scale as images; nothing eles can be done to scale
                            Dim oImage As Bitmap = Nothing
                            If sContentType.ToLower = "application/pdf" Then
                                oImage = MLib.GetPageImageFromPDF(oBinaryImage)
                            ElseIf InStr(sContentType.ToLower, "image") = 1 Then
                                oImage = New Bitmap(New MemoryStream(oBinaryImage))
                            End If
                            If Not oImage Is Nothing Then
                                'Resize image if we're given specific dimensions
                                If Not MLib.IsZero(oDataImageSpecification.ImageWidth) AndAlso
                                   Not MLib.IsZero(oDataImageSpecification.ImageHeight) Then
                                    'Figure out the most restrictive dimension in resizing the
                                    'image and go with that as our zoom factor, limiting zoom to
                                    '1.5 where the image is smaller than the available space 
                                    'because beyond that the image gets fuzzy
                                    Dim nWidthRatio As Double,
                                        nHeightRatio As Double
                                    nWidthRatio = oDataImageSpecification.ImageWidth / oImage.Width
                                    nHeightRatio = oDataImageSpecification.ImageHeight / oImage.Height
                                    Dim nZoomFactor As Double = MLib.Min(1.5, nWidthRatio, nHeightRatio)

                                    'Resize our image
                                    oImage =
                                        New Bitmap(
                                            oImage,
                                            CInt(oImage.Width * nZoomFactor),
                                            CInt(oImage.Height * nZoomFactor))
                                End If

                                'Stream the image as a jpeg
                                Dim oBitmapStream As New MemoryStream
                                oImage.Save(oBitmapStream, System.Drawing.Imaging.ImageFormat.Jpeg)
                                Me.Response.ContentType = "image/jpeg"
                                Me.Response.BinaryWrite(oBitmapStream.ToArray())
                                bImageFound = True
                            End If
                        End If
                    End If
                End With
            End If
        ElseIf Not MLib.IsEmpty(Request.QueryString("FramesetId")) AndAlso Not MLib.IsEmpty(Request.QueryString("FrameId")) Then
            With DirectCast(MLib.GetFrameset(Request.QueryString("FramesetId")).Item(Request.QueryString("FrameId")).TaskBindSpec.TaskInstance, RiskReporting)
                Me.Response.ContentType = "application/pdf"

                If MLib.IsTrue(Me.Request.QueryString("Print")) Then
                    Dim oTallPDF As New TallComponents.PDF.Document(.PDFMemoryStream),
                    oTallPDFOpenAction As New TallComponents.PDF.Actions.JavaScriptAction
                    oTallPDFOpenAction.JavaScript = New TallComponents.PDF.JavaScript.JavaScript("this.print(true)")
                    oTallPDF.OpenActions.Add(oTallPDFOpenAction)
                    Dim oTallMemStream As New System.IO.MemoryStream
                    oTallPDF.Write(oTallMemStream)
                    Me.Response.BinaryWrite(oTallMemStream.ToArray)
                    bImageFound = True
                Else
                    Me.Response.BinaryWrite(.PDFMemoryStream.ToArray)
                    bImageFound = True
                End If
            End With
        End If

        'If no image was located, stream something tiny
        If Not bImageFound Then
            Dim oEmptyBitmapStream As New MemoryStream
            MLib.GetEmptyBitmap().Save(
                oEmptyBitmapStream,
                System.Drawing.Imaging.ImageFormat.Jpeg)
            Me.Response.ContentType = "image/jpeg"
            Me.Response.BinaryWrite(oEmptyBitmapStream.ToArray())
        End If

        'End the response
        Me.Response.End()
    End Sub
End Class
