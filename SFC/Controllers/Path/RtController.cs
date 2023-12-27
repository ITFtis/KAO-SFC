using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Path
{
    [Dou.Misc.Attr.MenuDef(Name = "即時監控資訊", Index = 1, IsOnlyPath = true)]
    public class RtController : Controller
    {
        // GET: Rt
        public ActionResult Index()
        {
            return View();
        }
    }
}