using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;
using static log4net.Appender.RollingFileAppender;

namespace SFC.Models
{

    /*
     設備狀態說明
     */

    [Table("Hydra_station_base")]
    public class HydraStationBase
    {
        [ColumnDef(Visible = true, Display = "站名", Index = 1)]
        public string stn_name { get; set; } //站名

        [Key]
        [ColumnDef(Visible = true, Display = "站碼", Index = 2)]
        public string stn_id { get; set; } //站碼

        [ColumnDef(Visible = true, Display = "對應測站類型", Index = 3)]
        public string stn_type { get; set; } //對應測站類型

        [ColumnDef(Visible = true, Display = "站碼緯度", Index = 4)]
        public double Lat { get; set; } //緯度

        [ColumnDef(Visible = true, Display = "經度", Index = 5)]
        public double Lon { get; set; } //經度

        [ColumnDef(Visible = true, Display = "對應鄉鎮ID", Index = 6)]
        public string town { get; set; } //對應鄉鎮ID

        [ColumnDef(Visible = true, Display = "是否啟用", Index = 7)]
        public bool enable { get; set; }
    }
}