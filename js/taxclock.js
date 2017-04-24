// File that embeds the clock automatically

if (document.location.hostname == "localhost") {
    var baseurl = "/";
} else {
    var baseurl = "https://taxclock-za.codeforafrica.org/";
}
document.write('<div id="taxclock-za"></div>');
document.write('<script type="text/javascript" src="' + baseurl + 'js/vendor/pym.js"></script>');
document.write("<script>\n" +
"var pymParent = new pym.Parent('taxclock-za', '" + baseurl + "embed.html', {});\n" +
"pymParent.onMessage('childShrank', function(height) {\n" +
"  pymParent.iframe.setAttribute('style', 'height: ' + height + 'px');\n" +
"});" +
"</script>");
