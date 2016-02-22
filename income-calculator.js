var IncomeCalculator = function() {
  var self = this;

  this.calculateIncomeBreakdown = function(income) {
    return {
      income: income,
      breakdown: [{
          name: "Pay off SA's debts",
          minutes: 13.75,
        },
      ]
    };
  };
};
