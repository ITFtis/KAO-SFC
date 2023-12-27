using SFC.Controllers.Api.HydraDevice.function;
using SFC.Models.Api.HydraDevice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace SFC.Controllers.Api.HydraDevice
{

    /*
        設管科資料供應API
     */
    [RoutePrefix("api/HydroDevice")]
    public class HydraDeviceController : ApiController
    {
        /// <summary>
        /// 取得所有測站資訊
        /// </summary>
        /// <returns></returns>
        [Route("Stations")]
        public IEnumerable<ApiHydraStation> GetStations()
        {
            return HydraStation.GetStations();
        }

        /// <summary>
        /// 取得單一測站基本資訊
        /// </summary>
        /// <param name="stt_no">測站名稱</param>
        /// <returns></returns>
        [Route(@"Station/{stt_no}")]
        public ApiHydraStation GetStations(string stt_no)
        {
            return HydraStation.GetStaiton(stt_no);
        }

        /// <summary>
        /// 取得所有感測器資訊
        /// </summary>
        /// <returns></returns>
        [Route("Devices")]
        public IEnumerable<ApiHydraDevice> GetDevices()
        {
            return HydraStation.GetDevices();
        }

        /// <summary>
        /// 取得單一測站基本資訊
        /// </summary>
        /// <param name="stt_no">測站名稱</param>
        /// <returns></returns>
        [Route(@"Devices/{stt_no}")]
        public IEnumerable<ApiHydraDevice> GetDevice(string stt_no)
        {
            return HydraStation.GetDevices(stt_no);
        }

        /// <summary>
        /// 取得測站即時資料
        /// </summary>
        /// <returns></returns>
        [Route("RealTime")]
        public IEnumerable<ApiHydraStation> GetRealTime()
        {
            var deviceRealTimes = HydraDatas.GetDeviceRealTime();
            return GetStations().Select(e => new ApiHydraStation(e)).ToList().Select(station =>
            {
                station.MechanicalInfos = deviceRealTimes.Where(e => e.StationId == station.Id).ToList();
                return station;
            });
        }

        /// <summary>
        /// 取得測站歷史資料
        /// </summary>
        /// <param name="stationId">測站ID</param>
        /// <param name="deviceId">感測器ID</param>
        /// <param name="start">搜尋起始時間(yyyy/MM/dd HH:mm)</param>
        /// <param name="end">搜尋結束時間(yyyy/MM/dd HH:mm)</param>
        /// <returns></returns>
        [Route(@"history/{id}/{start:datetime}/{end:datetime}")]
        public IEnumerable<ApiHydraDeviceValue> GetHistorical(string id, DateTime start, DateTime end)
        {
            return HydraDatas.GetHistorical(id, start, end);
        }

    }
}