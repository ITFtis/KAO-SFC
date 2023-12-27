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
     �]�ƪ��A����
     */

    [Table("Hydra_station_base")]
    public class HydraStationBase
    {
        [ColumnDef(Visible = true, Display = "���W", Index = 1)]
        public string stn_name { get; set; } //���W

        [Key]
        [ColumnDef(Visible = true, Display = "���X", Index = 2)]
        public string stn_id { get; set; } //���X

        [ColumnDef(Visible = true, Display = "������������", Index = 3)]
        public string stn_type { get; set; } //������������

        [ColumnDef(Visible = true, Display = "���X�n��", Index = 4)]
        public double Lat { get; set; } //�n��

        [ColumnDef(Visible = true, Display = "�g��", Index = 5)]
        public double Lon { get; set; } //�g��

        [ColumnDef(Visible = true, Display = "�����m��ID", Index = 6)]
        public string town { get; set; } //�����m��ID

        [ColumnDef(Visible = true, Display = "�O�_�ҥ�", Index = 7)]
        public bool enable { get; set; }
    }
}