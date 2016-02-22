var IncomeCalculator = function() {
  var self = this;

  this.VAT = 0.14;

  this.calculateIncomeBreakdown = function(income) {
    var info = {
      income: income,
      breakdown: [{
          name: "Pay off SA's debts",
          minutes: 13.75,
        },
      ]
    };

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
};
