TC.colors = {};

TC.colors.all = {
  lightblue: '#5394C1',
  red: '#ED1C24',

  darkblue: '#1B4969',
  green_one: '#1DA087',
  teal: '#A6DDD3',
  green_two: '#547770',
  green_three: '#A9A6A6',
  lightblue_two: '#97B4B7',
  grey_four: '#636263',
  
  dullpurple_two: '#824D58',
  dullpurple_three: '#532F37',
  darkpurple_two: '#371A13',
  dullgreen: '#9A9B78',
  darkblue_two: '#102B3A',
  darkgreen: '#1B564B',
  yellow: '#D3D35B',
  dullorange: '#D1AD5D',
  lightgreen: '#A2E28A',
  grey_two: '#444444',
  

  black: '#000',
  grey: '#48494B',
  purple: '#81549D',
  maroon: '#5E1517',
  purple_two: '#414C8C',
  lightpurple: '#808AB2',
  darkpurple: '#172872',
  dullpurple: '#4C5472',
  lightpurple_two: '#DDC7D4',
  royalty: '#823464',

  darkred: '#AF1E29',
  orange_one: '#EA971F',
  lightorange: '#EDBE6C',
  red_two: '#D46137',
  lightpink: '#E28A79',
  pink: '#E281A0',
  brightpink: '#E0446D',
  darkpink: '#89343E',
  dullpink: '#99618C',

  
  blue: '#0D68A8',
};

TC.colors.setSchedule = function () {
  var colors_count = _.size(TC.colors.all);
  var colors = _.values(TC.colors.all);

  $.each($('.planner-item'), function (key, value) {
    var color_id = key % colors_count;
    $( this ).css( "background-color", colors[color_id] );
  });
};
