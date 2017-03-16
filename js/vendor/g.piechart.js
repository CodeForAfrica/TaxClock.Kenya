/*
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.piechart = function (cx, cy, rad, amount, opts) {
    var data = [];
    var paper = this
    var data = 0, //[24, 92, 24, 52, 78, 99, 82, 27]
        paths = paper.set(),
        face = paper.set(),
        total,
        start,
        hoursText,
        bg = paper.circle(cx, cy, 0).attr({stroke: "none", "stroke-width": 4});
    
    var remove, closer, subfuncText, subRev, subTime;
         
    paper.customAttributes.segment = function (x, y, r, a1, a2) {
        var flag = (a2 - a1) > 180,
            clr = (a2 - a1) / 360;
        a1 = (a1 % 360) * Math.PI / 180;
        a2 = (a2 % 360) * Math.PI / 180;
        
        return {
            path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]],
            //fill: "rgb(" + coloring *23 + ", " + coloring*53 + ", " + coloring*13 + ")" //"hsb(" + clr + ", .75, .8)"
        };
    };
    
   
    this.draw = function (values, labels) {
          data = values;
          parent = this;
          
          //data = data.sort(function (a, b) { return b - a;});
          
          total = 0;
          for (var i = 0; i < data.length; i++) {
              total += data[i];
              data[i] = {value: data[i], label: labels[i], order: i};
              //console.log("data: "+data[i].value+" - "+"labels: "+labels[i]);
          }
          values.sort(function (a, b) {
              return b.value - a.value;
          });
 
          start = 180;
          
        
          for (i = 0; i < data.length; i++) {
              var val = 360 / total * data[i].value;
              (function (i, val) {
                  var coloring = "rgb(" + (i+1) *40 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
                  
                  var p = paper.path().attr({segment: [cx, cy, rad-20, 180, 180 + val], title: data[i].label || "", stroke: "none", fill: coloring});
                  
                  
                  p.ss = start;
                  p.ccx = cx;
                  p.ccy = cy;
                  p.vval = val;
                  
                  paths.push(p);
                  
                   p.click(function () {
                     paper.wipe();
                   });

                  
                  p.hover(function () {
                       //this.stop();
                      this.animate({opacity: .60}, 500,  "ease");
                      var title = p.attr("title");
                      console.log(title);
                      if (title == "Money") {
                        
                        var daily = (salary / 21);
                      
                        subfuncText.attr('text', "You took home "+(Math.round(amount/salary * 100))+" %");
                        subRev.attr('text',  "of the Ksh."+Math.round(daily)+" you earned today.");
                        subTime.attr('text', "");
                       
                      } else if (title == "State & Local Governments") {

                        subfuncText.attr('text', title);

                        var daily = (data[i].value / 21);
                        var aday = daily / hourly;

                        subRev.attr('text', "took around Ksh."+formatDollar(data[i].value)+" or about 10%");
                        subTime.attr('text', "of that as income tax, depending on your state.");

                      } else {
                          
                          subfuncText.attr('text', title);

                          var daily = (data[i].value / 21);
                          var aday = daily / hourly;
                          //var ayear = amount / hourly;

                          subRev.attr('text', "received Ksh."+formatDollar(data[i].value)+" of that Ksh."+formatDollar(amount));
                          subTime.attr('text', "or "+formatHoursFlat(aday)+" of your time today");
                      }
                      
                      
                   }, function () {
                       //this.animate({segment: [p.ccx, p.ccy, rad, p.ss, p.ss + p.vval]}, 500,  "bounce");
                       this.animate({opacity: 1}, 500,  "ease");
                       
                   });
                  
              })(i, val);
              start += val;
          }
          
          //bg.animate({r: 151}, 1000, "easeout");
          parent.animate(1000, "easeout");
    }
    
    
    this.showInfo = function (which, amount) {
        var start = 180,
            val;
            //var coloring = "rgb(" + (i+1) *23 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
        
        
        var fontSizer = 20;
         if(cx > 360 && cx <= 500){
            fontSizer = 16;
          }
          if(cx > 280 && cx <= 360){
            fontSizer = 14;
          }
          if(cx <= 280){
            fontSizer = 10;
          }
 
        var daily = ((amount / 21));
        var aday = daily / hourly;
        var ayear = amount / hourly;

        face.push(
         paper.circle(cx+2, cy+2, rad-wheight/25).attr({fill:"#dedddb", stroke: "none", "stroke-width": 4}),
          
          
          paper.text(cx, (cy-(rad-(fontSizer*6))), "This month you worked a total of").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),           
          paper.text(cx, (cy-(rad-(fontSizer*7.5))), formatHoursFlat(ayear)).attr({"font-family": "Crimson Text", 'font-size': (fontSizer+4)+"px", "font-style":"italic"}),
          paper.text(cx, (cy-(rad-(fontSizer*9))), "for a contribution of Ksh."+formatDollar(amount)).attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          
          paper.text(cx, cy-(fontSizer*2), "You worked").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+4)+"px"}),
          paper.text(cx, cy, formatHoursFlat(aday)+" today").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
          paper.text(cx, cy+fontSizer*2, "for the "+which).attr({"font-family": "Crimson Text", 'font-size': (fontSizer+4)+"px"}),
          //paper.text(cx, (cy-(rad-120)), "You paid $"+amount+" to the").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
          
          subfuncText = paper.text(cx, (cy+(rad-(fontSizer*10.5))), "Hover Over Any Inner Ring Slice").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px", "font-style":"italic"}),
          subRev = paper.text(cx, (cy+(rad-(fontSizer*9))), "For A Cost / Time Breakdown").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          subTime = paper.text(cx, (cy+(rad-(fontSizer*7.5))), "").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          
          closer = paper.text(cx, (cy+fontSizer*4), ">> BACK To Clock <<").attr({"font-family": "Crimson Text", 'font-size': (fontSizer-4)+"px"})
          //remove = paper.text(cx, (cy+fontSizer*5), "or REMOVE").attr({"font-family": "Crimson Text", 'font-size': (fontSizer-4)+"px"})
          
         );
         
         closer.click(function () {
             paper.wipe();
             pie.redraw();
             
          });
          
         // remove.click(function () {
         //             paper.wipe();
         //          });
    }
    
    this.showMoney = function (amount) {
        
        var fontSizer = 20;
         if(cx > 360 && cx <= 500){
            fontSizer = 16;
          }
          if(cx > 280 && cx <= 360){
            fontSizer = 14;
          }
          if(cx <= 280){
            fontSizer = 10;
          }
 
        var daily = Math.round((amount / 21));
        var aday = daily / hourly;
        var ayear = amount / hourly;
        
        face.push(
         paper.circle(cx+2, cy+2, rad-wheight/25).attr({fill:"#dedddb", stroke: "none", "stroke-width": 4}),
          
          
          paper.text(cx, (cy-(rad-(fontSizer*6))), "This month you took home").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),           
          paper.text(cx, (cy-(rad-(fontSizer*7.5))), "Ksh."+formatDollar(amount)+" and paid "+(100-Math.round(amount/salary * 100))+" %").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
          paper.text(cx, (cy-(rad-(fontSizer*9))), "of your salary of Ksh."+formatDollar(salary)+" towards taxes.").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          
          paper.text(cx, cy-(fontSizer*2), "You worked").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+4)+"px"}),
          paper.text(cx, cy, formatHoursFlat(aday)+" today").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
          paper.text(cx, cy+fontSizer*2, "for yourself.").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+4)+"px"}),
          //paper.text(cx, (cy-(rad-120)), "You paid $"+amount+" to the").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
          
          subfuncText = paper.text(cx, (cy+(rad-(fontSizer*10.5))), "Hover Over Any Inner Ring Slice").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px", "font-style":"italic"}),
          subRev = paper.text(cx, (cy+(rad-(fontSizer*9))), "For A Cost / Time Breakdown").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          subTime = paper.text(cx, (cy+(rad-(fontSizer*7.5))), "").attr({"font-family": "Crimson Text", 'font-size': (fontSizer)+"px"}),
          
          closer = paper.text(cx, (cy+fontSizer*4), ">> BACK To Clock <<").attr({"font-family": "Crimson Text", 'font-size': (fontSizer-4)+"px"})
          //remove = paper.text(cx, (cy+fontSizer*5), "or Click Here to CLOSE and Remove").attr({"font-family": "Crimson Text", 'font-size': (fontSizer-4)+"px"})
          
         );
         
         closer.click(function () {
             paper.wipe();
             pie.redraw();
             
          });
          
         // remove.click(function () {
         //             paper.wipe();
         //          });
    }
    
    this.wipe = function (){
      paths.animate({opacity: 0}, 1000, "easeout", function(){
        paths.remove();
        
      });
      
      face.animate({r: 0}, 1000, "easeout", function(){
        face.remove();
        
      });
      
    }
    
    this.animate = function (ms, effect, backto) {
        var start = 180,
            val;
            
        for (i = 0; i < data.length; i++) {
          if(i < paths.length){
            val = 360 / total * data[i].value;
            if( i == data.length -1 ){
              var func = backto;
            }
            var p = paths[i];
            p.ss = start;
            p.ccx = cx;
            p.ccy = cy;
            p.vval = val;
            p.animate({segment: [cx, cy, rad, start, start += val]}, ms || 1500, effect || "bounce", func || "");
            p.angle = start - val / 2;
          }else{
            //this.insert();
          }  
            
        }
    }
    
    return this;
};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};
