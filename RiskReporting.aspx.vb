Imports mlib = MTrE.BaseLibrary
Imports Bind = MTrE.BaseLibrary
Imports MTrE.DatabaseTable
Imports MCCMLib = MCCMTrE.Classic.Library
Imports System.Collections.Generic
Imports edl = ExagoDataLayer
Imports ExagoFM = ExagoFileManagment.ExagoExtensibility.FolderManagment
Imports Dbc = MCCMTrE.Classic.DBConn
Imports Code = MCCMTrE.Classic.CodeTable
Imports Secur = MCCMTrE.Classic.SecurityGroup
Imports MCCMTrE


Public Class RiskReporting
    'Inherits System.Web.UI.Page
    Inherits MTrE.BaseTask

    Dim oReports As New MCCMTrE.ExagoReports
    Public Const TaskInputReportPath As String = "ReportPath"
    Public returnCmd As String = ""


    'Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

    'End Sub

    Public Overrides Sub Define()
        With Me.BindSpec
            .MinDisplayWidth = 1024
            .MinDisplayHeight = 475

            .IsTaskLogged = True
            '  .TaskInputs(MTrEProviderContainer.TaskInputChildTask).ElementValue = "Panelreports.aspx"
            'Inform parent task we're loaded
            With Me.oReports
                .BindColumns(.ExagoReportName, .ExagoReportTopics, .ExagoReportDefinition, .ExagoParentID, .ExagoReportType, .ExagoDisplayRecordYN, .ExagoRecordID)
                .ExagoDisplayRecordYN.Constraint = "Y"
                ' Me.linkImage.ImageURL = "../MCCMExagoReports/images/" + .ExagoReportName.Value + ".jpg"
                With .BindTable.Fetch()
                    .BindDataGrid(dgReports)
                End With
            End With
            With Me.linkReturn
                .SetReload()
                .LinkURL = "AppRoot.CloseFrame(window)"
                .LinkAction = BaseLink.LinkActionEnum.Javascript

            End With

        End With
            edl.ExecuteExago.Exago_ChangeConn()
    End Sub
    Public lblReportName As BasePrompt
    Public lblReportDef As BasePrompt
    Public lblReportType As BasePrompt

    Public lblReportTopics As BasePrompt
    Public lblReportParent As BasePrompt
    Public lblDisplayRec As BasePrompt
    Public lblRecordID As BasePrompt

    Public linkImage As MTrE.BaseLink
    Public LinkExagoReport As MTrE.BaseLink
    Private Sub dgReports_BindRowDefine(oDataGrid_In As MTrE.BaseDataGrid,
                                         oBindDatabaseRow_In As MTrE.BindLibrary.BindDatabaseRow,
                                         oDataGridDataTable_In As MTrE.DatabaseTable,
                                         bIsOnDataBind_In As Boolean, iRowIndex_In As Integer) Handles dgReports.BindRowDefine
        Dim currentReportPathItem As MCCMTrE.ExagoReports = oDataGridDataTable_In
        Dim currentReportFilterItem As MCCMTrE.ExagoReports = oDataGridDataTable_In
        Dim currentReportParentID As MCCMTrE.ExagoReports = oDataGridDataTable_In
        Dim currentReportID As MCCMTrE.ExagoReports = oDataGridDataTable_In



        If bIsOnDataBind_In Then

            ' Dim oSecur As New Secur(AppDbConn)
            'Dim oSecur As New Secur(AppDbConn)
            'If oSecur.ValidateDocument(AppDbConn.UserID, "jpg") Then
            With Me.oReports

                With Me.LinkExagoReport

                    '  .ActionArgItems(TaskInputReportPath) = currentReportPathItem.ExagoReportName.Value
                    If InStr(currentReportPathItem.ExagoReportName.Value, ".wrd") > 0 Then
                        currentReportPathItem.ExagoReportName.Value = currentReportPathItem.ExagoReportName.Value.Substring(0, currentReportPathItem.ExagoReportName.Value.IndexOf(".wrd"))
                    End If
                    .ActionArgItems("ReportName") = currentReportPathItem.ExagoReportName.Value
                    .ActionArgItems("ParentID") = currentReportPathItem.ExagoParentID.Value
                    .ActionArgItems("RecID") = currentReportPathItem.ExagoRecordID.Value
                    '.ActionArgItems("ReportFilter") = currentReportFilterItem.ReportFilter.Value
                    .IsRelatedTask = True
                    .IsPopup = "True"
                    .ActionMethod = AddressOf SelectLinkClicked
                    Me.lblReportName.Text = Me.oReports.ExagoReportName.Value
                    Me.lblReportDef.Text = Me.oReports.ExagoReportDefinition.Value
                    Me.lblReportType.Text = Me.oReports.ExagoReportType.Value
                    Me.lblReportTopics.Text = Me.oReports.ExagoReportTopics.Value
                    Me.lblReportParent.Text = Me.oReports.ExagoParentID.Value
                    Me.lblDisplayRec.Text = Me.oReports.ExagoDisplayRecordYN.Value
                    Me.lblRecordID.Text = Me.oReports.ExagoRecordID.Value
                    If InStr(lblReportName.Text, ".wrd") > 0 Then

                        lblReportName.Text = currentReportPathItem.ExagoReportName.Value


                    End If



                End With
            End With
            With Me.linkImage

                .LinkAction = MTrE.BaseLink.LinkActionEnum.URL
                .LinkURL = "ImagePopup.aspx?Now=" & Format(Now, "MdyyHmmss") & "&RecID=" & currentReportPathItem.ExagoRecordID.Value & "&Print=Y"
                .IsPopup = True
                .PopupInfo.IsOverlay = False
                .PopupInfo.DisplayStatusBar = True
                .PopupInfo.AllowScrolling = True
            End With
        End If
        ' End If


        ' AppDbConn.DbURL

        'New code to expand data gri    d

        If Me.IsRenderingTask Then
            With Me.AutoExpandSpec
                .Child(Me.dgReports).Stretch(100, 100)
            End With
        End If

    End Sub
    Sub SelectLinkClicked(oActionInfo_In As Core.Vector)

        ' ExagoFM.BuildReportPath(oActionInfo_In("ReportName"), oActionInfo_In("ParentID"))
        Dim exagoLInk As New MTrE.BaseLink


        With exagoLInk
            .LinkAction = MTrE.BaseLink.LinkActionEnum.URL

            .LinkURL = ExagoDataLayer.ExecuteExago.execute_exagoFunction(ExagoFM.BuildReportPath(oActionInfo_In("ReportName"), oActionInfo_In("ParentID")))



            .IsPopup = True
            .Target = "window.top"
            With .PopupInfo
                .IsOverlay = False
            End With
        End With

        Me.Frames.Action.ExtractScriptFromLink(exagoLInk)
        'End If
    End Sub

End Class