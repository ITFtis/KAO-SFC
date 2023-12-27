using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SFC.Controllers.Api;
using SFC.Controllers.Api.HydraDevice.function;
using SFC.Controllers.Api.StationDevice.funtion;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using static System.Net.WebRequestMethods;

namespace SFC
{
    public class BkTask
    {
        public BkTask()
        {
            // 從組態檔載入相關參數，例如 SmtpHost、SmtpPort、SenderEmail 等等.
        }
        private DateTime startdt = DateTime.Now;
        private int runCount = 0;
        private bool _stopping = false;


        public void Run()
        {
            Logger.Log.For(this).Info("啟動BkTask背景");
            System.IO.File.AppendAllText(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/log")), $"startlog{DateTime.Now.ToString("yyyyyMMdd")}.txt"), $"{DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")}啟動BkTask背景" + Environment.NewLine, System.Text.Encoding.Default);
            var aThread = new Thread(TaskLoop);
            aThread.IsBackground = true;
            aThread.Priority = ThreadPriority.BelowNormal;  // 避免此背景工作拖慢 ASP.NET 處理 HTTP 請求.
            aThread.Start();
        }

        public void Stop()
        {
            _stopping = true;
        }

        void DeleteExpiredLog()
        {
            _DeleteExpiredFile(System.Web.Hosting.HostingEnvironment.MapPath("~/log"), "startlog*", 15);
            _DeleteExpiredFile(System.Web.Hosting.HostingEnvironment.MapPath("~/Data/SO"), SFC.Controllers.Api.DCDataController.SOPD_FILE_PREFIX + "*", 15);
        }

        void _DeleteExpiredFile(string path, string searchPattern, int expiredDay)
        {
            try
            {
                Directory.GetFiles(path, searchPattern).ToList().ForEach(f =>
                {
                    var finfo = new FileInfo(f);
                    if ((DateTime.Now - finfo.CreationTime).TotalDays > expiredDay)
                    {
                        finfo.Delete();
                        Debug.WriteLine($"Delete:{f}");
                    }
                });
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        DateTime Last3DData = DateTime.MinValue;
        public void Todo3DData()
        {
            DateTime st = DateTime.Now;
            string p = System.Web.Hosting.HostingEnvironment.MapPath("~/3D/V1_2/data/淹水3D_F_V1.2");

            string c = Path.Combine(p, "config.json");
            if (Last3DData == DateTime.MinValue && System.IO.File.Exists(c))
            {
                var cjt = DouHelper.Misc.DeSerializeObjectLoadJsonFile<JToken>(c);
                Last3DData = cjt.Value<DateTime>("Last3DDataTime");
            }
            Debug.WriteLine("1Timer......:"+(DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            var jt = DouHelper.Misc.DeSerializeObjectLoadJsonFile<JToken>(Path.Combine(p, "geo.json"));
            Debug.WriteLine("2Timer......:"+(DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            var layerJas = jt.Value<JArray>("layers");
            var rt = layerJas.FirstOrDefault(s => s.Value<int>("id") == 3);
            Debug.WriteLine("3Timer......:" + (DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            SerData rtsd = GetCalData("RT", 2);
            Debug.WriteLine("4Timer......:" + (DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            //if (rtsd == null || Last3DData == rtsd.Time)
            //    return;

            SerData h1sd = GetCalData("1H", 2);
            Debug.WriteLine("5Timer......:" + (DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            Set3DOneModelData(rt,rtsd.Values);
            var h1t = layerJas.FirstOrDefault(s => s.Value<int>("id") == 4);
            Set3DOneModelData( h1t, h1sd.Values);
            Debug.WriteLine("6Timer......:" + (DateTime.Now - st).TotalMilliseconds);
            st = DateTime.Now;
            //寫出javascript檔
            using (StreamReader sr = new StreamReader(Path.Combine(p, "scene_temp.js")))
            {
                var _content = sr.ReadToEnd();
                var gstr = Newtonsoft.Json.JsonConvert.SerializeObject(jt, Formatting.Indented);
                _content = _content.Replace("{0}", gstr);
                //string.Format(_content, Newtonsoft.Json.JsonConvert.SerializeObject(jt));
                sr.Close();
                using (StreamWriter sw = new StreamWriter(Path.Combine(p, "scene_model-out.js"), false))
                {
                    sw.WriteLine(_content);
                }
            }
            DouHelper.Misc.SerializeObjectSaveJsonFile(new { Last3DDataTime  = rtsd .Time},c);
            //new Thread(Copy3DTemp2RealJs).Start(new object[] { 0});
            Thread thread = new Thread(() => Copy3DTemp2RealJs(0));
            thread.Start();

            Debug.WriteLine("7Timer......:" +(DateTime.Now - st).TotalMilliseconds);
            st= DateTime.Now;
            var sadds = "";
        }
        void Copy3DTemp2RealJs(int c)
        {
            Debug.WriteLine("Coppppppppppppppp"+c);
            if (c > 5)
                return;
            string p = System.Web.Hosting.HostingEnvironment.MapPath("~/3D/V1_2/data/淹水3D_F_V1.2");
            string sf = Path.Combine(p, "scene_model-out.js");
            string tf = Path.Combine(p, "scene.js");
            try
            {
                if (System.IO.File.Exists(sf))
                {
                    System.IO.File.Copy(sf, tf, true);
                    System.IO.File.Delete(sf);
                }
            }
            catch
            {
                Debug.WriteLine("ERRRRRRRRRRRRR");
                Thread.Sleep(20 * 1000);
                Copy3DTemp2RealJs(++c);
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
                        featurejt.Value<JToken>("geom")["h"] = svalues[idx++].Value;
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
                        url = "https://www.dprcflood.org.tw/SFC/Data/OUTSWMM/2023/09/04/20230904.0400" + $".BC.DEPTH.{type}.txt";
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

        private void TaskLoop()
        {
            Thread.Sleep(1000);
            // 設定每一輪工作執行完畢之後要間隔幾分鐘再執行下一輪工作.
            const int LoopIntervalInMinutes = 1000 * 60 * 3;

            Logger.Log.For(this).Info("背景TaskLoop on thread ID: " + Thread.CurrentThread.ManagedThreadId.ToString());
            while (!_stopping)
            {
                try
                {
                    //Todo3DData(); //取消背景產3d js，改即時下載時產製F3DSControlle.Scene
                    new SFC.Controllers.Api.DCDataController().GetSOPDInfo();
                    try
                    {
                        new SFC.Controllers.Api.FmgController().GetFmgAllCctvStation();
                    }
                    catch (Exception exx)
                    {
                        Logger.Log.For(this).Error("BkTask.TaskLoop GetFmgAllCctvStation錯誤:" + exx.ToString());
                    }
                    //new SFC.Controllers.Api.DCDataController().GetSOPDInfo();
                    DeleteExpiredLog();
                }
                catch (Exception ex)
                {
                    // 發生意外時只記在 log 裡，不拋出 exception，以確保迴圈持續執行.
                    Logger.Log.For(this).Error("BkTask.TaskLoop錯誤:" + ex.ToString());
                }
                finally
                {
                    // 每一輪工作完成後的延遲.
                    System.Threading.Thread.Sleep(LoopIntervalInMinutes);
                }

                try
                {
                    // 更新設管科即時資料
                    HydraDatas.GetRealTimes();

                    // 更新下水道即時水位Api
                    ApiDeviceData.GetRealTime();
                }
                catch { 
                }
            }
        }

        private void Todo()
        {
            Logger.Log.For(this).Info($"To do ......啟動時間:{startdt.ToString("yyyy/MM/dd HH:mm:ss")};次數:{(++runCount)}");
        }
    }
}