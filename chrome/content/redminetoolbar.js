/*
 * This file is part of the Redmine Toolbar, a Firefox addon to manage Redmine projects more easily.
 * Copyright (C) 2010,2011 Michael Pietsch <redminetoolbar@mpietsch.com>
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */ 
var RedmineToolbar= {

  urlExists : false,

  redmineToolbarPrefListener : null,
  
  Init : function() {
    // Initialize and register preferences listener
    RedmineToolbar.redmineToolbarPrefListener = new RedmineToolbar.PrefListener("extensions.redminetoolbar.",
      function(branch, name) {
        switch (name) {
          case "currentproject":
            RedmineToolbar.Change_Project_Label(); 
            break;
        }
    });
    RedmineToolbar.redmineToolbarPrefListener.register();
    
    // Set the project title to be the current project title
    RedmineToolbar.Change_Project_Label();
  },

  Change_Project_Label : function() {
    var projButton = document.getElementById('RedmineToolbar-Project-Button');
    if (projButton)
       projButton.setAttribute('label', RedmineToolbar.getPref('currentproject'));
  },

  Exit : function() {
  },

  loadUrl : function(url) {
    openUILinkIn(encodeURI(url), "current", false, null, null);
  },

  loadPage : function(page) {
    var url = "";
    var urlOld = "";
    var host = RedmineToolbar.getProjectUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    
    switch(page) {
      case 'MYPAGE':
        url = host + "/my/page";
        break;
      case 'OVERVIEW':
        url = host + "/projects/" + currProj;
        urlOld = host + "/projects/show/" + currProj;
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
        url= host + "/projects/" + currProj + "/wiki";
        urlOld = host + "/wiki/" + currProj;
        break;
      case 'FILES':
        url = host + "/projects/" + currProj + "/files";
        urlOld = host + "/projects/list_files/" + currProj;
        break;
      case 'REPOSITORY':
        url = host + "/projects/" + currProj + "/repository";
        urlOld = host + "/repositories/show/" + currProj;
        break;
      default:
        alert('No such page: ' + page);
    }
    if (RedmineToolbar.UrlExists(url)) {
        RedmineToolbar.loadUrl(url);
    } else if (RedmineToolbar.UrlExists(urlOld)) {
        RedmineToolbar.loadUrl(urlOld);
    }
  },

  getFeed : function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          RedmineToolbar.Populate(xhr.responseXML);
        }
      }
    }
    xhr.send(null);
  },

  PopulateActivities : function() {
    var host = RedmineToolbar.getProjectUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/activity/" + currProj + "?format=atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url);
		} else {
			url = host + "/projects/" + currProj + "/activity.atom";
			RedmineToolbar.getFeed(url);
		}
  },

  UrlExists : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			  if (xhr.status == 200) {
					RedmineToolbar.urlExists = true;
				}
			}
		}
		xhr.send(null);
		return RedmineToolbar.urlExists;
	},

  Populate : function(doc) {
    if (doc == null) {
       return;
    }

    // Maximum number of menu items
    const MAXENTRIES = 30;

    // Get the menupopup element that we will be working with
    var menu = document.getElementById("RedmineToolbar-Activity-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var resolver = function() { return 'http://www.w3.org/2005/Atom'; };
    var entryElements = doc.evaluate('//myns:entry', doc, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    nbEntries = (entryElements.snapshotLength > MAXENTRIES) ? MAXENTRIES : entryElements.snapshotLength;
    for (var i=0; i < nbEntries; i++) {
       (function(i) {
          // Get the single item
          var entryItem = entryElements.snapshotItem(i);

          // Create a new menu item to be added
          var tempItem = document.createElement("menuitem");

          // Get the label from the feed entry
          var title = entryItem.getElementsByTagName('title')[0].firstChild.nodeValue;

          // Set the new menu item's label
          tempItem.setAttribute("label", title);

          // Add a menu icon
          if (RedmineToolbar.StartsWith(title, "Wiki edit"))
            tempItem.setAttribute("class", "RedmineToolbar-Activity-Wiki-Edit");
          else if (RedmineToolbar.StartsWith(title, "Revision"))
            tempItem.setAttribute("class", "RedmineToolbar-Activity-Changeset");
          else if (RedmineToolbar.StartsWith(title, "Feature"))
            tempItem.setAttribute("class", "RedmineToolbar-Activity-Feature");
          else if (RedmineToolbar.StartsWith(title, "Patch"))
            tempItem.setAttribute("class", "RedmineToolbar-Activity-Patch");

          // get the URL from the feed entry
          var url = entryItem.getElementsByTagName('link')[0].getAttribute('href');

          // Set the new menu item's action
          tempItem.addEventListener("click", function() {
            RedmineToolbar.loadUrl(url);
          }, false);

          // Add the item to out menu
          menu.appendChild(tempItem);
       }) (i);
    }
  },

  StartsWith : function(haystack, needle) {
    return haystack.substr(0, needle.length) === needle;
  },

  Wiki_Populate : function() {
    var menu = document.getElementById("RedmineToolbar-Wiki-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list. Skip
    var skipEntries = 3;
    for (var i=menu.childNodes.length - 1; i >= skipEntries; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.project." + RedmineToolbar.getPref("currentproject") + ".wikipage.");
    var children = branch.getChildList("", {});

    for (var j=children.length -1; j >= 0; j--) {
      (function (i) {
        var link = RedmineToolbar.getProjectUrl() + '/wiki/' + RedmineToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
        var tempItem = document.createElement("menuitem");
        tempItem.setAttribute("label", branch.getCharPref(children[j]));
        var link = RedmineToolbar.getProjectUrl() + '/wiki/' + RedmineToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
        tempItem.addEventListener("click", function() {
           RedmineToolbar.loadUrl(link);
        }, false);
        menu.appendChild(tempItem);
      }) (i);
    }
  },

  getProjectUrl : function() {
    var currentProject = RedmineToolbar.getPref('currentproject');
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
    var menu = document.getElementById("RedmineToolbar-Project-Popup");
    
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.projects.name");
    var children = branch.getChildList("", {});

    while (menu.hasChildNodes())
      menu.removeChild(menu.firstChild);

    for (var i = 0; i < children.length; i++) {
       (function (i) {
          var tempItem = document.createElement("menuitem");
          var projectName = branch.getCharPref(children[i]);
          tempItem.setAttribute("label", projectName);
          tempItem.addEventListener("click", function() {
            RedmineToolbar.Change_Project(projectName);
          }, false);
          menu.appendChild(tempItem);
       }) (i);
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
  },
  
  showWikipagesDialog : function() {
    var x = window.openDialog("chrome://redminetoolbar/content/wikipages.xul",
      "Redmine Toolbar Wikipages", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  },
  
  showAboutDialog : function() {
    var x = window.openDialog("chrome://redminetoolbar/content/about.xul",
      "Redmine Toolbar About", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  },

  PrefListener : function(branchName, func) {
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
  },

  search : function(event) {
    if (event.keyCode == 13) {
        var host = RedmineToolbar.getProjectUrl();
        var currProj = RedmineToolbar.getPref('currentproject');
        url = host + "/search/index/" + currProj + "?q=" + document.getElementById("RedmineToolbar-Search-Textbox").value + "&submit=Submit";

        // Search what
        if (document.getElementById("RedmineToolbar-Search-What-AllWords").getAttribute("checked") == "true")
           url += "&all_words=1";
        if (document.getElementById("RedmineToolbar-Search-What-TitlesOnly").getAttribute("checked") == "true")
           url += "&titles_only=1";

        // Search conditions
        if (document.getElementById("RedmineToolbar-Search-Condition-Wikipages").getAttribute("checked") == "true")
           url += "&wiki_pages=1";
        if (document.getElementById("RedmineToolbar-Search-Condition-Issues").getAttribute("checked") == "true")
           url += "&issues=1";
        if (document.getElementById("RedmineToolbar-Search-Condition-Changesets").getAttribute("checked") == "true")
           url += "&changesets=1";
        if (document.getElementById("RedmineToolbar-Search-Condition-Messages").getAttribute("checked") == "true")
           url += "&messages=1";
        if (document.getElementById("RedmineToolbar-Search-Condition-News").getAttribute("checked") == "true")
           url += "&news=1";

        RedmineToolbar.loadUrl(url);
    }
  }

}; // End of RedmineToolbar
