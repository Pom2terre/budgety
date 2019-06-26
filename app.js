// BUDGET CONTROLLER
var budgetController = (function() {
  // Private section:
  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
    calcPercentage(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    }
    getPercentage() {
      return this.percentage;
    }
  }

  var data = {
    allitems: {
      expense: [],
      income: []
    },
    totals: {
      income: 0,
      expense: 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = type => {
    var sum = 0;
    data.allitems[type].forEach(current => {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  // Public methods:
  return {
    additem: (type, des, val) => {
      var newItem, ID;

      // Create new ID
      if (data.allitems[type].length > 0) {
        ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create a new item base on type 'expense' or 'income'
      if (type === "expense") {
        newItem = new Expense(ID, des, val);
      } else if (type === "income") {
        newItem = new Income(ID, des, val);
      }

      // Push the new item into the data structure data
      data.allitems[type].push(newItem);

      // Return the new item
      return newItem;
    },

    deleteItem: (type, id) => {
      var ids, index;

      ids = data.allitems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index >= 0) {
        data.allitems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // Calculate total incomes and total expenses
      calculateTotal("expense");
      calculateTotal("income");

      // Calculate the buget = incomes - expenses
      data.budget = data.totals.income - data.totals.expense;

      // Calculate the percentage of incomes that we spent
      if (data.totals.income > 0) {
        data.percentage = Math.round(
          (data.totals.expense / data.totals.income) * 100
        );
      } else {
        data.totals.percentage = -1;
      }
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.income,
        totalExp: data.totals.expense,
        percentage: data.percentage
      };
    },

    calculatePercentages: () => {
      data.allitems.expense.forEach(function(current) {
        current.calcPercentage(data.totals.income);
      });
    },

    getPercentages: () => {
      var allPerc = data.allitems.expense.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },

    testing: () => {
      console.log(data.allitems.income, data.allitems.expense);
    }
  };
})();

// UI CONTROLLER
var UIController = (function() {
  // Private var DOMStrings: store all class ids used in querySelector()
  // and communication with the appCtrl object.
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /*
    rule 1 : + or - before number
    rule 2 : exactly 2 decimal points
    rule 3 : comma separating the thousands
    Ex.: 2310.4567 -> + 2,310.46
         2000      -> + 2,000.00
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      // 23510 -> 23,510
    }

    dec = numSplit[1];

    return (type === "expense" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function(list, callback) {
    // Loop trough a node list object:
    // Callback receives anonymous function(current, index)

    for (let index = 0; index < list.length; index++) {
      callback(list[index], index);
    }
  };

  // Public methods:
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either 'income' or 'expense'.
        // See index.html for more details on value properties.
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    getDOMStrings: function() {
      return DOMStrings;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === "income") {
        element = DOMStrings.incomeContainer;

        html =
          '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "expense") {
        element = DOMStrings.expensesContainer;

        html =
          '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorId) {
      var el = document.getElementById(selectorId);

      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );
      // Convert List object to an Array via Array.prototype.slice.call method
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((current, index, array) => {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "income") : (type = "expense");

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "income"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "expense");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentage: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      // List gets the expenses node list.

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayDate: function() {
      var year, month, months, now;

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    }
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = () => {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Get the budget from the budgetController
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = () => {
    // 1. Calculate the percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentage(percentages);
  };

  var ctrlAddItem = () => {
    var input, newItem;

    //1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      newItem = budgetCtrl.additem(input.type, input.description, input.value);

      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the input fields
      UICtrl.clearFields();

      //5. Calculate and display the budget on the UI
      updateBudget();

      //6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = (event) => {
    var itemId, splitId, type, id;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitId = itemId.split("-");
    type = splitId[0];
    id = parseInt(splitId[1]);

    // 1. Delete the item from the DS
    budgetCtrl.deleteItem(type, id);

    // 2. Delete the item from the UI
    UICtrl.deleteListItem(itemId);

    // 3. Update and show the new budget
    updateBudget();

    // 4. Calculate and update percentages
    updatePercentages();
  };

  // Public methods:
  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      UICtrl.displayDate();
      return setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
