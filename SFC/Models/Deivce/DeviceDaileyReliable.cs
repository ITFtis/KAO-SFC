using Dou.Misc.Attr;
using SFC.Controllers.Api;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Http.Description;

namespace SFC.Models.Deivce
{
    public class DeviceDaileyReliable : DouDeviceReliableBase
    {
        [ColumnDef(Visible = false, Display = "測站代號", Index = 1)]
        public override string stt_no { get; set; }//測站代號

        [ColumnDef(Visible = true, Display = "資料日期", Index = 13)]
        public int Day { get; set; }

        [ColumnDef(Visible = true, Display = "日妥善率", Index = 20)]
        public string dailyReliable { get; set; }

        [ColumnDef(Visible = true, Display = "日上傳率", Index = 21)]
        public string dailyUpdateRate { get; set; }

        [ColumnDef(Visible = true, Display = "日即時率", Index = 22)]
        public string dailyRealTimeRate { get; set; }
    }
}