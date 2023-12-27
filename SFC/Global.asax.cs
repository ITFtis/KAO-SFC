using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using PagedList;
using Microsoft.Ajax.Utilities;
using System.Web.Http.Results;

namespace SFC
{
    class D
    {
        public string a { set; get; }
        public string b { set; get; }
        public string c { set; get; }
        public string d { set; get; }
        public string e { set; get; }

        public string f { set; get; }
        public string g { set; get; }
        public string h { set; get; }
        public string i { set; get; }

    }
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {

            
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            System.Web.Helpers.AntiForgeryConfig.SuppressXFrameOptionsHeader = true;
            Logger.Log.LoadConfig(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Config")), "Log4netConfig.xml"));
            Logger.Log.AutoDeleteExpiredData(System.Web.Hosting.HostingEnvironment.MapPath(("~/log")), 20);
            Logger.Log.For(null).Info("SFC Application_Start");

            //new System.Threading.Thread(() =>
            //{
                
            //    System.Threading.Thread.Sleep(2000);
            //    try
            //    {
            //        new SFC.Controllers.Api.FmgController().GetFmgAllCctvStation();
            //    }
            //    /*
            //     * 偶有以下問題
            //     * 會有來源陣列不夠長。請檢查 srcIndex 與長度，以及陣列的下限。
            //     * */
            //    catch
            //    {
            //        System.Threading.Thread.Sleep(2000);
            //        try
            //        {
            //            new SFC.Controllers.Api.FmgController().GetFmgAllCctvStation();
            //        }
            //        catch
            //        {

            //        }
            //    }
            //}
            //).Start();

            //背景
            try
            {
                var task = new BkTask();
                task.Run();
            }
            catch (Exception ex)
            {
                try
                {
                    var task = new BkTask();
                    task.Run();
                }
                catch (Exception exx)
                {
                    Logger.Log.For(this).Error("BkTask 錯誤:" + exx.Message);
                }
            }
        }
    }
}
