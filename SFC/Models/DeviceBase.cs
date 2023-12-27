using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Text;

namespace SFC.Models
{

    [Table("device_base")]
    public class DeviceBase
    {
        [Key]
        [Column(Order = 0)]
        [ColumnDef(Visible = true, Display = "設備ID", Index = 0, Filter = true)]
        public string dev_id { get; set; }//設備ID

        [Key]
        [Column(Order = 1)]
        [ColumnDef(Visible = true, Display = "測站ID", Index = 1, Filter = true)]
        public string stt_no { get; set; }//測站ID(一個測站對應多個設備)

        [ColumnDef(Visible = true, Display = "經度", Index = 2)]
        public double lon { get; set; }//經度

        [ColumnDef(Visible = true, Display = "緯度", Index = 3)]
        public double lat { get; set; }//緯度

        [ColumnDef(Visible = true, Display = "監測項目", Index = 4, EditType = EditType.Select,
            SelectItems = "{\"雨水下水道\":\"雨水下水道\",\"雨水抽水站\":\"雨水抽水站\" , \"雨水調節池\":\"雨水調節池\", \"閘門\":\"閘門\" , \"河川\":\"河川\" , \"氣象\":\"氣象\", \"海象\":\"海象\" , \"監視\":\"監視\" , \"其他\":\"其他\"  }")]
        public string dev_purpose { get; set; }//監測項目(雨水下水道、雨水抽水站、雨水調節池、閘門、河川、氣象、海象、監視、其他)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "製造商", Index = 5)]
        public string manufacturer { get; set; }// 製造商

        [ColumnDef(Visible = false, Display = "核心設備型號", Index = 6)]
        public string dev_model { get; set; }//核心設備型號

        [ColumnDef(Visible = true, Display = "建置日期", Index = 7)]
        public DateTime depoist_date { get; set; }// 建置日期

        [ColumnDef(VisibleEdit = true, VisibleView = false, Display = "傳輸方式", Index = 8, EditType = EditType.Select,
            SelectItems = "{\"4G/5G\":\"4G/5G\",\"NB-IoT\":\"NB-IoT\" , \"LoRA\":\"LoRA\", \"微波\":\"微波\" , \"其他\":\"其他\"}")]
        public string trans_method { get; set; }//傳輸方式(4G/5G、NB-IoT、LoRA、微波、其他)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "設備傳輸IP", Index = 9)]
        public string ip { get; set; }// 設備傳輸IP

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "供電方式", Index = 10, EditType = EditType.Select,
            SelectItems = "{\"外部供電\":\"外部供電\",\"內部供電\":\"內部供電\" , \"混合式供電\":\"混合式供電\", \"自行產生/提供電力\":\"自行產生/提供電力\"}")]
        public string power { get; set; }//供電方式(外部供電、內部供電、混合式供電、自行產生/提供電力)

        [ColumnDef(VisibleEdit = true, Visible = false, VisibleView = false, Display = "取樣週期，以秒為單位。若不定時，請填寫-1", Index = 11)]
        public int sampling_period { get; set; }// 取樣週期，以秒為單位。若不定時，請填寫-1

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "測量週期，以秒為單位。若不定時，請填寫-1", Index = 12)]
        public int measure_period { get; set; }// 測量週期，以秒為單位。若為不定時請填寫-1

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "資料上傳週期，以秒為單位。若不定時，請填寫-1", Index = 13)]
        public int upload_period { get; set; }//資料上傳週期，以秒為單位，若不定時請填寫-1

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "基準高程，以公尺為單位(若監測水位、淹水，則必填寫)", Index = 14)]
        public double base_elev { get; set; }//基準高程，以公尺為單位(若監測水位、淹水，則必填寫)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "箱涵底部高程，以絕對高程為單位(m)", Index = 15)]
        public double abs_elev { get; set; }//箱涵底部高程，以絕對高程為單位(m)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "設備安裝位置深度1，紀錄探頭安裝位置之絕對高程(m)", Index = 16)]
        public double install_depth1 { get; set; }//設備安裝位置深度1，紀錄探頭安裝位置之絕對高程(m)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "設備安裝位置深度2，紀錄探頭安裝位置之絕對高程(m)", Index = 17)]
        public double install_depth2 { get; set; }//設備安裝位置深度2，紀錄探頭安裝位置之絕對高程(m)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "補充說明", Index = 18)]
        public string desc { get; set; }// 補充說明

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "二級警戒(50%滿管)", Index = 19)]
        public double emerge2 { get; set; }//二級警戒(50%滿管)

        [ColumnDef(VisibleEdit = true, VisibleView = false, Visible = false, Display = "一級警戒(80%滿管)", Index = 20)]
        public double emerge1 { get; set; }//一級警戒(80%滿管)
    }
}