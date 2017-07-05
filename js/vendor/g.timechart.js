/*
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.timechart = function (cx, cy, rad, opts) {
    if (typeof opts === 'undefined') { opts = {sorted:true}}
    var data = [];
    var paper = this;
    var data = 0, //[24, 92, 24, 52, 78, 99, 82, 27]
        paths = paper.set(),
        total,
        start,
        oldData,
        oldItem,
        bg = paper.circle(cx, cy, 0).attr({stroke: "none", "stroke-width": 4});
        
    //change coloring to match TC.colors
    var coloring = ["#5394C1", "#ED1C24", "#1B4969", "#1DA087", "#A6DDD3", "#547770", "#A9A6A6", "#97B4B7", "#636263", "#824D58", "#532F37", "#371A13", "#9A9B78", "#102B3A", "#1B564B", "#D3D35B", "#D1AD5D", "#A2E28A", "#444444", "#000", "#48494B", "#81549D", "#5E1517", "#414C8C", "#808AB2", "#172872", "#4C5472", "#DDC7D4", "#823464", "#AF1E29", "#EA971F", "#EDBE6C", "#D46137", "#E28A79", "#E281A0", "#E0446D", "#89343E", "#99618C", "#0D68A8"];
    //var coloring = ["#ED1C24", "#1B4969", "#1DA087", "#A6DDD3", "#547770", "#A9A6A6", "#97B4B7", "#636263", "#AF1E29", "#EA971F", "#EDBE6C", "#D46137", "#E28A79", "#E281A0", "#E0446D", "#89343E", "#99618C", "#000", "#48494B", "#81549D", "#5E1517", "#414C8C", "#808AB2", "#172872", "#4C5472", "#DDC7D4", "#823464", "#824D58", "#532F37", "#371A13", "#9A9B78", "#102B3A", "#1B564B", "#D3D35B", "#D1AD5D", "#A2E28A", "#444444"];
    //var coloring = ["#60744f", "#495031",  "#87936f", "#576a4e", "#6a7854", "#969a7f", "#a2a47f", "#a1735b", "#7b5252", "#b9a868",  "#c4b880", "#736a2f", "#73572f", "#d84f13",  "#ffe010", "#7c94ec","#9d110a","#7c0986", "#d3d9b7","#bdc6a9", "#d8d4b1"];
             
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
	if (opts.sorted) {
	   values.sort(function (a, b) {
           return b.value - a.value;
       });
       };
       start = 180;
       
       this.animateAll(2500, "bounce");
    }
    
    this.draw = function (values, labels, ids) {
          data = values;
          var self = this;
          
          //data = data.sort(function (a, b) { return b - a;});
          
          total = 0;
          for (var i = 0; i < data.length; i++) {
              total += data[i];
              data[i] = {value: data[i], label: labels[i], order: i};
              //console.log("data: "+data[i].value+" - "+"labels: "+labels[i]);
          }
          
          if (opts.sorted) {
          values.sort(function (a, b) {
              return b.value - a.value;
          });
          };
 
          start = 180;
         
          for (i = 0; i < data.length; i++) {
              //var val = 270 / total * data[i].value;
              var val = 270 * data[i].value;
              (function (i, val) {
                //var coloring = "rgb(" + (i+1) *23 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
                  
                  var p = paper.path().attr({segment: [cx, cy, rad-20, 180, 180 + val], title: data[i].label || "", stroke: "none", fill: coloring[i]});
                  var od = false;
                  
                  p.ss = start;
                  p.ccx = cx;
                  p.ccy = cy;
                  p.vval = val;
                  
                  paths.push(p)

                  // REMOVE CLICK OPTION
                  
                  // p.click(function () {
                    
                  //     parent.redraw();
                      
                  //     d = data[i];
                  //     oldItem = d;
                  //     oldData = d.value;
                  //     total += d.value;
                  //     d.value *= 2;
                  //     parent.animateAll("600", "bounce", function(){
                  //       this.stop();
                  //       total -= d.value;
                  //       d.value = 0; //REMOVE
                  //       //total -= d.value /2;
                  //       //d.value /= 2;
                  //       var lb = d.label;
                  //       var vl = oldData;
                  //       var wh = i;

                  //       parent.animateAll("600", "bounce", function(){
                  //         if (wh > 0) {
                  //           getInfo(ids[wh-1], wh, lb, vl);
                  //         } else {
                  //           getMoney();
                  //         }
                          
                  //       });
                  //     });
                  // });
                  
                  p.hover(function () {
                       this.stop();
                       this.animate({segment: [p.ccx, p.ccy, rad+10, p.ss, p.ss + p.vval]}, 500,  "bounce");
                       
                       var daily = (data[i].value * 21 * 8);
                       //var aday = daily / hourly;
                       var aday = (data[i].value * 8);
                        
                       clocked.writeto(p.attr("title"),formatHoursFlat(aday));
                      //$("#dept").html(p.attr("title"));
                   }, function () {
                       this.animate({segment: [p.ccx, p.ccy, rad, p.ss, p.ss + p.vval]}, 500,  "bounce");
                       
                   });
                  
              })(i, val);
              start += val;
          }
          
          //bg.animate({r: 151}, 1000, "easeout");
          self.animateAll(1000, "bounce");
    }
    
    this.redraw = function () {
      if(oldItem){
        oldItem.value = oldData;                        
        total += oldItem.value;
        this.animateAll(1000, "bounce");
      }      
      oldItem = false;
      oldData = false;
    }
    
    this.showInfo = function (i, which) {
        var start = 180,
            val;
            var coloring = "rgb(" + (i+1) *23 + ", " + (i+1)*53 + ", " + (i+1)*13 + ")";
        
        var infoBg = paper.circle(cx+2, cy+2, 0).attr({fill:coloring, stroke: "none", "stroke-width": 4});   
        infoBg.animate({r: rad-60}, 500,  "ease");
        
    }
    
    this.animateAll = function (ms, effect, backto) {
        var start = 150,
            val;
            
        for (i = 0; i < data.length; i++) {
          if(i < paths.length){
            val = 270 * data[i].value;
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
//        var self = this;
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
//        self.animate();
