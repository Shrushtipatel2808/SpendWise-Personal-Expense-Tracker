
// GET HTML ELEMENTS

const transactionForm = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const transactionCount = document.getElementById("transactionCount");


// GET SAVED TRANSACTIONS

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];


// SET TODAY'S DATE

const today = new Date();

dateInput.value = today.toISOString().split("T")[0];

document.getElementById("currentDate").textContent =
    today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// FORMAT AMOUNT

function formatAmount(amount) {

    return Number(amount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    });

}


// SAVE DATA IN LOCAL STORAGE

function saveTransactions() {

    localStorage.setItem("transactions", JSON.stringify(transactions));

}


// UPDATE DASHBOARD CARDS

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

    let balance = income - expenses;

    totalIncome.textContent = formatAmount(income);
    totalExpenses.textContent = formatAmount(expenses);
    totalBalance.textContent = formatAmount(balance);

}


// SHOW TRANSACTIONS

function displayTransactions() {

    transactionList.innerHTML = "";

    let searchText = searchInput.value.toLowerCase();
    let selectedType = filterType.value;

    let filteredTransactions = transactions.filter(function(transaction) {

        let matchesSearch =
            transaction.title.toLowerCase().includes(searchText) ||
            transaction.category.toLowerCase().includes(searchText);

        let matchesType =
            selectedType === "all" || transaction.type === selectedType;

        return matchesSearch && matchesType;

    });


    transactionCount.textContent =
        filteredTransactions.length +
        (filteredTransactions.length === 1 ? " Transaction" : " Transactions");


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p class="empty_message">
                No transactions found.
            </p>
        `;

        return;

    }


    filteredTransactions.forEach(function(transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.className = "transaction_item";


        const transactionInfo = document.createElement("div");

        transactionInfo.className = "transaction_info";


        const transactionTitle = document.createElement("h3");

        const transactionDate = document.createElement("p");


        const categoryIcons = {
            Food: "🍔",
            Shopping: "🛍️",
            Travel: "🚗",
            Bills: "🧾",
            Salary: "💼",
            Education: "📚",
            Health: "💊",
            Other: "📌"
        };


        transactionTitle.textContent =
            (categoryIcons[transaction.category] || "📌") +
            " " + transaction.title;


        const date = new Date(transaction.date + "T00:00:00");

        transactionDate.textContent =
            date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            }) + " • " + transaction.category;


        transactionInfo.appendChild(transactionTitle);
        transactionInfo.appendChild(transactionDate);


        const transactionAmount = document.createElement("h3");

        if (transaction.type === "income") {

            transactionAmount.className = "income_amount";
            transactionAmount.textContent = "+ " + formatAmount(transaction.amount);

        } else {

            transactionAmount.className = "expense_amount";
            transactionAmount.textContent = "- " + formatAmount(transaction.amount);

        }


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete_btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            deleteTransaction(transaction.id);

        });


        transactionItem.appendChild(transactionInfo);
        transactionItem.appendChild(transactionAmount);
        transactionItem.appendChild(deleteButton);

        transactionList.appendChild(transactionItem);

    });

}


// ADD NEW TRANSACTION

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const type = typeInput.value;
    const date = dateInput.value;


    if (!title || amount <= 0 || !category || !date) {

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


    transactions.unshift(newTransaction);

    saveTransactions();

    updateSummary();

    displayTransactions();


    transactionForm.reset();

    dateInput.value = today.toISOString().split("T")[0];

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

}


// SEARCH TRANSACTIONS

searchInput.addEventListener("input", function() {

    displayTransactions();

});


// FILTER TRANSACTIONS

filterType.addEventListener("change", function() {

    displayTransactions();

});


// NAVIGATION ACTIVE LINK

const navLinks = document.querySelectorAll(".nav_link");

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        navLinks.forEach(function(item) {

            item.classList.remove("active");

        });

        link.classList.add("active");

    });

});


// INITIAL DASHBOARD LOAD

updateSummary();

displayTransactions();
