using SFC.Controllers.Api;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;

namespace SFC.Models
{
    [Table("device_lora")]
    public class DeviceLora
    {

        /// <summary>
        /// 設備ID
        /// </summary>
        [Key]
        [Column(Order = 0)]
        [StringLength(100)]
        public string dev_id { get; set; }

        /// <summary>
        /// 資料時間
        /// </summary>
        [Key]
        [Column(Order = 1)]
        public DateTime datatime { get; set; }

        /// <summary>
        /// 水位，需要再加上測站的底高才是真實水位高程
        /// </summary>
        public double val { get; set; }

        /// <summary>
        /// 測站資訊
        /// </summary>
        [NotMapped]
        public DeviceBase deviceBase
        {
            get
            {
                return DataController.GetDeviceBase(this.dev_id);
            }
        }

        /// <summary>
        /// 電壓
        /// </summary>
        public double voltage { get; set; }

        /// <summary>
        /// RSSI
        /// </summary>
        public double rssi { get; set; }

        /// <summary>
        /// 人孔開關
        /// </summary>
        public decimal mhole { get; set; }

        /// <summary>
        /// 上傳模式
        /// </summary>
        public decimal uptype { get; set; }

        /// <summary>
        /// 資料匯入時間
        /// </summary>
        public DateTime inserttime { get; set; }

    }
}