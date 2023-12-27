using Antlr.Runtime.Misc;
using Dou.Controllers;
using Dou.Misc.Attr;
using SFC.Controllers.Comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Xml.Linq;

namespace SFC.Controllers.Device
{
    [KRSWHtmlIFrameMenuDef(Id = "MonthReliable", Name = "下水道水位站月妥善率查詢", MenuPath = "設備妥善率查詢", Index = 6, Url = "DeviceReliableMonth")]
    public class DeviceReliableMonthFController : HtmlIFrameController
    {
        [System.Web.Mvc.AllowAnonymous]
        // GET: DeviceReliableMonthF
        public ActionResult Index()
        {
            return View();
        }
    }
}