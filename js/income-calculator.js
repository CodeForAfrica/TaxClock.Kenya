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
      'Industialization and Enterprise Development': 647975081.2,
      'Information-Communications and Technology': 999052488.8,
      'Labour Social Security and Services': 2074521647,
      'Land Housing and Urban Development': 2671514889,
      'Mining': 185366126.6,
      'Sports Culture and Arts':	549059163.2,
      'Gender and Equality Commission':	26179286.67,
      'National Intelligence Service':	1678500000,
      'Land Commission':	128380450.8,
      'Police Service Commission': 26375000,
      'Attorney General and Department of Justice':	387075454.6,
      'Director of Public Prosecutions':	 170005333.5,
      'The Registrar of Political Parties':	 42148484.17,
      'Public Service Commission':	 99435954.17,
      'Ministry of Agriculture':	 2872233508,
      'Ministry of Commerce and Tourism':	 915128013.8,
      'Coordination of National Government':  1498177872,
      'Ministry of Devolution':	974119641.7,
      'East African Affairs':	 148383117,
      'Ministry of Education':	 6811733877,
      'Environment And Natural Resources':	 1847415837,
      'Ministry of Fisheries': 375647454.7,
      'Ministry of Livestock':	 593220600.6,
      'Ministry of Planning':	 6798164886,
      'Science and Technology':	6049978951,
      'Infrastructure':	 11163829062,
      'Interior':	 8538939786,
      'Transport Ministry':	 13687852936,
      'Salaries and Remuneration Commission':	76902673.83,
      'Teachers Service Commission':	 15117634355,
      'Commission on Administrative Justice':	37059243.33,
      'Commission on Revenue Allocation':	28797947.58,
      'Presidency':	 658057306.8,
      'Witness Protection Agency':	30392083.33,
      'Commission for the Implementation of the Constitution':	17670000,
      'Controller of Budget':	47123185.83,
      'Ethics and Anti-Corruption Commission':	217660000,
      'Independent Electoral and Boundaries Commission':313826649.2,
      'Independent Police Oversight Authority':	28290308.33,
      'Kenya National Commission on Human Rights': 29925000,
      'Ministry of Defence':	7697586842,
      'Energy and Petroleum':	7871792048,
      'Foreign Affairs and International Trade':	7871792048,
      'Health':	4931989985,
      'Auditor-General': 344889431.3,
      'Ministry of Water and Regional Authorities': 3217338940,
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
  this.START_OF_DAY = moment().hour(8).minute(0).second(0);

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
