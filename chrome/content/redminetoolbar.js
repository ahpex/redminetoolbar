var RmTb= {

  urlExists : false,

  Init : function() {
		jQuery.noConflict();
		$ = function(selector,context){ return new jQuery.fn.init(selector,context); };
		$.fn = $.prototype = jQuery.fn;

    // Set the project title to be the current project title
    RmTb.Change_Project_Label();
    window.getBrowser().addProgressListener(RMTB_Listener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);  
  },

  Change_Project_Label : function() {
		$('#RmTb-Project-Button').attr('label', RmTb.getPref('currentproject'));
  },

  Exit : function() {
  },

  loadUrl : function(url) {
    window._content.document.location = url;
    window.content.focus();
  },

  loadPage : function(page) {
    var url = "";
    var host = RmTb.getProjectUrl();
    var currProj = RmTb.getPref('currentproject');
    
    switch(page) {
      case 'MYPAGE':
        url = host + "/my/page";
        break;
      case 'OVERVIEW':
        url = host + "/projects/show/" + currProj + "";
        break;
      case 'ISSUES':
        url = host + "/projects/" + currProj + "/issues";
        break;
      case 'NEWISSUE':
        url = host + "/projects/" + currProj + "/issues/new";
        break;
      case 'NEWS':
        url = host + "/projects/" + currProj + "/news";
        break;
      case 'DOCS':
        url = host + "/projects/" + currProj + "/documents";
        break;
      case 'WIKI':
        url = host + "/wiki/" + currProj + "";
        break;
      case 'FILES':
        url = host + "/projects/list_files/" + currProj + "";
        break;
      case 'REPOSITORY':
        url = host + "/repositories/show/" + currProj + "";
        break;
      default:
        alert('No such page: ' + page);
    }
    RmTb.loadUrl(url);
  },

  getFeed : function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          RmTb.Populate(xhr.responseXML);
        }
      }
    }
    xhr.send(null);
  },

  PopulateActivities : function() {
    var host = RmTb.getProjectUrl();
    var currProj = RmTb.getPref('currentproject');
    var url = host + "/projects/activity/" + currProj + "?format=atom";
    if (RmTb.UrlExists(url)) {
			RmTb.getFeed(url);
		} else {
			url = host + "/projects/" + currProj + "/activity.atom";
			RmTb.getFeed(url);
		}
  },

  UrlExists : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			  if (xhr.status == 200) {
					RmTb.urlExists = true;
				}
			}
		}
		xhr.send(null);
		return RmTb.urlExists;
	},

  Populate : function(doc) {
    // Maximum number of menu items
    const MAXENTRIES = 30;

    // Get the menupopup element that we will be working with
    var menu = document.getElementById("RmTb-Activity-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var resolver = function() { return 'http://www.w3.org/2005/Atom'; };
    var entryElements = doc.evaluate('//myns:entry', doc, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    nbEntries = (entryElements.snapshotLength > MAXENTRIES) ? MAXENTRIES : entryElements.snapshotLength;
    for (var i=0; i < nbEntries; i++) {
      // Get the single item
      var entryItem = entryElements.snapshotItem(i);

      // Create a new menu item to be added
      var tempItem = document.createElement("menuitem");
      
      // Get the label from the feed entry
      var title = entryItem.getElementsByTagName('title')[0].firstChild.nodeValue; 

      // Set the new menu item's label
      tempItem.setAttribute("label", title);
      
      // Add a menu icon
      if (RmTb.StartsWith(title, "Wiki edit"))
        tempItem.setAttribute("class", "RmTb-Activity-Wiki-Edit");
      else if (RmTb.StartsWith(title, "Revision")) 
        tempItem.setAttribute("class", "RmTb-Activity-Changeset");
      else if (RmTb.StartsWith(title, "Feature")) 
        tempItem.setAttribute("class", "RmTb-Activity-Feature");
      else if (RmTb.StartsWith(title, "Patch")) 
        tempItem.setAttribute("class", "RmTb-Activity-Patch");

      // get the URL from the feed entry
      var url = entryItem.getElementsByTagName('link')[0].getAttribute('href');

      // Set the new menu item's action
      tempItem.setAttribute("oncommand", "RmTb.loadUrl('" + url + "');");

      // Add the item to out menu
      menu.appendChild(tempItem);
    }
  },

  StartsWith : function(haystack, needle) {
    return haystack.substr(0, needle.length) === needle;
  },

  Wiki_Populate : function() {
    var menu = document.getElementById("RmTb-Wiki-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list. Skip 
    var skipEntries = 2;
    for (var i=menu.childNodes.length - 1; i >= skipEntries; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.project." + RmTb.getPref("currentproject") + ".wikipage.");
    var children = branch.getChildList("", {});

    for (var j=children.length -1; j >= 0; j--) {
      var link = RmTb.getProjectUrl() + '/wiki/' + RmTb.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
      $('<menuitem>').attr('label', branch.getCharPref(children[j]))
                     .attr('oncommand', "RmTb.loadUrl('" + link + "');")
                     .appendTo('#RmTb-Wiki-Popup');
    }
  },

  getProjectUrl : function() {
    var currentProject = RmTb.getPref('currentproject');
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.projects.name");
    var children = branch.getChildList("", {});
    for (var i = 0; i < children.length; i++) {
    if (prefs.getCharPref("extensions.redminetoolbar.projects.name." + i) == currentProject)
      return prefs.getCharPref("extensions.redminetoolbar.projects.url." + i);
    }
	return "No project";
  },

  getPref : function(pref) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    return branch.getCharPref(pref);
  },

  PopulateProjects : function() {
    var menu = document.getElementById("RmTb-Project-Popup");
    
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.projects.name");
    var children = branch.getChildList("", {});

    while (menu.hasChildNodes())
      menu.removeChild(menu.firstChild);

    for (var i = 0; i < children.length; i++) { 
      var tempItem = document.createElement("menuitem");
      var projectName = branch.getCharPref(children[i]);
      tempItem.setAttribute("label", projectName);
      tempItem.setAttribute("oncommand", "RmTb.Change_Project('" + projectName + "');");
      menu.appendChild(tempItem);
    }
  },

  Change_Project : function(projectName) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    branch.setCharPref("currentproject", projectName);
  },

  showOptions : function() {
    var x = window.openDialog("chrome://redminetoolbar/content/options.xul",
      "Redmine Toolbar Options", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  }
};

var RMTB_Listener = {
  onLocationChange: function(progress, request, location) {
    if (location) {
      // do something on location change
    }
  },

  onProgressChange: function(webprogress, request, curselfprogres, maxselfprogress, curtotalprogress, maxtotalprogress) {},
  onStatusChange: function(webprogress, request, status, message) {}, 
  onSecurityChange: function(webprogress, request, state) {},
  onLinkIconAvailable: function(a) {},
  onStateChange: function(webprogress, request, stateFlags, status) {
    if (stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
      // do something when page has finished loading
    }
  }
};

var redminePrefObserver = {
  register: function() {
    // First we'll need the preference services to look for preferences.
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);

    // For this._branch we ask that the preferences for extensions.myextension. and children
    this._branch = prefService.getBranch("extensions.redminetoolbar.");

    // Now we queue the interface called nsIPrefBranch2. This interface is described as:  
    // "nsIPrefBranch2 allows clients to observe changes to pref values."
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    // Finally add the observer.
    this._branch.addObserver("", this, false);
  },

  unregister: function() {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData) {
    if(aTopic != "nsPref:changed") return;
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
    switch (aData) {
      case "pref1":
        // extensions.myextension.pref1 was changed
        break;
      case "pref2":
        // extensions.myextension.pref2 was changed
        break;
    }
  }
}
redminePrefObserver.register();

function PrefListener(branchName, func) {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService);
  var branch = prefService.getBranch(branchName);
  branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

  this.register = function() {
    branch.addObserver("", this, false);
    branch.getChildList("", { })
          .forEach(function (name) { func(branch, name); });
  };

  this.unregister = function unregister() {
    if (branch)
      branch.removeObserver("", this);
  };

  this.observe = function(subject, topic, data) {
    if (topic == "nsPref:changed")
      func(branch, data);
    };
}

var redminePrefListener = new PrefListener("extensions.redminetoolbar.",
  function(branch, name) {
    switch (name) {
      case "currentproject":
        RmTb.Change_Project_Label(); 
        break;
    }
});
redminePrefListener.register();
