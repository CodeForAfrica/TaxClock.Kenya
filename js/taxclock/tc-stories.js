---
---

// Load stories

TC.stories = {

  data: [],

  load: function () {
    $.get(
      "https://corsio.devops.codeforafrica.org?https://pesacheck.org/feed/tagged/budget",
      function( response ) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(response,"text/xml");
        stories = xmlDoc.getElementsByTagName("item")

        stories_count = stories.length > 5 ? 5 : stories.length

        for (let i = 0; i < stories_count; i++) {
          title = stories[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
          link = stories[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
          content = stories[i].getElementsByTagName("content:encoded")[0].childNodes[0].nodeValue;
          content_html = parser.parseFromString(content,"text/html");
          thumbnail = content_html.getElementsByTagName("img")[0].getAttribute("src");

          TC.stories.data.push({
            "title": title,
            "link": link,
            "thumbnail": thumbnail
          })
        }

        TC.stories.show();
      }
    );
  },

  show: function () {

    var html = '';

    $.each(TC.stories.data, function (index, data) {
      html += '<div class="tc-box text-left tc-story tc-box-white">';
      html += '<a href="' + data.link + '" target="_blank">';
      html += '<div class="row"><div class="col-xs-4">';
      html += '<img src="' + data.thumbnail + '"/>';
      html += '</div><div class="col-xs-8">';
      html += '<h4>' + data.title + '</h4>';
      html += '<p><u>Read more</u> <i class="fa fa-arrow-right"></i></p>';
      html += '</div></div></a></div><br/>'
    });

    $('#stories-news').html(html);

  }
};


// When document ready
$(function() {

  TC.stories.load();

});
