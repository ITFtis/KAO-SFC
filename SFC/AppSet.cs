using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC
{

    public class AppSet
    {
        //水情影像雲端平台API
        public string WraFmgApiUrl { set; get; }
        //水利署Fhy
        public string WraFhyApiUrl { set; get; }
        //水利署Fhy api key
        public string WraFhyApiKey { set; get; }

        //高雄下水道資料
        public string KHNewSewerSource { set; get; }
        //高雄及有舊系統資料
        public string KhFloodinfoApiUrl { set; get; }
        //高雄及有舊系統資料Token
        public string KhFloodinfoApiTokenUrl { set; get; }
        //高雄及有舊系統資料帳
        public string KhFloodinfoApiName { set; get; }
        ////高雄及有舊系統資料密
        public string KhFloodinfoApiPwd { set; get; }

        //成功模式演算結果
        public string OUTSWMM { set; get; }
        //寶珠溝監控站
        public string ks224 { set; get; }
        //十全監控站
        public string ks245 { set; get; }
        //寶業里滯洪池
        public string ks31 { set; get; }
        //德山街抽水站
        public string ks245ds { set; get; }

        //累計雨量圖
        public string CWBDayRainfallUrl { set; get; }
        //雷達回波圖
        public string CWBRadUrl { set; get; }
        //Qpeums預報1小時
        public string CWBQpf1h { set; get; }


        // 上傳營建署API
        public string CpamiPostURL { get; set; }

        // 上傳營建署API的TOKEN
        public string CpamiPostKey { get; set; }
    }
}