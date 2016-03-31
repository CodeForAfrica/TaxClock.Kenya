/*
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.timechart = function (cx, cy, rad, opts) {
    var data = [];
    var paper = this
    var data = 0, //[24, 92, 24, 52, 78, 99, 82, 27]
        paths = paper.set(),
        total,
        start,
        bg = paper.circle(cx, cy, 0).attr({stroke: "none", "stroke-width": 4});
    
             
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
    
    this.update = function (values, labels, ids) {
      //this.draw(values);
       data = values;
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
       
       this.animate(2500, "bounce");
    }
    
    this.draw = function (values, labels, ids) {
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
              var val = 270 / total * data[i].value;
              (function (i, val) {
                  var coloring = "rgb(" + (i+1) *23 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
                  
                  var p = paper.path().attr({segment: [cx, cy, rad-20, 180, 180 + val], title: data[i].label || "", stroke: "none", fill: coloring});
                  
                  
                  p.ss = start;
                  p.ccx = cx;
                  p.ccy = cy;
                  p.vval = val;
                  
                  paths.push(p)
                  
                  p.click(function () {
                      d = data[i];
                      od = d.value;
                      total += d.value;
                      d.value *= 2;
                      parent.animate("600", "bounce", function(){
                        this.stop();
                        total -= d.value;
                        d.value = 0; //REMOVE
                        //total -= d.value /2;
                        //d.value /= 2;
                        var lb = d.label;
                        var vl = od;
                        var wh = i;

                        parent.animate("600", "bounce", function(){
                          getInfo(ids[wh], wh, lb, vl);
                          
                        });
                      });
                      
                      $("#info").html(getInfo(d.label,d.value));
                      //console.log(d.label);
                  });
                  
                  p.hover(function () {
                       this.stop();
                       this.animate({segment: [p.ccx, p.ccy, rad+10, p.ss, p.ss + p.vval]}, 500,  "bounce");
                       clocked.writeto(p.attr("title"));
                      //$("#dept").html(p.attr("title"));
                   }, function () {
                       this.animate({segment: [p.ccx, p.ccy, rad, p.ss, p.ss + p.vval]}, 500,  "bounce");
                       
                   });
                  
              })(i, val);
              start += val;
          }
          
          //bg.animate({r: 151}, 1000, "easeout");
          parent.animate(1000, "bounce");
    }
    
    
    this.showInfo = function (i, which) {
        var start = 180,
            val;
            var coloring = "rgb(" + (i+1) *23 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
        
        var infoBg = paper.circle(cx+2, cy+2, 0).attr({fill:coloring, stroke: "none", "stroke-width": 4});   
        infoBg.animate({r: rad-60}, 500,  "ease");
        
    }
    
    this.animate = function (ms, effect, backto) {
        var start = 180,
            val;
            
        for (i = 0; i < data.length; i++) {
          if(i < paths.length){
            val = 270 / total * data[i].value;
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

// //this.draw(values);
//        parent = this;
//        old_data = data;
//        //data = values;
//        differO = data.diff(values);
//        differ = values.diff(data);
//        console.log(differ);
//        
//        for (var i = 0; i < differ.length; i++) {
//             var where = data.indexOf(differO[i]);
//             console.log(total);
//             data[where] = differ[i];
//             total += data[where];
//             console.log(data[where]);
//             
//             
//         }
//        parent.animate();