using Antlr.Runtime.Misc;
using Dou.Controllers;
using Dou.Misc.Attr;
using Dou.Models.DB;
using Newtonsoft.Json;
using SFC.Controllers.Api;
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
    [MenuDef(Id = "DB_StationBase", Name = "下水道測站基本資訊", MenuPath = "資料庫維護", Index = 1, Action = "Index", AllowAnonymous = false, Func = FuncEnum.ALL)]
    public class DB_StationBaseController : Dou.Controllers.AGenericModelController<StationBase>
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }
        protected override IModelEntity<StationBase> GetModelEntity()
        {
            return new ModelEntity<StationBase>(Api.DataController.DbContext);
        }

        protected override void AddDBObject(IModelEntity<StationBase> dbEntity, IEnumerable<StationBase> objs)
        {
            base.AddDBObject(dbEntity, objs);
            clearCache();
        }

        protected override void DeleteDBObject(IModelEntity<StationBase> dbEntity, IEnumerable<StationBase> objs)
        {
            base.DeleteDBObject(dbEntity, objs);
            clearCache();
        }

        protected override void UpdateDBObject(IModelEntity<StationBase> dbEntity, IEnumerable<StationBase> objs)
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

            String manufacturekey = "~AllManufacture";
            DouHelper.Misc.ClearCache(manufacturekey);

            // 即時資料
            string realTimeCacheKey = "~api/StationDevice/GetRealTime";
            DouHelper.Misc.ClearCache(realTimeCacheKey);

            //圖台
            DouHelper.Misc.ClearCache(DataController.SewerRtCacheKey);
        }

    }
}