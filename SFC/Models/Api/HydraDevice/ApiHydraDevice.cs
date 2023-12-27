using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Models.Api.HydraDevice
{

    /*
     對應之前提供API格式
     */
    public class ApiHydraDevice
    {
        public string Id { get; set; } //感測器ID
        public string StationId { get; set; }//測站ID
        public string Name { get; set; } //感測器名稱
        public string Type { get; set; } //感測器類型
        public bool Enable { get; set; } //是否開啟

        public List<ApiHydraDeviceValue> Values { get; set; } // 即時/歷史資料

        public ApiHydraDevice() { }
        public ApiHydraDevice(ApiHydraDevice device)
        {
            this.Id = device.Id;
            this.StationId = device.StationId;
            this.Name = device.Name;
            this.Type = device.Type;
            this.Enable = device.Enable;
            this.Values = device.Values;
        }
    }
}