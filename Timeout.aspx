<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="Timeout.aspx.vb" Inherits="ScreenDesign.Timeout" %>
<%@ Register TagPrefix="base" Namespace="MTrE" Assembly="MTrE" %>
<html>
	<head id="Head1" runat="server">
		<title>Timeout</title>
        <link id="link1" href="Morrisey.css" rel="stylesheet" runat="server"/>
		<script type="text/javascript" language="javascript">
		    function ReassertTimeout() {
		        window.location = "Timeout.aspx";
		    }
		</script>
	</head>
	<body class="stdpanelgriddiv" onunload="ReassertTimeout();">
		<form id="Form1" method="post" runat="server">
            <div id="divLogo" runat="server"><img src="Images/MorLogo_Transparent3.png" alt="" style="Z-INDEX:101;POSITION:absolute;TOP:11px;LEFT:15px" /></div>
			<base:BasePrompt id="lblErrorMessage" runat="server" CssClass="errorbox" Height="100px" Width="550px" Font-Bold="True"
				style="Z-INDEX:101;POSITION:absolute;TOP:100px;LEFT:80px" />
			<base:BaseToolbar id="BaseToolbar1" runat="server" HasNewButton="False" HasDeleteButton="False" HasSaveButton="False"
                style="Z-INDEX:101;POSITION:absolute;TOP:109px; LEFT:588px"
				ReturnButton-ImageURL="Images/FormReturn.gif"  ReturnButton-Tooltip="Exit the application"
                ReturnButton-LinkAction="Javascript" ReturnButton-LinkURL="window.close();" />
		</form>
	</body>
</html>

