using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;

namespace SFC.Models
{
    [Table("device_reliable")]
    public class DeviceReliable
    {
        [Key]
        [Column(Order = 0)]
        public string dev_id { get; set; }
        [Key]
        [Column(Order = 1)]
        public int Year { get; set; }
        [Key]
        [Column(Order = 2)]
        public int Month { get; set; }
        [Key]
        [Column(Order = 3)]
        public int Day { get; set; }
        public double ReliableRate { get; set; }//妥善率
        public double UpdateRate { get; set; }//上傳率
        public double RealTimeRate { get; set; }//即時率
    }
}