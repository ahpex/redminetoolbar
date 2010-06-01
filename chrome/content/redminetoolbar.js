var RedmineToolbar= {

  urlExists : false,

  redmineToolbarPrefListener : null,
  
  Init : function() {
    // Initialize and register preferences listener
    RedmineToolbar.redmineToolbarPrefListener = new RedmineToolbar.PrefListener("extensions.redminetoolbar.",
      function(branch, name) {
        switch (name) {
          case "currentenvironment":
            RedmineToolbar.Change_Environment_Label(); 
            break;
          case "currentprojectname":
            RedmineToolbar.Change_Project_Label(); 
            break;
        }
    });
    RedmineToolbar.redmineToolbarPrefListener.register();
    
    // Set the project title to be the current project title
    RedmineToolbar.Change_Environment_Label();
    RedmineToolbar.Change_Project_Label();
  },

  Change_Environment_Label : function() {
    var envButton = document.getElementById('RedmineToolbar-Environment-Button');
    if (envButton)
       envButton.setAttribute('label', RedmineToolbar.getPref('currentenvironment'));
  },

  Change_Project_Label : function() {
    var projButton = document.getElementById('RedmineToolbar-Project-Button');
    if (projButton)
       projButton.setAttribute('label', RedmineToolbar.getPref('currentprojectname'));
  },

  Exit : function() {
  },

  loadUrl : function(url) {
    window._content.document.location = url;
    window.content.focus();
  },

  loadPage : function(page,searchTerms) {
    var url = "";
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    
    switch(page) {
      case 'MYPAGE':
        url = host + "/my/page";
        break;
      case 'SEARCH':
        searchWords = searchTerms.split(" ").join("+");
        url = host + "/search/index/" + currProj + "?q=" + searchWords;
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
    RedmineToolbar.loadUrl(url);
  },

  getFeed : function(url, what, sorted) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          RedmineToolbar.Populate(xhr.responseXML, what, sorted);
        }
      }
    }
    xhr.send(null);
  },

  PopulateNews : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/" + currProj + "/news.atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url,"News", false);
		} else {
			url = host + "/projects/" + currProj + "/news.atom";
			RedmineToolbar.getFeed(url,"News", false);
		}
  },


  PopulateIssues : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/" + currProj + "/issues.atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url,"Issues", false);
		} else {
			url = host + "/projects/" + currProj + "/issues.atom";
			RedmineToolbar.getFeed(url,"Issues", false);
		}
  },
  
  PopulateRevisions : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/" + currProj + "/repository/revisions.atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url,"Revisions", false);
		} else {
			url = host + "/projects/" + currProj + "/repository/revisions.atom";
			RedmineToolbar.getFeed(url,"Revisions", false);
		}
  },

  PopulateActivities : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/activity/" + currProj + "?format=atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url,"Activity", false);
		} else {
			url = host + "/projects/" + currProj + "/activity.atom";
			RedmineToolbar.getFeed(url,"Activity", false);
		}
  },

  PopulateForums : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/projects/" + currProj + "/boards?format=atom";
    if (RedmineToolbar.UrlExists(url)) {
			RedmineToolbar.getFeed(url,"Forums", false);
		} else {
			url = host + "/projects/" + currProj + "/boards?format=atom";
			RedmineToolbar.getFeed(url,"Forums", false);
		}
  },

  CheckRepository : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var currProj = RedmineToolbar.getPref('currentproject');
    var url = host + "/repositories/show/" + currProj;
	  var button = document.getElementById("RedmineToolbar-Repository-Button")

    button.setAttribute("disabled",false);

    if (!RedmineToolbar.UrlExists(url)) {
      button.setAttribute("disabled",true);
    }
  },

  UrlExists : function(url) {
		var xhr = new XMLHttpRequest();
    var exists = false;
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

  Populate : function(doc, what, sorted) {
    // Maximum number of menu items
    const MAXENTRIES = 30;

    // Get the menupopup element that we will be working with
    var menu = document.getElementById("RedmineToolbar-" + what + "-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var resolver = function() { return 'http://www.w3.org/2005/Atom'; };
    var entryElements = doc.evaluate('//myns:entry', doc, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    nbEntries = (entryElements.snapshotLength > MAXENTRIES) ? MAXENTRIES : entryElements.snapshotLength;
 
    var sortedArrayNames = [];
    var sortedArrayURLs = [];
    
    for (var i = 0; i < nbEntries; i++) {
      
      var itemSort = entryElements.snapshotItem(i);
      var title = itemSort.getElementsByTagName('title')[0].firstChild.nodeValue;
      var url = itemSort.getElementsByTagName('link')[0].getAttribute('href');

      sortedArrayNames[i] = title
      sortedArrayURLs[i] = [title, url]
    }

    if ( sorted && nbEntries > 1) {
      sortedArrayNames.sort();
    }

    if(what == "Issues") {
      host = RedmineToolbar.getProjectUrl();
      tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", "Go to Issues Page");
      tempItem.setAttribute("class", "RedmineToolbar-Issue-Goto");
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + host + "/issues"  + "');");

      menu.appendChild(tempItem);

      tempItem = document.createElement("menuseparator");

      menu.appendChild(tempItem);
    }else if(what == "News") {
      host = RedmineToolbar.getProjectUrl();
      tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", "Go to News Page");
      tempItem.setAttribute("class", "RedmineToolbar-News-MenuItem");
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + host + "/news"  + "');");

      menu.appendChild(tempItem);

      tempItem = document.createElement("menuseparator");

      menu.appendChild(tempItem);
    }else if(what == "Activity") {
      host = RedmineToolbar.getProjectUrl();
      tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", "Go to Activity Page");
      tempItem.setAttribute("class", "RedmineToolbar-Activity-MenuItem");
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + host + "/activity"  + "');");

      menu.appendChild(tempItem);

      tempItem = document.createElement("menuseparator");

      menu.appendChild(tempItem);
    }else if(what == "Revisions") {
      host = RedmineToolbar.getProjectUrl();
      tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", "Go to Repository Page");
      tempItem.setAttribute("class", "RedmineToolbar-Repository-MenuItem");
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + host + "/repository"  + "');");

      menu.appendChild(tempItem);

      tempItem = document.createElement("menuseparator");

      menu.appendChild(tempItem);
    }else if(what == "Forums") {
      host = RedmineToolbar.getProjectUrl();
      tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", "Go to Forums Page");
      tempItem.setAttribute("class", "RedmineToolbar-Forums-MenuItem");
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + host + "/boards"  + "');");

      menu.appendChild(tempItem);

      tempItem = document.createElement("menuseparator");

      menu.appendChild(tempItem);
    }

    for ( var i = 0; i < nbEntries; i++) {

      // Get the label from the feed entry
      var title = sortedArrayNames[i];

      // get the URL from the feed entry
      var url = RedmineToolbar.findUrlInArray(title, sortedArrayURLs)

      // Create a new menu item to be added
      var tempItem = document.createElement("menuitem");
           
      // Add a menu icon
      if (RedmineToolbar.StartsWith(title, "Support"))
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Support");
      else if (RedmineToolbar.StartsWith(title, "Bug") && RedmineToolbar.ContentsWord(title, "Fixed")) 
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Bug-Fixed");
      else if (RedmineToolbar.StartsWith(title, "Bug")) 
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Bug");
      else if (RedmineToolbar.StartsWith(title, "Feature") && RedmineToolbar.ContentsWord(title, "Fixed")) 
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Task-Fixed");
      else if (RedmineToolbar.StartsWith(title, "Feature") && (RedmineToolbar.ContentsWord(title, "Closed") || RedmineToolbar.ContentsWord(title, "Deferred"))) 
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Task-Closed");
      else if (RedmineToolbar.StartsWith(title, "Feature")) 
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Feature");
      else if (RedmineToolbar.StartsWith(title, "Task") && RedmineToolbar.ContentsWord(title, "Fixed"))
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Task-Fixed");
      else if (RedmineToolbar.StartsWith(title, "Task") && (RedmineToolbar.ContentsWord(title, "Closed") || RedmineToolbar.ContentsWord(title, "Deferred")))
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Task-Closed");
      else if (RedmineToolbar.StartsWith(title, "Task"))
        tempItem.setAttribute("class", "RedmineToolbar-Issue-Task");
      else if (RedmineToolbar.StartsWith(title, "Patch")) 
        tempItem.setAttribute("class", "RedmineToolbar-Activity-Patch");
      else if (RedmineToolbar.StartsWith(title, "Revision")) 
        tempItem.setAttribute("class", "RedmineToolbar-Activity-Changeset");
      else if (RedmineToolbar.StartsWith(title, "Wiki-Edit")) 
        tempItem.setAttribute("class", "RedmineToolbar-Activity-Wiki-Edit");
      else if ( what == "Projects" )
        tempItem.setAttribute("class", "RedmineToolbar-Project-MenuItem");
      else if ( what == "News" )
        tempItem.setAttribute("class", "RedmineToolbar-News-MenuItem");
      else if ( what == "Forums" )
        tempItem.setAttribute("class", "RedmineToolbar-Forums-MenuItem");
      else if (RedmineToolbar.StartsWith(title, "Document") || RedmineToolbar.ContentsWord(title, "pdf")) 
        tempItem.setAttribute("class", "RedmineToolbar-Activity-Document");

      if( what == "Projects") {
        title = title.split(" - ")[0]  
      } else if(what == "Revisions") {
        title = title.split(":")[1]
      }

      // Set the new menu item's label
      tempItem.setAttribute("label", title);

      // Set the new menu item's action
      if( what != "Projects") {
        tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + url + "');");
      } else {
        tempItem.setAttribute("oncommand", "RedmineToolbar.Change_Project('" + title + "','" + RedmineToolbar.getProjectRef(url) + "');");
      }

      // Add the item to out menu
      menu.appendChild(tempItem);
    }
  },

  searchListener : function(e) {
    var keyPressed = e.keyCode;
    var container = e.target;

    if(keyPressed == 13) {
      RedmineToolbar.Search();
    }
  },

  Search : function() {
    var searchWords = document.getElementById("RedmineToolbar-Search-MenuList").value
    if (searchWords != "" && searchWords != "Search" && searchWords.length > 2) {
      RedmineToolbar.loadPage('SEARCH', searchWords);
    }
  },

  findUrlInArray : function(needle, haystack) {
    for(var i = 0; i < haystack.length; i ++) {
      if(needle == haystack[i][0]) {
        return haystack[i][1];  
      }  
    }
    return "not found!"
  },

  getProjectRef : function(url) {
    splitted = url.split("/")
    return splitted[splitted.length - 1]
  },

  ContentsWord : function(haystack, needle) {
    return haystack.indexOf("(" + needle + ")") != -1;
  },

  StartsWith : function(haystack, needle) {
    return haystack.substr(0, needle.length) === needle;
  },

  Wiki_Populate : function() {
    var menu = document.getElementById("RedmineToolbar-Wiki-Popup");

    var skipEntries = 3;
    for (var i=menu.childNodes.length - 1; i >= skipEntries; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.project." + RedmineToolbar.getPref("currentproject") + ".wikipage.");
    var children = branch.getChildList("", {});

    for (var j=children.length -1; j >= 0; j--) {
      var link = RedmineToolbar.getEnvironmentUrl() + '/wiki/' + RedmineToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
      var tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", branch.getCharPref(children[j]));
      tempItem.setAttribute("class", "RedmineToolbar-Wiki-Page");
      var link = RedmineToolbar.getEnvironmentUrl() + '/wiki/' + RedmineToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
      tempItem.setAttribute("oncommand", "RedmineToolbar.loadUrl('" + link + "');");
      menu.appendChild(tempItem);
    }
  },

  getEnvironmentUrl : function() {
    var currentEnvironment = RedmineToolbar.getPref('currentenvironment');
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.environments.name");
    var children = branch.getChildList("", {});
    for (var i = 0; i < children.length; i++) {
    if (prefs.getCharPref("extensions.redminetoolbar.environments.name." + i) == currentEnvironment)
      return prefs.getCharPref("extensions.redminetoolbar.environments.url." + i);
    }
	return "No project";
  },

  getProjectUrl : function() {
    var urlEnvironment = RedmineToolbar.getEnvironmentUrl();
    var currentProject = RedmineToolbar.getPref('currentproject');
    return urlEnvironment + "/projects/" + currentProject;
   },

  getPref : function(pref) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    return branch.getCharPref(pref);
  },

  // Temporal changes to the functions to see if we can set up the
  // projects from a Certain URL
  PopulateEnvironments : function() {
    var menu = document.getElementById("RedmineToolbar-Environment-Popup");
    
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.environments.name");
    var children = branch.getChildList("", {});

    while (menu.hasChildNodes())
      menu.removeChild(menu.firstChild);

    for (var i = 0; i < children.length; i++) { 
      var tempItem = document.createElement("menuitem");
      var environmentName = branch.getCharPref(children[i]);
      tempItem.setAttribute("label", environmentName);
      tempItem.setAttribute("class", "RedmineToolbar-Environment-MenuItem");
      tempItem.setAttribute("oncommand", "RedmineToolbar.Change_Environment('" + environmentName + "');");
      menu.appendChild(tempItem);
    }
  },

  PopulateProjects : function() {
    var host = RedmineToolbar.getEnvironmentUrl();
    var urlProjects = host + "/projects.atom";
    RedmineToolbar.getFeed(urlProjects, "Projects", true);
  },

  Change_Environment : function(environmentName) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    branch.setCharPref("currentenvironment", environmentName);

    RedmineToolbar.PopulateProjects();
  },

  Change_Project : function(projectName, projectReferer) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    branch.setCharPref("currentproject", projectReferer);
    branch.setCharPref("currentprojectname", projectName);

    RedmineToolbar.CheckRepository();
    RedmineToolbar.PopulateIssues();
    RedmineToolbar.PopulateActivities();
    RedmineToolbar.PopulateNews();
    
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
  }

}; // End of RedmineToolbar
