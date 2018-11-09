<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="RiskReporting.aspx.vb" Inherits="ScreenDesign.RiskReporting" %>
<%@ Register TagPrefix="base" Namespace="MTrE" Assembly="MTrE" %>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
     <link href="Morrisey.css" rel="stylesheet" type="text/css" runat="server" />
    <script language="javascript" src="../mccm/Scripts/mn_menu_b.js"></script>
</head>
<body>
    <form id="Form1" runat="server">
      <div id="divContainer2" runat="server" class="Container2" style="width: 1024px;border:none">
          <table id="tblHeader" runat="server" style="border:none; background-color: #CDCDCD">
               
              
               <tr >
                    <td  > 


                       
                       
                        
                             <div id="div3" runat="server" class="Container2" style="width: 904px;background-color: #CDCDCD;Height:20px;vertical-align:middle;color:#1E326D; font-size: 20pt; align-items:center;text-align:center;border:none;" >
                       
                                                        
                    
                              </div>
                        
                        </td>
                            
                    <td>
                         
                            <div id="div4" runat="server" class="Container2" style="width: 100px;background-color: #CDCDCD;Height:20px;vertical-align:middle;color:#1E326D; font-size: 20pt; align-items:center;text-align: left;border: none; " >
                         
                           
                  </div>
                        </td>
                   
                </tr>
              
              
              
              
              
              
               <tr >
                    <td  > 


                       
                       
                        
                             <div id="div1" runat="server" class="Container2" style="width: 904px;background-color: ##CDCDCD;Height:50px;vertical-align:middle;color:#1E326D; font-size: 23pt; align-items:center;text-align:center;border: 0px solid #1f1f65;  border-left: 0px solid #1f1f65; border-right:0px solid #1f1f65; border-top:0px; " >
                       
                            
                      
                               <base:BasePrompt ID="lblReportHeader" runat="server" Text="Risk Management Dashboard & Analytics"  ForeColor="#1E326D" Font-Size="23pt" 
                            CssClass="HdrTitleReport"></base:BasePrompt>
                              
                    
                              </div>
                        
                        </td>
                            
                    <td>
                         
                            <div id="div2" runat="server" class="Container2" style="width: 100px;background-color: #CDCDCD;Height:50px;vertical-align:middle;color:#1E326D; font-size: 20pt; align-items:center;text-align: left;border: 0px solid #1f1f65;  border-left: 0px solid #1f1f65; border-right:0px solid #1f1f65; border-top:0px; " >
                         
                            <base:BaseLink   id="linkReturn" ImageURL= "../mccm/images/FormReturn.gif" ToolTip="Return" runat="server" style="Z-INDEX: 122" accessKey="R" tabIndex="220" BorderWidth="0px" Width="25px" Height="25px" BackColor="#ffffff"></base:BaseLink>
                  </div>
                        </td>
                   
                </tr>


          </table>
       
          
             <table id="tblReports" runat="server" style="width: 1024px;">
              
              
             


                <tr>
                    <td>
                        <base:BaseDataGrid ID="dgReports" runat="server" Style="left: 0px;" AutoGenerateColumns="False"
                            TotalGridHeight="353" Width="1004px" TotalGridWidth="1024" CssClass="GridWhiteBorder" >
                            <HeaderStyle CssClass="SoftHeaderHighlight" HorizontalAlign="Left" />
                            <ItemStyle CssClass="SoftRowHighlight" HorizontalAlign="Left"   />
                            <AlternatingItemStyle CssClass="SoftRowHighlightAlt" HorizontalAlign="Left" />
                            <Columns>
                                <asp:TemplateColumn>
                                    <HeaderStyle CssClass="SoftHeaderHighlight"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignCenter" Width="100px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BaseLink ID="LinkExagoReport" runat="server" Text="Execute Report" CssClass="LinkRegular" />
                                    </ItemTemplate>
                                </asp:TemplateColumn>
                                 <asp:TemplateColumn HeaderText="Report">
                                    <HeaderStyle CssClass="SoftHeaderHighlight PadLeftExtra GridSmallFont"  Width="250px">
                                    </HeaderStyle>
                                    <ItemStyle CssClass="GridSoftBorder" Width="250px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblReportName" runat="server" CssClass="PadLeftExtra LargeName"></base:BasePrompt>
                                    </ItemTemplate>
                                </asp:TemplateColumn>
                                <asp:TemplateColumn HeaderText="Description">
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="250px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="524px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblReportDef" runat="server"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                                <asp:TemplateColumn HeaderText="Key Metrics" Visible="false">
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="0px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="0px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblReportTopics" runat="server" Visible="false"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                               <asp:TemplateColumn >
                                    <HeaderStyle CssClass="SoftHeaderHighlight" ></HeaderStyle> 
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignCenter" Width="150px" Height="40px" />
                                    <ItemTemplate>
                                       <base:BaseLink id="linkImage" runat="server"  ToolTip="Displays a sample report" Text="Report Sample" CssClass="LinkRegular" Visible="false" >

                                       </base:BaseLink>
                                     
                                    </ItemTemplate>
                                   </asp:TemplateColumn>
                               
                                  <asp:TemplateColumn >
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="0px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="0px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblReportParent" runat="server" Visible="false"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                                <asp:TemplateColumn >
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="0px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="0px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblReportType" runat="server" Visible="false"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                                 <asp:TemplateColumn >
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="0px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="0px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblDisplayRec" runat="server" Visible="false"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                                  <asp:TemplateColumn >
                                    <HeaderStyle CssClass="GridSmallFont AlignLeft SoftHeaderHighlight" Width="0px"></HeaderStyle>
                                    <ItemStyle CssClass="GridSmallFont GridSoftBorder AlignLeft" Width="0px" Height="40px" />
                                    <ItemTemplate>
                                        <base:BasePrompt ID="lblRecordID" runat="server" Visible="false"></base:BasePrompt><br />
                                      </ItemTemplate>
                                </asp:TemplateColumn>
                                
                            </Columns>
                        </base:BaseDataGrid>
                    </td>
                </tr>
            </table>

      </div>
    </form>
    <script language="javaScript">
function fnClose() {
	window.close();
}

		</script>
	</BODY>
</body>
</html>
