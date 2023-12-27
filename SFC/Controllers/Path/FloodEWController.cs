using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Path
{
    [Dou.Misc.Attr.MenuDef(Name = "淹水預警模組", Index = 5, IsOnlyPath = true)]//, Icon = "~/images/menu/menu_info.png")]
    public class FloodEWController : Controller
    {
        // GET: FloodEW
        public ActionResult Index()
        {
            return View();
        }
    }
}