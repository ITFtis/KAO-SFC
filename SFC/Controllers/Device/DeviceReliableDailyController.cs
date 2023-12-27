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
     設備妥善率日報
     */
    //[MenuDef(Id = "DailyReliable", Name = "下水道水位站日妥善率查詢", MenuPath = "設備妥善率查詢", Index = 5, Action = "Index", AllowAnonymous = false, Func = FuncEnum.None)]
    public class DeviceReliableDailyController : Dou.Controllers.AGenericModelController<DeviceDaileyReliable>
    {
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }
        protected override IModelEntity<DeviceDaileyReliable> GetModelEntity()
        {
            throw new NotImplementedException();
        }

        // API用
        public IEnumerable<DeviceDaileyReliable> GetRawData(string stationID, int year, int month)
        {
            // 資料庫項目
            var db = Api.DataController.DbContext;

            // 下搜尋條件
            var selectedStation = db.StationBases.Where(e => e.stt_no == stationID).FirstOrDefault();
            if (selectedStation == null)
                return getEmptyValue();


            // 計算妥善率
            var selectedReliables = db.DeviceReliables.Where(e => true);
            selectedReliables = from reliables in db.DeviceReliables // 查詢妥善率Table
                                join device in db.DeviceBases // 對應到Device table
                                    on reliables.dev_id equals device.dev_id
                                where
                                reliables.Month == month// 確認月份
                                && reliables.Year == year //確認年分
                                && device.stt_no == stationID // 確認station相同
                                select reliables;

            // 確認該月份是否有資料
            var monthReliables = selectedReliables.ToList();
            if (monthReliables.Count == 0)
                return
                     new List<DeviceDaileyReliable>()
                     {
                            new DeviceDaileyReliable
                            {
                                stt_name = "測站查無該月份資料"
                            }
                     };


            // 最後輸出的list
            List<DeviceDaileyReliable> outList = new List<DeviceDaileyReliable>();
            var deviceIds = monthReliables.Select(e => e.dev_id).Distinct().ToList();
            foreach (var deviceId in deviceIds)
            {
                var datas = monthReliables.Where(e => e.dev_id == deviceId).OrderBy(e => e.Day).ToList();
                foreach (var data in datas)
                {
                    outList.Add(new DeviceDaileyReliable
                    {
                        stt_name = selectedStation.stt_name,
                        deviceID = deviceId,
                        county_code = selectedStation.county_code,
                        Day = data.Day,
                        Month = data.Month,
                        dailyReliable = data.ReliableRate.ToString("P", CultureInfo.InvariantCulture),
                        dailyUpdateRate = data.UpdateRate.ToString("P", CultureInfo.InvariantCulture),
                        dailyRealTimeRate = data.RealTimeRate.ToString("P", CultureInfo.InvariantCulture),
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

            // 測站
            var selectedStationName = kvs.FirstOrDefault(e => e.key == "stt_name");
            if (selectedStationName == null || selectedStationName.value.ToString().Trim().Length == 0)
                return Json(new
                {
                    success = true,
                    data =
                     new List<DeviceDaileyReliable>()
                     {
                            new DeviceDaileyReliable
                            {
                                stt_name = "請輸入查詢測站"
                            }
                     }
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
                    new List<DeviceDaileyReliable>()
                    {
                        new DeviceDaileyReliable
                        {
                            stt_name = "請輸入查詢年月份"
                        }
                   }
                }, JsonRequestBehavior.AllowGet);


            // 最後回傳
            return Json(new
            {
                success = true,
                data = this.GetRawData(selectedStationName.value.ToString().Trim(), 
                                        Convert.ToInt32(selectedYear.value.ToString()), 
                                        Convert.ToInt32(selectedMonth.value.ToString()))
            }, JsonRequestBehavior.AllowGet);
        }

        private List<DeviceDaileyReliable> getEmptyValue()
        {
            return
                 new List<DeviceDaileyReliable>()
                 {
                    new DeviceDaileyReliable
                    {
                        stt_name = "請輸入查詢測站"
                    }
                 };
        }
    }
}