var canvas;
var clocked;
var offset = 0;
  var right = 50;
  var top = 100;
jQuery(document).ready(function($) {
  
  canvas = Raphael("canvas", 1300, 1000);
  clocked = canvas.clock(400,400,400);

  $("#button").click(function(){
    console.log("hi");
    pie.remove();
    getData("agency", "2011", "150000");
  });
});



var getData = function(group,year,income) {
    var base = "http://www.whatwepayfor.com/api/";
		
		var type  = "getBudgetAggregate/";
		
    var call = 
          "?group=" + group +
          "&year=" + year + 
          "&income=" + income ;
          
          
    var api  = base + type + call;
    
    Ajax.get(api, function(data) {
         var xml = data;
         if(typeof data == 'string') {
           xml = stringToXml(data);
         }
         var items = xml.getElementsByTagName('item');

         analyzeData(items, income);
         
    });
    

}

window.onload = getData("agency", "2005", "50000");


function analyzeData(data, income){
  var items = [],
      labels = [],
      leftover = income;
      
      $(data).each(function () {
            var id     = $(this).attr('dimensionID');
            var name   = $(this).attr('dimensionName');
            var amount = Math.abs(parseInt($(this).attr('mycosti')));
            
            items.push(amount);
            labels.push(name);
            
            leftover -= amount;
            
      });
      
      items.push(leftover);
      labels.push("Take Home");
      
      createPie(items, labels);
}

function createPie(items, labels){
  pie = canvas.g.piechart(402 + right, 402+top, 400, items, {legend: labels, legendpos: "east", stroke: "none"});
  clocked.toFront();
  
  pie.hover(function () {
      this.sector.stop();
         this.sector.animate({scale: [1.04, 1.04, this.cx, this.cy]}, 500, "bounce");
         if (this.label) {
             this.label[0].stop();
             this.label[0].scale(1.5);
             this.label[1].attr({"font-weight": 800});
         }
     }, function () {
         this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
         if (this.label) {
             this.label[0].animate({scale: 1}, 500, "bounce");
             this.label[1].attr({"font-weight": 400});
         }
     });
}
