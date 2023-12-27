using Antlr.Runtime.Misc;
using Dou.Controllers;
using Dou.Misc.Attr;
using Dou.Models.DB;
using Newtonsoft.Json;
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
    [MenuDef(Id = "DB_HydraStationBase", Name = "設管課測站基本資訊", MenuPath = "資料庫維護", Index = 3, Action = "Index", AllowAnonymous = false, Func = FuncEnum.ALL)]
    public class DB_HydraStationBaseController : Dou.Controllers.AGenericModelController<HydraStationBase>
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

        protected override IModelEntity<HydraStationBase> GetModelEntity()
        {
            return new ModelEntity<HydraStationBase>(Api.DataController.DbContext);
        }

        protected override void AddDBObject(IModelEntity<HydraStationBase> dbEntity, IEnumerable<HydraStationBase> objs)
        {
            base.AddDBObject(dbEntity, objs);
            this.clearCache();
        }

        protected override void DeleteDBObject(IModelEntity<HydraStationBase> dbEntity, IEnumerable<HydraStationBase> objs)
        {
            base.DeleteDBObject(dbEntity, objs);
            this.clearCache();
        }

        protected override void UpdateDBObject(IModelEntity<HydraStationBase> dbEntity, IEnumerable<HydraStationBase> objs)
        {
            base.UpdateDBObject(dbEntity, objs);
            this.clearCache();
        }

        private void clearCache()
        {
            String getDeviceKey = "Api/HydroDevice/GetDevices";
            DouHelper.Misc.ClearCache(getDeviceKey);

            String getStationKey = "Api/HydroDevice/GetStations";
            DouHelper.Misc.ClearCache(getStationKey);

            String getRealTimeKey = "Api/HydroDevice/GetRealTimes";
            DouHelper.Misc.ClearCache(getRealTimeKey);
        }
    }
}