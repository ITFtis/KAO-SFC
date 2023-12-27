using Microsoft.Ajax.Utilities;
using RestSharp;
using SFC.Controllers.Api.StationDevice.funtion;
using SFC.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Services.Description;

namespace SFC.Controllers.Api.StationDevice
{

    [RoutePrefix("api/StationDevice")]
    public class StationDeviceController : ApiController
    {
        /// <summary>
        /// 取得所有測站資訊
        /// </summary>
        /// <returns></returns>
        [Route("Stations")]
        public IEnumerable<StationBase> GetStations()
        {
            string key = "Api/StationDevice/GetStations";
            var stations = DouHelper.Misc.GetCache<IEnumerable<StationBase>>(24 * 3600 * 1000, key);
            if (stations != null)
                return stations;

            var db = Api.DataController.DbContext;
            stations = Api.DataController.getAllStations();
            stations.ForEach(station =>
            {
                station.sttDevs = db.DeviceBases.Where(device => device.stt_no == station.stt_no).ToList();
                if (station.sttDevs.Count > 0)
                {
                    station.alarm1 = station.sttDevs[0].emerge1;
                    station.alarm2 = station.sttDevs[0].emerge2;
                }

            });

            DouHelper.Misc.AddCache(stations, key);
            return this.GetStations();
        }

        /// <summary>
        /// 取得單一測站資訊
        /// </summary>
        /// <param name="stt_no">測站名稱</param>
        /// <returns></returns>
        [Route(@"Station/{stt_no}")]
        public StationBase GetStation(string stt_no)
        {
            return this.GetStations().Where(e => e.stt_no == stt_no).FirstOrDefault();
        }

        /// <summary>
        /// 取得即時下水道水位資料
        /// </summary>
        /// <returns></returns>
        [Route("RealTime")]
        public IEnumerable<DeviceLora> GetRealTime()
        {
            return ApiDeviceData.GetRealTime();
        }

        /// <summary>
        /// 取得歷史下水道水位資料
        /// </summary>
        /// <param name="id">下水道測站ID</param>
        /// <param name="start">搜尋起始時間(yyyy/MM/dd HH:mm)</param>
        /// <param name="end">搜尋結束時間(yyyy/MM/dd HH:mm)</param>
        /// <returns></returns>
        [Route(@"history/{id}/{start:datetime}/{end:datetime}")]
        public IEnumerable<DeviceLora> GetHistory(string id, DateTime start, DateTime end)
        {
            var db = Api.DataController.DbContext;
            return db.DeviceLoras.Where(e => e.datatime >= start && e.datatime <= end && e.dev_id == id).ToList().Select(e =>
            {
                e.val = e.deviceBase != null ? e.deviceBase.abs_elev + e.val : e.val;
                return e;
            }).ToList();
        }


        /// <summary>
        /// 上傳營建署，上傳前10分鐘內所有資料
        /// </summary>
        /// <returns></returns>
        [Route("cpami/manualPostData")]
        public async Task<string> PostCpamiData()
        {
            var db = Api.DataController.DbContext;
            var loras =

            // 取得每一個測站的最新更新時間    
            db.DeviceLoras.GroupBy(e => e.dev_id).Select(deviceGroup => new
            {
                device_id = deviceGroup.Key,
                lastestDate = deviceGroup.Max(e => e.datatime),
            })

            // 取得device lora的完整資訊
            .Join(db.DeviceLoras,
                latest => latest,
                lora => new { device_id = lora.dev_id, lastestDate = lora.datatime },
                (latest, lora) => lora

            // 取得device基本資料的完整資訊
            ).Join(db.DeviceBases,
                    lora => lora.dev_id,
                    device => device.dev_id,
                    (lora, device) =>
                    new
                    {
                        device = device,
                        lora = lora
                    }).ToList().Select(e => new
                    {
                        stt_no = e.device.stt_no.ToLower(),
                        dev_id = e.device.dev_id.ToLower(),
                        measure_time = e.lora.datatime.ToString("yyyy-MM-ddTHH:mm:ss"),
                        upload_time = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                        val = e.lora.val + e.device.abs_elev
                    }).ToList();

            string postURL = Startup.AppSet.CpamiPostURL;
            string postKey = Startup.AppSet.CpamiPostKey;

            try
            {

                var client = new RestClient();
                var request = new RestRequest(postURL, Method.Post);
                request.AddHeader("Content-Type", "application/json");
                request.AddHeader("apikey", postKey);

                var body = Newtonsoft.Json.JsonConvert.SerializeObject(loras);
                request.AddStringBody(body, DataFormat.Json);
                RestResponse response = await client.ExecuteAsync(request);
                return Newtonsoft.Json.JsonConvert.SerializeObject(loras);
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }
    }
}