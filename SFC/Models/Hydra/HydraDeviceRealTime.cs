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
    [Table("Hydra_device_realTime")]
    public class HydraDeviceRealTime
    {
        [Key]
        [Column(Order = 1)]
        public string device_id { get; set; } //感測器ID

        [Key]
        [Column(Order = 0)]
        public DateTime datatime { get; set; } //資料時間
        public double? value { get; set; } //內水/外水/滯洪率
        public bool? device_status { get; set; } //設備狀態(抽水機、閘門、橡皮壩、地下道)，可參考Hydra_device_status

    }
}