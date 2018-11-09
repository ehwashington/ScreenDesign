Imports mlib = MTrE.BaseLibrary
Imports Bind = MTrE.BaseLibrary
Imports MTrE.DatabaseTable
Imports MCCMLib = MCCMTrE.Classic.Library
Imports System.Collections.Generic
Imports ExagoDataLayer
Imports ExagoFM = ExagoFileManagment.ExagoExtensibility.FolderManagment

'Imports WebReports.Api
Public Class RiskReports
    'Inherits System.Web.UI.Page
    Inherits MTrE.BaseTask
    Dim oReports As New MCCMTrE.ExagoReports
    Public Const TaskInputReportPath As String = "ReportPath"

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
                .BindColumns(.ExagoReportName, .ExagoReportTopics, .ExagoReportDefinition, .ExagoParentID, .ExagoReportType, .ExagoDisplayRecordYN)
                .ExagoDisplayRecordYN.Constraint = "Y"
                With .BindTable.Fetch()
                    .BindDataGrid(dgReports)
                End With
            End With
        End With
        'Try

        '    Dim dapi As New WebReports.Api.Api("C:\\Program Files\\Exago\\ExagoWeb", "WebReports.xml")
        '    sExagoRootURL = "http://localhost/Exago/"
        '    sExagoxml = "WebReports.xml"
        '    sExagoaspx = "ExagoHome"

        '    Dim rReportobj As WebReports.Api.Reports.Report = dapi.ReportObjectFactory.LoadFromRepository("MCCM\Risk\Risk Widgets\Test1")
        '    dapi.Action = wrApiAction.ExecuteReport
        '    If rReportobj.Widgets.Count > 0 Then
        '        Dim oFusionChart As WebReports.Api.Charts.FusionChart =
        '                            rReportobj.Widgets(0)
        '    End If
        '    dapi.ReportObjectFactory.SaveToApi(rReportobj)
        '    ExecuteExago = sExagoRootURL & dapi.GetUrlParamString(sExagoaspx, True)
        'Catch ex As Exception
        '    Write(ex.Message)
        'End Try
        'Response.Redirect(ExecuteExago)
    End Sub
    Public lblReportName As BasePrompt
    Public lblReportDef As BasePrompt
    Public lblReportType As BasePrompt

    Public lblReportTopics As BasePrompt
    Public lblReportParent As BasePrompt
    Public lblDisplayRec As BasePrompt

    Public LinkExagoReport As MTrE.BaseLink
    Private Sub dgReports_BindRowDefine(oDataGrid_In As MTrE.BaseDataGrid,
                                         oBindDatabaseRow_In As MTrE.BindLibrary.BindDatabaseRow,
                                         oDataGridDataTable_In As MTrE.DatabaseTable,
                                         bIsOnDataBind_In As Boolean, iRowIndex_In As Integer) Handles dgReports.BindRowDefine
        Dim currentReportPathItem As MCCMTrE.ExagoReports = oDataGridDataTable_In
        Dim currentReportFilterItem As MCCMTrE.ExagoReports = oDataGridDataTable_In
        Dim currentReportParentID As MCCMTrE.ExagoReports = oDataGridDataTable_In


        If bIsOnDataBind_In Then
            With Me.oReports
                With Me.LinkExagoReport

                    '  .ActionArgItems(TaskInputReportPath) = currentReportPathItem.ExagoReportName.Value

                    .ActionArgItems("ReportName") = currentReportPathItem.ExagoReportName.Value
                    .ActionArgItems("ParentID") = currentReportPathItem.ExagoParentID.Value
                    '.ActionArgItems("ReportFilter") = currentReportFilterItem.ReportFilter.Value
                    .IsRelatedTask = True
                    .IsPopup = "true"
                    .ActionMethod = AddressOf SelectLinkClicked
                    Me.lblReportName.Text = Me.oReports.ExagoReportName.Value
                    Me.lblReportDef.Text = Me.oReports.ExagoReportDefinition.Value
                    Me.lblReportType.Text = Me.oReports.ExagoReportType.Value
                    Me.lblReportTopics.Text = Me.oReports.ExagoReportTopics.Value
                    Me.lblReportParent.Text = Me.oReports.ExagoParentID.Value
                    Me.lblDisplayRec.Text = Me.oReports.ExagoDisplayRecordYN.Value
                    If InStr(lblReportName.Text, ".wrd") > 0 Then
                        lblReportName.Text = lblReportName.Text.Substring(1, InStr(lblReportName.Text, ".wrd") - 1)

                    End If


                End With
            End With
        End If


        'New code to expand data grid

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