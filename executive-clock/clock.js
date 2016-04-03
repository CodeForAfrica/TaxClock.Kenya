Raphael.fn.clock = function (cx, cy, rad) {
    var paper = this,
        chart = this.set(),
        handHour,
        handMin,
        handSec,
        midSec,
        workingFor,
        spent,
        clickHere;

   var fontSizer = 20;
   var stroker = 8;
   
    if(cx > 360 && cx <= 500){
       fontSizer = 16;
       var stroker = 7;
      
     }
     if(cx > 280 && cx <= 360){
       fontSizer = 14;
       var stroker = 6;
       
     }
     if(cx <= 280){
       fontSizer = 10;
       var stroker = 5;
       
     }
                  
    Raphael.fn.clock.tick = function () {
            var t = new Date( (new Date()).getTime() - (offset * 1000) );
            var hour   = t.getHours()
          var minute = t.getMinutes()
          var second = t.getSeconds()
         
          handSec.animate({rotation: (second * 6)  + " "+(cx)+" "+(cy)}, 1, "bounce");
          handMin.animate({rotation: (minute * 6)  + " "+(cx)+" "+(cy)}, 1, "bounce");
          handHour.animate({rotation: ((hour * 30) + (minute * 0.5))  + " "+(cx)+" "+(cy)}, 1, "bounce");
            
        }
    

      this.rollBack = function (years) {
        var t = new Date( (new Date()).getTime() - (offset * 1000) );
            var hour   = t.getHours()
            var minute = t.getMinutes()
            var second = t.getSeconds()
            window.clearInterval(tickTock);
            
            if(years < 0){
              abs = -1;
              years = years * -1;
            }else{
              abs = 1;
            }
            
            handSec.animate({rotation: (second * 6) - (360*6*abs) + " "+(cx)+" "+(cy)}, 2000, "ease");
            handMin.animate({rotation: (minute * 6) - (360*3*abs) + " "+(cx)+" "+(cy)}, 2000, "ease");
            handHour.animate({rotation: (((hour * 30) - (minute * 0.5))) + (-360*abs) + " "+(cx)+" "+(cy)}, 2000, "ease", function(){
              tickTock = window.setInterval("Raphael.fn.clock.tick()", 1000);
              
            });
            
        }
        
        tickTock = window.setInterval("Raphael.fn.clock.tick()", 1000);
        
        chart.push(
      
         c = paper.circle(cx, cy, rad).attr({fill:"#dedddb", stroke:"#676767",'stroke-width':8}),
         n12 = paper.text(cx, cy-(rad-30),'12').attr({"font-size":"36px", "font-family":"Crimson Text"}),
         n3 = paper.text(cx+(rad-20),cy,'3').attr({"font-size":"26px", "font-family":"Crimson Text"}),
         n6 = paper.text(cx,cy+(rad-20),'6').attr({"font-size":"26px", "font-family":"Crimson Text"}),
         n9 = paper.text(cx-(rad-20),cy,'9').attr({"font-size":"26px", "font-family":"Crimson Text"})
          
        ); 
        for (var i = 0; i < 60; i++) {
            var trad = 1;
            var ccol = 676767;
            if ((i%5) == 0 ){
              trad = 2;
              ccol = 252628;
            }
          chart.push(
            paper.circle( 
                                 ((rad-5)  * Math.cos(i / 60 * 2 * Math.PI) + cx), 
                                 ((rad-5)  * Math.sin(i / 60 * 2 * Math.PI) + cy),
                                 trad
                               ).attr({stroke: "none", fill:"#"+ccol}));
        }

     

      
      chart.updateYear = function(){
          theyear.attr('text', year.toString().split("").join(" "));
          paper.rollBack(oldYear - year);
      }
      
      chart.updateSalary = function(){
        if(salary < 100000){
          spacerS = "0 ";
        }else{
          spacerS = "";
        }
          thesalary.attr('text', "$"+formatDollar(salary));
      }
      
      
      
        chart.push( 
          paper.circle(cx, cy, rad).attr({fill:"none", stroke:"#a7a7a7",'stroke-width':6}),
          //paper.image("images/usa.png", cx-81,(cy-(rad-65)), 162, 86),
          thesalary = paper.text(cx, (cy-(rad-(fontSizer*7))), "$"+formatDollar(salary)).attr({"font-family": "Crimson Text", 'font-size':  (fontSizer+6)+"px", fill:"#38383a"}),
          
          paper.text(cx, (cy-(rad-(fontSizer*8.35))), "IN").attr({"font-family": "Crimson Text", 'font-size':  (fontSizer-4)+"px", fill:"#38383a"}),
          
          theyear= paper.text(cx, (cy-(rad-(fontSizer*9.5))), year.toString().split("").join(" ")).attr({"font-family": "Crimson Text", 'font-size':  (fontSizer+6)+"px", fill:"#38383a"}),
          
          //paper.text(cx+100, (cy-(rad-200)), "1 2 4").attr({"font-family": "Crimson Text", 'font-size': "17px", fill:"#38383a"}),
          //paper.image("images/datepicker.png", cx-26,(cy-(rad-113)), 51, 19),
          //paper.image("images/salary.png", cx-38,(cy-(rad-143)), 75, 19),
          //paper.image("images/hourly.png", cx+80,(cy-(rad-189)), 39, 19),
          
          chart.spent = paper.text(cx, (cy+(rad-(fontSizer*9.5))), "Time spent working for the").attr({"font-family": "Crimson Text", 'font-size': fontSizer+"px", "text-align":"center"}),
          workingFor = paper.text(cx, (cy+(rad-(fontSizer*7.8))), "United States Government").attr({"font-family": "Crimson Text", 'font-size': (fontSizer+6)+"px", "font-style":"italic"}),
        clickHere = paper.text(cx, (cy+(rad-(fontSizer*6))), "Click Any Color Slice For More Info").attr({"font-family": "Crimson Text", 'font-size': fontSizer+"px", "text-align":"center"})
          
     );
     sec = (cy-(rad-20));
    
     chart.push(

         mid = paper.circle(cx, cy, 6).attr({stroke: "none", fill:"#000"}),
         pa = "M"+(cx)+" "+(cy+40)+"L"+(cx)+" ",
      
         handHour = paper.path(pa+(sec + 55)).attr({'stroke-width':stroker,stroke:"#252628"}),
         handMin = paper.path(pa+(sec + 30)).attr({'stroke-width':stroker-2,stroke:"#252628"}),
        midSec = paper.circle(cx, cy, 12).attr({stroke: "none", fill:"#252628"}),
         handSec = paper.path(pa+sec).attr({'stroke-width':stroker-4,stroke:"#7a2221"}),
     
         midSec = paper.circle(cx, cy, 7).attr({stroke: "none", fill:"#7a2221"})
      
      
    );
    
    chart.writeto = function (text, time, link) {
            workingFor.attr('text', text);
            this.spent.attr('text', time+" today working for the");
            //clickHere.attr('text', link)
        }
          
    return chart;
};

Raphael.fn.timeline = function (width, ticks) {
    var paper = this,
        chart = this.set(),
        ticks = ticks;
        pa = "M"+(3)+" "+(2)+"L"+(width+5)+" "+(2);
        chart.push(      
         paper.path(pa).attr({'stroke-width':4,stroke:"#e4e0da"})
         
         //paper.path("M3 0L3 30").attr({'stroke-width':2,stroke:"#e4e0da"}),
         //paper.path("M404 0L404 30").attr({'stroke-width':2,stroke:"#e4e0da"})
         
          
        ); 
        
     // for (var i = 0; i < 31; i++) {
     //             var pa = "M"+(i * 13.533333)+" "+(0)+"L"+(i * 13.5333333)+" "+(20);
     //             
     //             var trad = 1;
     //             var ccol = 676767;
     //             if ((i%5) == 0 ){
     //               trad = 2;
     //               ccol = 252628;
     //             }
     //             chart.push(
     //               //paper.path(pa).attr({'stroke-width':1,stroke:"#e4e0da"})
     //               paper.circle( 5+ i * 13.433333, 6, 3).attr({stroke: "none",fill:"#e4e0da"})
     //             );
     //         }
                  
              //chart.push( paper.circle(402, 402, 350).attr({fill:"none", stroke:"#a7a7a7",'stroke-width':6}) );
    
    return chart;
};