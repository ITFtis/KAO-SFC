using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;

namespace SFC.Models
{
    [Table("station_base")]
    public class StationBase : StationBaseModel
    {
        /// <summary>
        /// 測站名稱
        /// </summary>
        [StringLength(100)]
        [ColumnDef(Visible = true, Display = "測站名稱", Index = 0)]
        public override string stt_name { get; set; }

        /// <summary>
        /// 測站代號
        /// </summary>
        [Key]
        [StringLength(70)]
        [ColumnDef(Visible = true, Display = "測站代號", Index = 1)]
        public override string stt_no { get; set; }

        /// <summary>
        /// 鄉鎮市區
        /// </summary>
        [StringLength(10)]
        [ColumnDef(Visible = false, Display = "鄉鎮市區", Index = 2)]
        public override string county_code { get; set; }

        /// <summary>
        /// 都市計畫區
        /// </summary>
        [StringLength(20)]
        [ColumnDef(VisibleEdit =true , VisibleView =false, Display = "都市計畫區", Index = 3)]
        public override string urban_plan { get; set; }

        /// <summary>
        /// 雨水下水道
        /// </summary>
        [StringLength(20)]
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "雨水下水道", Index = 4)]
        public string pip_num { get; set; }

        /// <summary>
        /// 人孔編號
        /// </summary>
        [StringLength(20)]
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "人孔編號", Index = 5)]
        public string manhole_num { get; set; }

        /// <summary>
        /// 人孔深度(m)
        /// </summary>
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "人孔深度(m)", Index = 6)]
        public double? manhole_depth { get; set; }

        /// <summary>
        /// 人空路面高程
        /// </summary>
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "人空路面高程(m)", Index = 7)]
        public double ground_level { get; set; }

        /// <summary>
        /// 經度
        /// </summary>
        [ColumnDef(Visible = true, Display = "經度", Index = 8)]
        public double lon { get; set; }

        /// <summary>
        /// 緯度
        /// </summary>
        [ColumnDef(Visible = true, Display = "緯度", Index = 9)]
        public double lat { get; set; }

        /// <summary>
        /// 建置日期
        /// </summary>
        [ColumnDef(Visible = true, Display = "人空路面高程(m)", Index = 10)]
        public DateTime deposit_date { get; set; }


        /// <summary>
        /// 管理單位
        /// </summary>
        [StringLength(255)]
        [ColumnDef(Visible = true, Display = "管理單位", Index = 11)]
        public override string manager { get; set; }

        /// <summary>
        /// 地址
        /// </summary>
        [StringLength(255)]
        [ColumnDef(Visible = true, Display = "地址", Index = 12)]
        public string addr { get; set; }

        /// <summary>
        /// 監測站照片位置
        /// </summary>
        [StringLength(255)]
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "監測站照片位置", Index = 13)]
        public string pic_url { get; set; }

        /// <summary>
        /// 測站種類及用途(雨水下水道監測、雨水抽水站監測、雨水調節池監測、氣象觀測、海象觀測、影像監視、其他)
        /// </summary>
        [StringLength(255)]
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "測站種類及用途", Index = 14, EditType = EditType.Select,
            SelectItems = "{\"雨水下水道監測\":\"雨水下水道監測\",\"雨水抽水站監測\":\"雨水抽水站監測\" , \"雨水調節池監測\":\"雨水調節池監測\", \"氣象觀測\":\"氣象觀測\" , \"海象觀測\":\"海象觀測\" , \"影像監視\":\"影像監視\",  \"其他\":\"其他\"  }")]

        public string stt_purpose { get; set; }

        /// <summary>
        /// 備註
        /// </summary>
        [ColumnDef(VisibleEdit = true,  VisibleView = false,Visible =false, Display = "備註", Index = 14)]
        public string desc { get; set; }


        // 對外API需要，僅會對應到第一個device(未來若有其他非水位Device出現需要調正)
        //===========================================================
        /// <summary>
        //一級警戒水位
        /// </summary>
        [NotMapped]
        [ColumnDef(Visible = false)]
        public double? alarm1 { get; set; }

        /// <summary>
        //二級警戒水位
        /// </summary>
        [NotMapped]
        [ColumnDef(Visible = false)]
        public double? alarm2 { get; set; }
        //=================================================================

        /// <summary>
        /// 對應Device
        /// </summary>
        [NotMapped]
        [ColumnDef(Visible = false)]
        public List<DeviceBase> sttDevs { set; get; }
    }


    public class StationBaseModel
    {
        /// <summary>
        /// 測站名稱
        /// </summary>
        public virtual string stt_name { get; set; }

        /// <summary>
        /// 測站代號
        /// </summary>
        public virtual string stt_no { get; set; }

        /// <summary>
        /// 鄉鎮市區
        /// </summary>
        public virtual string county_code { get; set; }

        /// <summary>
        /// 都市計畫區
        /// </summary>
        public virtual string urban_plan { get; set; }

        /// <summary>
        /// 管理單位
        /// </summary>
        public virtual string manager { get; set; }
    }
}