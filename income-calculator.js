var IncomeCalculator = function() {
  var self = this;

  this.VAT = 0.16;

  function TaxBand(marginalRate, baseAmount, threshold, limit) {
    this.marginalRate = marginalRate;
    this.baseAmount = baseAmount;
    this.threshold = threshold;
    this.limit = (arguments.length > 3) ? this.limit = limit : this.limit = Number.POSITIVE_INFINITY;
  }

  // tax bands -- with thanks to http://www.oldmutual.co.za/markets/south-african-budget/income-tax-calculator
  this.TAX_TABLE = [
    new TaxBand(0.10, 0, 10165),
    new TaxBand(0.15, 10166, 19741),
    new TaxBand(0.20, 19742, 29317),
    new TaxBand(0.25, 29318, 38893),
    new TaxBand(0.30, 38895, 701300),

  ];

  this.PRIMARY_REBATE = 1162;  //tax relief to be confirmed

  // Budget revenue streams from individuals (billions)
  this.PERSONAL_INCOME_TAX_REVENUE = 15.1;
  this.VAT_REVENUE = 19.4;

  // Budget expenditure by category, in millions
  // see https://docs.google.com/spreadsheets/d/18pS6-GXmV2AE6TqKtYYzL6Ag-ZuwiE4jb53U9heWF1M/edit#gid=0

  // Categorised expenditure (should, but doesn't have to, total to CONSOLIDATED_EXPENDITURE)
  this.EXPENDITURE = {
      'Sports Culture and Arts':	322703275.7,
      'Gender and Equality Commission':	15770910.8,
      'National Intelligence Service':	1453333333.3,
      'Land Commission':	54361512.5,
      'Police Service Commission':	23176603.3,
      'Attorney General and Department of Justice':	276138474.3,
      'Director of Public Prosecutions':	154315105.3,
      'The Registrar of Political Parties':	38913412.7,
      'Public Service Commission':	92267026.1,
      'Ministry of Agriculture':	2442764241.3,
      'Ministry of Commerce and Tourism':	361308949.5,
      'Coordination of National Government': 1339040585,
      'Ministry of Devolution':	573595776.3,
      'East African Affairs':	140300314,
      'Ministry of Education':	6374924121.5,
      'Environment And Natural Resources':	3943715324.2,
      'Ministry of Fisheries':	177828055.4,
      'Ministry of Livestock':	461165927.3,
      'Ministry of Planning':	5528700334.8,
      'Science and Technology':	11654274538,
      'Infrastructure':	10294460699.8,
      'Interior':	6965781616.2,
      'Transport':	3784038673.1,
      'Salaries and Remuneration Commission':	28387457.8,
      'Teachers Service Commission':	13801164889,
      'Commission on Administrative Justice':	22707125,
      'Commission on Revenue Allocation':	22067956.8,
      'Presidency':	354126966.4,
      'Witness Protection Agency':	14139583.3,
  };

  // override ordering
  this.ORDERING = {
    'Working for yourself': 9999,
    'National debt': -1,
  };

  // Total budget expenditure
  this.CONSOLIDATED_EXPENDITURE = _.reduce(_.values(this.EXPENDITURE), function(t, n) { return t + n; }, 0);

  // fraction of budget line items that are funded through
  // personal tax and VAT
  this.TAXPAYER_RATIO = (this.PERSONAL_INCOME_TAX_REVENUE + this.VAT_REVENUE) / this.CONSOLIDATED_EXPENDITURE;

  // start of day as a moment.js object. The date is irrelevant.
  this.START_OF_DAY = moment().hour(9).minute(0).second(0);

  this.WORKDAY_HOURS = 8;
  this.WORKDAY_MINS = this.WORKDAY_HOURS * 60;
  this.END_OF_DAY = this.START_OF_DAY.clone().add(this.WORKDAY_MINS, 'minutes');

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
      gross_income_tax = gross_income_tax - this.PRIMARY_REBATE;
    }

    if (gross_income_tax < 0) gross_income_tax = 0;

    return gross_income_tax;
  };

  this.vatTax = function(info) {
    return info.netIncome * this.VAT / (1 + this.VAT);
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
    var time = this.START_OF_DAY;

    _.each(cats, function(cat) {
      // time of day when you FINISH working for this category
      time = time.clone().add(cat.minutes, 'm');

      cat.finish_time = time.clone();
      cat.finish_time_s = time.format('h:mm a');
    });
  };
};
