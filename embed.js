if (document.location.hostname == "localhost") {
    var baseurl = "";
} else {
    var baseurl = "https://static.code4sa.org/tax-clock-lib/";
}

document.write('<script type="text/javascript" src="' + baseurl + 'pym.js"></script>')
document.write(" <script>var pymParent = new pym.Parent('code4sa-embed-taxclock', '" + baseurl + "placeholder.html', {});</script>")
