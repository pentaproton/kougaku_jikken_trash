function crank_nicolson(t0, u0, h, n, a, b) {
    var results = [];
    var t = t0;
    var u = u0;
    for (var i = 0; i <= n; i++) {
        results.push({ t: t, u: u });
        u = (2-a*h)/(2+a*h)*u + 2*b*h/(2+a*h);
        t += h;
    }
    return results;
}
function predictor_corrector(t0, u0, h, n, a, b) {
    var results = [{ t: t0, u: u0 }];
    var t2 = t0;
    var u2 = u0;
    var t1 = t0 + h;
    var u1 = u0 + h*(-a*u0+b);
    for (var i = 1; i <= n; i++) {
        results.push({ t: t1, u: u1 });
        var u_hat = u1 + h/2*(3*(-a*u1+b) - (-a*u2+b));
        var u = u1 + h/2*(-a*u_hat+b -a*u1+b);
        t2 = t1;
        u2 = u1;
        t1 += h;
        u1 = u;
    }
    return results;
}
function heun(t0, u0, h, n, a, b) {
    var results = [];
    var t = t0;
    var u = u0;
    for (var i = 0; i <= n; i++) {
        results.push({ t: t, u: u });
        var k1 = -a*u + b;
        var k2 = -a*(u + h*k1) + b;
        u += h/2*(k1 + k2);
        t += h;
    }
    return results;
}
function exact(t0, u0, h, n, a, b) {
    var results = [];
    var t = t0;
    var u = u0;
    for (var i = 0; i <= n; i++) {
        results.push({ t: t, u: u });
        t += h;
        u = (u0 - b/a)*Math.exp(-a*t) + b/a;
    }
    return results;
}
var t0 = 0;
var u0 = 1;
var a = 10;
var b = 1;
var h = 0.02;
var n = 4 / h;
var results_cn = crank_nicolson(t0, u0, h, n, a, b);
var results_pc = predictor_corrector(t0, u0, h, n, a, b);
var results_heun = heun(t0, u0, h, n, a, b);
var results_exact = exact(t0, u0, h, n, a, b);

console.log(results_cn);
console.log(results_pc);
console.log(results_heun);
console.log(results_exact);

var slider = document.createElement('input');
slider.type = 'range';
slider.min = '0.01';
slider.max = '0.3';
slider.step = '0.001';
slider.value = h.toString();
document.body.appendChild(slider);

window.addEventListener('load', function() {
    const ctx = document.getElementById('myChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                label: 'CN',
                data: results_cn.map(item => ({ x: item.t, y: item.u })),
                borderColor: 'red',
                fill: false
            },
            {
                label: 'PC',
                data: results_pc.map(item => ({ x: item.t, y: item.u })),
                borderColor: 'blue',
                fill: false
            },
            {
                label: 'Heun',
                data: results_heun.map(item => ({ x: item.t, y: item.u })),
                borderColor: 'green',
                fill: false
            },
            {
                label: 'Exact',
                data: results_exact.map(item => ({ x: item.t, y: item.u })),
                borderColor: 'orange',
                fill: false
            }
            ]
        },
        options: {
            scales: {
            x: { type: 'linear', position: 'bottom', min: 0, max: 4 },
            y: { beginAtZero: false, min: -1, max: 2 }
            }
        }
    });
    // PDF ダウンロード関数
    document.getElementById('downloadPdfBtn').addEventListener('click', function() {
        const canvas = document.getElementById('myChart');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
        pdf.save('chart.pdf');
    });
    hValue.textContent = h.toString();
    slider.addEventListener('input', function() {
        h = parseFloat(this.value);
        hValue.textContent = h.toString();
        n = 5 / h;
        results_cn = crank_nicolson(t0, u0, h, n, a, b);
        results_pc = predictor_corrector(t0, u0, h, n, a, b);
        results_heun = heun(t0, u0, h, n, a, b);
        results_exact = exact(t0, u0, h, n, a, b);

        chart.data.datasets[0].data = results_cn.map(item => ({ x: item.t, y: item.u }));
        chart.data.datasets[1].data = results_pc.map(item => ({ x: item.t, y: item.u }));
        chart.data.datasets[2].data = results_heun.map(item => ({ x: item.t, y: item.u }));
        chart.data.datasets[3].data = results_exact.map(item => ({ x: item.t, y: item.u }));
        chart.update();
    });

    let autoUpdateInterval = null;
    playButton.addEventListener('click', function() {
        if (autoUpdateInterval) {
            clearInterval(autoUpdateInterval);
            autoUpdateInterval = null;
        } else {
            autoUpdateInterval = setInterval(() => {
                h += 0.0002; // 自動更新量を調整
                slider.value = h;
                hValue.textContent = h.toString();
                n = 5 / h;
                results_cn = crank_nicolson(t0, u0, h, n, a, b);
                results_pc = predictor_corrector(t0, u0, h, n, a, b);
                results_heun = heun(t0, u0, h, n, a, b);
                results_exact = exact(t0, u0, h, n, a, b);
                chart.data.datasets[0].data = results_cn.map(item => ({ x: item.t, y: item.u }));
                chart.data.datasets[1].data = results_pc.map(item => ({ x: item.t, y: item.u }));
                chart.data.datasets[2].data = results_heun.map(item => ({ x: item.t, y: item.u }));
                chart.data.datasets[3].data = results_exact.map(item => ({ x: item.t, y: item.u }));
                chart.update();
    
                if (h > 2) { // 終了条件を設定
                    clearInterval(autoUpdateInterval);
                    autoUpdateInterval = null;
                }
            }, 10); // 更新間隔(ms)を調整
        }
    });
});