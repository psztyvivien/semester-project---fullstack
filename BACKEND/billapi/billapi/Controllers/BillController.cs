using billapi.Model;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace billapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BillController : ControllerBase
    {
        IBillRepository repo;
        public BillController(IBillRepository repo)
        {
            this.repo = repo;
        }

        [HttpGet]
        public IEnumerable<Bill> GetBills()
        {
            return this.repo.Read();
        }

        [HttpGet("{id}")]
        public Bill? GetBill(int id)
        {
            return this.repo.Read(id);
        }

        [HttpPost]
        public void CreateBill([FromBody] Bill bill)
        {
            this.repo.Create(bill);
        }

        [HttpPut]
        public void EditBill([FromBody] Bill bill)
        {
            this.repo.Update(bill);
        }

        [HttpDelete("{id}")]
        public void DeleteBill(int id)
        {
            this.repo.Delete(id);
        }
    }
}
