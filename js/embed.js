---
---

if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "{{ site.url }}";
}
document.write('<script type="text/javascript" src="' + baseurl + '/pym.js"></script>');
document.write("<script>var pymParent = new pym.Parent('c4a-taxclock-ke', '" + baseurl + "index.html', {});\n" +
"pymParent.onMessage('childShrank', function(height) {\n" +
"  pymParent.iframe.setAttribute('style', 'height: ' + height + 'px');\n" +
"});" +
"</script>");
