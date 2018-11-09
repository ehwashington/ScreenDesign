function OpenHelp(oFrame)
{
    OpenNewBrowswerFromFrame(oFrame,
		GetAJAXResult("MTrE", "BaseDbConn", "GetCurrentCustomerWebSiteURL", "Application=MCCM"),
		800, 625, "Help", "yes");
}