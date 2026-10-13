let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];

let editindex = null;

function hideAllSections() {
    document.querySelector(".dashboard").style.display = "none";
    document.querySelector(".search-section").style.display = "none";
    document.querySelector(".subdashboard").style.display = "none";
    document.querySelector(".form-section").style.display = "none";
    document.querySelector(".table-section").style.display = "none";
    document.querySelector(".sales-section").style.display = "none";
    document.querySelector(".sales-history").style.display = "none";
    document.querySelector(".card6").style.display = "none";
    document.querySelector(".card7").style.display = "none";
    document.querySelector(".card8").style.display = "none";
    document.querySelector(".sub-result").style.display = "none";
    document.querySelector(".sales-report").style.display = "none";
}

function showHome() {
    hideAllSections();

    document.querySelector(".dashboard").style.display = "flex";
    document.querySelector(".search-section").style.display = "block";
    document.querySelector(".subdashboard").style.display = "flex";

    document.querySelector(".card6").style.display = "flex";
    document.querySelector(".card7").style.display = "flex";
    document.querySelector(".card8").style.display = "flex";

    document.querySelector(".footer").style.display = "block";

    updateDashboard();
    searchProduct();
    updateCharts();
}

function showAddProduct() {
    hideFooter()
    hideAllSections();

    document.querySelector(".form-section").style.display = "block";
    document.querySelector(".footer").style.display = "none";

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showProducts() {
    hideAllSections();

    document.querySelector(".table-section").style.display = "block";
    document.querySelector(".table-section table").style.display = "table";
    document.querySelector(".footer").style.display = "block";

    displayProducts();

    document.querySelector(".table-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showSell() {
    hideAllSections();

    document.querySelector(".sales-section").style.display = "block";
    document.querySelector(".footer").style.display = "block";

    loadSaleProducts();

    document.querySelector(".sales-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showSalesHistory() {
    hideAllSections();

    document.querySelector(".sales-history").style.display = "block";
    document.querySelector(".sales-history table").style.display = "table";
    document.querySelector(".footer").style.display = "block";

    viewsales();

    document.querySelector(".sales-history").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
function showSalesReport() {
    hideAllSections();

    document.querySelector(".sales-report").style.display = "block";

    document.querySelector(".footer").style.display = "none";

    generateSalesReport();

    document.querySelector(".sales-report").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getReportSaleDate(sale) {
    // New sales have timestamp
    if (sale.timestamp) {
        return new Date(sale.timestamp);
    }

    // Support older sales saved before timestamp was added
    if (sale.date && sale.date.includes("/")) {
        let parts = sale.date.split("/");

        if (parts.length === 3) {
            let day = Number(parts[0]);
            let month = Number(parts[1]) - 1;
            let year = Number(parts[2]);

            // Handle dates such as 9/10/2026
            if (year < 100) year += 2000;

            return new Date(year, month, day);
        }
    }

    return new Date(sale.date);
}


// Generate Sales Report
function generateSalesReport() {
    let period = document.getElementById("reportPeriod").value;

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);

    // Set the starting date based on selected period
    if (period === "week") {
        let day = startDate.getDay();

        // Monday is the first day of the week
        let difference = day === 0 ? 6 : day - 1;

        startDate.setDate(startDate.getDate() - difference);
    }

    if (period === "month") {
        startDate.setDate(1);
    }

    // Filter sales
    let filteredSales = sales.filter(function (sale) {
        if (period === "all") {
            return true;
        }

        let saleDate = getReportSaleDate(sale);

        if (isNaN(saleDate.getTime())) {
            return false;
        }

        saleDate.setHours(0, 0, 0, 0);

        if (period === "today") {
            return saleDate.getTime() === today.getTime();
        }

        if (period === "week" || period === "month") {
            return saleDate >= startDate && saleDate <= today;
        }

        return false;
    });

    // Calculate report totals
    let totalAmount = 0;
    let totalItems = 0;

    filteredSales.forEach(function (sale) {
        totalAmount += Number(sale.totalAmount) || 0;
        totalItems += Number(sale.quantity) || 0;
    });

    // Display report cards
    document.getElementById("reportAmount").textContent =
        "₹" + totalAmount.toFixed(2);

    document.getElementById("reportTransactions").textContent =
        filteredSales.length;

    document.getElementById("reportItems").textContent =
        totalItems;

    // Display sales table
    let table = document.getElementById("reportTable");

    if (filteredSales.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    No sales found for this period
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filteredSales.map(function (sale) {
        return `
            <tr>
                <td>${sale.productName}</td>
                <td>${sale.quantity}</td>
                <td>₹${Number(sale.totalAmount).toFixed(2)}</td>
                <td>${sale.date}</td>
            </tr>
        `;
    }).join("");
}
function exportSalesReport() {
    let rows = [
        ["Product", "Quantity", "Price", "Total Amount", "Date"]
    ];

    let period = document.getElementById("reportPeriod").value;

    // Export the same sales currently shown in the report
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);

    if (period === "week") {
        let day = startDate.getDay();
        let difference = day === 0 ? 6 : day - 1;
        startDate.setDate(startDate.getDate() - difference);
    }

    if (period === "month") {
        startDate.setDate(1);
    }

    let filteredSales = sales.filter(function (sale) {
        if (period === "all") return true;

        let saleDate = getReportSaleDate(sale);

        if (isNaN(saleDate.getTime())) return false;

        saleDate.setHours(0, 0, 0, 0);

        if (period === "today") {
            return saleDate.getTime() === today.getTime();
        }

        return saleDate >= startDate && saleDate <= today;
    });

    filteredSales.forEach(function (sale) {
        rows.push([
            sale.productName,
            sale.quantity,
            sale.price,
            sale.totalAmount,
            sale.date
        ]);
    });

    let csv = rows.map(function (row) {
        return row.map(function (value) {
            return '"' + String(value ?? "").replace(/"/g, '""') + '"';
        }).join(",");
    }).join("\n");

    let blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");

    link.href = url;
    link.download = "Sales_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
}



function scrollToSubResult() {
    document.getElementById("subResult").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function addButton() {
    hideFooter()
    let name = document.getElementById("name").value.trim();
    let category = document.getElementById("category").value.trim();
    let price = document.getElementById("price").value;
    let quantity = document.getElementById("quantity").value;

    if (
        name === "" ||
        category === "" ||
        price === "" ||
        quantity === ""
    ) {
        alert("Please fill all the forms");
        return;
    }

    if (
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
    ) {
        alert("Please enter a valid price");
        return;
    }

    if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        alert("Quantity must be a positive whole number or 0");
        return;
    }

    let product = {
        name: name,
        category: category,
        price: Number(price),
        quantity: Number(quantity)
    };

    products.push(product);

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    displayProducts();
    loadSaleProducts();
    updateDashboard();

    alert("Product added successfully!");

    clearForm();
    hideFooter()
    updateCharts();
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";

    editindex = null;

    document.getElementById("addButton").innerText =
        "Add Product";
}

function displayProducts() {
    hideFooter()
    let table = document.getElementById("tablesection");

    table.innerHTML = "";

    if (products.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No products available
                </td>
            </tr>
        `;

        updateDashboard();
        return;
    }

    products.forEach(function(product, index) {

        let status;

        if (product.quantity === 0) {
            status =
                `<span class="out-of-stock">Out of Stock</span>`;
        } else if (product.quantity < 10) {
            status =
                `<span class="low-stock">Low Stock</span>`;
        } else {
            status =
                `<span class="available">Available</span>`;
        }

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>₹${product.price}</td>

                <td>${product.quantity}</td>

                <td>${status}</td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteproduct(${index})">
                        Delete
                    </button>

                    <button
                        class="edit-btn"
                        onclick="editProduct(${index})">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    });

    updateDashboard();
    updateCharts();
}

function deleteproduct(index) {
    let confirmDelete =
        confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

    products.splice(index, 1);

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    displayProducts();
    loadSaleProducts();
    updateDashboard();
    updateCharts();
}

function updateDashboard() {

    document.getElementById("totalProducts").innerText =
        products.length;

    let totalstock = 0;
    let lowstock = 0;
    let outofstock = 0;

    products.forEach(function(product) {

        totalstock += Number(product.quantity);

        if (
            product.quantity > 0 &&
            product.quantity < 10
        ) {
            lowstock++;
        }

        if (product.quantity === 0) {
            outofstock++;
        }
    });

    document.getElementById("totalstock").innerText =
        totalstock;

    document.getElementById("lowstock").innerText =
        lowstock;

    let lowStockCount =
        document.getElementById("lowStockCount");

    if (lowStockCount) {
        lowStockCount.innerText = lowstock;
    }

    let outOfStockCount =
        document.getElementById("outofstock");

    if (outOfStockCount) {
        outOfStockCount.innerText = outofstock;
    }

    let recentSalesCount =
        document.getElementById("recentSalesCount");

    if (recentSalesCount) {
        recentSalesCount.innerText =
            Math.min(sales.length, 5);
    }

    let totalSales = 0;
    let totalSalesAmount = 0;

    sales.forEach(function(sale) {

        totalSales += Number(sale.quantity);

        totalSalesAmount += Number(
            sale.totalAmount || sale.total || 0
        );
    });

    document.getElementById("totalSales").innerText =
        totalSales;

    document.getElementById("totalSalesAmount").innerText =
        "₹" + totalSalesAmount;

    
}
function searchProduct() {

    let searchValue = document
        .getElementById("search")
        .value
        .toLowerCase()
        .trim();

    let result = document.getElementById("searchResult");

    // Search empty ga unte
    if (searchValue === "") {
        result.innerHTML = "";
        return;
    }

    // Product name or category tho search
    let foundProducts = products.filter(function(product) {

        return (
            product.name.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );

    });

    // Product dorakakapothe
    if (foundProducts.length === 0) {
        result.innerHTML = "No products Found";
        return;
    }

    // Results display
    result.innerHTML = "";

    foundProducts.forEach(function(product) {

        let status;

        if (product.quantity === 0) {
            status = "Out of Stock";
        } 
        else if (product.quantity < 10) {
            status = "Low Stock";
        } 
        else {
            status = "Available";
        }

        result.innerHTML += `
            <div class="result-card">

                <h3>${product.name}</h3>

                <p>Category: ${product.category}</p>

                <p>Price: ₹${product.price}</p>

                <p>Quantity: ${product.quantity}</p>

                <p>Status: ${status}</p>

            </div>
        `;

    });

}

function editProduct(index) {

    let product = products[index];

    editindex = index;

    document.querySelector(".table-section").style.display =
        "none";

    document.querySelector(".form-section").style.display =
        "block";

    document.querySelector(".footer").style.display =
        "block";

    document.getElementById("name").value =
        product.name;

    document.getElementById("category").value =
        product.category;

    document.getElementById("price").value =
        product.price;

    document.getElementById("quantity").value =
        product.quantity;

    document.getElementById("addButton").innerText =
        "Add Product";

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


}

function updateProduct() {

    if (editindex === null) {
        alert("Please select a product to edit");
        return;
    }

    let name =
        document.getElementById("name").value.trim();

    let category =
        document.getElementById("category").value.trim();

    let price =
        document.getElementById("price").value;

    let quantity =
        document.getElementById("quantity").value;

    if (
        name === "" ||
        category === "" ||
        price === "" ||
        quantity === ""
    ) {
        alert("Please fill all the forms");
        return;
    }

    if (
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
    ) {
        alert("Please enter a valid price");
        return;
    }

    if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        alert("Quantity must be a positive whole number or 0");
        return;
    }

    products[editindex] = {
        name: name,
        category: category,
        price: Number(price),
        quantity: Number(quantity)
    };

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    displayProducts();
    loadSaleProducts();
    updateDashboard();

    alert("Product updated successfully!");

    clearForm();

    showProducts();
    hideFooter()
    updateCharts();
}

function loadSaleProducts() {
    hideFooter()

    let select =
        document.getElementById("saleProduct");

    select.innerHTML =
        `<option value="">Select Product</option>`;

    products.forEach(function(product, index) {

        let option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            product.name;

        if (product.quantity === 0) {
            option.disabled = true;
            option.textContent += " - Out of Stock";
        }

        select.appendChild(option);
    });

    document.getElementById("availableStock").innerText =
        "";
}

function showAvailableStock() {

    let index =
        document.getElementById("saleProduct").value;

    if (index === "") {

        document.getElementById(
            "availableStock"
        ).innerText = "";

        return;
    }

    let stock =
        products[index].quantity;

    document.getElementById(
        "availableStock"
    ).innerText =
        "Available Stock: " + stock;
}

function sellProduct() {
    hideFooter()
    

    let index =
        document.getElementById("saleProduct").value;

    let saleQuantity =
        Number(
            document.getElementById("saleQuantity").value
        );

    if (index === "") {
        alert("Please select a product");
        return;
    }

    if (
        !Number.isInteger(saleQuantity) ||
        saleQuantity <= 0
    ) {
        alert("Please enter a valid sale quantity");
        return;
    }

    let product =
        products[index];

    if (saleQuantity > product.quantity) {
        alert("Not enough stock");
        return;
    }

    let now = new Date();

   let sale = {
    productName: product.name,
    quantity: saleQuantity,
    price: product.price,
    totalAmount: saleQuantity * product.price,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    timestamp: now.getTime()
};
sales.push(sale);

product.quantity = product.quantity - saleQuantity;

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

   
displayProducts();
loadSaleProducts();
updateDashboard();
viewsales();
updateCharts();


    document.getElementById("saleQuantity").value =
        "";

    document.getElementById("availableStock").innerText =
        "";

    alert("Product sold successfully");
}

function viewsales() {
    hideFooter()

    let saleTable =
        document.getElementById("salesTable");

    saleTable.innerHTML = "";

    if (sales.length === 0) {

        saleTable.innerHTML = `
            <tr>
                <td colspan="8">
                    No sales available
                </td>
            </tr>
        `;

        return;
    }

    sales.forEach(function(sale, index) {

        let productName =
            sale.productName ||
            sale.product ||
            "-";

        let totalAmount =
            sale.totalAmount ||
            sale.total ||
            0;

        saleTable.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${productName}
                </td>

                <td>
                    ${sale.quantity}
                </td>

                <td>
                    ₹${sale.price}
                </td>

                <td>
                    ₹${totalAmount}
                </td>

                <td>
                    ${sale.date || "-"}
                </td>

                <td>
                    ${sale.time || "-"}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deletesale(${index})">
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });
}
function hideFooter() {
    document.getElementById("footer").style.display = "none";
}

function showAbout() {
    hideAllSections();

    document.getElementById("footer").style.display = "block";

    document.querySelector(".about-section").style.display = "block";
    hideFooter();
}

function deletesale(index) {

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this sale?"
        );

    if (!confirmDelete) {
        return;
    }

    sales.splice(index, 1);

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

    viewsales();
    updateDashboard();
}

function showLowStock() {

    let result =
        document.getElementById("subResult");

    result.style.display = "block";

    let lowProducts =
        products.filter(function(product) {

            return (
                product.quantity > 0 &&
                product.quantity < 10
            );
        });

    result.innerHTML = "";

    if (lowProducts.length === 0) {

        result.innerHTML = `
            <div class="result-card">
                <h3>
                    No Low Stock Products
                </h3>
            </div>
        `;

        scrollToSubResult();

        return;
    }

    lowProducts.forEach(function(product) {

        result.innerHTML += `
            <div class="result-card">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Category: ${product.category}
                </p>

                <p>
                    Price: ₹${product.price}
                </p>

                <p>
                    Available Stock:
                    ${product.quantity}
                </p>

            </div>
        `;
    });

    scrollToSubResult();
}

function showOutOfStock() {

    let result =
        document.getElementById("subResult");

    result.style.display = "block";

    let outProducts =
        products.filter(function(product) {

            return product.quantity === 0;
        });

    result.innerHTML = "";

    if (outProducts.length === 0) {

        result.innerHTML = `
            <div class="result-card">

                <h3>
                    No Out of Stock Products
                </h3>

            </div>
        `;

        scrollToSubResult();

        return;
    }

    outProducts.forEach(function(product) {

        result.innerHTML += `
            <div class="result-card">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Category: ${product.category}
                </p>

                <p>
                    Price: ₹${product.price}
                </p>

                <p>
                    Available Stock: 0
                </p>

            </div>
        `;
    });

    scrollToSubResult();
}

function showRecentSales() {

    let result =
        document.getElementById("subResult");

    result.style.display = "block";

    result.innerHTML = "";

    let recentSales =
        sales.slice(-5).reverse();

    if (recentSales.length === 0) {

        result.innerHTML = `
            <div class="result-card">

                <h3>
                    No Recent Sales
                </h3>

            </div>
        `;

        scrollToSubResult();

        return;
    }

    recentSales.forEach(function(sale) {

        result.innerHTML += `
            <div class="result-card">

                <h3>
                    ${sale.productName || sale.product}
                </h3>

                <p>
                    Quantity Sold:
                    ${sale.quantity}
                </p>

                <p>
                    Price:
                    ₹${sale.price}
                </p>

                <p>
                    Total Amount:
                    ₹${sale.totalAmount || sale.total || 0}
                </p>

                <p>
                    Date:
                    ${sale.date || "-"}
                </p>

                <p>
                    Time:
                    ${sale.time || "-"}
                </p>

            </div>
        `;
    });

    scrollToSubResult();
}
let salesChartInstance = null;
let stockChartInstance = null;


// Create Dashboard Charts
function updateCharts() {

    // Check if Chart.js is loaded
    if (typeof Chart === "undefined") {
        console.log("Chart.js is not loaded");
        return;
    }

    // Get chart canvas elements
    let salesCanvas = document.getElementById("salesChart");
    let stockCanvas = document.getElementById("stockChart");

    if (!salesCanvas || !stockCanvas) {
        return;
    }

    // Calculate total sales amount for each product
    let salesByProduct = {};

    sales.forEach(function (sale) {
        let name = sale.productName;

        if (!salesByProduct[name]) {
            salesByProduct[name] = 0;
        }

        salesByProduct[name] += Number(
            sale.totalAmount || sale.total || 0
        );
    });

    // Remove old charts before creating new ones
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    // Sales Bar Chart
    salesChartInstance = new Chart(salesCanvas, {
        type: "bar",

        data: {
            labels: Object.keys(salesByProduct),

            datasets: [{
                label: "Sales Amount (₹)",
                data: Object.values(salesByProduct),
                backgroundColor: "#3b82f6",
                borderRadius: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Stock Doughnut Chart
    let available = products.filter(function (product) {
        return Number(product.quantity) >= 10;
    }).length;

    let lowStock = products.filter(function (product) {
        return Number(product.quantity) > 0 &&
               Number(product.quantity) < 10;
    }).length;

    let outOfStock = products.filter(function (product) {
        return Number(product.quantity) === 0;
    }).length;

    stockChartInstance = new Chart(stockCanvas, {
        type: "doughnut",

        data: {
            labels: [
                "Available",
                "Low Stock",
                "Out of Stock"
            ],

            datasets: [{
                data: [available, lowStock, outOfStock],

                backgroundColor: [
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444"
                ],

                borderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
  
}

displayProducts();
loadSaleProducts();
viewsales();
updateDashboard();
showHome();
updateCharts()