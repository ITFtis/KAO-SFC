using Antlr.Runtime.Misc;
using Dou.Controllers;
using Dou.Misc.Attr;
using Dou.Models.DB;
using Newtonsoft.Json;
using SFC.Controllers.Api;
using SFC.Controllers.Device;
using SFC.Models;
using SFC.Models.Deivce;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Xml.Linq;

namespace SFC.Controllers
{

    /*
    資料庫操作
     */
    [MenuDef(Id = "DB_DeviceBase", Name = "下水道設備基本資訊", MenuPath = "資料庫維護", Index = 2, Action = "Index", AllowAnonymous = false, Func = FuncEnum.ALL)]
    public class DB_DeviceBaseController : Dou.Controllers.AGenericModelController<DeviceBase>
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

        protected override void AddDBObject(IModelEntity<DeviceBase> dbEntity, IEnumerable<DeviceBase> objs)
        {
            base.AddDBObject(dbEntity, objs);
            clearCache();
        }

        protected override void DeleteDBObject(IModelEntity<DeviceBase> dbEntity, IEnumerable<DeviceBase> objs)
        {
            base.DeleteDBObject(dbEntity, objs);
            clearCache();
        }

        protected override IModelEntity<DeviceBase> GetModelEntity()
        {
            return new ModelEntity<DeviceBase>(Api.DataController.DbContext);
        }

        protected override void UpdateDBObject(IModelEntity<DeviceBase> dbEntity, IEnumerable<DeviceBase> objs)
        {
            base.UpdateDBObject(dbEntity, objs);
            clearCache();
        }

        private void clearCache()
        {
            // 基本資料表
            string stationCacheKey = "Api/StationDevice/GetStations";
            DouHelper.Misc.ClearCache(stationCacheKey);

            String stationKey = "~AllBaseStation~";
            DouHelper.Misc.ClearCache(stationKey);


            // 即時資料
            string realTimeCacheKey = "~api/StationDevice/GetRealTime";
            DouHelper.Misc.ClearCache(realTimeCacheKey);

            //圖台
            DouHelper.Misc.ClearCache(DataController.SewerRtCacheKey);
        }

    }
}