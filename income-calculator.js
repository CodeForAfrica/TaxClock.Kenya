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

  this.PRIMARY_REBATE = 13,942;  //tax relief to be confirmed

  // Budget revenue streams from individuals (billions)
  this.PERSONAL_INCOME_TAX_REVENUE = 181.2;
  this.VAT_REVENUE = 233.3;

  // Budget expenditure by category, in millions
  // see https://docs.google.com/spreadsheets/d/18pS6-GXmV2AE6TqKtYYzL6Ag-ZuwiE4jb53U9heWF1M/edit#gid=0

  // Categorised expenditure (should, but doesn't have to, total to CONSOLIDATED_EXPENDITURE)
  this.EXPENDITURE = {
    'Sports Culture and Arts':	3872439308,
    'Gender and Equality Commission':	189250930,
    'National Intelligence Service':	17440000000,
    'Land Commission':	652338149,
    'Police Service Commission':	278119240,
    'Attorney General and Department of Justice':	3313661691,
    'Director of Public Prosecutions':	1851781263,
    'The Registrar of Political Parties':	466960949,
    'Public Service Commission':	1107204313,
    'Ministry of Agriculture':	29313170895,
    'Ministry of Commerce and Tourism':	4335707394,
    'Coordination of National Government':	16068487019,
    'Ministry of Devolution':	6883149315,
    'East African Affairs':	1683603767,
    'Ministry of Education':	76499089457,
    'Environment And Natural Resources':	47324583890,
    'Ministry of Fisheries':	2133936665,
    'Ministry of Livestock':	5533991128,
    'Ministry of Planning':	66344404018,
    'Science and Technology':	139851294456,
    'Infrastructure':	123533528398,
    'Interior':	83589379394,
    'Transport':	45408464077,
    'Salaries and Remuneration Commission':	340649493,
    'Teachers Service Commission':	165613978668,
    'ommission on Administrative Justice':	272485500,
    'Commission on Revenue Allocation':	264815482,
    'Presidency	':4249523597,
    'Witness Protection Agency':	169675000,
  };

  // override ordering
  this.ORDERING = {
    'Working for yourself': 9999,
    'Debt-service costs': -1,
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
