using Dou.Models.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers 
{
    [Dou.Misc.Attr.MenuDef(Id = "Home", Name = "首頁", MenuPath = "", Action = "Index", Func = Dou.Misc.Attr.FuncEnum.None, AllowAnonymous = false)]
    public class HomeController : Dou.Controllers.AGenericModelController<Object>
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        protected override IModelEntity<object> GetModelEntity()
        {
            throw new NotImplementedException();
        }
    }
}