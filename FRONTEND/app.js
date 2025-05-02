const payments = [];

async function donwloadAndDisplay(){
    const response = await fetch('http://localhost:5500/billapi')
    const bills = await response.json()
    console.log(bills)

    document.querySelector('#bills').innerHTML = ''
    payments = []

    bills.map(x => {
        payments.push(x)

        let tr = document.createElement('tr')
        let tdName = document.createElement('td')
        let tdAmountNumber = document.createElement('td')
        let tdAmountText = document.createElement('td')
        let tdDate = document.createElement('td')
        let tdActions = document.createElement('td')

        tdID.innerHTML =  x.id
        tdName.innerHTML = x.name
        tdAmountNumber.innerHTML = x.amountNumber
        tdAmountText.innerHTML = x.amountText
        tdDate.innerHTML = x.date

        tr.appendChild(tdID)
        tr.appendChild(tdName)
        tr.appendChild(tdAmountNumber)
        tr.appendChild(tdAmountText)
        tr.appendChild(tdDate)
        tr.appendChild(tdActions)

        let btnUpdate = document.createElement('button')
        btnUpdate.classList.add('btn')
        btnUpdate.classList.add('btn-sm')
        btnUpdate.classList.add('btn-warning')
        btnUpdate.classList.add('mx-2')
        btnUpdate.innerHTML = 'Update'
        btnUpdate.idParameter = x.id
        btnUpdate.addEventListener('click', updateLog)
        tdActions.appendChild(btnUpdate)

        let btnDel = document.createElement('button')
        btnDel.classList.add('btn')
        btnDel.classList.add('btn-sm')
        btnDel.classList.add('btn-danger')
        btnDel.classList.add('mx-2')
        btnDel.innerHTML = 'Delete'
        btnDel.idParameter = x.id
        btnDel.addEventListener('click', deleteLog)
        tdActions.appendChild(btnDel)

        document.querySelector('#bills').appendChild(tr)
    })
}



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