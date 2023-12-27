using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Path
{
    [Dou.Misc.Attr.MenuDef(Name = "寶珠溝示範區", Index = 9, IsOnlyPath = true)]//, Icon = "~/images/menu/menu_info.png")]
    public class BaozhugouController : Controller
    {
        // GET: FQuery
        public ActionResult Index()
        {
            return View();
        }
    }
}