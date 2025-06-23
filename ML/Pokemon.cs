using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ML
{
    public class Pokemon
    {
        public int count {  get; set; }
        public string next {  get; set; }
        public string previous { get; set; }
        public ML.Results Results { get; set; }
        public List<Pokemon> pokemons { get; set; }
    }
}
