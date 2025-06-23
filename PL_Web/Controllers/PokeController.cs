using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PL_Web.Controllers
{
    public class PokeController : Controller
    {
        // GET: Poke
        public ActionResult PokemonCards()
        {
            return View();
        }

        public ActionResult Carta()
        {
            return View();
        }

        public ActionResult LoginGitHub()
        {
            return View();
        }
    }
}