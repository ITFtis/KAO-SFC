using Dou.Misc.Attr;
using Dou.Models.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Prj
{
    [MenuDef(Id = "SensorGRQ", Name = "水位、淹感、CCTV月妥善率", MenuPath = "設備妥善率查詢", Index = 9, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class SensorGRQController : Dou.Controllers.AGenericModelController<Object>
    {
        // GET: SensorGRQ
        public ActionResult Index()
        {
            ViewBag.urltemp = UrlTemp;
            return View();
        }
        public string Download(string type, string month)
        {
            var u = UrlTemp.Replace("{type}", type).Replace("{month}", month);
            string lfn = Guid.NewGuid() + ".xlsx";
            string lfp = System.IO.Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Download")), lfn);
            using (System.Net.WebClient webClient = new System.Net.WebClient())
            {
                webClient.DownloadFile(u, lfp);
            }
            new System.Threading.Thread(RunInitData).Start(lfp);
            return new UrlHelper(Request.RequestContext).Content("~/Download/" + lfn);
        }
        void RunInitData(object args)
        {
            System.Threading.Thread.Sleep(8000);
            var f = args+"";
            if (System.IO.File.Exists(f))
                System.IO.File.Delete(f);
            var fs = System.IO.Directory.GetFiles(System.IO.Path.GetDirectoryName(f));
            foreach (var tf in fs)
            {
                System.IO.FileInfo fi = new System.IO.FileInfo(tf);
                if ((DateTime.Now - fi.CreationTime).TotalSeconds > 30)
                    System.IO.File.Delete(tf);
            }
        }
        string UrlTemp
        {
            get
            {
                return "https://floodinfo.kcg.gov.tw/service/download/get_sensor_xlsx_data?data_type={type}&month={month}&jwt=" + new SFC.Controllers.Api.DataController().GetKHToken();
            }
        }

        protected override IModelEntity<object> GetModelEntity()
        {
            throw new NotImplementedException();
        }
    }
}