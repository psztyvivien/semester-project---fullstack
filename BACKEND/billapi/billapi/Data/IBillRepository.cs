using billapi.Model;

namespace billapi.Controllers
{
    public interface IBillRepository
    {
        IEnumerable<Bill> Read();
        Bill? Read(int id);
        void Update(Bill befizetes);
        void Delete(int id);
        void Create(Bill bill);
    }
}