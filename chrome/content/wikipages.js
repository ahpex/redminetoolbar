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
