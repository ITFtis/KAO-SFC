using Dou.Controllers;
using Dou.Misc.Attr;
using Dou.Models.DB;
using SFC.Models;
using SFC.Models.Deivce;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SFC.Controllers
{

    /*
     設備妥善率日報
     */
    //[MenuDef(Id = "MonthReliable", Name = "下水道水位站月妥善率查詢", MenuPath = "設備妥善率查詢", Index = 5, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class DeviceReliableMonthController : Dou.Controllers.AGenericModelController<DeviceMonthlyReliable>
    {
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }
        protected override IModelEntity<DeviceMonthlyReliable> GetModelEntity()
        {
            throw new NotImplementedException();
        }

        // API用
        public IEnumerable<DeviceMonthlyReliable> GetRawData(string manufactureID, int year, int month)
        {
            // 資料庫項目
            var db = Api.DataController.DbContext;

            var selectedStations = from device in db.DeviceBases
                                   join station in db.StationBases
                                   on device.stt_no equals station.stt_no
                                   select new
                                   {
                                       station = station,
                                       device = device
                                   };
            if (manufactureID != "all")
                selectedStations = selectedStations.Where(e => e.device.manufacturer == manufactureID);
            var stations = selectedStations.ToList();


            //// 確認該月份是否有資料
            var monthReliables = db.DeviceReliables.Where(reliable => selectedStations.Where(station => station.device.dev_id == reliable.dev_id).Any()
                && reliable.Month == month
                && reliable.Year == year
            ).ToList();
            if (monthReliables.Count == 0)
                return
                     new List<DeviceMonthlyReliable>()
                     {
                            new DeviceMonthlyReliable
                            {
                                stt_name = "查無該月份資料"
                            }
                    };


            //// 最後輸出的list
            List<DeviceMonthlyReliable> outList = new List<DeviceMonthlyReliable>();
            foreach (var reliables in monthReliables.GroupBy(e => e.dev_id))
            {
                var station = stations.Where(e => e.device.dev_id == reliables.Key).FirstOrDefault();
                if (reliables.Count() > 0 && station != null)
                {
                    outList.Add(new DeviceMonthlyReliable
                    {
                        stt_name = station.station.stt_name,
                        deviceID = station.device.dev_id,
                        county_code = station.station.county_code,
                        Month = month,
                        monthReliable = (reliables.Sum(e => e.ReliableRate) / reliables.Count()).ToString("P", CultureInfo.InvariantCulture),
                        monthUpdateRate = (reliables.Sum(e => e.UpdateRate) / reliables.Count()).ToString("P", CultureInfo.InvariantCulture),
                        monthRealTimeRate = (reliables.Sum(e => e.RealTimeRate) / reliables.Count()).ToString("P", CultureInfo.InvariantCulture),
                    });
                }
            }
            return outList;
        }

        // DOU 用
        public override async Task<ActionResult> GetData(params KeyValueParams[] paras)
        {
            // 無搜尋條件
            var filters = paras.FirstOrDefault(s => s.key == "filter");
            if (filters == null)
                return Json(new
                {
                    success = true,
                    data = getEmptyValue()
                }, JsonRequestBehavior.AllowGet);

            // 下搜尋條件
            KeyValueParams[] kvs = Newtonsoft.Json.JsonConvert.DeserializeObject<KeyValueParams[]>(filters.value + "");

            // 廠商
            var selectedManufacture = kvs.FirstOrDefault(e => e.key == "manufacturer");
            if (selectedManufacture == null || selectedManufacture.value.ToString().Trim().Length == 0)
                return Json(new
                {
                    success = true,
                    data = this.getEmptyValue()
                }, JsonRequestBehavior.AllowGet);


            // 年月
            var selectedMonth = kvs.FirstOrDefault(e => e.key == "Month");
            var selectedYear = kvs.FirstOrDefault(e => e.key == "Year");
            if (selectedMonth == null || selectedMonth.value.ToString().Trim().Length == 0
            && selectedYear == null || selectedYear.value.ToString().Trim().Length == 0)
                return Json(new
                {
                    success = true,
                    data =
                        new List<DeviceMonthlyReliable>()
                        {
                            new DeviceMonthlyReliable
                            {
                                stt_name = "請輸入查詢年月份"
                            }
                        }
                }, JsonRequestBehavior.AllowGet);


            // 最後回傳
            string manufacture = selectedManufacture.value.ToString().Trim();
            manufacture = manufacture == "shinTran" ? "昕傳科技"
                        : manufacture == "KaiTrun" ? "開創水資源"
                        : manufacture == "Procal" ? "勝邦科技"
                        : "all";

            return Json(new
            {
                success = true,
                data = this.GetRawData(manufacture,
                                        Convert.ToInt32(selectedYear.value.ToString()),
                                        Convert.ToInt32(selectedMonth.value.ToString()))
            }, JsonRequestBehavior.AllowGet);
        }

        private List<DeviceMonthlyReliable> getEmptyValue()
        {
            return
                 new List<DeviceMonthlyReliable>()
                 {
                    new DeviceMonthlyReliable
                    {
                        stt_name = "請輸入查詢廠商"
                    }
                 };
        }

        private class DeviceMapping
        {
            public string deviceID { get; set; }
            public DeviceReliable reliables { get; set; }
        }
    }
}