
// GET HTML ELEMENTS

const transactionForm = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const currentDate = document.getElementById("currentDate");
const monthlyChart = document.getElementById("monthlyChart");
const insightText = document.getElementById("insightText");


// LOAD SAVED TRANSACTIONS

let transactions = [];

try {
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    if (!Array.isArray(transactions)) {
        transactions = [];
    }
} catch (error) {
    transactions = [];
}


// SET TODAY'S DATE

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.value = getTodayDate();

currentDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});


// FORMAT AMOUNT

function formatAmount(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}


// SAVE DATA

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}


// CATEGORY ICONS

function getCategoryIcon(category) {
    const icons = {
        Food: "🍔",
        Shopping: "🛍️",
        Travel: "🚕",
        Bills: "🧾",
        Salary: "💼",
        Education: "📚",
        Health: "💊",
        Other: "📌"
    };

    return icons[category] || "📌";
}


// UPDATE SUMMARY CARDS

function updateSummary() {

    let income = 0;
    let expenses = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }

    });

    const balance = income - expenses;

    totalBalance.textContent = formatAmount(balance);
    totalIncome.textContent = formatAmount(income);
    totalExpenses.textContent = formatAmount(expenses);

    updateInsight(income, expenses);
}


// UPDATE QUICK INSIGHT

function updateInsight(income, expenses) {

    if (transactions.length === 0) {
        insightText.textContent =
            "Start adding transactions to understand your spending habits.";
    } else if (expenses === 0) {
        insightText.textContent =
            "Great start! You haven't recorded any expenses yet.";
    } else if (income >= expenses) {
        insightText.textContent =
            "Your recorded income is higher than your expenses. Keep managing your money wisely!";
    } else {
        insightText.textContent =
            "Your recorded expenses are higher than your income. Review your spending and plan ahead.";
    }
}


// DISPLAY TRANSACTIONS

function displayTransactions() {

    transactionList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedType = filterType.value;

    const filteredTransactions = transactions.filter(function(transaction) {

        const matchesSearch =
            transaction.title.toLowerCase().includes(searchValue) ||
            transaction.category.toLowerCase().includes(searchValue);

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        return matchesSearch && matchesType;

    });

    transactionCount.textContent =
        `${filteredTransactions.length} Transactions`;


    if (filteredTransactions.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty_message";
        emptyMessage.textContent = transactions.length === 0
            ? "No transactions yet. Add your first transaction!"
            : "No matching transactions found.";

        transactionList.appendChild(emptyMessage);

        return;
    }


    // SHOW LATEST TRANSACTIONS FIRST

    const sortedTransactions = [...filteredTransactions].sort(function(a, b) {
        return b.id - a.id;
    });


    sortedTransactions.forEach(function(transaction) {

        const row = document.createElement("div");
        row.className = "transaction_row";

        const left = document.createElement("div");
        left.className = "transaction_left";

        const icon = document.createElement("div");
        icon.className = "transaction_icon";
        icon.textContent = getCategoryIcon(transaction.category);

        const info = document.createElement("div");
        info.className = "transaction_info";

        const name = document.createElement("h4");
        name.textContent = transaction.title;

        const details = document.createElement("p");
        details.textContent =
            `${transaction.category} • ${transaction.date}`;

        info.appendChild(name);
        info.appendChild(details);

        left.appendChild(icon);
        left.appendChild(info);


        const right = document.createElement("div");
        right.className = "transaction_right";

        const amount = document.createElement("span");

        amount.className = transaction.type === "income"
            ? "transaction_amount income_text"
            : "transaction_amount expense_text";

        const sign = transaction.type === "income" ? "+" : "-";

        amount.textContent = `${sign} ${formatAmount(transaction.amount)}`;


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete_btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(transaction.id);
        });


        right.appendChild(amount);
        right.appendChild(deleteButton);

        row.appendChild(left);
        row.appendChild(right);

        transactionList.appendChild(row);

    });

}


// ADD TRANSACTION

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const type = typeInput.value;
    const date = dateInput.value;

    if (!title || !category || !date || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        title: title,
        amount: amount,
        category: category,
        type: type,
        date: date
    };

    transactions.push(newTransaction);

    saveTransactions();

    updateSummary();
    displayTransactions();
    updateMonthlyChart();

    transactionForm.reset();

    dateInput.value = getTodayDate();

});


// DELETE TRANSACTION

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    saveTransactions();

    updateSummary();
    displayTransactions();
    updateMonthlyChart();

}


// SEARCH TRANSACTIONS

searchInput.addEventListener("input", function() {
    displayTransactions();
});


// FILTER TRANSACTIONS

filterType.addEventListener("change", function() {
    displayTransactions();
});


// MONTHLY EXPENSE CHART

function updateMonthlyChart() {

    monthlyChart.innerHTML = "";

    const today = new Date();

    const months = [];

    // LAST SIX MONTHS INCLUDING CURRENT MONTH

    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push({
            month: date.getMonth(),
            year: date.getFullYear(),
            label: date.toLocaleDateString("en-IN", {
                month: "short"
            }),
            total: 0
        });

    }


    // CALCULATE MONTHLY EXPENSES

    transactions.forEach(function(transaction) {

        if (transaction.type !== "expense") {
            return;
        }

        const transactionDate = new Date(transaction.date + "T00:00:00");

        const monthData = months.find(function(item) {
            return item.month === transactionDate.getMonth() &&
                item.year === transactionDate.getFullYear();
        });

        if (monthData) {
            monthData.total += transaction.amount;
        }

    });


    const highestExpense = Math.max(
        ...months.map(function(item) {
            return item.total;
        })
    );


    if (highestExpense === 0) {

        const empty = document.createElement("p");
        empty.className = "chart_empty";
        empty.textContent = "Add expenses to see your monthly chart.";

        monthlyChart.appendChild(empty);

        return;
    }


    // CREATE CHART BARS

    months.forEach(function(item) {

        const barItem = document.createElement("div");
        barItem.className = "bar_item";

        const bar = document.createElement("div");
        bar.className = "bar";

        const height = item.total === 0
            ? 4
            : Math.max((item.total / highestExpense) * 145, 8);

        bar.style.height = `${height}px`;
        bar.title = formatAmount(item.total);

        const label = document.createElement("span");
        label.textContent = item.label;

        barItem.appendChild(bar);
        barItem.appendChild(label);

        monthlyChart.appendChild(barItem);

    });

}


// SIDEBAR NAVIGATION

const navLinks = document.querySelectorAll(".nav_link");

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        navLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });

});


// INITIAL PAGE LOAD

updateSummary();
displayTransactions();
updateMonthlyChart();
