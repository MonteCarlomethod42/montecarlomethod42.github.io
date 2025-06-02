// 用來暫存最新計算出的結果，方便匯出用
let latestResults = {};

function findRequiredCapital() {
    console.log("開始執行計算...");

    let annualSpending = parseFloat(document.getElementById("annual_spending").value);
    let numSimulations = parseInt(document.getElementById("num_simulations").value);

    let expectedReturn = parseFloat(document.getElementById("expected_return").value) / 100;
    let volatility = parseFloat(document.getElementById("volatility").value) / 100;
    let inflationRate = parseFloat(document.getElementById("inflation_rate").value) / 100;

    let retirementAges = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
    let results = {};

    retirementAges.forEach((retirementAge) => {
        let minCapital = 0;
        let maxCapital = 1000000000; // 設定最大可能值
        let requiredCapital = maxCapital;
        let withdrawalYears = 90 - retirementAge;

        while (maxCapital - minCapital > 10000) { // 當差異小於 1 萬元時停止迭代
            let testCapital = (minCapital + maxCapital) / 2;
            let successCount = 0;

            for (let i = 0; i < numSimulations; i++) {
                let capital = testCapital;
                let spending = annualSpending;

                for (let j = 0; j < withdrawalYears; j++) {
                    let marketReturn = Math.random() * (volatility * 2) - volatility + expectedReturn;
                    capital *= (1 + marketReturn);
                    capital -= spending;
                    spending *= (1 + inflationRate);
                    if (capital <= 0) break;
                }

                if (capital > 0) successCount++;
            }

            let successRate = (successCount / numSimulations) * 100;

            if (successRate >= 95) {
                requiredCapital = testCapital;
                maxCapital = testCapital;
            } else {
                minCapital = testCapital;
            }
        }

        results[retirementAge] = requiredCapital;
    });

    // 存入全域變數，方便後續匯出
    latestResults = results;
    displayResults(results);
}

function displayResults(results) {
    let resultText = "<h2>成功率 95% 所需初始金額</h2><ul>";
    let retirementAges = Object.keys(results);
    let capitalData = Object.values(results);

    retirementAges.forEach((age) => {
        resultText += `<li>退休年齡 ${age} 歲：${results[age].toFixed(0)} 元</li>`;
    });
    resultText += "</ul>";
    document.getElementById("result").innerHTML = resultText;

    // 若之前已生成圖表，先銷毀以避免重疊
    if (window.capitalChartInstance) {
        window.capitalChartInstance.destroy();
    }

    // 繪製折線圖
    let ctx = document.getElementById("capitalChart").getContext("2d");
    window.capitalChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: retirementAges,
            datasets: [{
                label: '所需初始資金 (元)',
                data: capitalData,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 匯出 CSV 檔案供 Excel 開啟
function exportCSV() {
    // 確保有計算結果
    if (!latestResults || Object.keys(latestResults).length === 0) {
        alert("請先執行計算！");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF 為 Byte Order Mark (BOM)，可解決 Excel 顯示亂碼的問題
    csvContent += "退休年齡,所需初始金額\n";
    for (let age in latestResults) {
        csvContent += `${age},${latestResults[age].toFixed(0)}\n`;
    }

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "財務計算結果.csv");
    document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
    link.click();
    document.body.removeChild(link);
}
