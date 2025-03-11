---
---
var IncomeCalculator = function() {
  var self = this;

  this.VAT = {{ site.vat }};

  function TaxBand(marginalRate, baseAmount, threshold, limit) {
    this.marginalRate = marginalRate;
    this.baseAmount = baseAmount;
    this.threshold = threshold;
    this.limit = (arguments.length > 3) ? this.limit = limit : this.limit = Number.POSITIVE_INFINITY;
  }

  // TODO: Move to _data
  // tax bands -- with thanks to https://apps.wingubox.com/best-paye-tax-calculator-for-kenya
  this.TAX_TABLE = [
    new TaxBand(0.10, 0, 0, 12298),
    new TaxBand(0.15, 1229.8, 12299, 23885),
    new TaxBand(0.20, 2967.5, 23886, 35472),
    new TaxBand(0.25, 5285.25, 29318, 47059),
    new TaxBand(0.30, 8182, 47060),
  ];

  this.PRIMARY_REBATE = {{ site.primary_rebate }};

  // Budget revenue streams from individuals (billions)
  this.PERSONAL_INCOME_TAX_REVENUE = {{ site.income_tax_revenue }} * Math.pow(10,9);
  this.VAT_REVENUE = {{ site.vat_revenue }} * Math.pow(10,9);

  // Housing Levy: https://kra.go.ke/images/publications/The-Finance-Act--2023.pdf#page=55
  this.HOUSING_LEVY = {{ site.housing_levy }} * Math.pow(10,9);

  // https://apps.wingubox.com/blog/category/updates/new-shif-rates-for-your-kenyan-payroll
  this.SHIF = {{ site.shif }} * Math.pow(10,9);

  // Budget expenditure by category, in millions
  // see http://www.treasury.go.ke/component/jdownloads/send/198-2018-2019/890-budget-highlights-2018-19.html

  // TODO: Move to _data
  // Categorised expenditure (should, but doesn't have to, total to CONSOLIDATED_EXPENDITURE)
  this.EXPENDITURE = {
    'Education': (444.1 * Math.pow(10,9)),
    'Public Healthcare': (90.0 * Math.pow(10,9)),
    'Law and Order': (190.4 * Math.pow(10,9)),
    'Debt Repayment': (493.0 * Math.pow(10,9)),
    'Agriculture, Rural & Urban Development': (47.1 * Math.pow(10,9)),
    'Energy, Infrastructure & ICT': (418.8 * Math.pow(10,9)),
    'Environment Protection, Water & Natural Resources': (77.0 * Math.pow(10,9)),
    'County Shareable Revenue': (314.0 * Math.pow(10,9)),
    'Trade and Commerce': (25.4 * Math.pow(10,9)),
    'Running Government': (270.1 * Math.pow(10,9)),
    'Social Protection': (44.4 * Math.pow(10,9)),
    'Military and Intelligence Services': (142.3  * Math.pow(10,9)),
  };

  // override ordering
  this.ORDERING = {
    'Working for yourself': 9999,
    'Debt Repayment': -1,
  };

  // Total budget expenditure
  this.CONSOLIDATED_EXPENDITURE = _.reduce(_.values(this.EXPENDITURE), function(t, n) { return t + n; }, 0);

  // Gross savings (% of GDP)
  this.GROSS_SAVINGS = {{ site.gross_savings }};

  // fraction of budget line items that are funded through
  // personal tax and VAT
  this.TAXPAYER_RATIO = (this.PERSONAL_INCOME_TAX_REVENUE + this.VAT_REVENUE) / this.CONSOLIDATED_EXPENDITURE;

  // start of day as a moment.js object. The date is irrelevant.
  this.START_OF_DAY = moment().hour(8).minute(0).second(0);

  this.WORKDAY_HOURS = 8;
  this.WORKDAY_MINS = this.WORKDAY_HOURS * 60;
  //let's make sure the day ends at 5pm by adding 60 minutes to the 480 WORKDAY_MINS.
  this.END_OF_DAY = this.START_OF_DAY.clone().add(this.WORKDAY_MINS + 60, 'minutes');

  this.calculateIncomeBreakdown = function(income) {
    var info = {};

    info.income = income;

    // income tax
    info.incomeTax = self.incomeTax(info);
    // after tax income
    info.netIncome = income - info.incomeTax;

    // VAT calculated on net income (less gross savings)
    info.vatTax = self.vatTax(info);

    // total personal tax
    info.personalTax = info.incomeTax + info.vatTax;
    // income after tax and VAT
    info.disposableIncome = income - info.personalTax;

    // fraction of day spent working for yourself
    info.personal_fraction = info.disposableIncome / info.income;
    // times spent working for yourself
    info.personal_minutes = info.personal_fraction * self.WORKDAY_MINS;
    // times spent working for the man
    info.taxman_minutes = self.WORKDAY_MINS - info.personal_minutes;
    // fraction of day spent working for the man
    info.taxman_fraction = 1 - info.personal_fraction;

    info.breakdown = this.doBreakdown(info);

    // time spent working for myself
    info.breakdown.push(this.workingForSelf(info));

    // sort
    info.breakdown = _.sortBy(info.breakdown, function(b) {
      return self.ORDERING[b.name] || -b.fraction;
    });

    // add times of day
    this.addTimesOfDay(info.breakdown);

    return info;
  };

  this.incomeTax = function(info) {
    var gross_income_tax = 0;
    var band = _.find(this.TAX_TABLE, function(b) {
      return (info.income >= b.threshold) && (info.income <= b.limit);
    });

    if (band) {
      gross_income_tax = band.baseAmount + (band.marginalRate * (info.income - band.threshold));
      gross_income_tax = gross_income_tax - this.HOUSING_LEVY + this.SHIF;
      gross_income_tax = gross_income_tax - this.PRIMARY_REBATE;
    }

    if (gross_income_tax < 0) gross_income_tax = 0;

    return gross_income_tax;
  };

  this.vatTax = function(info) {
    let netIncomeLessSavings = info.netIncome * (1 - (this.GROSS_SAVINGS/100));
    return netIncomeLessSavings * this.VAT / (1 + this.VAT);
  };

  this.workingForSelf = function(info) {
    return {
      name: 'Working for yourself',
      amount: info.income,
      taxpayer_amount: info.disposableIncome,
      fraction: info.personal_fraction,
      minutes: info.personal_minutes,
    };
  };

  this.doBreakdown = function(info) {
    return _.map(this.EXPENDITURE, function(amount, category) {
      // scale amount to that contributed by personal taxpayers
      var taxpayer_amount = self.TAXPAYER_RATIO * amount;
      var fraction = amount / self.CONSOLIDATED_EXPENDITURE * info.taxman_fraction;

      return {
        name: category,
        // absolute amount from budget
        amount: amount,
        // amount contributed by the taxpayer
        taxpayer_amount: taxpayer_amount,
        // fraction of time spent on this amount
        fraction: fraction,
        // minutes per day spent on this amount
        minutes: self.WORKDAY_MINS * fraction,
      };
    });
  };

  this.addTimesOfDay = function(cats) {
  	//let us have an hour long lunch from 13:00
  	var startlunch = this.START_OF_DAY.clone().add(5, 'hours');
  	
  	var endlunch = startlunch.clone().add(1, 'hours');
  	
    var time = this.START_OF_DAY;

    _.each(cats, function(cat) {
      // time of day when you FINISH working for this category
      	time = time.clone().add(cat.minutes, 'm');
      
      
      if (time.isAfter(endlunch)){
      	//if activity comes up after lunch hour, let's account for the one hour lunch break. 
      	time = time.clone().add(1, 'hours');
     	cat.finish_time = time.clone();
      	cat.finish_time_s = time.format('h:mm a');
      }else{
      	cat.finish_time = time.clone();
      	cat.finish_time_s = time.format('h:mm a');
      }
    });
  };
};
