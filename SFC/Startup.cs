using Microsoft.Owin;
using Owin;
using SFC;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Web.Mvc;

[assembly: OwinStartup(typeof(SFC.Startup))]

namespace SFC
{
    public class Startup
    {
        internal static AppSet AppSet { get; set; }
        public void Configuration(IAppBuilder app)
        {
            // 如需如何設定應用程式的詳細資訊，請瀏覽 https://go.microsoft.com/fwlink/?LinkID=316888

            AppSet = DouHelper.Misc.DeSerializeObjectLoadJsonFile<AppSet>(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Config"), "AppSet.json"));

            bool isDebug = true;
            // 如需如何設定應用程式的詳細資訊，請瀏覽 https://go.microsoft.com/fwlink/?LinkID=316888
            Dou.Context.Init(new Dou.DouConfig
            {
                //SystemManagerDBConnectionName = "DouModelContextExt",
                DefaultPassword = "1234@1qaz#EDC", //"1234@1qaz#EDC",
                SessionTimeOut = 20,
                SqlDebugLog = isDebug,
                AllowAnonymous = false,
                LoginPage = new UrlHelper(System.Web.HttpContext.Current.Request.RequestContext).Action("DouLogin", "User", new { }),
                LoggerListen = (log) =>
                {
                    if (log.WorkItem == Dou.Misc.DouErrorHandler.ERROR_HANDLE_WORK_ITEM)
                    {
                        Debug.WriteLine("DouErrorHandler發出的錯誤!!\n" + log.LogContent);
                        Logger.Log.For(null).Error("DouErrorHandler發出的錯誤!!\n" + log.LogContent);
                    }
                }
            });

            

            // DbContext 的類別所產生單一物件，不能夠使用於多執行緒環境下
            // 所以在非有登入下(superdou)一次載入多元件可能會有同時create DbContext問題
            // 以下在第一次啟動時先create DbContext，避免多執行緒同時create DbContext
            //using (var cxt = WWF.Controllers.Api.Data.DataController.DbContext)
            //{
            //    cxt.GlobalPeriod.Find(DateTime.Now.Year);
            //}
        }
    }
}
