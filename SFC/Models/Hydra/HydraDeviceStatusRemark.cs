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

    [Table("Hydra_device_statusRemark")]
    public class HydraDeviceStatusRemark
    {
        [Key]
        public string deviceTypeID { get; set; } //感測器類型ID
        public string deviceTypeName { get; set; } //感測器類型名稱
        public string statusTrue { get; set; } //狀態開啟說明
        public string statusFalse { get; set; } //狀態關閉說明
        public string remark { get; set; } //錯誤時顯示內容
    }
}