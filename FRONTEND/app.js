let payments = [];

async function downloadAndDisplay(){
    const response = await fetch('http://localhost:5121/bill')
    const bills = await response.json()
    console.log(bills)

    document.querySelector('#bills').innerHTML = ''
    payments = []

    bills.map(x => {
        payments.push(x)

        let tr = document.createElement('tr')
        let tdID = document.createElement('td')
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
    document.querySelector('#amount-txt').value = toUpdate.amountText
    document.querySelector('#bill-date').value = toUpdate.date

}

function deleteLog(event) {
    console.log(event.target.idParameter)

    fetch('http://localhost:5121/bill' + event.target.idParameter, {
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
    document.querySelector('#amount-num').value = '2000'
    document.querySelector('#amount-txt').value = 'kettő ezer'
    document.querySelector('#bill-date').value = '2023-10-01'
}

function createBill(){
    let payername = document.querySelector('#create-payername').value
    let amountnum = document.querySelector('#create-amount-num').value
    let amounttext = document.querySelector('#create-amount-txt').value
    let billdate = document.querySelector('#create-bill-date').value

    fetch('http://localhost:5121/bill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: payername,
            amountNumber: parseInt(amountnum),
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

    fetch('http://localhost:5121/billapi' + billid, {
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




function magyarSzovegSzamra(szoveg) {
    const szamok = {
        'nulla': 0, 'egy': 1, 'kettő': 2, 'két': 2, 'három': 3, 'négy': 4,
        'öt': 5, 'hat': 6, 'hét': 7, 'nyolc': 8, 'kilenc': 9,
        'tíz': 10, 'tizen': 10, 'húsz': 20, 'huszon': 20,
        'száz': 100, 'ezer': 1000
    };

    let maradek = szoveg.toLowerCase().replace(/[-\s]/g, '');

    let osszeg = 0;

    function kivesz(prefix) {
        if (maradek.startsWith(prefix)) {
            maradek = maradek.slice(prefix.length);
            return true;
        }
        return false;
    }

    // Ezerest vizsgál
    let ezres = 0;
    for (let [k, v] of Object.entries(szamok)) {
        if (kivesz(k + 'ezer')) {
            ezres = v * 1000;
            break;
        }
    }
    if (kivesz('ezer')) ezres = 1000;

    // Százas rész
    let szazas = 0;
    for (let [k, v] of Object.entries(szamok)) {
        if (kivesz(k + 'száz')) {
            szazas = v * 100;
            break;
        }
    }
    if (kivesz('száz')) szazas = 100;

    // Tízes + egyes kombinációk (pl. tizennégy, huszonhárom)
    let tizes = 0;
    if (kivesz('tizen')) tizes = 10;
    else if (kivesz('huszon')) tizes = 20;
    else {
        for (let [k, v] of Object.entries(szamok)) {
            if (kivesz(k + 'ven')) {
                tizes = v * 10;
                break;
            }
        }
    }

    // Egyes
    let egyes = 0;
    for (let [k, v] of Object.entries(szamok)) {
        if (maradek.startsWith(k)) {
            egyes = v;
            maradek = maradek.slice(k.length);
            break;
        }
    }

    osszeg = ezres + szazas + tizes + egyes;
    return osszeg;
}

function checkAmount() {
    const num = parseInt(document.getElementById('create-amount-num').value);
    const txt = document.getElementById('create-amount-txt').value;
    const parsed = magyarSzovegSzamra(txt);

    if (num === parsed) {
        alert("Az összegek egyeznek.");
    } else {
        alert(`Az összeg nem egyezik! Szöveg alapján: ${parsed}, számként megadva: ${num}`);
    }
}