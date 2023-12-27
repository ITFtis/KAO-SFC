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
using System.Web.Mvc;
using System.Xml.Linq;

namespace SFC.Controllers.Device
{
    /*
     設備妥善率日報
     */
    [KRSWHtmlIFrameMenuDef(Id = "DailyReliable", Name = "下水道水位站日妥善率查詢", MenuPath = "設備妥善率查詢", Index = 5, Url = "DeviceReliableDaily")]
    public class DeviceReliableDailyFController : HtmlIFrameController
    {
        // GET: DeviceReliableDailyI
        public ActionResult Index()
        {
            return View();
        }
    }
}