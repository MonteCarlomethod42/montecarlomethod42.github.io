function findRequiredCapital() {
    console.log("開始執行計算..."); // 確保函數運行

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

        while (maxCapital - minCapital > 10000) { // 避免無限循環，讓計算更精確
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

    // 清除舊圖表
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
