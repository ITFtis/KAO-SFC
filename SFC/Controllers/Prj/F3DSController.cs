using Dou.Misc.Attr;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SFC.Controllers.comm;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace SFC.Controllers.Prj
{
    
    [HtmlIFrameMenuDef(Id = "Flood3DSimulation", Name = "3D淹水模擬展示", MenuPath = "寶珠溝示範區", Index = 1, Action = "Index", AllowAnonymous = false,Url = "3D/V1_2/Index.html")]
    public class F3DSController : Dou.Controllers.HtmlIFrameController
    {
        protected override void OnActionExecuting(ActionExecutingContext ctx)
        {
            string action = base.ControllerContext.RouteData.Values["action"].ToString().ToLower();
            if(action.Equals("index") || action.Equals("iframe")) //要排除，不然Scene會無作用
                base.OnActionExecuting(ctx);
        }
        // GET: F3DS
        public ActionResult Index()
        {
            return View();
        }
        //[HttpGet]
        //[Route("f3ds/data/scene")]
        public ActionResult Scene()
        {
            //DateTime st = DateTime.Now;
            //string p = System.Web.Hosting.HostingEnvironment.MapPath("~/3D/V1_2/data/淹水3D_F_V1.2");
            //string tf = System.IO.Path.Combine(p, "scene.js");
            //string responseString = null;
            //using (StreamReader sr = new StreamReader(tf))
            //{
            //    responseString = sr.ReadToEnd();
            //}
            //Debug.WriteLine("2Timer......:" + (DateTime.Now - st).TotalMilliseconds);
            return Content(Get3DDataJs(), "application/javascript");
        }

        static object lockobject = new object();
        static DateTime Last3DData = DateTime.MinValue;

        public string Get3DDataJs()
        {
            string key = "~~Get3DDataJs~~";
            lock (lockobject)
            {
                string js = DouHelper.Misc.GetCache<string>(60*1000,key);
                if (js != null) 
                    return js;
                DateTime st = DateTime.Now;
                string p = System.Web.Hosting.HostingEnvironment.MapPath("~/3D/V1_2/data/淹水3D_F_V1.2");

                
                var jt = DouHelper.Misc.DeSerializeObjectLoadJsonFile<JToken>(System.IO.Path.Combine(p, "geo.json"));
                var layerJas = jt.Value<JArray>("layers");
                var rt = layerJas.FirstOrDefault(s => s.Value<int>("id") == 3);
                SerData rtsd = GetCalData("RT", 2);
                
                SerData h1sd = GetCalData("1H", 2);
                Set3DOneModelData(rt, rtsd.Values);
                var h1t = layerJas.FirstOrDefault(s => s.Value<int>("id") == 4);
                Set3DOneModelData(h1t, h1sd.Values);
                //組javascript字串
                using (StreamReader sr = new StreamReader(System.IO.Path.Combine(p, "scene_temp.js")))
                {
                    js = sr.ReadToEnd();
                    var gstr = Newtonsoft.Json.JsonConvert.SerializeObject(jt);//, Formatting.Indented);
                    js = js.Replace("{0}", gstr);
                }

                DouHelper.Misc.AddCache(js, key);
                return js;
            }
        }
    
        void Set3DOneModelData(JToken typeJt, List<SerValue> svalues)
        {
            var blocks = typeJt.Value<JToken>("data").Value<JArray>("blocks");
            int acount = 0; //2962
            //SerData sd = GetCalData(type, 2);
            int idx = 0;
            //if (sd != null)
            //{
            foreach (var ojt in blocks)
            {
                var features = ojt.Value<JArray>("features");
                foreach (var featurejt in features)
                {
                    featurejt.Value<JToken>("geom")["h"] = svalues[idx++].Value+10;
                }
                acount += features.Count;
            }
            string ssd = "";
            //}
        }
        SerData GetCalData(string type, int? columncount)
        {
            DateTime n = DateTime.Now;
            n = Convert.ToDateTime(n.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
            SerData result = null;
            while (result == null)
            {
                try
                {
                    using (WebClient wc = new WebClient())
                    {
                        //https://www.dprcflood.org.tw/SFC/Data/OUTSWMM/2023/09/24/20230924.1800.BC.DEPTH.RT.txt
                        string url = Startup.AppSet.OUTSWMM + $"{n.Year}/{n.Month.ToString("00")}/{n.Day.ToString("00")}/{n.ToString("yyyyMMdd.HHmm")}.BC.DEPTH.{type}.txt";
                        //url = "https://www.dprcflood.org.tw/SFC/Data/OUTSWMM/2023/09/04/20230904.0400" + $".BC.DEPTH.{type}.txt";
                        var stream = wc.OpenRead(url);
                        using (StreamReader sr = new StreamReader(stream, System.Text.Encoding.GetEncoding("big5")))
                        {
                            result = new SerData { Time = n, Values = new List<SerValue>() };
                            string l = null;
                            while ((l = sr.ReadLine()) != null)
                            {
                                var ds = l.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                                if (columncount != null && ds.Length != columncount)
                                    continue;
                                result.Values.Add(new SerValue { Ser = Convert.ToInt32(ds[0]), Value = Convert.ToDouble(ds[1]) });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    result = null;
                    var ss = ex;
                }
                n = n.AddMinutes(-10);
                if ((DateTime.Now - n).TotalHours > 24)
                    break;
            }
            return result;
        }
        class SerData
        {
            public DateTime Time { get; set; }
            public List<SerValue> Values { get; set; }
        }
        class SerValue
        {
            public int Ser { get; set; }
            public Double Value { get; set; }
        }
    }
}