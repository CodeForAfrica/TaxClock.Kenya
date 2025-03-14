---
---
var IncomeCalculator = function() {
  var self = this;

  this.VAT = {{ site.vat }};

  // Statutory rates and personal relief
  this.VAT = {{ site.vat }};
  this.PRIMARY_REBATE = {{ site.primary_rebate }};

  // Affordable Housing Levy (1.5%): https://kra.go.ke/images/publications/The-Finance-Act--2023.pdf#page=55
  this.HOUSING_LEVY = {{ site.housing_levy }};

  // Social Health Insurance Fund (SHIF) 2.75%: https://apps.wingubox.com/blog/category/updates/new-shif-rates-for-your-kenyan-payroll
  this.SHIF = {{ site.shif }};

  function TaxBand(marginalRate, baseAmount, threshold, limit) {
    this.marginalRate = marginalRate;
    this.baseAmount = baseAmount;
    this.threshold = threshold;
    this.limit = (arguments.length > 3) ? this.limit = limit : this.limit = Number.POSITIVE_INFINITY;
  }

  // TODO: Move to _data
  // PAYE tax bands (Finance Act 2023) based on taxable income (after allowable deductions: SHIF and Housing Levy)
  // with thanks to https://apps.wingubox.com/best-paye-tax-calculator-for-kenya
  this.TAX_TABLE = [
    // 1st bracket: 0 - 24,000
    new TaxBand(0.10, 0, 0, 24000),
  
    // 2nd bracket: 24,001 - 32,333 (8,333)
    new TaxBand(0.25, 2400, 24001, 32333),
  
    // 3rd bracket: 32,334 - 500,000 (467,667)
    new TaxBand(0.30, 4483.25, 32334, 500000),
  
    // 4th bracket: 500,001 - 800,000 (300,000)
    new TaxBand(0.325, 144783.35, 500001, 800000),
  
    // 5th bracket: Above 800,000
    new TaxBand(0.35, 242283.35, 800001)
  ];

  // Budget revenue streams from individuals (billions)
  this.PERSONAL_INCOME_TAX_REVENUE = {{ site.income_tax_revenue }} * Math.pow(10,9);
  this.VAT_REVENUE = {{ site.vat_revenue }} * Math.pow(10,9);

  // Budget expenditure by category, in millions
  // see https://www.treasury.go.ke/wp-content/uploads/2024/06/Budget-Highlights-The-Mwananchi-Guide-for-the-FY-2024-25-Budget.pdf#page=15.06
  // TODO: Move to _data
  // Categorised expenditure (should, but doesn't have to, total to CONSOLIDATED_EXPENDITURE)
  this.EXPENDITURE = {
    'Education': (656.6 * Math.pow(10,9)),
    'Public Healthcare': (127.0 * Math.pow(10,9)),
    'Law and Order': (247.8 * Math.pow(10,9)),
    'Debt Repayment': (1213.4 * Math.pow(10,9)),
    'Agriculture and Food Security': (84.9 * Math.pow(10,9)),
    'Energy, Infrastructure & ICT': (477.2 * Math.pow(10,9)),
    'Environment Protection, Water & Natural Resources': (110.1 * Math.pow(10,9)),
    'County Shareable Revenue': (400.1 * Math.pow(10,9)),
    'Trade and Commerce': (43.1 * Math.pow(10,9)),
    'Running Government': (344.4 * Math.pow(10,9)),
    'Social Protection': (68.0 * Math.pow(10,9)),
    'Military and Intelligence Services': (219.4  * Math.pow(10,9)),
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

  // Calculate NSSF contribution based on new rates (effective Feb 2025)
  // https://assets.kpmg.com/content/dam/kpmg/ke/pdf/tax/2025/Enhanced%20NSSF%20rates%20effective%20February%202025%20-%20Tax%20Alert.pdf
  this.calculateNSSF = function(income) {
    // Tier I: Applies to the first Ksh 8,000 at 6%
    var tier1 = Math.min(income, 8000);
    // Tier II: Applies to income between Ksh 8,001 and Ksh 72,000 (max Ksh 64,000) at 6%
    var tier2 = Math.min(Math.max(income - 8000, 0), 64000);
    var nssfTier1 = tier1 * 0.06;
    var nssfTier2 = tier2 * 0.06;
    return nssfTier1 + nssfTier2;
  };

  this.calculateIncomeBreakdown = function(income) {
    var info = {};

    info.income = income;

    // Calculate statutory contributions/deductions
    info.nssf = self.calculateNSSF(income);
    info.shif = (income * this.SHIF) / 100;                  // 2.75% Social Health Insurance Fund (SHIF)
    info.housingLevy = (income * this.HOUSING_LEVY) / 100;   // 1.5% Affordable Housing Levy

    info.statutory_deductions = info.nssf + info.shif + info.housingLevy;

    // Compute taxable income for PAYE (gross income minus allowable deductions: NSSF + SHIF + Housing Levy)
    info.taxableIncome = income - info.statutory_deductions;

    // Calculate PAYE based on the taxable income
    info.incomeTax = self.incomeTax(info.taxableIncome);

    // Calculate net income after deducting PAYE, NSSF, SHIF, and Housing Levy
    info.netIncome = income - (info.incomeTax + info.statutory_deductions);

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

  this.incomeTax = function(taxableIncome) {
    var gross_income_tax = 0;
    // Find the applicable tax band for the given taxable income
    var band = _.find(self.TAX_TABLE, function(b) {
      return (taxableIncome >= b.threshold) && (taxableIncome <= b.limit);
    });

    if (band) {
      gross_income_tax = band.baseAmount + (band.marginalRate * (taxableIncome - band.threshold));
      gross_income_tax = gross_income_tax - self.PRIMARY_REBATE;
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
