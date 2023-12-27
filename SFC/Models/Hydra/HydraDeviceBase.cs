using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace SFC.Models
{
    [Table("Hydra_device_base")]
    public class HydraDeviceBase
    {
        [Key]
        [Column(Order = 0)]
        [ColumnDef(Visible = true, Display = "設備ID", Index = 1)]
        public string stn_id { get; set; } //設備ID

        [ColumnDef(Visible = true, Display = "感測器類型", Index = 2)]
        public string device_type { get; set; } // 感測器類型，對應到 Hydra_device_type

        [Key]
        [Column(Order = 1)]
        [ColumnDef(Visible = true, Display = "感測器ID", Index = 4)]
        public string device_id { get; set; } // 感測器ID

        [ColumnDef(Visible = true, Display = "感測器名稱", Index = 5)]
        public string device_name { get; set; } // 感測器名稱

        [AllowHtml]
        [ColumnDef(Visible = true, Display = "開啟顯示名稱", Index = 6)]
        public string status_true { get; set; } // 感測器

        [AllowHtml]
        [ColumnDef(Visible = true, Display = "關閉顯示名稱", Index = 7)]
        public string status_false { get; set; } // 感測器名稱

        [ColumnDef(Visible = true, Display = "是否啟用", Index = 8)]
        public bool enable { get; set; }
    }
}