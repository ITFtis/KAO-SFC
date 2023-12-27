using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Models.Api.HydraDevice
{
    public class ApiHydraDeviceValue
    {
        public string deviceId { get; set; } //設備ID
        public DateTime Time { get; set; } //資料時間
        public double? Value { get; set; } //資料內容(水位)
        public string Display { get; set; } //顯示內容，每個測站不一樣 
    }
}