// Explanations for items
var itemExplanations = {
 'industialization-and-enterprise-development': 'Responsible for creating a competitive, sustainable Industrial, enterprise and co-operative sector.',
  'information-communications-and-technology': 'Regulating the information and communication sector.',
  'labour-social-security-and-services': 'Responsible to advance employment rights ',
  'land-housing-and-urban-development': 'Responsible for all matters to do with land, housing and urban development.',
  'mining': 'Responsible for survey and exploration of all minerals other than, oil, petroleum and gas.',
  'sports-culture-and-arts': 'Responsible for the development, co-ordination and management of sports, film industry, fine, creative and performing arts.',
  'gender-and-equality-commission': 'Advances gender equality in all spheres of society and make recommendations on any legislation affecting the status of women.',
  'national-intelligence-service':  'Responsible for giving the Government advice about matters related to security.',
  'land-commission':  'Manage, regulate, administer the ownership and use of land.',
  'police-service-commission':'Recruits, disciplines and promotes policemen.',
  'attorney-general-and-department-of-justice': 'Legal advisor to the government.',
  'director-of-public-prosecutions':  'Instituting, conducting and supervising prosecutions',
  'the-registrar-of-political-parties': 'Registration of political parties and administration of the Political Parties Fund',
  'public-service-commission':  'Employment of civil servants.',
  'ministry-of-agriculture':  'Agriculture, fishing and enhancing food security',
  'ministry-of-commerce-and-tourism': 'Development of tourism',
  'coordination-of-national-government': 'Public administration, internal security and promotion of national unity.',
  'ministry-of-devolution': 'Responsible for economic planning and development, devolution, public service management, youth, gender and special programmes.Responsible for economic planning and development, devolution, public service management, youth, gender and special programmes.',
  'east-african-affairs': 'government ministry responsible for coordinating political,economic, military, social, and cultural relations with other EAC countries.',
  'ministry-of-education':  'Education and human resource development',
  'environment-and-natural-resources':  'Protection, conservation and management of the the environment.',
  'ministry-of-fisheries':  'Exploration, exploitation, development and conservation of fisheries.',
  'ministry-of-livestock':  'Promotion, regulation and development of the livestock sector.',
  'ministry-of-planning': ' Development planning and policy formulation',
  'science-and-technology': ' Responsible for research, development and implementation of innovations.',
  'infrastructure': ' Development, management of infrastructure.',
  'interior': 'Internal security, Immigration, Prisons.',
  'transport-ministry': 'Maritime , rail and road  transport infrastructure ',
  'salaries-and-remuneration-commission': 'Sets and reviews salaries and benefits of all public officers',
  'teachers-service-commission':  'Recruits, assigns, disciplines all teachers in public insititutions.',
  'commission-on-administrative-justice': 'Establishes standards for public servants and ensures service delivery.',
  'commission-on-revenue-allocation': 'Recommends the basis for sharing of revenues between national and county governments and among the County Governments.',
  'presidency':'Organization and coordination of Government business.',
  'witness-protection-agency':  'Establishes and maintains a witness protection programme.',
  'commission-for-the-implementation-of-the-constitution':  'Monitors, facilitates and oversees the development of legislation required to implement this Constitution.',
  'controller-of-budget': 'Examines the legality,the timing and approves or denies any allocation of all public funds, at both the national and county governments.',
  'ethics-and-anti-corruption-commission':  'Prevent corruption, educate the public on corruption, investigate corrupt conduct and activities and oversee compliance with constitutional provisions about leadership and integrity.',
  'independent-electoral-and-boundaries-commission':'Conducting or supervising referenda and elections; delimitation of electoral units, voter education and regislration; regulating political parties and settling electoral disputes ',
  'independent-police-oversight-authority': 'Oversees the work of the police',
  'kenya-national-commission-on-human-rights': 'Monitors government institutions, carries out investigations  and provides redress to those whose rights have been violated',
  'ministry-of-defence':  'Protecting Kenya and its national interests',
  'energy-and-petroleum': 'Overallmanagement of the oil, gas and minerals sectors ',
  'foreign-affairs-and-international-trade':  "Oversees, promotes, protects and projects Kenya's interests abroad",
  'health': 'Responsible for the provision of health services.',
  'auditor-general': 'Scrutinises the accounts of public entities and organs for potential instances of wastage, inefficiency or ineffectiveness and presents the report on accounts to Parliament.',
  'ministry-of-water-and-regional-authorities': 'Mobilizing and promoting efficiency in management ,access and utilization of water resources'
}

var cal = null;

function Slugify(str) {
  var $slug = '';
  var trimmed = $.trim(str);
  $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
  replace(/-+/g, '-').
  replace(/^-|-$/g, '');
  return $slug.toLowerCase();
}

function GetHours(mins) {
  var hours = Math.floor( mins / 60);
  return hours;
}

function GetMinutes(mins) {
  var minutes = Math.floor(mins % 60);
  return minutes;
}

function GetSeconds(mins) {
  var seconds = Math.floor((mins * 60) % 60);
  return seconds;
}

function workingOn(now, items, calc) {
  // of the items in items, what is being worked on now?
  var current = 0, next;

  // sort by end time
  items = _.sortBy(items, function(x) { return x.valueOf(); });

  for (var i = 0; i < items.length; i++) {
    if (now.isBefore(items[i].finish_time)) {
      current = i;
      break;
    }
  }

  if (current < items.length) {
    next = items[current+1];
  }
  current = items[current];

  if (now.isBefore(calc.START_OF_DAY) || now.isAfter(calc.END_OF_DAY)) {
    next = current;
    current = null;
  }

  return [current, next];
}

function checkEmbedLink() {
  if (window.location.search.indexOf('embed-link') > -1) {
      allowEmbedLink();
  }
}

function allowEmbedLink() {
    $('.embed-link').addClass('allowed');
}

function createICS(breakdown) {
    var num_slots = breakdown.length;
    var secondlast_slot_start = breakdown[num_slots - 2].finish_time;
    var end_day = breakdown[num_slots - 1].finish_time;
    cal = icsFormatter();
    cal.addEvent('Working for yourself', 'Every minute from now on, you\'re working for yourself', 'Work', secondlast_slot_start, end_day, 'RRULE:FREQ=DAILY;INTERVAL=1');

    return cal;
}
function downloadICS() {
    ga('send', 'event', 'taxclock', 'ics');
    cal.download();
}


var pymChild;
pymChild = new pym.Child({id: 'codeforkenya-embed-taxclock' });
checkEmbedLink();

var engaged = false;

var firstLoop = true;
var output;

function incomeChange() {
  var income = parseFloat($('input[name="income"]').val());

  var calc = new IncomeCalculator();

  output = calc.calculateIncomeBreakdown(income);
  cal = createICS(output.breakdown);
  var startTime = calc.START_OF_DAY;

  /* Clear output */
  $('#output-wrapper').hide();

  if (income > 0){
    $('#output-dayplanner').html('');

    $(output.breakdown).each(function(){
      var breakdown = this;
      $(breakdown).each(function(){

        var name = this.name;
        var slug = Slugify(this.name);
        var finishTime = this.finish_time;
        var taxamount = this.taxpayer_amount;

        var startTimeStr = startTime.format('h:mm a');

        var startHour = startTime.format('H');
        var startMinute = startTime.format('m');
        var startSecond = startTime.format('s');

        var finishHour = finishTime.format('H');
        var finishMinute = finishTime.format('m');
        var finishSecond = finishTime.format('s');

        var mins = this.minutes;
        var hours = GetHours(mins);
        var minutes = GetMinutes(mins);
        var seconds = GetSeconds(mins);

        /* if minutes > 0 and seconds > 30, round up a 1 minute */
        if (minutes > 0 && seconds > 30) {
          minutes = minutes + 1;
          seconds = 0;
        }
        else if (minutes > 0) {
          seconds = 0;
        }

        var hoursString = "";
        var minutesString = "";
        var secondsString = "";

        if (hours > 0) {
          var hoursString = '<span class="item-hours">' + hours + ' hours </span>';
        }

        if (hours == 1) {
          var hoursString = '<span class="item-hours">' + hours + ' hours </span>';
        }

        if (minutes > 0) {
          var minutesString = '<span class="item-minutes">' + minutes + ' minutes </span>';
        }

        if (minutes == 1) {
          var minutesString = '<span class="item-minutes">' + minutes + ' minute </span>';
        }

        if (seconds > 0) {
          var secondsString = '<span class="item-seconds">' + seconds + ' seconds</span>';
        }

        if (seconds == 1) {
          var secondsString = '<span class="item-seconds">' + seconds + ' seconds</span>';
        }

        var durationDiv = '<div class="item-duration">' + hoursString + minutesString + secondsString + '</div>';

        var rowHeight = Math.floor(mins * 14);
        if (rowHeight > 450){ rowHeight = 450; }

        'Add a class for small items (under 5 minutes)'
        var smallClass = "";
        if (minutes < 5){ smallClass= " item-small"; }

        $('#output-dayplanner').append('<div class="item planner-item" id="' + slug + '" style="min-height: ' + rowHeight + 'px;" data-starthour="' + startHour + '" data-startminute="' + startMinute + '" data-startsecond="' + startSecond + '" data-finishhour="' + finishHour + '" data-finishminute="' + finishMinute + '" data-finishsecond="' + finishSecond + '"><div class="item-starttime-wrapper"><span class="item-starttime">' + startTimeStr + '</span></div><div class="item-details"><div class="item-name">' + name + '</div><div class="item-duration">' + durationDiv + "</div></div></div>");

        startTime = this.finish_time;
      });
    });

    $('#output-dayplanner').prepend('<div class="item" id="start"><strong>8am</strong> - START OF THE WORK DAY</div>').append('<div class="item" id="end"><strong>5pm</strong> - END OF THE WORK DAY</div>');

    /* update clock */
    function tick() {
      var now = moment();
      $('#clock-now').text(now.format('HH:mm'));

      // draw current-time 'now' line
      $('#output-dayplanner .planner-item').each(function(){

        var startHour = parseInt($(this).attr('data-starthour'));
        var startMinute = parseInt($(this).attr('data-startminute'));
        var startSecond = parseInt($(this).attr('data-startsecond'));

        var startSeconds = (startHour * 60 * 60) + (startMinute * 60) + startSecond;

        var finishHour = parseInt($(this).attr('data-finishhour'));
        var finishMinute = parseInt($(this).attr('data-finishminute'));
        var finishSecond = parseInt($(this).attr('data-finishsecond'));

        var finishSeconds = (finishHour * 60 * 60) + (finishMinute * 60) + finishSecond;

        var nowHour = parseInt(now.format('H'));
        var nowMinute = parseInt(now.format('m'));
        var nowSecond = parseInt(now.format('s'));

        var nowSeconds = (nowHour * 60 * 60) + (nowMinute * 60) + nowSecond;

        if (nowSeconds < finishSeconds && nowSeconds >= startSeconds ) {
          elementHeight = $(this).height() - 12;
          topPosition = Math.round((nowSeconds - startSeconds) / (finishSeconds - startSeconds) * elementHeight) + 12;
          $('#now-line').remove();
          $(this).prepend('<div id="now-line" title="' + now.format('hh:mm a') + '" style="top: '+ topPosition +'px;"><span>Time Now</span></div>');
        }

      });

      // current and next work items
      var pair = workingOn(now, output.breakdown, calc);

      if (pair[0]) {
        $('#clock-next-wrapper, #working-on').show();
        $('#clock-item').show().text(pair[0].name);
      } else {
        $('#clock-next-wrapper, #working-on').hide();
        $('#clock-item').text('Put your feet up, you’ve had a long day working and contributing to the state.');
        // show morning message (after 4 am)

        var nowHour = parseInt(now.format('H'));
        if (nowHour >= 4 && nowHour < 9) {
          $('#clock-item').text('Brace yourself, you have a long day ahead of you.');
        }
      }

      $('#clock-next').text(pair[1] ? pair[1].name : 'End of the workday');

      TC.colors.setSchedule();
    };

    // update it now
    tick();

    if (firstLoop) {
      // update it every 1 second
      setInterval(tick, 1000);
      firstLoop = false;
    }

    // Add explanations
    $('.planner-item').each(function(){
      var itemID = $(this).attr('id');
      var explanation = itemExplanations[itemID];

      var itemHeight = parseInt($(this).css('min-height'));

      if (itemID != 'working-for-yourself'){
        if (itemHeight > 80) {
        $(this).find('.item-details').append('<div class="item-explanation"><span class="what-is-this">?</span> ' + explanation + '</div>');
        }
        else {
          $(this).find('.item-name').append('<span class="explanation-icon" data-toggle="tooltip" title="'+ explanation +'">?</span>');
        }
      }

      // Activate tooltips
      $('[data-toggle="tooltip"]').tooltip();

    });

    /* Show the output */
    $('#output-wrapper').show();
    ga('send', 'event', 'taxclock', 'salary', $('input[name="income"]').val());

    if (!engaged) {
      ga('send', 'event', 'taxclock', 'engaged');
    }
    engaged = true;

    // tell pym to resize
    pymChild.sendHeight();
  } else {
    var footer = $('.footer');
    pymChild.sendMessage("childShrank", footer.offset().top+footer.height());
  }
}

if (window != window.top) {
  $('body').addClass('embedded');
} else {
  $('body').addClass('standalone');
}


$(function() {

  $('input[name="income"]').on('change keyup', function() {
    incomeChange();
  });
  /* Stupid hack to probably fix size once probably rendered initially */
  // setInterval(function() { pymChild.sendHeight(); }, 1000);
});
