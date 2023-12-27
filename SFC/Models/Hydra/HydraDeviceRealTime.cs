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
        public string device_id { get; set; } //�P����ID

        [Key]
        [Column(Order = 0)]
        public DateTime datatime { get; set; } //��Ʈɶ�
        public double? value { get; set; } //����/�~��/���x�v
        public bool? device_status { get; set; } //�]�ƪ��A(������B�h���B�����B�a�U�D)�A�i�Ѧ�Hydra_device_status

    }
}