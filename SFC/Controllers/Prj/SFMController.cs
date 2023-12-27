using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "SmartFloodModel", Name = "智慧淹水模式", MenuPath = "淹水預警模組", Index = 3, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class SFMController : NoModelController
    {
        // GET: SFM
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            //ViewBag.ShowOtherCtrl = false;
            //ViewBag.ShowBGGCtrl = false;
            return View();
        }
    }
}