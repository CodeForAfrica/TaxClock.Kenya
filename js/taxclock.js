// TODO: Delete this file..

if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://taxclock-za.codeforafrica.org/";
}
document.write('<div id="code4sa-embed-taxclock"></div>');
document.write('<script type="text/javascript" src="' + baseurl + 'pym.js"></script>');
document.write("<script>\n" +
"var pymParent = new pym.Parent('code4sa-embed-taxclock', '" + baseurl + "index.html?show-embed-link=true', {});\n" +
"pymParent.onMessage('childShrank', function(height) {\n" +
"  pymParent.iframe.setAttribute('style', 'height: ' + height + 'px');\n" +
"});" +
"</script>");
