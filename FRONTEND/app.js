let payments = [];

async function downloadAndDisplay(){
    const response = await fetch('http://localhost:5121/bill')
    const bills = await response.json()
    console.log(bills)
    document.querySelector('#bills').innerHTML = ''
    payments = []
    
    // Find the most recent payment
    let latestPayment = null;
    bills.forEach(bill => {
        if (!latestPayment || new Date(bill.date) > new Date(latestPayment.date)) {
            latestPayment = bill;
        }
    });
    
    bills.map(bill => {
        payments.push(bill)
        let tr = document.createElement('tr')
        let tdID = document.createElement('td')
        let tdName = document.createElement('td')
        let tdAmountNumber = document.createElement('td')
        let tdAmountText = document.createElement('td')
        let tdDate = document.createElement('td')
        let tdActions = document.createElement('td')
        tdID.innerHTML =  bill.id
        
        // Add red badge to the latest payment's name
        if (latestPayment && bill.id === latestPayment.id) {
            tdName.innerHTML = `<span class="badge bg-danger">${bill.payerName}</span>`;
        } else {
            tdName.innerHTML = bill.payerName;
        }
        
        tdAmountNumber.innerHTML = bill.amountNum
        tdAmountText.innerHTML = bill.amountTxt
        tdDate.innerHTML = new Date(bill.date).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
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
        btnUpdate.innerHTML = 'Frissít'
        btnUpdate.idParameter = bill.id
        btnUpdate.addEventListener('click', updateLog)
        tdActions.appendChild(btnUpdate)
        let btnDel = document.createElement('button')
        btnDel.classList.add('btn')
        btnDel.classList.add('btn-sm')
        btnDel.classList.add('btn-danger')
        btnDel.classList.add('mx-2')
        btnDel.innerHTML = 'Törlés'
        btnDel.idParameter = bill.id
        btnDel.addEventListener('click', deleteLog)
        tdActions.appendChild(btnDel)
        document.querySelector('#bills').appendChild(tr)
    })
}


function updateLog(event) {
    console.log(event.target.idParameter)

    let toUpdate = payments.find(x => x.id === event.target.idParameter)

    document.querySelector('#bill-id').value = toUpdate.id
    document.querySelector('#payername').value = toUpdate.payerName
    document.querySelector('#amount-num').value = toUpdate.amountNum
    document.querySelector('#amount-txt').value = toUpdate.amountTxt
    document.querySelector('#bill-date').value = toUpdate.date.split('T')[0]

    console.log(toUpdate)
}

function deleteLog(event) {
    console.log(event.target.idParameter)

    fetch('http://localhost:5121/bill/' + event.target.idParameter, {
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
    document.querySelector('#create-bill-id').value = '3'
    document.querySelector('#create-payername').value = 'Teszt befizető'
    document.querySelector('#create-amount-num').value = '12000'
    document.querySelector('#create-amount-txt').value = 'tizenkétezer'
    document.querySelector('#create-bill-date').value = '2025-05-01'
}

function createBill(){
    let id = document.querySelector('#create-bill-id').value
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
            id: parseInt(id),
            payername: payername,
            amountNum: parseInt(amountnum),
            amountTxt: amounttext,
            date: billdate
        })
    })
    .then(resp => {
        console.log('Response: ', resp)
        if (resp.status === 200) {
            downloadAndDisplay()
        }
        if(resp.status === 400){
            alert('Hibás tranzakció!')
        }
    })
    .catch(err => {
        console.error('Error: r ', err)
        alert('Sikertelen létrehozás!')
    })
}

function updateBill(){
    let billid = document.querySelector('#bill-id').value
    let payername = document.querySelector('#payername').value
    let amountnum = document.querySelector('#amount-num').value
    let amounttext = document.querySelector('#amount-txt').value
    let billdate = document.querySelector('#bill-date').value

    fetch('http://localhost:5121/bill/' + billid, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: parseInt(billid),
            payername: payername,
            amountNum: parseInt(amountnum),
            amountTxt: amounttext,
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






