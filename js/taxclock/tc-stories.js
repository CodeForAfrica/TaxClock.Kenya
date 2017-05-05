---
---

// Stories load

TC.stories = {

  data: [],

  load: function () {
     $.get(
      'https://s3-eu-west-1.amazonaws.com/taxclock.codeforkenya.org/data/standard-news.json',
      function( data ) {
        TC.stories.data = JSON.parse(data);
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
      html += '<img src="' + data.img + '"/>';
      html += '</div><div class="col-xs-8">';
      html += '<h4>' + data.title + '</h4>';//<p>' + data.description + '</p>';
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


