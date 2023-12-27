using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    //[MenuDef(Id = "CDashboard", Name = "綜整水情儀錶板", MenuPath = "即時監控資訊", Index = 5, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class CDashboardController : NoModelController
    {
        // GET: CDashboard
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            return View();
        }
    }
}