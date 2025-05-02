using billapi.Model;

namespace billapi.Controllers
{
    public class BillRepository : IBillRepository
    {
        List<Bill> bills;
        public BillRepository()
        {
            bills = new List<Bill>();
        }

        public void Create(Bill bill)
        {
            this.bills.Add(bill);
        }

        public IEnumerable<Bill> Read()
        {
            return this.bills;
        }

        public Bill? Read(int id)
        {
            return this.bills.FirstOrDefault(b => b.Id == id);
        }

        public void Update(Bill bill) 
        {
            Bill toUpdate = this.Read(bill.Id);

            toUpdate.PayerName = bill.PayerName;
            toUpdate.AmountNum = bill.AmountNum;
            toUpdate.AmountTxt = bill.AmountTxt;
            toUpdate.Date = bill.Date;
        }

        public void Delete(int id)
        {
            Bill toDelete = this.Read(id);
            this.bills.Remove(toDelete);
        }
    }
}
