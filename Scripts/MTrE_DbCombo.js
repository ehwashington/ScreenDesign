function DbComboGetText(sComboId)
{
	var oCombo = document.getElementById(sComboId);
	return oCombo.value;
}
function DbComboGetValue(sComboId)
{
	var oCombo = document.getElementById(sComboId);
	return AppRoot.BaseComboGetHiddenValue(window, oCombo).value;
}
function DbComboSendRequestButton(sComboId)
{
	var oCombo = document.getElementById(sComboId);
	oCombo.GetResults();
}
function DbComboClear(sComboId)
{
	var oCombo = document.getElementById(sComboId);
	oCombo.Clear();
}
function DbComboChangeText(sComboId, sComboText)
{
	var oCombo = document.getElementById(sComboId);
	oCombo.ClearResults();
	AppRoot.BaseComboGetHiddenValue(window, oCombo).value = '';
	oCombo.LastValue = '';
	oCombo.LastText = '';
	oCombo.LastValueText = '';
	oCombo.value = sComboText;
	oCombo.GetResults();
}
function DbComboStateChanged(sComboId)
{
	var oCombo = document.getElementById(sComboId);
	oCombo.ClearResults();
}
