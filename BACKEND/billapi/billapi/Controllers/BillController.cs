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
            int parsedAmount = ParseHungarianNumberText(bill.AmountTxt);

            if (parsedAmount != bill.AmountNum)
            {
                return BadRequest("The numeric amount and text amount do not match.");
            }

            if (parsedAmount > 999999)
            {
                return BadRequest("Amount exceeds maximum value of 999 999.");
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

            var hungarianNumberDictionary = new Dictionary<string, int>
            {
                { "nulla", 0 },
                { "egy", 1 },
                { "kettő", 2 },
                { "két", 2 },
                { "három", 3 },
                { "négy", 4 },
                { "öt", 5 },
                { "hat", 6 },
                { "hét", 7 },
                { "nyolc", 8 },
                { "kilenc", 9 },
                { "tíz", 10 },
                { "tizenegy", 11 },
                { "tizenkettő", 12 },
                { "tizenkét", 12 },
                { "tizenhárom", 13 },
                { "tizennégy", 14 },
                { "tizenöt", 15 },
                { "tizenhat", 16 },
                { "tizenhét", 17 },
                { "tizennyolc", 18 },
                { "tizenkilenc", 19 },
                { "húsz", 20 },
                { "huszon", 20 },
                { "harminc", 30 },
                { "negyven", 40 },
                { "ötven", 50 },
                { "hatvan", 60 },
                { "hetven", 70 },
                { "nyolcvan", 80 },
                { "kilencven", 90 },
                { "száz", 100 },
                { "ezer", 1000 },
                { "millió", 1000000 }
            };

            if (hungarianNumberDictionary.ContainsKey(hungarianText))
            {
                return hungarianNumberDictionary[hungarianText];
            }

            int result = 0;
            int currentNumber = 0;

            // Handle common suffixes and prefixes
            hungarianText = hungarianText.Replace("ezerkétszáz", "1200");
            hungarianText = hungarianText.Replace("ezerötszáz", "1500");

            // Handle special case like "izenkét" -> "tizenkét"
            hungarianText = Regex.Replace(hungarianText, @"\bizen", "tizen");

            // Process each word
            string[] words = hungarianText.Split(new[] { ' ', '-' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string word in words)
            {
                if (word == "ezer")
                {
                    if (currentNumber == 0)
                        currentNumber = 1;

                    result += currentNumber * 1000;
                    currentNumber = 0;
                    continue;
                }

                if (word == "száz")
                {
                    if (currentNumber == 0)
                        currentNumber = 1;

                    currentNumber *= 100;
                    continue;
                }

                // Check if the word itself is a number
                if (hungarianNumberDictionary.ContainsKey(word))
                {
                    currentNumber += hungarianNumberDictionary[word];
                    continue;
                }

                // Check for compound words
                if (word.EndsWith("száz"))
                {
                    string prefix = word.Substring(0, word.Length - 4);
                    if (hungarianNumberDictionary.ContainsKey(prefix))
                    {
                        currentNumber += hungarianNumberDictionary[prefix] * 100;
                    }
                    continue;
                }

                if (word.EndsWith("ezer"))
                {
                    string prefix = word.Substring(0, word.Length - 4);
                    if (hungarianNumberDictionary.ContainsKey(prefix))
                    {
                        result += hungarianNumberDictionary[prefix] * 1000;
                        currentNumber = 0;
                    }
                    continue;
                }

                // Try to find partial matches
                foreach (var entry in hungarianNumberDictionary)
                {
                    if (word.Contains(entry.Key))
                    {
                        int index = word.IndexOf(entry.Key);
                        string before = word.Substring(0, index);
                        string after = word.Substring(index + entry.Key.Length);

                        if (hungarianNumberDictionary.ContainsKey(before))
                        {
                            currentNumber += hungarianNumberDictionary[before];
                        }

                        currentNumber += entry.Value;

                        if (hungarianNumberDictionary.ContainsKey(after))
                        {
                            currentNumber += hungarianNumberDictionary[after];
                        }

                        break;
                    }
                }
            }

            result += currentNumber;
            return result;
        }
    }
}