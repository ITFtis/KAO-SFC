using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    //[MenuDef(Id = "EstimateFlood", Name = "淹水範圍即時推估", MenuPath = "淹水預警", Index = 3, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class EFRTController : NoModelController
    {
        // GET: EFRT
        public ActionResult Index()
        {
            return View();
        }
    }
}