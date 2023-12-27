using Dou.Controllers;
using SFC.Controllers.comm;
using SFC.Controllers.Comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Web;
using System.Web.Mvc;
using System.Xml.Linq;

namespace SFC.Controllers.Prj
{
    [KaoCWBHtmlIFrameMenuDef(Id = "KaoCWB", Name = "氣象預報情資", MenuPath = "淹水預警模組", Index = 1, Url = "KaoCWB")]
    public class KaoCWBController : HtmlIFrameController
    {
        // GET: KaoCWB
        public ActionResult Index()
        {
            return View();
        }
    }
}