var RedmineToolbar_Options = {

  load : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.environments.");

    // List of environemnts
    var names = branch.getChildList("name.", {});
    for (var i = 0; i < names.length; i++) {
      RedmineToolbar_Options.addToEnvironmentList(
        branch.getCharPref("name." + i),
        branch.getCharPref("url." + i));
    }
  },

  save : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.");
 
    // Remove all environments first ...  
    branch.deleteBranch("environments.name");
    branch.deleteBranch("environments.url");

    // and add them again
    var environmentList = document.getElementById("RedmineToolbar-Opt-Environments");
    var environments = environmentList.getElementsByTagName("listitem");
    for (var i = 0; i < environments.length; i++) {
      var items = environments[i].childNodes;
      branch.setCharPref("environments.name." + i, items[0].getAttribute("label"));
      branch.setCharPref("environments.url." + i, items[1].getAttribute("label"));
    }
  },

  addOrEditEnvironment : function() {
    if (   document.getElementById("RedmineToolbar-Opt-AddEditName").value != ""
        && document.getElementById("RedmineToolbar-Opt-AddEditUrl").value != "") {
      RedmineToolbar_Options.addToEnvironmentList(
        document.getElementById("RedmineToolbar-Opt-AddEditName").value,
        document.getElementById("RedmineToolbar-Opt-AddEditUrl").value); 
    }
  },

  addToEnvironmentList : function(name, url) {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.redminetoolbar.");
    var environmentList = document.getElementById("RedmineToolbar-Opt-Environments");
    var environment = document.createElement("listitem");
    var pName = document.createElement("listcell");
    pName.setAttribute("label", name);
    var pUrl  = document.createElement("listcell");
    pUrl.setAttribute("label", url);
    environment.appendChild(pName);
    environment.appendChild(pUrl);
    environmentList.appendChild(environment);
  },

  removeAllEnvironments : function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};
    var result = prompts.confirmCheck(window, "Redmine Toolbar", 
                        "Do you really want to remove all Environments?",
                        "Do not ask me again", check);

    if (result) {
      var environmentList = document.getElementById("RedmineToolbar-Opt-Environments");
      var elements = environmentList.getElementsByTagName("listitem");
      for (var i = elements.length-1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]); 
      }
    }
  },

  removeEnvironment : function() {
    var environmentList = document.getElementById("RedmineToolbar-Opt-Environments");
    var elements = environmentList.getElementsByTagName("listitem");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].hasAttribute("selected"))
        elements[i].parentNode.removeChild(elements[i]); 
    }
  } 
};
