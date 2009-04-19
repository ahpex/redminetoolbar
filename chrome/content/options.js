var RmTb_Options = {

  load : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.");

    // General
    document.getElementById("RmTb-Opt-Host").value = branch.getCharPref("host");
	},

  save : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.");

    // General
    branch.setCharPref("host", document.getElementById("RmTb-Opt-Host").value);
  }

};
