define(function(require, exports, module) {
    var  ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var localPath = ExtensionUtils.getModulePath(module);
    
    var loadCSS = ExtensionUtils.loadStyleSheet(module, "ui/css/main.css");
    
    var panelSize = 450;
    
exports.localPath = localPath;
exports.panelSize = panelSize;    
});