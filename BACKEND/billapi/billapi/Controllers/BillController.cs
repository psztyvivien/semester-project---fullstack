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

        [HttpPut("{id}")]
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
            // A bemeneti szöveg kisbetűssé alakítása és szóközök eltávolítása az elejéről és végéről
            hungarianText = hungarianText.ToLower().Trim();

            // A kötőjelek lecserélése szóközökre, hogy egységesen lehessen feldolgozni
            hungarianText = hungarianText.Replace("-", " ");

            // Dictionary a magyar számnevek és azok numerikus értékei között
            Dictionary<string, int> numbers = new Dictionary<string, int>
            {
                // Alapszámok és alternatív írásmódjaik
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

                // Tízesek és összetett alakok
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

                 // Többszörös tízesek
                {"húsz", 20}, {"husz", 20},
                {"harminc", 30},
                {"negyven", 40},
                {"ötven", 50}, {"otven", 50},
                {"hatvan", 60},
                {"hetven", 70},
                {"nyolcvan", 80},
                {"kilencven", 90},

                // Száz, ezer, millió és variációik
                {"száz", 100}, {"szaz", 100},
                {"ezer", 1000},
                {"millió", 1000000}, {"millio", 1000000}
            };

            // Ha a szöveg egyszerű (5), akkor közvetlenül visszaadjuk a szótárból
            if (numbers.ContainsKey(hungarianText))
            {
                return numbers[hungarianText];
            }

            int result = 0;

            // Először a legnagyobb érték, a "millió" kezelése
            if (hungarianText.Contains("millió") || hungarianText.Contains("millio"))
            {
                string[] parts = Regex.Split(hungarianText, "millió|millio");

                int millioValue = 1;
                if (!string.IsNullOrWhiteSpace(parts[0]))
                {
                    // A "millió" előtti rész értéke
                    millioValue = ParseSubHungarianNumber(parts[0], numbers);
                }

                result += millioValue * 1000000;

                // A "millió" utáni rész feldolgozása (pl. "háromszázhúsz")
                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseRemainingParts(parts[1], numbers);
                }
            }

            // Ha nincs "millió", de van "ezer", akkor azt kezeljük
            else if (hungarianText.Contains("ezer"))
            {
                string[] parts = Regex.Split(hungarianText, "ezer");

                int ezerValue = 1;
                if (!string.IsNullOrWhiteSpace(parts[0]))
                {
                    ezerValue = ParseSubHungarianNumber(parts[0], numbers);
                }

                result += ezerValue * 1000;

                // A "ezer" utáni rész feldolgozása
                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseRemainingParts(parts[1], numbers);
                }
            }
            else
            {
                // Ha sem "millió", sem "ezer" nincs benne, akkor az egész szöveget egyszerűbb módon elemezzük
                result = ParseSubHungarianNumber(hungarianText, numbers);
            }

            return result;
        }

        // Ez a segédfüggvény a "millió" vagy "ezer" utáni részeket dolgozza fel
        private int ParseRemainingParts(string text, Dictionary<string, int> numbers)
        {
            text = text.Trim();

            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            // Ha van benne "ezer", akkor azt is külön kezeljük
            if (text.Contains("ezer"))
            {
                string[] parts = Regex.Split(text, "ezer");

                int ezerValue = 1;
                if (!string.IsNullOrWhiteSpace(parts[0]))
                {
                    ezerValue = ParseSubHungarianNumber(parts[0], numbers);
                }

                int result = ezerValue * 1000;

                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseSubHungarianNumber(parts[1], numbers);
                }

                return result;
            }
            else
            {
                // Ha nincs benne "ezer", csak sima számrész maradt (pl. "harminc")
                return ParseSubHungarianNumber(text, numbers);
            }
        }

        // Ez a függvény feldolgozza az olyan részeket, mint "kétszázharminc"
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

            // Ha van benne "száz", akkor azt külön bontjuk
            if (text.Contains("száz") || text.Contains("szaz"))
            {
                string[] parts = Regex.Split(text, "száz|szaz");

                // Ha nincs előtte érték (pl. csak "száz"), akkor 100-at adunk
                if (parts[0].Trim() == "")
                {
                    result += 100;
                }
                else
                {
                    result += numbers[parts[0].Trim()] * 100;
                }

                // A száz utáni részt külön kezeljük (pl. "harmincöt")
                if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                {
                    result += ParseTensAndOnes(parts[1], numbers);
                }
            }
            else
            {
                // Ha nincs benne "száz", akkor tízeseket és egyeseket kezelünk
                result += ParseTensAndOnes(text, numbers);
            }

            return result;
        }

        // Ez a függvény a tízeseket és egyeseket dolgozza fel (pl. "harmincöt" → 35)
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

            // Megkeressük, melyik tízes előtaggal kezdődik a szöveg
            foreach (var tensNumber in new[] { "kilencven", "nyolcvan", "hetven", "hatvan", "ötven", "otven", "negyven", "harminc", "húsz", "husz" })
            {
                if (text.StartsWith(tensNumber))
                {
                    int tensValue = numbers[tensNumber];
                    string remaining = text.Substring(tensNumber.Length).Trim();

                    // Ha nincs egyes utána
                    if (string.IsNullOrEmpty(remaining))
                    {
                        return tensValue;
                    }

                    // Tízes + egyes
                    return tensValue + numbers[remaining];
                }
            }

            // Ha nem tudtuk feldolgozni, hibát dobunk
            throw new ArgumentException($"Cannot parse Hungarian number text: {text}");
        }
    }
}