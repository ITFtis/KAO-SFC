using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "BCD", Name = "防汛展示面板", MenuPath = "寶珠溝示範區", Index = 1, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class BCDController : NoModelController 
    {
        // GET: BCD
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            //ViewBag.ShowOtherCtrl = false;
            //ViewBag.ShowBGGCtrl = false;
            return View();
        }
    }
}