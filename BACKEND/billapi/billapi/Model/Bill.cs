namespace billapi.Model
{
    public class Bill
    {
        public int Id { get; set; }
        public string PayerName { get; set; }
        public int AmountNum { get; set; }
        public string AmountTxt { get; set; }
        public DateTime Date { get; set; }
    }
}
