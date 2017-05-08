---
---

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
  
      c = paper.circle(cx, cy, rad).attr({fill:"#0D68A8", stroke:"#fff",'stroke-width':8}),
      n12 = paper.text(cx, cy-(rad-60),'12').attr({"font-size":"36px", "font-family":"Poppins", "fill":"#fff"}),
      n3 = paper.text(cx+(rad-50),cy,'3').attr({"font-size":"26px", "font-family":"Poppins", "fill":"#fff"}),
      n6 = paper.text(cx,cy+(rad-50),'6').attr({"font-size":"26px", "font-family":"Poppins", "fill":"#fff"}),
      n9 = paper.text(cx-(rad-50),cy,'9').attr({"font-size":"26px", "font-family":"Poppins", "fill":"#fff"})
      
    ); 
    for (var i = 0; i < 60; i++) {
      var trad = 1;
      var ccol = "fff";
      if ((i%5) == 0 ){
        trad = 5;
        ccol = "fff";
      }
      chart.push(
        paper.circle( 
        ((rad-20)  * Math.cos(i / 60 * 2 * Math.PI) + cx), 
        ((rad-20)  * Math.sin(i / 60 * 2 * Math.PI) + cy),
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
      thesalary.attr('text', "{{ site.currency }} "+formatDollar(salary));
    }
      
    
    chart.push( 
      paper.circle(cx, cy, rad).attr({fill:"none", stroke:"#fff",'stroke-width':6}),
      //paper.image("images/usa.png", cx-81,(cy-(rad-65)), 162, 86),
      thesalary = paper.text(cx, (cy-(rad-(fontSizer*9))), "{{ site.currency }} "+formatDollar(salary)).attr({"font-family": "Poppins", 'font-size':  (fontSizer+6)+"px", fill:"#fff"}),

      // paper.text(cx, (cy-(rad-(fontSizer*10.35))), "IN").attr({"font-family": "Poppins", 'font-size':  (fontSizer-4)+"px", fill:"#fff"}),

      // theyear= paper.text(cx, (cy-(rad-(fontSizer*11.5))), year.toString().split("").join(" ")).attr({"font-family": "Poppins", 'font-size':  (fontSizer+6)+"px", fill:"#fff"}),

      //paper.text(cx+100, (cy-(rad-200)), "1 2 4").attr({"font-family": "Crimson Text", 'font-size': "17px", fill:"#38383a"}),
      //paper.image("images/datepicker.png", cx-26,(cy-(rad-113)), 51, 19),
      //paper.image("images/salary.png", cx-38,(cy-(rad-143)), 75, 19),
      //paper.image("images/hourly.png", cx+80,(cy-(rad-189)), 39, 19),

      chart.spent = paper.text(cx, (cy+(rad-(fontSizer*11.5))), "Time spent working for").attr({"font-family": "Poppins", 'font-size': fontSizer+"px", "text-align":"center", fill:"#fff"}),
      workingFor = paper.text(cx, (cy+(rad-(fontSizer*9.8))), "{{ site.government }}").attr({"font-family": "Poppins", 'font-size': (fontSizer+6)+"px", "font-style":"italic", fill:"#fff"}),
      clickHere = paper.text(cx, (cy+(rad-(fontSizer*8))), "Hover Over Any Color Slice For More Info").attr({"font-family": "Poppins", 'font-size': fontSizer+"px", "text-align":"center", fill:"#fff"})

    );
    sec = (cy-(rad-20));
    
    chart.push(

      mid = paper.circle(cx, cy, 6).attr({stroke: "none", fill:"#ED1C24"}),
      pa = "M"+(cx)+" "+(cy)+"L"+(cx)+" ",

      handHour = paper.path(pa+(sec + 100)).attr({'stroke-width':stroker+5,stroke:"#fff", 'stroke-opacity': 0.5}),
      handMin = paper.path(pa+(sec + 20)).attr({'stroke-width':stroker+5,stroke:"#fff", 'stroke-opacity': 0.5}),
      midSec = paper.circle(cx, cy, 12).attr({stroke: "none", fill:"#ED1C24"}),
      handSec = paper.path(("M"+(cx)+" "+(cy+40)+"L"+(cx)+" ")+sec).attr({'stroke-width':stroker,stroke:"#5394C1"}),

      midSec = paper.circle(cx, cy, 20).attr({stroke: "none", fill:"#ED1C24"})

    );
    
    chart.writeto = function (text, time, link) {
      workingFor.attr('text', text);
      this.spent.attr('text', time+" today working for");
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
