using Dou.Misc.Attr;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "SOperate", Name = "設施智慧操作決策", MenuPath = "寶珠溝示範區", Index = 1, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class SOperateController : NoModelController
    {
        // GET: BCD
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            return View();
        }
    }
}