using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    public class RtHydroMobileController : Controller
    {
        // GET: RtHydroMobile
        public ActionResult Index()
        {
            ViewBag.HasGis = true;
            ViewBag.ShowOtherCtrl = true;
            //return View("~/Views/RtHydro/Index.cshtml");
            return View();
        }
    }
}