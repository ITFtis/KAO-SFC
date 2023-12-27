using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace SFC.Models
{
    [Table("User")]
    public partial class User : Dou.Models.UserBase {

        [Display(Name = "使用者名稱", Order =2)]
        [Column(Order = 2)]
        [Required]
        [StringLength(50)]
        public override string Name { get; set; }

        [ColumnDef( Display ="單位名稱")]
        public string Unit { set; get; }
        [ColumnDef(Display = "EMail")]
        public string EMail { set; get; }
        [ColumnDef(Display = "連絡電話")]
        public string Tel { set; get; }
        [ColumnDef(Display = "地址")]
        public string Address { set; get; }
    }
}