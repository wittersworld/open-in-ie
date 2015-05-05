var openInIE = {
    useDomainList: false,
    domainList: [],
    
    isLink: function (element) {
        if (element.tagName === 'A')
            return true;
        else
            if (element.parentNode)
                return openInIE.isLink(element.parentNode)
            else
                return false;
    },
    getHref: function(element) {
        if (element.tagName === 'A')
            return element.href;
        else
            if (element.parentNode)
                return openInIE.getHref(element.parentNode);
            else
                return undefined;
    },
    isRightClick: function (e) {
        var rightClick;
        if (e.which) 
            rightClick = (e.which == 3);
        else if (e.button)
            rightClick = (e.button == 2);

        return rightClick;
    },
    handleWindowClick: function (event) {
        var element = event.target || event.srcElement;
        var targetIsLink = openInIE.isLink(element);
        if (targetIsLink && openInIE.isRightClick(event) == false) {
            if (openInIE.useDomainList == true) {
                var href = openInIE.getHref(element);
                console.debug('Handling left click: ' + href);
    
                for (var i = 0; i < openInIE.domainList.length; i++) {
                    var regex = new RegExp(openInIE.domainList[i], "gi");
    
                    if (regex.test(href)) {
                        console.debug('Href matches pattern');
                        self.port.emit("ieLinkClicked", href);
                        event.preventDefault();
                        event.returnValue = false;
                        return false;
                    }
                }
            }
        }
    }
};

self.port.on("setPreferences", function(prefs) {
    openInIE.useDomainList = prefs['useDomainList'];
    
    var domains = prefs['domainList'].split('|');
    for (var i=0; i<domains.length; i++) {
        console.debug('\tDomain found: ' + domains[i]);
        openInIE.domainList.push(domains[i]);
    } 
});
window.addEventListener("click", openInIE.handleWindowClick, false);
