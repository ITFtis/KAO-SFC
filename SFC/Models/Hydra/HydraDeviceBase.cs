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
        [ColumnDef(Visible = true, Display = "�]��ID", Index = 1)]
        public string stn_id { get; set; } //�]��ID

        [ColumnDef(Visible = true, Display = "�P��������", Index = 2)]
        public string device_type { get; set; } // �P���������A������ Hydra_device_type

        [Key]
        [Column(Order = 1)]
        [ColumnDef(Visible = true, Display = "�P����ID", Index = 4)]
        public string device_id { get; set; } // �P����ID

        [ColumnDef(Visible = true, Display = "�P�����W��", Index = 5)]
        public string device_name { get; set; } // �P�����W��

        [AllowHtml]
        [ColumnDef(Visible = true, Display = "�}����ܦW��", Index = 6)]
        public string status_true { get; set; } // �P����

        [AllowHtml]
        [ColumnDef(Visible = true, Display = "������ܦW��", Index = 7)]
        public string status_false { get; set; } // �P�����W��

        [ColumnDef(Visible = true, Display = "�O�_�ҥ�", Index = 8)]
        public bool enable { get; set; }
    }
}