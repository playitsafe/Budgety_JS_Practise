/* Just Test

//the var is an IIFE that returns an obj
var budgetController = (function(){

    var x = 23;

    var add = function(a) {
        return x + a;
    }

    //return an obj containing a method
    return {
        publicTest: function(b) {
            //console.log(add(b));
            return add(b);
        }
    }
})();


var UIController = (function() {

})();

var controller = (function(budgetCtrl, UICtrl) {

    var z = budgetCtrl.publicTest(5);

    return {
        anotherPublic: function () {
            console.log(z);
        }
    }
    
})(budgetController, UIController);

*/

//----------- Start Building App -----------------------

//the var is an IIFE that returns an obj
//function constructor first
var budgetController = (function(){

    //create function constructors to instantiate lots of records
    var Expense = function(id, description, value,percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);             
        } 
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //organize data in obj, Data Structure
    var data = {
            allItems: {
                expense: [],
                income: []
            },
            
            total: {
                expense: 0,
                income: 0
            },

            budget: 0,
            percentage: -1
    };

    var calculateTotal = function(type) {
        
        var sum = 0;
        //for each method is pretty much like addEventListener function
        //that need a call back function
        data.allItems[type].forEach(function(element) {
            sum += element.value;
        });

        data.total[type] = sum;

    }

    return {
        addItem: function(type, desc, value) {

            var newItem, ID;

            if (data.allItems[type].length > 0) {
                //create new ID
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }            
            

            if (type === 'expense') {
                newItem = new Expense(ID, desc, value);                
            } else if (type === 'income') {
                newItem = new Income(ID, desc, value); 
            }

            data.allItems[type].push(newItem);
            //return for other controller to use
            return newItem;
        },

        calculateBudget: function() {
            //calculate total income n expense
            calculateTotal('income');
            calculateTotal('expense')

            //calculate income - expense
            data.budget = data.total.income - data.total.expense;

            //calculate percentage of income been spent
            if (data.total.income > 0) {
                data.percentage = Math.round((data.total.expense / data.total.income) * 100);
            } 
            
        },

        //calc percentage for each expense: exp / totalIncome
        calculatePercentage: function() {
            data.allItems.expense.forEach(function(element) {
                element.calcPercentage(data.total.income);
            });
        },

        getAllPercentage: function() {
            var allPercentage = data.allItems.expense.map(function(element) {
                return element.getPercentage();
            });

            return allPercentage;
        },

        getBudget: function() {
            //return four values, so use an obj
            return {
                budget: data.budget,
                totalIncome: data.total.income,
                totalExpense: data.total.expense,
                percentage: data.percentage
            };
        },

        deleteItem: function(type, id) {

            /**
            var data = {
                allItems: {
                    expense: [],
                    income: []
                },                
                total: {
                    expense: 0,
                    income: 0
                } 
             
             */
            var idArray, idIndex;

            //array.map() returns a new array
            idArray = data.allItems[type].map(function(element) {
                return element.id;
            });

            idIndex = idArray.indexOf(id);

            //delete the data w/ id
            if (idIndex !== -1) {
                data.allItems[type].splice(idIndex, 1);
            }
        },

        test: function() {
            console.log(data);
        }
    }
    
})();

////////////////////////  UI  Control  ///////////////////////////////
var UIController = (function() {

    //Create DOMString for querySelector
    var DOMString = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeDiv: '.income__list',
        expenseDiv: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLable: '.item__percentage',
        dateLable: '.budget__title--month',
        inputType: '.add__type'

    };

    var formatNum = function(num, type) {

        var numSplit, int, decimal, sign;
        //example: + 2,000.00
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        decimal = numSplit[1];

        if (int.length > 3) {  //$23,509.00
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        //type === 'expense' ? sign = '-' : sign = '+';
        
        //return type + ' ' + int + '.' + decimal;
        return (type === 'expense' ? '-' : '+') +' ' + int + '.' + decimal;

    };

    /**
    * Use first class function to pass 
    * an function as a parameter
    */
    var nodeListForEach = function(array, callback) {
        for (var i = 0; i < array.length; i++) {
            callback(array[i], i);                    
        }
    };

    //build public function so it can be used by another controler
    return {

        getInput: function() {

            //return an obj to contain these 3 properties
            return {
                //will be income or expense
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDesc).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            };            
        },

        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            //create HTML string w/ placeholder txt
            if (type === 'income') {

                element = DOMString.incomeDiv;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'expense') {

                element = DOMString.expenseDiv;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }       

            //replace the place holder txt w/ some real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNum(obj.value, type));

            //insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            //remove a child of parent element
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },

        clearFields: function() {

            var fields, fieldsArray;

            //querySelectorAll returns a List
            fields = document.querySelectorAll(DOMString.inputDesc + ', ' + DOMString.inputValue);

            //convert the list into array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(element, indexOfCurrent, originArray) {
                element.value = "";
                //console.log(index);
                //console.log(originArray);
            });

            //set the focus to frst field
            fieldsArray[0].focus();

        },

        displayBudget: function(obj) {

            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';

            //document.querySelector(DOMString.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMString.budgetLabel).textContent = formatNum(obj.budget, type);
            //document.querySelector(DOMString.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMString.incomeLabel).textContent = formatNum(obj.totalIncome, 'income');
            //document.querySelector(DOMString.expenseLabel).textContent = obj.totalExpense;
            document.querySelector(DOMString.expenseLabel).textContent = formatNum(obj.totalExpense, 'expense');


            if (obj.percentage > 0) {
                document.querySelector(DOMString.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMString.percentageLable).textContent = '---';                
            }

        },

        displayPercentage: function(percentageArray) {

            var percentFieldsArray = document.querySelectorAll(DOMString.expensePercentageLable);

            nodeListForEach(percentFieldsArray, function(element, index){

                if (percentageArray[index] > 0) {
                    element.textContent = percentageArray[index] + '%';                    
                } else {
                    element.textContent = '--';
                }                
            });

        },

        displayMonth: function() {

            var now, year, month;
            //date of today 
            now = new Date();
            //var Xmas = new Date(2018, 12, 24);
            year = now.getFullYear();
            //month = now.getMonth(); this returns 0-based num
            //month = now.toLocaleString('en-us', { month: 'long' });
            month = now.toLocaleString('en-us', { month: 'short' });

            document.querySelector(DOMString.dateLable).textContent = month + ' ' + year;

        },

        //style manipulation
        changeType: function() {

            //document.querySelectorAll('.add__type, .add__description, .add__value')
            var fields = document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDesc + ',' +
                DOMString.inputValue
            );

            /**
             
            var nodeListForEach = function(array, callback) {
                for (var i = 0; i < array.length; i++) {
                    callback(array[i], i);                    
                }
            };
             */

            nodeListForEach(fields, function(element) {
                element.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.addButton).classList.toggle('red');
        },

        getDOMString: function() {
            return DOMString;
        }
    }


})();

////////////////////////  Global  Control  ///////////////////////////////


//Global app controller
var controller = (function(budgetCtrl, UICtrl) {

    //to wrap eventListner in function
    //later create an init function to call it
    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMString();
        
        //add btn event listener
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        //add key press ENTRE listener as well
        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        //add delete eventHandler for their parent element
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //add change event for dropdown list
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);


    };

    var ctrlAddItem = function() {

        var input, newItem;
        //1. get the field input dta
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI

            //newItem = new Expense(ID, desc, value); 
            UICtrl.addListItem(newItem, input.type);

            //4 Clear the fields
            UICtrl.clearFields();

            //5. Calculate n Update budget
            updateBudget();

            //6. Calculate n update percentages
            updatePercentage();

        } 

 
    };

    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on UI
        //console.log(budget);
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function() {

        //1. Calculate %
        budgetCtrl.calculatePercentage();

        //2. Read % from budgetController
        var percentageArray = budgetCtrl.getAllPercentage();

        //3. update UI
        //console.log(percentageArray);
        UICtrl.displayPercentage(percentageArray);

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //income-0
            splitID = itemID.split('-');//returns ['income', '0']
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update n show new budget
            updateBudget();

            //4. Calculate n update percentages
            updatePercentage();

        }
    };

    //for event listeners
    return {
        init: function() {   

            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1

            });
        }
    };
    
})(budgetController, UIController);

//only line of code to be put outside
controller.init();