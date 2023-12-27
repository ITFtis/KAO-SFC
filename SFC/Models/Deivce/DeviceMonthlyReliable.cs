using Dou.Misc.Attr;
using SFC.Controllers.Api;
using SFC.Controllers.Device;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SFC.Models.Deivce
{
    public class DeviceMonthlyReliable : DouDeviceReliableBase
    {
        [ColumnDef(Visible = false, Display = "測站代號", Index = 1)]
        public override string stt_no { get; set; }//測站代號

        [ColumnDef(Visible = true, Display = "測站名稱", Index = 0, Filter = false)]
        public override string stt_name { get; set; }//測站名稱


        [ColumnDef(Visible = false, Display = "鄉鎮市區", Index = 10, Filter = false)]
        public override string CountyName
        {
            get
            {
                var selectedCounty = DataController.GetCounty(this.county_code);
                return selectedCounty == null ? "-" : selectedCounty.CountyName;
            }
        }


        [ColumnDef(Visible = true, Display = "月妥善率", Index = 21)]
        public string monthReliable { get; set; }

        [ColumnDef(Visible = true, Display = "月上傳率", Index = 22)]
        public string monthUpdateRate { get; set; }

        [ColumnDef(Visible = true, Display = "月即時率", Index = 23)]
        public string monthRealTimeRate { get; set; }
    }
}