using SFC.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Controllers.Api.StationDevice.funtion
{
    public class ApiDeviceData
    {
        static object GetRealTimesLock = new object();
        internal static IEnumerable<DeviceLora> GetRealTime()
        {
            string key = "~api/StationDevice/GetRealTime";
            lock (GetRealTimesLock)
            {
                var realTime = DouHelper.Misc.GetCache<IEnumerable<DeviceLora>>(3 * 60000, key);
                if (realTime != null)
                    return realTime;
            
                var db = Api.DataController.DbContext;
                var realTimes = db.DeviceBases.Select(device =>
                       db.DeviceLoras.Where(lora => lora.dev_id == device.dev_id)
                       .OrderByDescending(lora => lora.datatime).FirstOrDefault()
                ).Where(e => e != null).ToList();

                realTimes.ForEach(e => e.val = e.deviceBase.abs_elev + e.val);

                DouHelper.Misc.AddCache(realTimes, key);
                return realTimes;
            }
        }
    }
}