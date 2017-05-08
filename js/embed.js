---
---

if (document.location.hostname == 'localhost') {
    var baseurl = '';
} else {
    var baseurl = '{{ site.url }}';
}
document.write('<div id="{{ site.embed_id }}"></div>');
document.write('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/pym/1.2.0/pym.v1.min.js"></script>');
document.write("<script>var pymParent = new pym.Parent('{{ site.embed_id }}', '" + baseurl + "/embed.html', {});\n" +
"pymParent.onMessage('childShrank', function(height) {\n" +
"  pymParent.iframe.setAttribute('style', 'height: ' + height + 'px');\n" +
"});" +
"</script>");
