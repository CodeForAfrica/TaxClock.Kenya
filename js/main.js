$(window).on('load', function() {
    var host = window.location;
    var search = host.search;
    if (search.indexOf("income") > -1) {
	var index = host.href.indexOf("?");
	var new_url = host.href.substr(0, index);
	
	new_salary = parseInt(search.split("=")[1]);
	window.history.replaceState({}, "TaxClock Kenya", new_url);
	
	$('input[name="income"]').val(new_salary);
	
    } else {
	$('input[name="income"]').val(50000);
    }
    incomeChange();
    TC.clock.update();
    
    
    // Show on Safari

    if (isSafari) {$('.visible-safari').show();}
    
});
