using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Models.Api.HydraDevice
{
    public class ApiHydraStation
    {
        public string Id { get; set; }//設備ID
        public string Name { get; set; } //設備名稱
        public double? Lat { get; set; } //經度
        public double? Lon { get; set; } //緯度
        public string Desc { get; set; } //備註

        public List<ApiHydraDevice> MechanicalInfos { get; set; } //Device清單

        public ApiHydraStation() { }
        public ApiHydraStation(ApiHydraStation station)
        {
            this.Id = station.Id;
            this.Name = station.Name;
            this.Lat = station.Lat;
            this.Lon = station.Lon;
            this.Desc = station.Desc;
            this.MechanicalInfos = station.MechanicalInfos;

        }

    }
}