<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="ExagoSecurity.aspx.vb" Inherits="ScreenDesign.ExagoSecurity" %>
<%@ Register TagPrefix="base" Namespace="MTrE" Assembly="MTrE" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <LINK href="MCCMstyle.css" rel="stylesheet" runat="server"/>
	<LINK href="MCCMstyle_Menu.css" rel="stylesheet" runat="server"/>
     <link href="Morrisey.css" rel="stylesheet" type="text/css" runat="server" />
    <script language="javascript" src="../mccm/Scripts/mn_menu_b.js"></script>
    <style type="text/css">
        .Color{
            color:black !important;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
    <div id="DIVX" class="toolbar greyBackground" style="Z-INDEX: 110; POSITION: relative; WIDTH: 740px; TOP: 5px; LEFT: 30px; ms_positioning: FlowLayout">
    	<TABLE id="Table1">
			<TR height="50">
				<TD align="right"><asp:label id="lblGroupSearch" runat="server" CssClass="SearchLabel"
						Width="150px"> Group Search:</asp:label></TD>
				<TD>
                    <asp:DropDownList ID="DropDownList1" runat="server" Height="25px" Width="442px">
                        <asp:ListItem Text="ALLREVS" Selected="True"></asp:ListItem>
                    </asp:DropDownList>
                </TD>
				</TD>
			</TR>
            <TR height="50">
				<TD align="right"><asp:label id="Label1" runat="server" CssClass="SearchLabel"
						Width="150px"> Report Filter:</asp:label></TD>
				<TD>
                    <asp:DropDownList ID="DropDownList2" runat="server"  Height="25px" Width="442px">
                        <asp:ListItem Text="Risk" Selected="True"></asp:ListItem>
                    </asp:DropDownList>
                            </TD>
				</TD>
			</TR>
		</TABLE>
    </div>
	<div style="POSITION: relative; TOP: 10px; LEFT: 30px">
		<TABLE id="Table2" width="740">
			<TR>
				<TD width="680"><asp:validationsummary id="Validationsummary1" style="Z-INDEX: 123; LEFT: 377px" runat="server" Width="290px"
						 CssClass="errorbox"></asp:validationsummary></TD>
                <td>
                    <TABLE class="toolbar greyBackground" id="Table3" cellSpacing="5">
					    <TR>
						    <TD><asp:hyperlink id="Hyperlink1" style="Z-INDEX: 122" tabIndex="220" runat="server" ImageUrl="../mccm/images/FormReturn.gif"
								    BorderStyle="None" BorderWidth="2px" Height="16px"
								    ToolTip="Return" accessKey="R"></asp:hyperlink></TD>
					    </TR>
				    </TABLE>
                </td>
			</TR>
		</TABLE>
	</div>
    <div>
			<base:TabContainer id="MultiPage1" runat="server" Width="735px" Height="410px" style="LEFT: 30px; POSITION: relative; TOP: 20px;">
					<base:TabPanel HeaderText="Report Permissions" id="PageView1" runat="server" style="background-color: #97b4de;"><ContentTemplate>
                        <br />
                        <Table>
                            <tr>
                                <td style="width:300px">

                                    <asp:TreeView ID="TreeView1" runat="server" Font-Names="Arial" SelectedNodeStyle-BackColor="#0971CE" SelectedNodeStyle-ForeColor="Gray" 
                                                  SelectedNodeStyle-HorizontalPadding="5px" HoverNodeStyle-BackColor="Gray" NodeStyle-HorizontalPadding="5px" 
                                                  LeafNodeStyle-HorizontalPadding="5px">
                                        <Nodes>
                                            <asp:TreeNode Text="MCCM" Value="MCCM">
                                                <asp:TreeNode Text="Risk" Value="Risk">
                                                    <asp:TreeNode Text="Risk Dashboard" Value="Risk Dashboard"></asp:TreeNode>
                                                    <asp:TreeNode Text="Risk Export Report" Value="Risk Export Report"></asp:TreeNode>
                                                </asp:TreeNode>
                                                <asp:TreeNode Text="Quality" Value="Quality"></asp:TreeNode>
                                                <asp:TreeNode Text="User Root Folder" Value="User Root Folder">
                                                    <asp:TreeNode Text="User Folder 2" Value="User Folder 2">
                                                        <asp:TreeNode Text="User Report" Value="User Report" Selected="true"></asp:TreeNode>
                                                    </asp:TreeNode>
                                                </asp:TreeNode>
                                            </asp:TreeNode>
                                        </Nodes>
                                        <NodeStyle CssClass="Color" />
                                    </asp:TreeView>

                                </td>
                                <td >
                                    <table>
                                        <tr>
                                            <td align="right">
                                                <TABLE class="toolbar greyBackground" id="Table3" cellSpacing="5">
						                            <TR>
                                                        <td>
                                                            Change code 11.12.18 8:50 AM

                                                        </td>
							                            <TD class="savebttn"><asp:imagebutton id="bttnOK" tabIndex="190" runat="server" ImageUrl="../mccm/images/formsave.gif"
									                            BorderStyle="None" BorderWidth="2px" Tooltip="Save" accessKey="S"></asp:imagebutton></TD>
						                            </TR>
					                            </TABLE>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <asp:Label ID="Label3" runat="server" Text="Access Permission:"></asp:Label>
                                                 <asp:DropDownList ID="DropDownList4" runat="server" Height="25px" Width="200px">
                                                    <asp:ListItem Text="Allow" Selected="True"></asp:ListItem>
                                                </asp:DropDownList>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <base:BaseCheckBox ID="BaseCheckBox1" runat="server" CssClass="labelMTrE" Text="Select All" />
                                                <br />
                                                <table border="1" cellpadding="0px" cellspacing="0px">
                                                    <tr>
                                                        <th style="background-color: #1E376D;">
                                                        </th>
                                                        <th style="background-color: #1E376D; color: white; width: 350px;">
                                                            Action
                                                        </th>
                                                    </tr>
                                                    <tr class="xtd">
                                                        <td>
                                                            <asp:CheckBox ID="CheckBox1" runat="server" Checked="True" />
                                                        </td>
                                                        <td>
                                                            Rename
                                                        </td>
                                                    </tr>
                                                    <tr class="xtdalt">
                                                        <td>
                                                            <asp:CheckBox ID="CheckBox2" runat="server" Checked="True" />
                                                        </td>
                                                        <td>
                                                            Export
                                                        </td>
                                                    </tr>
                                                    <tr class="xtd">
                                                        <td>
                                                            <asp:CheckBox ID="CheckBox3" runat="server" Checked="True" />
                                                        </td>
                                                        <td>
                                                            Edit
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                            
                        </Table>
					</ContentTemplate></base:TabPanel>
                	<base:TabPanel HeaderText="General Permissions" id="TabPanel1" runat="server" style="background-color: #97b4de; TabLabelSelectedColor: #97b4de;" ><ContentTemplate>
                        <br />
                        <table>
                            <tr>
                                <td colspan="2" align="right">
                                    <TABLE class="toolbar greyBackground" id="Table3" cellSpacing="5">
						                <TR>
							                <TD class="savebttn"><asp:imagebutton id="Imagebutton1" tabIndex="190" runat="server" ImageUrl="../mccm/images/formsave.gif"
									                BorderStyle="None" BorderWidth="2px" Tooltip="Save" accessKey="S"></asp:imagebutton></TD>
						                </TR>
					                </TABLE>
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 50px;"></td>
                                <td>
                                    <asp:label id="Label2" runat="server" CssClass="SearchLabel"
						            Width="200px">Ad&nbsp;-&nbsp;Hoc&nbsp;Reporting&nbsp;Option:</asp:label>
                                    <asp:DropDownList ID="DropDownList3" runat="server" Height="25px" Width="150">
                                        <asp:ListItem Text="Build" Selected="True"></asp:ListItem>
                                    </asp:DropDownList><br /><br />
                                    <base:BaseCheckBox ID="chkSelected" runat="server" CssClass="labelMTrE" Text="Select All" />
                                    <table border="1" cellpadding="0px" cellspacing="0px">
                                        <tr>
                                            <th style="background-color: #1E376D;">
                                            </th>
                                            <th style="background-color: #1E376D; color: white; width: 550px;">
                                                Action
                                            </th>
                                        </tr>
                                        <tr class="xtd">
                                            <td>
                                                <asp:CheckBox ID="CheckBox4" runat="server" Checked="true" />
                                            </td>
                                            <td>
                                                Express Report
                                            </td>
                                        </tr>
                                        <tr class="xtdalt">
                                            <td>
                                                <asp:CheckBox ID="CheckBox5" runat="server" Checked="true" />
                                            </td>
                                            <td>
                                                Advanced Report
                                            </td>
                                        </tr>
                                        <tr class="xtd">
                                            <td>
                                                <asp:CheckBox ID="CheckBox6" runat="server" Checked="true" />
                                            </td>
                                            <td>
                                                Crosstab report
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
					</ContentTemplate></base:TabPanel>
			</base:TabContainer>
    </div>
    </form>
</body>
</html>
