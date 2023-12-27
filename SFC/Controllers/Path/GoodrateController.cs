using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Path
{
    [Dou.Misc.Attr.MenuDef(Name = "設備妥善率查詢", Index = 9, IsOnlyPath = true)]
    public class GoodrateController : Controller
    {
        // GET: Goodrate
        public ActionResult Index()
        {
            return View();
        }
    }
}