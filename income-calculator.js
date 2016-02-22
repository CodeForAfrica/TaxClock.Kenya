var IncomeCalculator = function() {
  var self = this;

  this.VAT = 0.14;

  // Budget revenue streams from individuals (billions)
  this.PERSONAL_INCOME_TAX_REVENUE = 350;
  this.VAT_REVENUE = 260.6;

  // Budget expenditure by category, in billions
  // see https://docs.google.com/spreadsheets/d/18pS6-GXmV2AE6TqKtYYzL6Ag-ZuwiE4jb53U9heWF1M/edit#gid=0
  //
  // Total budget expenditure
  this.CONSOLIDATED_EXPENDITURE = 1351;

  // Categorised expenditure (should, but doesn't have to, total to CONSOLIDATED_EXPENDITURE)
  this.EXPENDITURE = {
    'Basic education': 203.5,
    'Debt-service costs': 126.4,
    // etc.
  };

  // fraction of budget line items that are funded through
  // personal tax and VAT
  this.TAXPAYER_RATIO = (this.PERSONAL_INCOME_TAX_REVENUE + this.VAT_REVENUE) / this.CONSOLIDATED_EXPENDITURE;

  // start of day as a moment.js object. The date is irrelevant.
  this.START_OF_DAY = moment().hour(9).minute(0).second(0);

  this.WORKDAY_HOURS = 8;
  this.WORKDAY_MINS = this.WORKDAY_HOURS * 60;

  this.calculateIncomeBreakdown = function(income) {
    var info = {};

    info.income = income;

    // income tax
    info.incomeTax = self.incomeTax(info);
    // after tax income
    info.netIncome = income - info.incomeTax;

    // VAT calculated on net income
    info.vatTax = self.vatTax(info);

    // total personal tax
    info.personalTax = info.incomeTax + info.vatTax;
    // income after tax and VAT
    info.disposableIncome = income - info.personalTax;

    // times spent working for yourself
    info.personal_fraction = info.disposableIncome / info.income;
    info.personal_minutes = info.personal_fraction * self.WORKDAY_MINS;
    // times spent working for the man
    info.taxman_minutes = self.WORKDAY_MINS - info.personal_minutes;

    info.breakdown = this.doBreakdown(info);

    // time spent working for myself
    info.breakdown.push(this.workingForSelf(info));
    
    // sort
    info.breakdown = _.sortBy(info.breakdown, function(b) { return -b.fraction; });

    // add times of day
    this.addTimesOfDay(info.breakdown);

    return info;
  };

  this.incomeTax = function(info) {
    // TODO
    // return info.income * 0.3;  // 30%
    return 69586;
  };

  this.vatTax = function(info) {
    return info.netIncome * this.VAT;
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
      var fraction = amount / self.CONSOLIDATED_EXPENDITURE;

      return {
        name: category,
        // absolute amount from budget
        amount: amount,
        // amount contributed by the taxpayer
        taxpayer_amount: taxpayer_amount,
        // fraction of time spent on this amount
        fraction: fraction,
        // minutes per day spent on this amount
        minutes: info.taxman_minutes * fraction,
      };
    });
  };

  this.addTimesOfDay = function(cats) {
    var time = this.START_OF_DAY;

    _.each(cats, function(cat) {
      // time of day when you FINISH working for this category
      time = time.clone().add(cat.minutes, 'm');

      cat.finish_time = time.clone();
      cat.finish_time_s = time.format('h:mm a');
    });
  };
};
