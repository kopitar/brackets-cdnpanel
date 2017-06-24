/* CDN PANEL - UI */
define(function(require, exports, module) {
    
  var Dialogs          = brackets.getModule('widgets/Dialogs'),
      WorkspaceManager = brackets.getModule("view/WorkspaceManager");
    
  var panelHtml = $(require("text!ui/panel.html"));
  var extensionIcon = null;
  var iconClass = "panel-icon";

  var SHOW_PANEL = "brackets-panel.showpanel";
  var panel;

  var Config = require('config');
  // initial and minimum panel height (px)
  var panelSize = Config.panelSize;
  var localPath = Config.localPath;


  function addIcon() {
    // set an icon and append it to the toolbar
    extensionIcon = $('<a class="' + iconClass + '"></a>');
    extensionIcon.css('background-image', localPath + 'ui/css/images/icon.svg');
    extensionIcon.css('background-position', 'top left');
    extensionIcon.css('background-repeat', 'no-repeat');
    extensionIcon.appendTo($("#main-toolbar .buttons"));
  }

  function onClick(handler) {
    if (extensionIcon == null) {
      throw new Error('No icon');
    }  
    //load CSS
    Config.loadCSS;
    extensionIcon.on('click', handler);
  }

  // show a loading gif image while loading content    
  function loadingGif(state) {
    var loading_image = 'none',
      loading_image_id = $('#cdn-panel-id');

    if (state == true) {
      loading_image = localPath + 'ui/css/images/loading_dark.gif';
      loading_image_id.css('background-image', "url('" + loading_image + "')");
      loading_image_id.css('background-position', '48% 55%');
      loading_image_id.css('background-repeat', 'no-repeat');

    }
    if (state == false) {
      loading_image = null;
      loading_image_id.css('background-image', 'none');
    }
  }
  // the About extension modal
  function aboutModal() {
    var displayAbout = "<img style=\"float: left; margin:0px 5px; padding:0;\" src=\"" + localPath + "ui/css/images/logo_cdnjs.png\" alt=\"logo\">";
    displayAbout += "<br></span>\n<small style=\"vertical-align:bottom;\">version: 0.4.0</small><br><br>\n";
    displayAbout += "<span style=\"letter-spacing: 1px;\">Instant access to Javascript libraries, plugins, CSS frameworks, fonts & icons. All hosted on <a href=\"https://www.cdnjs.com\" target=\"_blank\">www.cdnjs.com</a>.<hr>";
    displayAbout += "<p>&#9679; Author: Kopitar Anže</p><p>&#9679; Homepage: <a href=\"https://github.com/kopitar/brackets-cdnpanel\" >https://github.com/kopitar/brackets-cdnpanel</a></p>";
    displayAbout += "&#9679; Contact: <a href=\"mailto:kopitar71@gmail.com\">kopitar71@gmail.com</a><br><hr>";
    displayAbout += "<span style=\"display:flex; align-items:center; margin: 0 auto;\"><img style=\"float: left; margin-right:5px; padding:0;\" src=\"" + localPath + "ui/css/images/bugfix.svg\" alt=\"bug\" width=\"32\" height=\"32\"><p style=\"text-align:left; margin-right:15p; text-decoration:underline; vertical-align:bottom;\">problems? bugs? suggestions?</p><small style=\"text-decoration:none; margin-bottom: 4px;\">&nbsp;&nbsp;Please use the provided contact or repository</small></span>";

    Dialogs.showModalDialog('a', "About Extension", displayAbout);
  }
    
  //create panel    
  panel = WorkspaceManager.createBottomPanel(SHOW_PANEL, panelHtml, panelSize);

  // resize panel to full height/normal height       
  function resizePanel() {
    if (Config.panelSize == 450) {
      Config.panelSize = screen.availHeight;
      $('#panel-id').css('height', Config.panelSize + "px");
      WorkspaceManager.recomputeLayout(true);
    } else if (Config.panelSize != 450) {
      Config.panelSize = 450;
      $('#panel-id').css('height', Config.panelSize + "px");
      WorkspaceManager.recomputeLayout(true);
    }
  }

  exports.addIcon = addIcon;
  exports.onClick = onClick;
  exports.loadingGif = loadingGif;
  exports.aboutModal = aboutModal;
  exports.resizePanel = resizePanel;
  exports.panel = panel;

});
