using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "RtHydro", Name = "即時監控圖台", MenuPath = "即時監控資訊", Index = 1, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class RtHydroController : NoModelController
    {
        // GET: RtHydro
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            ViewBag.ShowOtherCtrl = true;
            ViewBag.ShowBGGCtrl = true;
            return View();
        }
    }
}