using Dou.Misc.Attr;
using SFC.Controllers.Api;
using SFC.Controllers.Device;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web.Mvc;
namespace SFC.Models.Deivce
{
    public class DouDeviceReliableBase : StationBaseModel
    {
        [ColumnDef(Visible = true, Display = "測站名稱", Index = 0, Filter = true, EditType = EditType.Select,
            SelectItemsClassNamespace = DeviceFilter_ComplesStations.complexKey, FilterAssign = FilterAssignType.Equal)]
        public override string stt_name { get; set; }//測站名稱


        [ColumnDef(Visible = true, Display = "設備代號", Index = 1)]
        public string deviceID { get; set; }//設備代號

        [ColumnDef(Visible = false, Display = "都市計畫區", Index = 3)]
        public override string urban_plan { get; set; } //都市計畫區

        [ColumnDef(Visible = false, Display = "管理單位", Index = 4)]
        public override string manager { get; set; }//管理單位


        [ColumnDef(Display = "廠商", EditType = EditType.Select, SelectItemsClassNamespace = DeviceFilter_Manufactures.cacheKey
            , Filter = true, FilterAssign = FilterAssignType.Equal, Visible = false)]
        public string manufacturer { get; set; }


        [ColumnDef(Visible = false, Display = "鄉鎮市區", Index = 10, Filter = true, SelectItemsClassNamespace = DeviceFilter_County.cacheKey
            , FilterAssign = FilterAssignType.Equal , EditType =EditType.Select)]
        public virtual string CountyName
        {
            get
            {
                var selectedCounty = DataController.GetCounty(this.county_code);
                return selectedCounty == null ? "-" : selectedCounty.CountyName;
            }
        }

        [ColumnDef(Visible = false, Display = "資料月份", Index = 12, Filter = true, EditType = EditType.Select, SelectItems =
            "{\"1\":\"1\",\"2\":\"2\" , \"3\":\"3\", \"4\":\"4\" , \"5\":\"5\",\"6\":\"6\",\"7\":\"7\",\"8\":\"8\" , \"9\":\"9\", \"10\":\"10\" , \"11\":\"11\",\"12\":\"12\"}")]
        public int Month { get; set; }

        [ColumnDef(Visible = false, Display = "年份", Index = 12, SelectItemsClassNamespace = DeviceFilter_Year.cacheKey
            , Filter = true, EditType = EditType.Select, FilterAssign = FilterAssignType.Equal)]
        public int Year { get; set; }
    }
}