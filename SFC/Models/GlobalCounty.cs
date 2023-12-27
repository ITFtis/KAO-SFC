using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;

namespace SFC.Models
{
    [Table("Global_County")]
    public class GlobalCounty
    {
        [Key]
        [StringLength(50)]
        public string Id { get; set; }

        [StringLength(50)]
        public string CityName { get; set; }

        [StringLength(50)]
        public string CountyName { get; set; }
    }
}