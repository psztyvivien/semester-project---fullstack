const payments = [];

document.getElementById('payment-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const amountNumber = parseInt(document.getElementById('amount-number').value.trim());
    const amountText = document.getElementById('amount-text').value.trim().toLowerCase();
    const date = document.getElementById('date').value;

    const converted = convertTextToNumber(amountText);

    if (amountNumber !== converted) {
        document.getElementById('result').innerHTML = `<p style="color:red;">Hibás tranzakció</p>`;
        return;
    }

    const payment = { name, amountNumber, amountText, date };
    payments.push(payment);
    renderTable();
});

// Egyszerű szövegből számra konvertáló (magyar)
function convertTextToNumber(text) {
    const szavak = {
        'egy': 1, 'kettő': 2, 'két': 2, 'három': 3, 'négy': 4, 'öt': 5,
        'hat': 6, 'hét': 7, 'nyolc': 8, 'kilenc': 9, 'tíz': 10,
        'tizenegy': 11, 'tizenkettő': 12, 'tizenhárom': 13, 'tizennégy': 14,
        'tizenöt': 15, 'tizenhat': 16, 'tizenhét': 17, 'tizennyolc': 18, 'tizenkilenc': 19,
        'húsz': 20, 'harminc': 30, 'negyven': 40, 'ötven': 50, 'hatvan': 60,
        'hetven': 70, 'nyolcvan': 80, 'kilencven': 90, 'száz': 100, 'ezer': 1000
    };

    if (!text) return 0;

    let total = 0;

    if (text.includes('ezer')) {
        const parts = text.split('ezer');
        const ezres = convertTextToNumber(parts[0]);
        const maradek = convertTextToNumber(parts[1] || '');
        return ezres * 1000 + maradek;
    }

    for (let [szo, ertek] of Object.entries(szavak)) {
        if (text.startsWith(szo)) {
            return ertek + convertTextToNumber(text.slice(szo.length));
        }
    }

    return 0;
}

function renderTable() {
    const latestName = payments[payments.length - 1].name;
    let html = `
    <table border="1" cellpadding="5">
        <thead>
            <tr>
                <th>Név</th><th>Összeg (szám)</th><th>Összeg (szöveg)</th><th>Dátum</th>
            </tr>
        </thead>
        <tbody>
    `;

    payments.forEach(p => {
        html += `
        <tr>
            <td>${p.name === latestName ? `<span class="badge" style="color: white; background-color: red; padding: 2px 5px; border-radius: 5px;">${p.name}</span>` : p.name}</td>
            <td>${p.amountNumber}</td>
            <td>${p.amountText}</td>
            <td>${p.date}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById('result').innerHTML = html;
}