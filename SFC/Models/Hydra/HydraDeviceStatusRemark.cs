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
     �]�ƪ��A����
     */

    [Table("Hydra_device_statusRemark")]
    public class HydraDeviceStatusRemark
    {
        [Key]
        public string deviceTypeID { get; set; } //�P��������ID
        public string deviceTypeName { get; set; } //�P���������W��
        public string statusTrue { get; set; } //���A�}�һ���
        public string statusFalse { get; set; } //���A��������
        public string remark { get; set; } //���~����ܤ��e
    }
}