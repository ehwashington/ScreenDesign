//v.2.1 build 90226

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
To use this component please contact sales@dhtmlx.com to obtain license
*/
dhtmlXTabBar.prototype._cells= function(wins,id,name){if (!this.wins[id]){var win=wins.createWindow(id,0,0,100,100);win.setText((typeof name == "undefined")?id:name);this.attachWindow(win)};return this.wins[id]};dhtmlXTabBar.prototype.wins = {};dhtmlXTabBar.prototype.attachWindow = function(win) {if (this.wins == dhtmlXTabBar.prototype.wins)this.wins={};this.wins[win.idd] = win;this.dockWindow(win.idd)};dhtmlXTabBar.prototype.dockWindow = function(windowId) {if (this.wins[windowId] == null){return};if (this.wins[windowId]._isDocked == true){return};var win = this.wins[windowId];if (!this.tabsId[windowId])this.addTab(win.getId(), win.getText(), "*");var data = win._content;data.parentNode.removeChild(data);win.hide();this.setContent(win.getId(), data);data.style.width = "100%";data.style.height = "100%"};dhtmlXTabBar.prototype.unDockWindow = function(windowId) {};
//v.2.1 build 90226

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
To use this component please contact sales@dhtmlx.com to obtain license
*/