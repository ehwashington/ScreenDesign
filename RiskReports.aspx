<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="RiskReports.aspx.vb" Inherits="MCCMExagoReports.RiskReports" %>
<%@ Register TagPrefix="base" Namespace="MTrE" Assembly="MTrE" %>


<html>
<head runat="server">
    <title>Risk Reports</title>
  
 
    <link href="Morrisey.css" rel="stylesheet" type="text/css" runat="server" />
 

   
</head>
<body>
    <form id="form1" runat="server">
        
       <asp:Panel ID="Panel1" runat="server" CssClass="f1Major" HorizontalAlign="Center" Height="144px" Font-Size="Large"  >
          <div></div>

           <div></div>
           <asp:Label ID="lblheader"  Text="Data Analytics Reporting"    runat="server" Font-Size="Large" ></asp:Label>
          
          
        </asp:Panel>

   <table id="tableHeader" runat="server" cellpadding="0" cellspacing="0" style="position: relative; left: 0px; top: 30px;">
   
        
        <tr>
<td>
   
    <base:BaseDataGrid ID="dgReports"
             runat="server" AutoGenerateColumns="False"
        Width="1024px" TotalGridWidth="1024" TotalGridHeight="400" CssClass="GridWhiteBorder">
        <HeaderStyle CssClass="SoftHeaderHighlight" HorizontalAlign="center" />
        <ItemStyle CssClass="SoftRowHighlight" HorizontalAlign="center" />
        <AlternatingItemStyle CssClass="SoftRowHighlight" HorizontalAlign="center" />
        <Columns>
            <asp:TemplateColumn HeaderStyle-Height="0px" ItemStyle-VerticalAlign="Top">
                 <ItemStyle HorizontalAlign="Center" CssClass="GridSoftBorder" Width="230px" Height="20"/>
                 <ItemTemplate>
                 
                    <base:BaseLink ID="LinkExagoReport"  runat="server">
                        
                        <ClickableRegion>
                            <Template>
                               
                                    <table cellpadding="0" cellspacing="0">
                                      
                                            
                                               <tr >
                                            <td >
                                                <base:BasePrompt ID="lblReportName" runat="server" Height="20" Width="180px" CssClass="GridSmallFont"></base:BasePrompt>

                                            </td>
                                            <td >
                                               
                                                <base:BasePrompt ID="lblReportTopics"  runat="server" width ="660px" CssClass="GridSmallFont" Height="20"></base:BasePrompt>

                                            </td>
                                             <td >
                                                <base:BasePrompt ID="lblReportDef"  runat="server" width ="660px" CssClass="GridSmallFont" Height="20"></base:BasePrompt>

                                            </td>
                                                 
                                            <td >
                                                <base:BasePrompt ID="lblReportParent"  runat="server" CssClass="General" Visible="false"></base:BasePrompt>
                                            </td>
                                            <td >
                                             
                                               <base:BasePrompt ID="lblReportType"  runat="server" CssClass="General" Visible="false"></base:BasePrompt>
                                                 <base:BasePrompt ID="lblDisplayRec"  runat="server" CssClass="General" Visible="false"></base:BasePrompt>
                                            </td>
                                        </\tr>
                                    </table>

                              
                            </Template>

                        </ClickableRegion>

                    </base:BaseLink>
                </ItemTemplate>
            </asp:TemplateColumn>
        </Columns>
    </base:BaseDataGrid>
      
   
</td>

      </tr>
       
       
         </table>
    </form>
</body>
</html>
