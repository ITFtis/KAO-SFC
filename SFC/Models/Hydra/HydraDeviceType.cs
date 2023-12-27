using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SFC.Models.Hydra
{
    [Table("Hydra_device_type")]
    public class HydraDeviceType : TypeBase
    {
        [Key]
        public override string TypeID { get; set; }
    }
}