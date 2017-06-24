/* CDN PANEL */
define(function(require, exports, module) {
var CommandManager   = brackets.getModule("command/CommandManager"),
    Menus            = brackets.getModule("command/Menus"),
    EditorManager    = brackets.getModule("editor/EditorManager"),
    WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
    DocumentManager  = brackets.getModule("document/DocumentManager"),
    Dialogs = brackets.getModule('widgets/Dialogs'),
    UserInterface    = require('ui/ui'),
    Config           = require('config');
    
  var ko = require("knockout/knockout-3.4.2");
  var panel = UserInterface.panel;


  var resourceFile = require("text!libs.json");
  var parsedResource = JSON.parse(resourceFile);
  parsedResource = parsedResource['results'];
  var localPath = Config.localPath;
  var allNames = [];

  // store all resource names
  $.each(parsedResource, function(index, val) {
    allNames.push(val.name);
  });

  var ViewModel = function() {
      var self = this;

      self.urlPrefix = "https://cdnjs.cloudflare.com/ajax/libs/";
      self.items = ko.observableArray().extend({ rateLimit: 500 });
      self.resources = ko.observableArray(allNames);
      self.prepareLatest = ko.observable();
      self.license = ko.observable();
      self.links = ko.observable(" ");
      self.cdnjsLink = ko.observable();
      self.keywordEntered = ko.observable();
      self.selectedItem = ko.observable();
      self.searchHits = ko.observable(0);
      self.showHits = ko.observable(false);

      self.findByKeyword = function() {
          // show loading gif
          UserInterface.loadingGif(true);
          // remove any previous results
          self.items.removeAll();
          //fetch the data
          fetch("https://api.cdnjs.com/libraries?search=" + self.keywordEntered() + "&fields=description,keywords,version,author,license,homepage,repository").then(function(data) {
            // return data as JSON    
            return data.json();
          }).then(function(json) {
            // store results into foundData    
            var foundData = json['results'];
            json = null;
            // number of search results    
            var numOfHits = foundData.length;
            // show result number if any    
            if (numOfHits > 0) {
              self.showHits(true);
            } else {
              self.showHits(false);
            }

            self.searchHits(numOfHits);
            var homepageLink = "";
            var gitLink = "";
            // loop through the data stored in foundData
            for (var i = 0; i < numOfHits; i++) {
              // remove found entries from previous cycle
              //check if search result contains version,license,files,homepage & repository entries to avoid errors
              if (foundData[i]['license'] !== null) {
                self.license(foundData[i]['license'] + " license");
              }
              if (foundData[i]['homepage'] !== null) {
                var homepageLink = "<a href='" + foundData[i]['homepage'] + "' target='_blank'><img src='" + localPath + "ui/css/images/homepage.svg' alt='homepage' width='28' height='28'></a>";
              }
              if (foundData[i]['repository'] !== null) {
                var gitLink = "<a href='" + foundData[i]['repository']['url'] + "' target='_blank'><img src='" + localPath + "ui/css/images/github-logo.svg' alt='github' width='28' height='28'></a>";
              }
              // prepare html with a link directly to target resource on cdnjs.com
              if (foundData[i]['name'] !== null) {
                self.cdnjsLink('<a href="https://www.cdnjs.com/libraries/' + foundData[i]['name'] + '" target="_blank"><img class="cdnjs-link" src="' + localPath + 'ui/css/images/cdnjs1.svg" alt="' + foundData[i]['name'] + '" width="30" height="27">');
              }
              // join html & git for homepage & repository image links by search results    
              self.links(homepageLink + gitLink);

              // if is JS
              if (foundData[i]['latest'].indexOf(".js")) {
                self.prepareLatest("<script type=\"text/javascript\" src=\"" + foundData[i]['latest'] + "\"></script>");
              }
              // if is CSS    
              if (foundData[i]['latest'].indexOf(".css") !== -1) {
                self.prepareLatest("<link rel=\"stylesheet\" href=\"" + foundData[i]['latest'] + "\">");
              }

              // if is FONT or is SVG    
              if ((foundData[i]['latest'].indexOf(".otf") !== -1) || (foundData[i]['latest'].indexOf(".eot") !== -1) || (foundData[i]['latest'].indexOf(".svg") !== -1) || (foundData[i]['latest'].indexOf(".ttf") !== -1) || (foundData[i]['latest'].indexOf(".woff") !== -1) || (foundData[i]['latest'].indexOf(".woff2") !== -1)) {
                self.prepareLatest(foundData[i]['latest']);
              }
              // push data into items    
              self.items.push({
                name: foundData[i]['name'],
                version: foundData[i]['version'] || " ",
                description: foundData[i]['description'],
                keywords: foundData[i]['keywords'],
                latest: self.prepareLatest(),
                author: foundData[i]['author'] || "",
                cdnjsLink: self.cdnjsLink()
              });
            } // end for loop
          }).then(function() {
            // get rid of foundData object  
              foundData = null;
            // hide the loading gif image    
            UserInterface.loadingGif(false);
            // catch any errors        
          }).catch(function(error) {
            UserInterface.loadingGif(false);
            throw new Error(error);
          });
        }, //end of findByKeyword

        self.findData = function() {
          // show loading gif
          UserInterface.loadingGif(true);
          // remove any previous results
          self.items.removeAll();
          //fetch the data using the search + fields
          fetch("https://api.cdnjs.com/libraries?search=" + self.selectedItem() + "&fields=description,keywords,version,author,license,homepage,repository").then(function(data) {
            // return data as JSON    
            return data.json();
          }).then(function(json) {
            // store results into foundData    
            var foundData = json['results'];
            // number of search results    
            var numOfHits = foundData.length;
            // show result number if any    
            if (numOfHits > 0) {
              self.showHits(true);
            } else {
              self.showHits(false);
            }

            self.searchHits(numOfHits);
            var homepageLink = "";
            var gitLink = "";
            // loop through the data stored in foundData
            for (var i = 0; i < numOfHits; i++) {
              //check if search result contains version,license,files,homepage & repository entries to avoid errors
              if (foundData[i]['license'] !== null) {
                self.license(foundData[i]['license'] + " license");
              }

              if (foundData[i]['homepage'] !== null) {
                var homepageLink = "<a href='" + foundData[i]['homepage'] + "' target='_blank'><img src='" + localPath + "ui/css/images/homepage.svg' alt='homepage' width='28' height='28'></a>";
              }
              if (foundData[i]['repository'] !== null) {
                var gitLink = "<a href='" + foundData[i]['repository']['url'] + "' target='_blank'><img src='" + localPath + "ui/css/images/github-logo.svg' alt='github' width='28' height='28'></a>";
              }
              // prepare html with a link directly to target resource on cdnjs.com
              if (foundData[i]['name'] !== null) {
                self.cdnjsLink('<a href="https://www.cdnjs.com/libraries/' + foundData[i]['name'] + '" target="_blank"><img class="cdnjs-link" src="' + localPath + 'ui/css/images/cdnjs1.svg" alt="' + foundData[i]['name'] + '" width="30" height="27">');
              }
              // join html & git for homepage & repository image links by search results    
              self.links(homepageLink + gitLink);

              // if is JS
              if (foundData[i]['latest'].indexOf(".js")) {
                self.prepareLatest("<script type=\"text/javascript\" src=\"" + foundData[i]['latest'] + "\"></script>");
              }
              // if is CSS    
              if (foundData[i]['latest'].indexOf(".css") !== -1) {
                self.prepareLatest("<link rel=\"stylesheet\" href=\"" + foundData[i]['latest'] + "\">");
              }
                  
              // if is FONT or is SVG    
              if ((foundData[i]['latest'].indexOf(".otf") !== -1) || (foundData[i]['latest'].indexOf(".eot") !== -1) || (foundData[i]['latest'].indexOf(".svg") !== -1) || (foundData[i]['latest'].indexOf(".ttf") !== -1) || (foundData[i]['latest'].indexOf(".woff") !== -1) || (foundData[i]['latest'].indexOf(".woff2") !== -1)) {
                self.prepareLatest(foundData[i]['latest']);
              }
              // push data into items    
              self.items.push({
                name: foundData[i]['name'],
                version: foundData[i]['version'] || " ",
                description: foundData[i]['description'],
                keywords: foundData[i]['keywords'],
                latest: self.prepareLatest(),
                author: foundData[i]['author'] || "",
                cdnjsLink: self.cdnjsLink()
              });
            } // end for loop
          }).then(function() {
          // get rid of foundData object  
            foundData = null;              
            // hide the loading gif image    
            UserInterface.loadingGif(false);
            // catch any errors        
          }).catch(function(error) {
            UserInterface.loadingGif(false);
            throw new Error(error);
          });
        }, //end of findData    
        // select text to be copied from .latest element
        self.selectText = function() {
          $('.latest').on('focus focusin', function() {
            $(this).select();  
                $(this).next().css('backgroundColor', '#DD4814').css('color','#FFFFFF');
            
          $(this).on('focusout', function() {
            $(this).next().css('backgroundColor', 'darkgray').css('color','black');
              });
          });
        },
        // copy selected text    
        self.copyText = function() {
          $('.copyBtn').on('click', function() {
            var target = $(this).prev();
            // select and copy to clipboard  
            target.select();
            var copied = document.execCommand('copy');
                target = null;
                $(this).next('.cdn-copytext').animate({
                left : '0%'
                },500).delay(700).fadeOut(500);
          });
        },
        // shows the 'About Extension' modal dialog    
        self.aboutModal = function() {
            UserInterface.aboutModal();
        },
        // hide panel when X button is clicked  
        self.hidePanel = function() {
          panel.hide();
        },
        // resize panel to full height        
        self.resizePanel = function() {
         UserInterface.resizePanel();
        }

    } // end of ViewModel

  //open extension panel    
  function openPanel() {
    if (panel.isVisible()) {
      panel.hide();
    } else {
      panel.show();
    }
   ko.applyBindings(new ViewModel());
  }

  UserInterface.addIcon();
  UserInterface.panel;
  // toolbar icon - opens extension panel    
  UserInterface.onClick(openPanel);
});
