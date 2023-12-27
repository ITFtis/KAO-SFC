using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SFC.Models.Hydra
{
    [Table("Hydra_station_type")]
    public class HydraStationType : TypeBase
    {
        [Key]
        public override string TypeID { get; set; }
    }

    public class TypeBase
    {
        [ColumnDef(Visible = true, Display = "類型ID", Index = 1)]
        public virtual string TypeID { get; set; } //類型ID


        [ColumnDef(Visible = true, Display = "顯示名稱", Index = 2)]
        public string TypeName { get; set; }//顯示名稱

        [ColumnDef(Visible = true, Display = "單位", Index = 3)]
        public string Unit { get; set; } //單位
    }
}