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


function updateLog(event) {
    console.log(event.target.idParameter)

    let toUpdate = payments.find(x => x.id === event.target.idParameter)

    document.querySelector('#bill-id').value = toUpdate.id
    document.querySelector('#payername').value = toUpdate.name
    document.querySelector('#amount-num').value = toUpdate.amountNumber
    document.querySelector('#amount-text').value = toUpdate.amountText
    document.querySelector('#bill-date').value = toUpdate.date

}

function deleteLog(event) {
    console.log(event.target.idParameter)

    fetch('http://localhost:5500/billapi/' + event.target.idParameter, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    })
    .then(resp => {
        console.log('Response: ', resp)
        if (resp.status === 200) {
            downloadAndDisplay()
        }
    })
}


function reset(){
    document.querySelector('#bill-id').value = ''
    document.querySelector('#payername').value = ''
    document.querySelector('#amount-num').value = ''
    document.querySelector('#amount-txt').value = ''
    document.querySelector('#bill-date').value = ''
}

function addTemp(){
    document.querySelector('#bill-id').value = '3'
    document.querySelector('#payername').value = 'Test Payer'
    document.querySelector('#amount-num').value = '12000'
    document.querySelector('#amount-txt').value = 'tizenkettő ezer'
    document.querySelector('#bill-date').value = '2023-10-01'
}

function createBill(){
    let payername = document.querySelector('#create-payername').value
    let amountnum = document.querySelector('#create-amount-num').value
    let amounttext = document.querySelector('#create-amount-txt').value
    let billdate = document.querySelector('#create-bill-date').value

    fetch('http://localhost:5500/billapi', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: payername,
            amountNumber: amountnum,
            amountText: amounttext,
            date: billdate
        })
    })
    .then(resp => {
        console.log('Response: ', resp)
        if (resp.status === 200) {
            downloadAndDisplay()
        }
    })
    .catch(err => {
        console.error('Error: ', err)
    })
}

function updateBill(){
    let billid = document.querySelector('#bill-id').value
    let payername = document.querySelector('#payername').value
    let amountnum = document.querySelector('#amount-num').value
    let amounttext = document.querySelector('#amount-txt').value
    let billdate = document.querySelector('#bill-date').value

    fetch('http://localhost:5500/billapi/' + billid, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: billid,
            name: payername,
            amountNumber: amountnum,
            amountText: amounttext,
            date: billdate
        })
    })
    .then(resp => {
        console.log('Response: ', resp)
        if (resp.status === 200) {
            downloadAndDisplay()
        }
    })
    .catch(err => {
        console.error('Error: ', err)
    })
}

downloadAndDisplay()




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