using Microsoft.Ajax.Utilities;
using Newtonsoft.Json.Linq;
using SFC.Controllers.Api.StationDevice;
using SFC.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.UI;
using System.Xml.Linq;

namespace SFC.Controllers.Api
{
    [RoutePrefix("api")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class DataController : ApiController
    {
        //static string KhFloodinfoApiUrl = "https://floodinfo.kcg.gov.tw/service/api/db/";
        //static string KhFloodinfoApiTokenUrl = "https://floodinfo.kcg.gov.tw/service/api/login";
        //static string NewSewerApiUrl = "https://wrbswi.kcg.gov.tw/SFC-Api/sewerwater/";
        //static string WraFhyUrl = "https://fhy.wra.gov.tw/api/v2/";

        //static string CWBDayRainfallKmzUrl = "https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-003.kmz";
        //static string CWBRadPrefixUrl = "https://qpeplus.cwb.gov.tw/static/data/grid_0.01deg/cref/";
        //static string CWBQpfqpe060minPrefixUrl = "https://qpeplus.cwb.gov.tw/static/data/grid/qpfqpe_060min/";

        #region 取高雄khfloodinfo資料
        /// <summary>
        /// 取高雄水利局資料
        /// </summary>
        /// <param name="para0">取資料路徑</param>
        /// <param name="para1">取資料路徑</param>
        /// <param name="para2">取資料路徑</param>
        /// <param name="para3">取資料路徑</param>
        /// <returns>JToken</returns>
        [Route("khfloodinfo/{para0}")]
        [Route("khfloodinfo/{para0}/{para1}")]
        [Route("khfloodinfo/{para0}/{para1}/{para2}")]
        [Route("khfloodinfo/{para0}/{para1}/{para2}/{para3}")]
        [Route("khfloodinfo/{para0}/{para1}/{para2}/{para3}/{para4}")]
        [HttpGet]
        public JToken KhFloodinfo(string para0, string para1 = null, string para2 = null, string para3 = null, string para4 = null, int i = 0)
        {
            string url = $"{Startup.AppSet.KhFloodinfoApiUrl}{para0}";
            try
            {
                ///{info}?jwt={Token()}";
                if (!string.IsNullOrEmpty(para1))
                    url += $"/{para1}";
                if (!string.IsNullOrEmpty(para2))
                    url += $"/{para2}";
                if (!string.IsNullOrEmpty(para3))
                    url += $"/{para3}";
                if (!string.IsNullOrEmpty(para4))
                    url += $"/{para4}";
                url += $"?jwt={GetKHToken()}";
                if (GetKHToken() == null)
                    Logger.Log.For(null).Info($"Token 是null:{url}");
                //Debug.WriteLine("GetKHToken():" + GetKHToken());
                //var result = DouHelper.Misc.GetCache<JToken>(10*1000,url);
                //if (result == null)
                //{
                //    var o = DouHelper.HClient.Get<JToken>(url);//.Result.Message;
                //    result = o.Result.Result;
                //    Debug.WriteLine($"{url} count {(result == null ? 0 : result.Count())}");
                //}


                JToken r = GetJToken(url);
                if (r == null && (++i) < 2)
                {
                    DouHelper.Misc.ClearCache("khfloodinfo_token"); //清掉token cache
                    return KhFloodinfo(para0, para1, para2, para3, para4, i);
                }
                return r;
            }
            catch (Exception ex)
            {
                Logger.Log.For(null).Error($"Url 錯誤:{url}");
                throw ex;
            }
        }
        internal string GetKHToken()
        {
            return KHToken().Value<string>("result");
        }
        static object tokenlocker = new object();
        /// <summary>
        /// 取高雄水利局資料token
        /// </summary>
        /// <returns>JToken</returns>
        [HttpGet]
        [Route("khdata/token")]
        public JToken KHToken(int i = 0)
        {
            lock (tokenlocker)
            {
                string k = "khfloodinfo_token";
                JToken token = DouHelper.Misc.GetCache<JToken>(10 * 60 * 1000, k);
                if (token == null)
                {
                    token = DouHelper.HClient.Post<JToken>(Startup.AppSet.KhFloodinfoApiTokenUrl, new Dictionary<string, string> {
                        { "name",Startup.AppSet.KhFloodinfoApiName},
                        { "pwd",Startup.AppSet.KhFloodinfoApiPwd}
                    }).Result.Result;
                    DouHelper.Misc.AddCache(token, k);
                    Debug.WriteLine($"GetKHToken():{token}");
                }
                else
                {
                    Debug.WriteLine($"取cache  GetKHToken():{token.Value<string>("result")}");
                }
                if (token == null && i <= 2)
                    return KHToken(++i);

                return token;// "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjQ0MTM0ODIsIm5iZiI6MTY2NDQxMzQ4MiwianRpIjoiYmVmMWQxMzUtOGNiOC00M2MxLWJiMWUtZmRkNTRmMmJkNGVmIiwiZXhwIjoxNjY0NTg2MjgyLCJpZGVudGl0eSI6ImthbyIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.CfE60pzfMbf7u9gICtxaclerEv6RbPKUAZGMBrTL1kY";
            }
        }
        #endregion

        static Dictionary<string, object> lockobjs = new Dictionary<string, object>();
        [Route("getjson")]
        public JToken GetJToken(string url, int cachetimer = 10 * 1000)
        {
            if (!lockobjs.ContainsKey(url))
                lockobjs.Add(url, new object());
            var lobj = lockobjs[url];
            JToken result = null;
            //lock (lobj)
            //{
            result = DouHelper.Misc.GetCache<JToken>(cachetimer, url);

            if (result == null)
            {
                var o = DouHelper.HClient.Get<JToken>(url);//.Result.Message;
                result = o.Result.Result;
                if (result != null)
                {
                    DouHelper.Misc.AddCache(result, url);
                }

                Debug.WriteLine($"{url} count {(result == null ? 0 : result.Count())}");
            }
            else
            {
                Debug.WriteLine($"取 {url} form cache count {(result == null ? 0 : result.Count())}");
            }
            //}
            return result;
        }

        #region 雨量資料
        static object GetRainStationLocker = new object();
        [Route("rain/base")]
        public List<RainStation> GetRainStation()
        {
            string key = "GetRainStation";
            lock (GetRainStationLocker)
            {
                var result = DouHelper.Misc.GetCache<List<RainStation>>(30 * 60 * 1000, key);
                if (result == null)
                {
                    var o = GetFhyData("Rainfall/Station?$filter=CityCode%20eq%20%2764%27");
                    result = o.Value<JArray>("Data").Select(s => new RainStation
                    {
                        ST_NO = s.Value<string>("StationNo"),
                        NAME_C = s.Value<string>("StationName"),
                        BASIN_NO = s.Value<string>("BasinCode"),
                        COUN_ID = s.Value<string>("CityCode"),
                        ADDR_C = s.Value<string>("Address"),
                        Long = s.Value<JToken>("Point").Value<double>("Longitude"),
                        Lat = s.Value<JToken>("Point").Value<double>("Latitude"),
                        Source = "氣象署"
                    }).ToList();

                    var khjtk = KhFloodinfo("wrs_rain", "all") as JArray;
                    result.AddRange(khjtk.Select(s => new RainStation
                    {
                        ST_NO = s.Value<string>("stn_no"),
                        NAME_C = s.Value<string>("stn_name"),
                        Town = s.Value<string>("town"),
                        COUN_ID = "64",
                        ADDR_C = s.Value<string>("stn_name"),
                        Long = s.Value<double>("lon"),
                        Lat = s.Value<double>("lat"),
                        Source = "水利局"
                    }));
                    DouHelper.Misc.AddCache(result, key);
                }
                return result;
            }
        }
        JToken GetFhyData(string p)
        {
            return DouHelper.HClient.Get<JToken>(Startup.AppSet.WraFhyApiUrl + p, "application/json", new KeyValuePair<string, string>[] { new KeyValuePair<string, string>("Apikey", Startup.AppSet.WraFhyApiKey) }).Result.Result;
        }
        [Route("rain/rt")]
        public List<RainRt> GetRainRt()
        {
            string key = "GetRainRt";
            lock (GetRainStationLocker)
            {
                var result = DouHelper.Misc.GetCache<List<RainRt>>(30 * 1000, key);
                if (result == null)
                {
                    var rainids = GetRainStation().Select(s => s.ST_NO);
                    result = new List<RainRt>();
                    try
                    {
                        var o = GetFhyData("Rainfall/Info/RealTime");
                        var cwbkks = o.Value<JArray>("Data").Where(s => rainids.Contains(s.Value<string>("StationNo")));
                        result.AddRange(cwbkks.Select(s => new RainRt
                        {
                            ST_NO = s.Value<string>("StationNo"),
                            DATE = s.Value<DateTime>("Time"),
                            M10 = s.Value<double>("M10"),
                            H1 = s.Value<double>("H1"),
                            H3 = s.Value<double>("H3"),
                            H6 = s.Value<double>("H6"),
                            H12 = s.Value<double>("H12"),
                            H24 = s.Value<double>("H24")
                        }).ToList());
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine(ex.ToString());
                    }
                    try
                    {
                        var khjtk = KhFloodinfo("wrs_rain", "all") as JArray;
                        result.AddRange(khjtk.Select(s => new RainRt
                        {
                            ST_NO = s.Value<string>("stn_no"),
                            DATE = s.Value<DateTime>("time"),
                            M10 = s.Value<double>("min_10"),
                            M20 = s.Value<double>("min_20"),
                            H1 = s.Value<double>("hour_1"),
                            H3 = s.Value<double>("hour_3"),
                            H6 = s.Value<double>("hour_6"),
                            H12 = s.Value<double>("hour_12"),
                            H24 = s.Value<double>("hour_24")
                        }));
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine(ex.ToString());
                    }
                    var ntime = DateTime.Now;
                    foreach (var i in result)
                    {
                        if ((ntime - i.DATE).TotalHours > 6)
                            i.Status = "無資料";
                        else if (i.H24 > 0 && i.H24 >= 500)
                            i.Status = "超大豪雨";
                        else if (i.H24 > 0 && i.H24 >= 350)
                            i.Status = "大豪雨";
                        else if (i.H24 >= 200 || (i.H3 >= 100))
                            i.Status = "豪雨";
                        else if (i.H24 >= 80 || (i.H1 >= 40))
                            i.Status = "大雨";
                        else
                            i.Status = "正常";
                    }
                    if (result.Count > 0)
                        DouHelper.Misc.AddCache(result, key);
                }
                return result;
            }
        }
        [Route("rain/timeser/{stno}/{source}")]
        [Route("rain/timeser/{stno}/{source}/{fhy}/{qsdt}/{qedt}")]
        //[Route("rain/timeser/{stno}/{source}/{qsdt}/{qedt}")]
        public List<RainInfoB> GetRainSer(string stno, string source, bool fhy = false, string qsdt = null, string qedt = null)
        {
            string key = "GetRainSer" + stno + source + qsdt + qedt + fhy;
            lock (GetRainStationLocker)
            {
                var result = DouHelper.Misc.GetCache<List<RainInfoB>>(10 * 1000, key);

                if (result == null)
                {

                    if (fhy && source == "氣象署")
                    {
                        var o = GetFhyData($"Rainfall/Info/Last24Hours/StationNo/{stno}/M10");
                        if (o != null)
                        {
                            var ds = o.Value<JArray>("Data");
                            if (ds.Count > 0)
                            {
                                result = new List<RainInfoB>();
                                var d = ds.First();
                                var dt = d.Value<DateTime>("Time");
                                var dtsub = dt.ToString("yyyy/MM/dd");
                                var ts = d.Value<JArray>("Timeseries");
                                var vs = d.Value<JArray>("Rainfall").ToList();
                                for (int i = 0; i < ts.Count; i++)
                                {
                                    var sdt = dtsub + " " + ts[i] + ":00";
                                    var dd = Convert.ToDateTime(sdt);
                                    if (dd > dt)
                                        dd = dd.AddDays(-1);
                                    var v = Convert.ToDouble(vs[i]);
                                    result.Add(new RainInfoB { ST_NO = stno, DATE = dd, M10 = v });
                                }
                            }
                        }
                    }
                    else
                    {
                        var sourcetype = "wrs_rain";
                        var m10f = "obs_value";
                        if (source == "氣象署")
                        {
                            sourcetype = "cwb_rain";
                            m10f = "min_10";

                        }

                        var edt = qedt != null ? qedt : DateTime.Now.AddDays(1).ToString("yyyy-MM-dd");
                        var sdt = qsdt != null ? qsdt : DateTime.Now.AddDays(-6).ToString("yyyy-MM-dd");
                        var khjtk = KhFloodinfo("sta_info", sourcetype, stno, sdt, edt) as JArray;
                        Random r = new Random();
                        result = khjtk.Select(s => new RainInfoB
                        {
                            ST_NO = s.Value<string>("stn_no"),
                            DATE = s.Value<DateTime>("time"),
                            M10 = s.Value<double>(m10f)
                            //M10 = r.NextDouble() * 10//  s.Value<double>("obs_value")
                        }).ToList();

                    }
                    //}
                    //var n = Convert.ToDateTime(DateTime.Now.ToString("yyyy/MM/dd"));
                    //Random rr = new Random();
                    //for (int i = 24; i >= 0; i--)
                    //{

                    //    result.Add(new RainInfoB
                    //    {
                    //        ST_NO = stno,
                    //        DATE = DateTime.Now.AddHours(-i),
                    //        M10 = rr.NextDouble() * 10
                    //    });
                    //}
                    result = result.OrderBy(s => s.DATE).ToList();
                    DouHelper.Misc.AddCache(result, key);
                }
                return result;
            }
        }
        public class RainStation
        {
            public string ST_NO { get; set; }
            public string NAME_C { get; set; }
            public string BASIN_NO { get; set; }
            public string COUN_ID { get; set; }
            public string ADDR_C { get; set; }
            public double Long { get; set; }
            public double Lat { get; set; }
            public string Town { get; set; }
            public string Source { get; set; }
        }
        public class RainInfoB
        {
            public string ST_NO { get; set; }
            public DateTime DATE { get; set; }
            public double M10 { get; set; }
        }
        public class RainRt : RainInfoB
        {

            public double M20 { get; set; }
            public double H1 { get; set; }
            public double H3 { get; set; }
            public double H6 { get; set; }
            public double H12 { get; set; }
            public double H24 { get; set; }
            public string Status { get; set; }
        }

        #endregion

        #region 下水道資料

        static object GetSewerRtLocker = new object();
        internal static string SewerRtCacheKey = "api/sewer/rt";

        [Route("sewer/rt")]
        public IEnumerable<JToken> GetSewerRt()
        {

            string key = SewerRtCacheKey;

            List<JToken> r = DouHelper.Misc.GetCache<List<JToken>>(30 * 1000, key); //下水道新api已有cache，所以這邊cache可縮短
            if (r == null)
            {
                var ustno = new string[] { "KCRS012C", "KCRS013C" };
                //r = KhFloodinfo("sta_info", "lastest", "waterlevel").Value<JArray>("水利局").Where(j => j.Value<string>("stn_no").IndexOf("KCRS") >= 0).ToList();
                r = KhFloodinfo("sta_info", "lastest", "waterlevel").Value<JArray>("水利局").Where(j => ustno.Contains(j.Value<string>("stn_no"))).ToList();

                #region Api取
                JArray basejas = DouHelper.HClient.Get<JArray>($"{Startup.AppSet.KHNewSewerSource}api/StationDevice/Stations").Result.Result;
                JArray valuejas = DouHelper.HClient.Get<JArray>($"{Startup.AppSet.KHNewSewerSource}api/StationDevice/RealTime").Result.Result;
                foreach (JToken bjt in basejas.ToArray()) //基本資料
                {
                    //新增舊資料格式
                    bjt["stn_name"] = bjt.Value<string>("stt_name");
                    bjt["stn_no"] = bjt.Value<string>("stt_no");
                    bjt["lon"] = bjt.Value<double>("lon");
                    bjt["lat"] = bjt.Value<double>("lat");
                    bjt["warn_Level1"] = bjt.Value<double?>("alarm1");
                    bjt["warn_level2"] = bjt.Value<double?>("alarm2"); //l是小寫，原高雄API

                    var st_no = bjt.Value<string>("stt_no");
                    var dev = bjt.Value<JArray>("sttDevs").FirstOrDefault();
                    if (dev != null)
                    {
                        var dev_id = dev.Value<string>("dev_id");
                        bjt["dev_id"] = dev_id;
                        bjt["base_elev"] = dev.Value<double?>("base_elev");
                        bjt["abs_elev"] = dev.Value<double?>("abs_elev");

                        DateTime? time = null;
                        double? stage = null;

                        var vjt = valuejas.FirstOrDefault(j => j.HasValues && j.Value<string>("dev_id") == dev_id);

                        if (vjt != null)//即時資料
                        {
                            time = vjt.Value<DateTime>("datatime");
                            stage = vjt.Value<double?>("val");
                            //新增舊資料格式
                            bjt["time"] = vjt.Value<DateTime>("datatime");
                            bjt["stage"] = vjt.Value<double?>("val");
                        }
                    }
                    r.Add(bjt);
                }
                #endregion

                #region 直接取至DB
                if (false)
                {
                    var realTimes = new StationDeviceController().GetRealTime();
                    new StationDeviceController().GetStations().ForEach(station =>
                    {

                        station.sttDevs.ForEach(device =>
                        {
                            JToken bjt = new JObject();

                            var realTime = realTimes.Where(e => e.dev_id == device.dev_id).FirstOrDefault();
                            bjt["manhole_num"] = station.manhole_num;
                            bjt["manhole_depth"] = station.manhole_depth;
                            bjt["dev_id"] = device.dev_id;
                            bjt["abs_elev"] = device.abs_elev;
                            bjt["time"] = realTime == null ? null : realTime.datatime.ToString("yyyy-MM-ddTHH:mm:ss");
                            bjt["stage"] = realTime == null ? null : (double?)(realTime.val);

                            bjt["stn_name"] = station.stt_name;
                            bjt["stn_no"] = station.stt_name;
                            bjt["base_elev"] = device.base_elev;

                            bjt["lon"] = station.lon;
                            bjt["lat"] = station.lat;
                            bjt["warn_Level1"] = device.emerge1;
                            bjt["warn_level2"] = device.emerge2; //l是小寫，原高雄API

                            r.Add(bjt);
                        });
                    });
                }
                #endregion
            }
            return r;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="start">格式yyyy-MM-ddTHH:mm:ss</param>
        /// <param name="end">格式yyyy-MM-ddTHH:mm:ss</param>
        /// <returns></returns>
        [Route("sewer/history/{id}")]
        [Route(@"sewer/history/{id}/{start:datetime}/{end:datetime}")]
        public IEnumerable<DeviceLora> GetSewerSerInfo(string id, DateTime? start = null, DateTime? end = null) //web.config要加 <httpRuntime targetFramework="4.8" requestPathInvalidCharacters="" />
        {
            end = end ?? DateTime.Now;

            IEnumerable<DeviceLora> r = null;
            if (id.IndexOf("KCRS") >= 0) //舊高雄API
            {
                start = start ?? end.Value.AddDays(-7);
                JArray jas = KhFloodinfo("sta_info", "wrs_waterlevel", id, start.Value.ToString("yyyy-MM-ddTHH:mm:ss"), end.Value.ToString("yyyy-MM-ddTHH:mm:ss")) as JArray;
                if (jas != null)
                {
                    r = jas.Select(jt => new DeviceLora
                    {
                        datatime = jt.Value<DateTime>("time"),
                        val = jt.Value<double>("stage")
                    });
                }
            }
            else
            {
                start = start ?? end.Value.AddHours(-24);
                var url = $"{Startup.AppSet.KHNewSewerSource}api/StationDevice/history/{id}/{start.Value.ToString("yyyy-MM-ddTHH:mm")}/{end.Value.ToString("yyyy-MM-ddTHH:mm")}";
                r = DouHelper.HClient.Get<IEnumerable<DeviceLora>>(url).Result.Result;
                //r = new JArray(historicals);
                //if (r != null)
                //{
                //    foreach (var jt in r)
                //    {
                //        jt["time"] = jt.Value<DateTime>("datatime");
                //        jt["stage"] = jt.Value<double>("waterlevel");
                //    }
                //}
                //#region 直接取至DB
                //r = new StationDeviceController().GetHistory(id, start.Value, end.Value);
                #endregion
            }
            return r;
        }
        //public JArray GetSewerSerInfo(string id, DateTime? start = null, DateTime? end = null) //web.config要加 <httpRuntime targetFramework="4.8" requestPathInvalidCharacters="" />
        //{
        //    end = end ?? DateTime.Now;

        //    JArray r = null;
        //    if (id.IndexOf("KCRS") >= 0) //舊高雄API
        //    {
        //        start = start ?? end.Value.AddDays(-7);
        //        r = KhFloodinfo("sta_info", "wrs_waterlevel", id, start.Value.ToString("yyyy-MM-ddTHH:mm:ss"), end.Value.ToString("yyyy-MM-ddTHH:mm:ss")) as JArray;
        //    }
        //    else
        //    {
        //        start = start ?? end.Value.AddHours(-24);

        //        var historicals = new StationDeviceController().GetHistory(id, start.Value, end.Value);
        //        r = new JArray(historicals);
        //        if (r != null)
        //        {
        //            foreach (var jt in r)
        //            {
        //                jt["time"] = jt.Value<DateTime>("datatime");
        //                jt["stage"] = jt.Value<double>("val");
        //            }
        //        }
        //    }
        //    return r;
        //}

        #region 取累計雨量去背圖資訊
        static object DayRainfallLockObject = new object();
        // GET api/<controller>
        [Route("rain/img/dayrainfall")]
        [HttpGet]
        public ImageData DayRainfall()
        {
            string key = "day-rainfall";
            lock (DayRainfallLockObject)
            {
                ImageData img = DouHelper.Misc.GetCache<ImageData>(2 * 60 * 1000, key);
                if (img == null)
                {
                    img = GetDayRainfall();
                    DouHelper.Misc.AddCache(img, key);
                }
                return img;
            }
        }
        ImageData GetDayRainfall()
        {
            ImageData img = new ImageData();
            using (WebClient client = new WebClient())
            {
                var dfile = HttpContext.Current.Server.MapPath($@"~/download/{Guid.NewGuid()}/O-A0040-003.kmz");
                var dir = System.IO.Path.GetDirectoryName(dfile);
                var edir = dir + @"/Extract";
                bool istest = false;
                if (istest)
                    edir = @"D:\CVS_SRC\SourceCode\水利署\水利署重大水災情\SFC\SFC\download\O-A0040-003";
                try
                {
                    if (!istest)
                    {
                        if (!Directory.Exists(dir))
                            Directory.CreateDirectory(dir);
                        client.DownloadFile(Startup.AppSet.CWBDayRainfallUrl, dfile);

                        ZipFile.ExtractToDirectory(dfile, edir);
                    }
                    string linkkml = null;
                    using (StreamReader sr = new StreamReader(edir + @"\doc.kml"))
                    {
                        XDocument doc = XDocument.Load(sr);
                        var xe = doc.Root.Descendants(doc.Root.Name.Namespace + "name").FirstOrDefault();
                        var fname = xe.Value;
                        if (!string.IsNullOrEmpty(fname))
                        {
                            try
                            {
                                img.Name = fname.Substring(fname.LastIndexOf("_") + 1);
                                System.Globalization.CultureInfo provider = new System.Globalization.CultureInfo("zh-TW");
                                img.Time = DateTime.ParseExact(fname.Replace(img.Name, ""), "yyyy-MM-dd_HHmm_", provider, System.Globalization.DateTimeStyles.None);
                            }
                            catch (Exception ex)
                            {
                                Debug.WriteLine(ex.ToString());
                                img.Name = ex.ToString();
                            }
                        }

                        //xe = doc.Root.Element(doc.Root.Name.Namespace + @"Network/Link/Link/href");
                        xe = doc.Root.Descendants(doc.Root.Name.Namespace + @"href").FirstOrDefault();
                        linkkml = xe.Value;

                    }
                    using (StreamReader sr = new StreamReader(edir + @"\" + linkkml))
                    {
                        XDocument doc = XDocument.Load(sr);
                        var xe = doc.Root.Descendants(doc.Root.Name.Namespace + "LatLonBox").FirstOrDefault();
                        img.MaxX = Convert.ToDouble(xe.Element(xe.Name.Namespace + "east").Value);
                        img.MinX = Convert.ToDouble(xe.Element(xe.Name.Namespace + "west").Value);
                        img.MaxY = Convert.ToDouble(xe.Element(xe.Name.Namespace + "north").Value);
                        img.MinY = Convert.ToDouble(xe.Element(xe.Name.Namespace + "south").Value);
                    }

                    using (System.Drawing.Image image = System.Drawing.Image.FromFile((edir + @"\" + linkkml).Replace(".kml", ".png")))
                    {
                        using (MemoryStream m = new MemoryStream())
                        {
                            image.Save(m, image.RawFormat);
                            byte[] imageBytes = m.ToArray();

                            // Convert byte[] to Base64 String
                            string base64String = Convert.ToBase64String(imageBytes);
                            img.Url = "data:image/png;base64," + base64String;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Logger.Log.For(this).Error("GetDayRainfall Error:" + ex.Message);
                }
                finally
                {
                    if (!istest && Directory.Exists(dir))
                        Directory.Delete(dir, true);
                }
            }
            return img;
        }
        public class ImageData
        {
            public string Name { set; get; }
            public DateTime Time { set; get; }
            public double MinX { set; get; }
            public double MaxX { set; get; }
            public double MinY { set; get; }
            public double MaxY { set; get; }
            public string Url { set; get; }
        }
        #endregion

        #region 雷達回波圖
        [Route("rad/rt")]
        public QpesumsData GetRadRt()
        {
            QpesumsData result = null;
            DateTime n = DateTime.Now;//.AddHours(-8);//資料路徑格式是UTC
            n = Convert.ToDateTime(n.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
            while (true)
            {
                var c = GetRadTime(n);
                if (c != null)
                {
                    result = new QpesumsData
                    {
                        Datetime = n,//.AddHours(8), //還原UTC+8
                        Content = c
                    };
                    break;
                }
                else
                {
                    n = n.AddMinutes(-10);
                    if ((DateTime.Now - n).TotalHours > 1)
                    {
                        break;
                    }
                }
            }
            return result;
        }
        [Route(@"rad/time/{dt:datetime}")]
        public string GetRadTime(DateTime dt)
        {
            string result = null;
            try
            {
                using (WebClient wc = new WebClient())
                {
                    var udt = dt.AddHours(-8);
                    udt = Convert.ToDateTime(udt.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
                    string url = $"{Startup.AppSet.CWBRadUrl}{udt.Year}/{udt.Month.ToString("00")}/{udt.Day.ToString("00")}/{udt.Hour.ToString("00")}/CREF.{udt.ToString("yyyyMMdd.HHmm00")}.dat";
                    var stream = wc.OpenRead(url);
                    using (StreamReader sr = new StreamReader(stream))
                    {
                        result = sr.ReadToEnd();
                    }
                }
            }
            catch (Exception ex)
            {
                var ss = ex;
            }
            return result;
        }
        #endregion

        #region qpesums預報1小時資料
        [Route("qpesums/qpf060min/rt")]
        public QpesumsData GetQpfqpe060minRt()
        {
            QpesumsData result = null;
            DateTime n = DateTime.Now;//.AddHours(-8);//資料路徑格式是UTC
            n = Convert.ToDateTime(n.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
            while (true)
            {
                var c = GetQpfqpe060min(n);
                if (c != null)
                {
                    result = new QpesumsData
                    {
                        Datetime = n,//.AddHours(8), //還原UTC+8
                        Content = c
                    };
                    break;
                }
                else
                {
                    n = n.AddMinutes(-10);
                    if ((DateTime.Now - n).TotalHours > 1)
                    {
                        break;
                    }
                }
            }
            return result;
        }
        //[Route(@"daterange/{startDate:regex(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$)}/{endDate:regex(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$)}")]
        //[Route(@"qpesums/qpf060min/time/{dt:regex(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$)}")]
        [Route(@"qpesums/qpf060min/time/{dt:datetime}")]
        public string GetQpfqpe060min(DateTime dt)
        {
            string result = null;
            try
            {
                using (WebClient wc = new WebClient())
                {
                    var udt = dt.AddHours(-8);
                    udt = Convert.ToDateTime(udt.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
                    string url = $"{Startup.AppSet.CWBQpf1h}{udt.Year}/{udt.Month.ToString("00")}/{udt.Day.ToString("00")}/{udt.Hour.ToString("00")}/qpfqpe_060min.{udt.ToString("yyyyMMdd.HHmm")}.dat";
                    var stream = wc.OpenRead(url);
                    using (StreamReader sr = new StreamReader(stream))
                    {
                        result = sr.ReadToEnd();
                    }
                }
            }
            catch (Exception ex)
            {
                var ss = ex;
            }
            return result;
        }
        public class QpesumsData
        {
            public DateTime Datetime { set; get; }
            public string Content { set; get; }
        }
        #endregion


        #region 資料庫項目

        static Object lockobj = new object();
        internal static DouModelContextExt DbContext
        {
            get
            {
                return new DouModelContextExt();
            }
        }

        public static StationBase getStationByID(string stationID)
        {
            if (stationID == null)
                return null;

            String stationKey = "~BaseStation~" + stationID;
            var station = DouHelper.Misc.GetCache<StationBase>(24 * 3600 * 1000, stationKey);

            if (station != null)
                return station;

            var db = DataController.DbContext;
            var selectStation = db.StationBases.Where(e => e.stt_no == stationID).FirstOrDefault();
            if (selectStation != null)
            {
                DouHelper.Misc.AddCache(selectStation, stationKey);
                return selectStation;
            }
            else
                return null;
        }

        // 取得所有測站資訊
        public static IEnumerable<StationBase> getAllStations()
        {
            String stationKey = "~AllBaseStation~";
            var station = DouHelper.Misc.GetCache<IEnumerable<StationBase>>(24 * 3600 * 1000, stationKey);

            if (station != null)
                return station;

            var db = DataController.DbContext;
            var selectStation = db.StationBases.Where(e => true).ToList();
            DouHelper.Misc.AddCache(selectStation, stationKey);
            return selectStation;
        }

        // 取得所有建置廠商
        public static IEnumerable<String> getAllManifactures()
        {
            String key = "~AllManufacture";
            var manufatures = DouHelper.Misc.GetCache<IEnumerable<String>>(24 * 3600 * 1000, key);

            if (manufatures != null)
                return manufatures;

            var db = DataController.DbContext;
            var selectedManufatures = db.DeviceBases.Select(e => e.manufacturer).Distinct().ToList();
            DouHelper.Misc.AddCache(selectedManufatures, key);
            return selectedManufatures;
        }
        public static DeviceBase GetDeviceBase(string deviceID)
        {
            if (deviceID == null)
                return null;

            String deviceKey = "~BaseDevice~" + deviceID;
            var device = DouHelper.Misc.GetCache<DeviceBase>(24 * 3600 * 1000, deviceKey);

            if (device != null)
                return device;

            var db = DataController.DbContext;
            var selectDevice = db.DeviceBases.Where(e => e.dev_id == deviceID).FirstOrDefault();
            if (selectDevice != null)
            {
                DouHelper.Misc.AddCache(selectDevice, deviceKey);
                return selectDevice;
            }
            else
                return null;
        }

        public static IEnumerable<DeviceBase> GetStationDevices(string stationID)
        {
            if (stationID == null)
                return null;

            String stationKey = "~StationDevices~" + stationID;
            var devices = DouHelper.Misc.GetCache<IEnumerable<DeviceBase>>(24 * 3600 * 1000, stationKey);

            if (devices != null)
                return devices;

            var db = DataController.DbContext;
            var selectStation = db.DeviceBases.Where(e => e.stt_no == stationID).ToList();
            if (selectStation != null)
            {
                DouHelper.Misc.AddCache(selectStation, stationKey);
                return selectStation;
            }
            else
                return null;
        }

        public static IEnumerable<GlobalCounty> GetAllCounty()
        {
            String countyKey = "~GetAllCounties~";
            var county = DouHelper.Misc.GetCache<IEnumerable<GlobalCounty>>(24 * 3600 * 1000, countyKey);

            if (county != null)
                return county;

            var db = DataController.DbContext;
            var selectCounty = db.GlobalCounties.Where(e => e.Id.StartsWith("640")).ToList();

            DouHelper.Misc.AddCache(selectCounty, countyKey);
            return selectCounty;
        }

        public static GlobalCounty GetCounty(string countyCode)
        {
            if (countyCode == null)
                return null;

            String countyKey = "~GetCounty~" + countyCode;
            var county = DouHelper.Misc.GetCache<GlobalCounty>(24 * 3600 * 1000, countyKey);

            if (county != null)
                return county;

            var db = DataController.DbContext;
            var selectCounty = db.GlobalCounties.Where(e => e.Id == countyCode).FirstOrDefault();
            if (selectCounty != null)
            {
                DouHelper.Misc.AddCache(selectCounty, countyKey);
                return selectCounty;
            }
            else
                return null;
        }

        public static IEnumerable<HydraDeviceBase> GetAllHydraDevices()
        {
            String stationKey = "~AllHydraDevices~";
            var station = DouHelper.Misc.GetCache<IEnumerable<HydraDeviceBase>>(24 * 3600 * 1000, stationKey);

            if (station != null)
                return station;

            var db = DataController.DbContext;
            var selectStation = db.HydraDeviceBase.ToList();
            DouHelper.Misc.AddCache(selectStation, stationKey);
            return selectStation;
        }

        #endregion
    }
}