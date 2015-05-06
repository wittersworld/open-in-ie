'use strict';

var {Cc, Ci} = require("chrome");
var buttons = require('sdk/ui/button/action');
var contextMenu = require("sdk/context-menu");
var tabs = require('sdk/tabs');
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;
var { Hotkey } = require("sdk/hotkeys");
var pageMod = require("sdk/page-mod");
var _ = require("sdk/l10n").get;

/********** CONTEXT MENU **********/
var menuItem = contextMenu.Item({
	label: _("extensionTitle"),
	context: contextMenu.SelectorContext("a[href]"),
	image: self.data.url("icon-16.png"),
    accessKey: "i",
    contentScript:'self.on("click", function(node, data) { self.postMessage(node.href); })',
    onMessage: function (url) {
        console.debug("Handling context menu click");
        openInIE(url);
    }
});

/********** TOOLBAR BUTTON **********/
var button = buttons.ActionButton({
    id: "openinie-button",
    label: _("extensionTitle"),
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onClick: function() {
        console.debug("Handling toolbar button click");
        var url = tabs.activeTab.url;
        openInIE(url);
    }
});

/************** HOT KEY **************/
var handleHotKey = Hotkey({
    combo: "alt-shift-e",
    onPress: function() {
        console.debug("Handling hotkey combo");
        var url = tabs.activeTab.url;
        openInIE(url);
    }
});

/********** HANDLE EVERY CLICK ON PAGE **********/
pageMod.PageMod({
    include: "*",
    contentScriptWhen: 'ready',
    contentScriptFile: self.data.url("clickHandler.js"),
    onAttach: function(worker) {
        worker.port.emit("setPreferences", prefs);
        worker.port.on("ieLinkClicked", function(url) {
            openInIE(url);
        });
    }
})

/********** MAIN FUNCTION **********/
var openInIE = function (url) {
    console.debug('Received command for ' + url);

    var iePath = prefs['iePath'];
    
    // create an nsILocalFile for the executable
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(iePath);

    // create an nsIProcess
    var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
    process.init(file);

    // Run the process
    var args = [url];
    process.run(false, args, args.length);
};