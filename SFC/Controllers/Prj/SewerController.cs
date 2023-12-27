using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "SewerComplex", Name = "雨水下水道水位站多元展示", MenuPath = "即時監控資訊", Index = 5, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class SewerController : NoModelController
    {
        // GET: Sewer
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            return View();
        }
    }
}