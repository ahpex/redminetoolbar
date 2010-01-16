var RedmineToolbar_Wikipages = {

  load : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);
	const curProj = prefService.getBranch("extensions.redminetoolbar.").getCharPref("currentproject");
    const branch = prefService.getBranch("extensions.redminetoolbar.project." + curProj + ".wikipage.");
    
	// List of projects
    var names = branch.getChildList("", {});
    for (var i = 0; i < names.length; i++) {
      RedmineToolbar_Wikipages.addToList(branch.getCharPref(i));
    }
  },

  save : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.");
	const curProj = prefService.getBranch("extensions.redminetoolbar.").getCharPref("currentproject");
 
    // Remove all wiki pages first ...  
    branch.deleteBranch("project." + curProj + ".wikipage");

    // and add them again
    var pagesList = document.getElementById("RedmineToolbar-Wikipages-Pages");
    var pages = pagesList.getElementsByTagName("listitem");
    for (var i = 0; i < pages.length; i++) {
      var items = pages[i].childNodes;
      branch.setCharPref("project." + curProj + ".wikipage." + i, items[0].getAttribute("label"));
    }
  },

  addOrEdit: function() {
    if (document.getElementById("RedmineToolbar-Wikipage-AddEditName").value != "") {
      RedmineToolbar_Wikipages.addToList(document.getElementById("RedmineToolbar-Wikipage-AddEditName").value);
    }
  },

  addToList : function(name) {
    var pagesList = document.getElementById("RedmineToolbar-Wikipages-Pages");
    var pages = document.createElement("listitem");
    var pName = document.createElement("listcell");
    pName.setAttribute("label", name);
    pages.appendChild(pName);
    pagesList.appendChild(pages);
  },

  removeAll: function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};
    var result = prompts.confirmCheck(window, "Redmine Toolbar", 
                        "Do you really want to remove all wiki pages?",
                        "Do not ask me again", check);

    if (result) {
      var pagesList = document.getElementById("RedmineToolbar-Wikipages-Pages");
      var elements = pagesList.getElementsByTagName("listitem");
      for (var i = elements.length-1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]); 
      }
    }
  },

  remove: function() {
    var pagesList = document.getElementById("RedmineToolbar-Wikipages-Pages");
    var elements = pagesList.getElementsByTagName("listitem");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].hasAttribute("selected"))
        elements[i].parentNode.removeChild(elements[i]); 
    }
  } 
};
