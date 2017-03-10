var canvas;
var clocked;
var pie;
var init = true;
var salary = 50000;
var hourly = 313;
var year = 2015;
var oldYear;
var offset = 0;
var sum = 0;
var state = 0;
var wheight = 600;
var divisor = 10;

jQuery(document).ready(function($) {
  
  wheight = parseInt($(window).height()) - 100;
  if(wheight > 900){
    wheight = 900;
    divisor = 12;
  }else if((500 < wheight) && (wheight < 600)){
    divisor = 9;
  }else if(wheight < 500){
    wheight = 500;
    divisor = 8;
  }
  
  canvas = Raphael("canvas", wheight, wheight);
  clocked = canvas.clock(wheight/2,wheight/2,wheight/2-(wheight/divisor));
  pie = canvas.g.timechart(wheight/2,wheight/2, wheight/2-30);
  
  timeline = Raphael("theyears", 450, 8).timeline(500,31);
  
  $("#slider").slider({ 
    min: 2014,
    max: 2017,
    slide: function(event, ui) { $("#year").html(ui.value); },
    change: function(event, ui) {
      oldYear = year;
      year =  ui.value;
      getData("agency", year, salary);
      clocked.updateYear();

      },
    value: 2015
  });
  
  
  $("#info").click(function(){
    getData("agency", year, salary);
  });
  
  $("#salaryRight").click(function(){
    salary = salary + 10000;
    hourly = Math.round(salary / 20 / 8);
    $("#hourly").html(hourly);
    $("#salary").html(formatDollar(salary));
    clocked.updateSalary();
    
    getData("agency", year, salary);
  });
  
  $("#salaryLeft").click(function(){
    if(salary > 10000){
      salary = salary-10000;
      hourly = Math.round(salary / 20 / 8);
      $("#hourly").html(hourly);
      $("#salary").html(formatDollar(salary));
      clocked.updateSalary();
      getData("agency", year, salary);
    }
  });

  $("#hourlyRight").click(function(){
    hourly = hourly+1;
    salary = Math.round(hourly * 20 * 8);
    
    $("#hourly").html(hourly);
    $("#salary").html(formatDollar(salary));
    
    clocked.updateSalary();
    getData("agency", year, salary);
  });

  $("#hourlyLeft").click(function(){
    if(salary > 1){
      hourly = hourly-1;
      salary = Math.round(hourly * 20 * 8);
      
      $("#hourly").html(hourly);
      $("#salary").html(formatDollar(salary));
      
      clocked.updateSalary();
      
      getData("agency", year, salary);
    }
  });
  
  // $("#stateRight").click(function(){
  //   state = state+1;
  //   
  //   $("#state").html(state);
  //   
  //   getData("agency", year, salary);
  // });
  // 
  // $("#stateLeft").click(function(){
  //   if(state > 0){
  //     state = state-1;
  //     
  //     $("#state").html(state);
  //     
  //     getData("agency", year, salary);
  //   }
  // });

  clocked.updateSalary();
  getData("agency", 2015, 50000);
  
 
});



var getData = function(group,year,income) {
  var calc = new IncomeCalculator();
  var output = calc.calculateIncomeBreakdown(income);
  var items = output.breakdown;

  analyzeData(items, income);

  // var base = "http://www.whatwepayfor.com/api/";
   
  // var type  = "getBudgetAggregate/";
   
  // var call = "?group=" + group +
  //            "&year=" + year + 
  //            "&income=" + income ;
          
          
  // var api  = base + type + call;
    
  // Ajax.get(api, function(data) {
  //    var xml = data;
  //    if(typeof data == 'string') {
  //      xml = stringToXml(data);
  //    }
  //    var items = xml.getElementsByTagName('item');

  //    analyzeData(items, income);
  // });
    
}

var getSubData = function(agency,year,income, label, val) {
   //http://www.whatwepayfor.com/api/getBudgetAccount?income=50000&year=2010&bureau=2
   
   var base = "http://www.whatwepayfor.com/api/";
   
   var type  = "getBudgetAccount/";
   
    var call = 
          "?agency=" + agency +
          "&year=" + year + 
          "&income=" + income ;
          
    var api  = base + type + call;
    
    
    Ajax.get(api, function(data) {
         var xml = data;
         if(typeof data == 'string') {
           xml = stringToXml(data);
         }
         var items = xml.getElementsByTagName('item');
         
         analyzeSubData(items, income, label, val);
         
    });
    

}

function analyzeData(data, income){
 var  items = [],
      labels = [],
      ids = [],
      leftover = income;
      sum = 0;

      $(data).each(function (index, element) {
          var id     = index;
          var name   = element.name;
          var amount = Math.abs(parseInt(element.fraction * income));

          if (index != data.length - 1) {
            sum += parseFloat(amount);
          }
          
          if (amount > 1) {
            
            items.push(amount);
            labels.push(name);
            ids.push(id);
            
          }
      });

      parsePayment(sum);
        
      if (init) {
        pie.draw(items, labels, ids);
        clocked.toFront();
        init = false;
      } else {
        if (typeof(subpie) == 'object') {
          subpie.wipe();
        }
        pie.update(items, labels, ids);        
      }
      
      var daily = Math.round((sum / 20));
      var aday = daily / hourly;

      clocked.writeto("Kenya Government",formatHoursFlat(aday));
      
}

function analyzeSubData(data, income, label, val){
  var subitems = [],
      sublabels = [],
      other = [],
      otherlabels = [];
      
      $(data).each(function () {
        var id     = $(this).attr('accountID');
        var name   = $(this).attr('account');
        var amount = Math.abs(parseInt($(this).attr('mycosti')));

        subitems.push(amount);
        sublabels.push(name); 
      });
      
      
      if (typeof(subpie) == 'object') {
        subpie.wipe();
      }
      
      
      subpie = canvas.g.piechart(wheight/2, wheight/2, wheight/2-(wheight/divisor+3), val);
      
      subpie.draw(subitems, sublabels);

      subpie.showInfo(label, val);
      
}

function getMoney(){
  var subitems = [],
      sublabels = [],
      other = [],
      otherlabels = [];
      
      leftover = salary - sum;
      
      //if(state > 0){
        var stateTax = salary * (10/100);
        subitems.push(stateTax);
        sublabels.push("State & Local Governments");
        leftover -= stateTax;
      //}

        
      subitems.push(leftover);
      sublabels.push("Money");
      
      //pie = canvas.g.timechart(420, 420, 410);
      
      if(typeof(subpie) == 'object'){
              subpie.wipe();
      }
      
      subpie = canvas.g.piechart(wheight/2, wheight/2, wheight/2-(wheight/divisor+3), leftover);
      
      subpie.draw(subitems, sublabels);

      subpie.showMoney(leftover);
    
}

function getInfo(id, place, label, val){  
  getSubData(id, year, salary, label, val);
  
}

function parsePayment(sum){
    $("#iSum").html(formatDollar(sum));
    
    daily = Math.round((sum / 20));
    $("#iDaily").html(daily);
    
    aday = daily / hourly;
    
    $("#iHours").html(formatHours(aday));
}

function formatHours(val) {
  num = val;
  str = "";
  
  //http://www.springfrog.com/converter/decimal-time.htm
  var hours = parseInt(num);
     num -= parseInt(num); num *= 60;
  var mins = parseInt(num);
  
  if(hours == 1){
    str = "<span class='num'>"+hours+"</span> hour ";
  }else if(hours > 1){
    str = "<span class='num'>"+hours+"</span> hours ";
  }
  
  if(mins >= 1 && hours > 0){
    str += "and ";
  }
  
  if(mins < 1){
    num -= parseInt(num); num *= 60;
    var sec = parseInt(num);
  }
  
  if(mins == 1){
    str += "<span class='num'>"+mins+"</span> minute ";
  }else if(mins > 1){
    str += "<span class='num'>"+mins+"</span> minutes ";
  }
  
  if(sec){
    str += "<span class='num'>"+sec+"</span> seconds";
  }  
  return str
}

function formatHoursFlat(val) {
  num = val;
  str = "";
  
  //http://www.springfrog.com/converter/decimal-time.htm
  
  if(num < 24){
    var hours = parseInt(num);
       num -= parseInt(num); num *= 60;
    var mins = parseInt(num);
 
  }else{
    
    var days = parseInt(num/24);
    num -= parseInt(days*24); 
    var hours = parseInt(num);
       num -= parseInt(num); num *= 60;
    var mins = parseInt(num);
  }
  
  if(mins < 1){
    num -= parseInt(num); num *= 60;
    var sec = parseInt(num);
  }

  if(days){
    str += days+" days, ";
  }
  if(hours == 1){
    str +=  hours+" hour ";
  }else if(hours > 1){
    str +=  hours+" hours ";
  }
  
  if(mins >= 1 && hours > 0){
    str += "and ";
  }
  
  if(mins == 1){
    str += mins+" minute";
  }else if(mins > 1){
    str += mins+" minutes";
  }
  
  if(sec){
    str += sec+" seconds";
  }
     
  return str
}


// thanks jonobr1...
// Takes a number and adds commas and
// formatting US Citizens have come to
// expect when looking at money.
function formatDollar(value) {
  var word = value.toString();
  var period = word.indexOf('.');
  
  if(period == -1) period = word.length;
  
  if(period > 3) {
    var result = '';
    for(var i = 0; i < word.length; i++) {
      result += word.charAt(i);
      if(i < period) {
      
        var n = period - i;
        if(n % 3 == 1 && word.charAt(n - 1) != '-') {
          result += ',';
        }
      }
    }
    result = result.replace(',.', '.');
    result = result.replace(/\,$/, '');
  } else {
    result = word;
  }
  
  return result;
}
