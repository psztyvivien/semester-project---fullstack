using billapi.Model;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

namespace billapi.Controllers
{
    [ApiController]
    [Route("[controller]")]     //URL: http://localhost:5121/bill
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
        public ActionResult<Bill> CreateBill([FromBody] Bill bill)
        {
            int textAsNumber = ParseHungarianNumberText(bill.AmountTxt);

            if (textAsNumber != bill.AmountNum)
            {
                return BadRequest("The numeric amount and text amount do not match");
            }

            this.repo.Create(bill);
            return bill;
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

        private int ParseHungarianNumberText(string hungarianText)
        {
            hungarianText = hungarianText.ToLower().Trim();

            Dictionary<string, int> numbers = new Dictionary<string, int>
            {
                {"nulla", 0},
                {"egy", 1},
                {"kettő", 2}, {"ketto", 2}, {"két", 2}, {"ket", 2},
                {"három", 3}, {"harom", 3},
                {"négy", 4}, {"negy", 4},
                {"öt", 5}, {"ot", 5},
                {"hat", 6},
                {"hét", 7}, {"het", 7},
                {"nyolc", 8},
                {"kilenc", 9},
                {"tíz", 10}, {"tiz", 10},
                {"tizenegy", 11},
                {"tizenkettő", 12}, {"tizenketto", 12}, {"tizenkét", 12}, {"tizenket", 12},
                {"tizenhárom", 13}, {"tizenharom", 13},
                {"tizennégy", 14}, {"tizennegy", 14},
                {"tizenöt", 15}, {"tizenot", 15},
                {"tizenhat", 16},
                {"tizenhét", 17}, {"tizenhet", 17},
                {"tizennyolc", 18},
                {"tizenkilenc", 19},
                {"húsz", 20}, {"husz", 20},
                {"harminc", 30},
                {"negyven", 40},
                {"ötven", 50}, {"otven", 50},
                {"hatvan", 60},
                {"hetven", 70},
                {"nyolcvan", 80},
                {"kilencven", 90},
                {"száz", 100}, {"szaz", 100},
                {"ezer", 1000},
                {"millió", 1000000}, {"millio", 1000000}
            };

            if (numbers.ContainsKey(hungarianText))
            {
                return numbers[hungarianText];
            }

            int result = 0;
            int currentNumber = 0;

            if (hungarianText.Contains("ezer"))
            {
                string[] parts = hungarianText.Split(new[] { "ezer" }, StringSplitOptions.None);

                if (parts[0].Trim() == "")
                {
                    currentNumber = 1;
                }
                else
                {
                    currentNumber = ParseSubHungarianNumber(parts[0], numbers);
                }

                result += currentNumber * 1000;

                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseSubHungarianNumber(parts[1], numbers);
                }
            }
            else
            {
                result = ParseSubHungarianNumber(hungarianText, numbers);
            }

            if (result > 999999)
            {
                throw new ArgumentException("Number exceeds maximum value of 999 999");
            }

            return result;
        }

        private int ParseSubHungarianNumber(string text, Dictionary<string, int> numbers)
        {
            text = text.Trim();

            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            if (numbers.ContainsKey(text))
            {
                return numbers[text];
            }

            int result = 0;

            if (text.Contains("száz") || text.Contains("szaz"))
            {
                string[] parts = Regex.Split(text, "száz|szaz");

                if (parts[0].Trim() == "")
                {
                    result += 100;
                }
                else
                {
                    result += numbers[parts[0].Trim()] * 100;
                }

                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseTensAndOnes(parts[1], numbers);
                }
            }
            else
            {
                result += ParseTensAndOnes(text, numbers);
            }

            return result;
        }

        private int ParseTensAndOnes(string text, Dictionary<string, int> numbers)
        {
            text = text.Trim();

            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            if (numbers.ContainsKey(text))
            {
                return numbers[text];
            }

            foreach (var tensNumber in new[] { "kilencven", "nyolcvan", "hetven", "hatvan", "ötven", "otven", "negyven", "harminc", "húsz", "husz" })
            {
                if (text.StartsWith(tensNumber))
                {
                    int tensValue = numbers[tensNumber];
                    string remaining = text.Substring(tensNumber.Length).Trim();

                    if (string.IsNullOrEmpty(remaining))
                    {
                        return tensValue;
                    }

                    return tensValue + numbers[remaining];
                }
            }

            throw new ArgumentException($"Cannot parse Hungarian number text: {text}");
        }
    }
}