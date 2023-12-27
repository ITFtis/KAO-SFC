using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DouHelper;
using System.Diagnostics;
using System.Web.Http.Description;
using PagedList;
using Microsoft.Ajax.Utilities;

namespace SFC.Controllers.Api
{
    [RoutePrefix("api/bc")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class DCDataController : ApiController
    {
        #region 寶珠溝智慧操作決策
        static object lockGetSOPDInfo = new object();
        internal static string SOPD_FILE_PREFIX = "SO_";


        /// <summary>
        /// 設施情境警戒評估資料
        /// </summary>
        /// <param name="adjust">將原演算資料(即時、預報)，如有必要可依參數調整(如測試)</param>
        /// <param name="all"></param>
        /// <returns></returns>
        [Route("sopd/adjust/rt/{adjust:double}")]
        [Route("sopd/rt")]
        [Route("sopd/rt/{all}")]
        public List<Sop> GetSOPDInfo(double adjust = 0, string all = null) {
            //List<List<string>> r = new List<List<string>>();
            string k = $"GetSOPDInfo~~{adjust}";
            
            List<Sop> r = null;
            lock (lockGetSOPDInfo)
            {
                r = DouHelper.Misc.GetCache<List<Sop>>(60 * 1000, k);

                //r.Split<Object>(10);
                if (r == null)
                {
                    r = new List<Sop>();
                    var jr = DeserializeJsonObject<JArray>("智慧操作決策參數.json");
                    var nbcp = GetNewestBcPoint();
                    var bcrt = GetInterceptionStationInfo();
                    var ran = new Random();
                    string cachef = System.IO.Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Data/SO")), $"{SOPD_FILE_PREFIX}{nbcp.Time.ToString("yyyyMMddHHmm")}.xml");
                    if (r == null && File.Exists(cachef)) //用cach檔考慮會有nbcp與bcrt資料時間不一致問題
                    {

                    }

                    foreach (JToken jt in jr)
                    {
                        List<string> o = new List<string>();
                        o.Add("Name:" + jt.Value<string>("Name"));

                        Sop sop = new Sop()
                        {
                            Name = jt.Value<string>("Name"),
                            X = jt.Value<double>("X"),
                            Y = jt.Value<double>("Y"),
                            OperateSop = jt.Value<bool>("OperateSop"),
                        };
                        jt.Value<JArray>("Parameters").ToList().ForEach(s =>
                        {
                            var n = s.Value<string>("Name");
                            sop.Parameters.Add(new SopParameter
                            {
                                Name = n,
                                Desc = s.Value<string>("Desc")
                            });
                        });

                        //情境
                        JArray situationJArray = jt.Value<JArray>("Situation");
                        int scount = 1;
                        bool isAlert = false;

                        foreach (JToken situationJ in situationJArray)
                        {
                            SopSituation sops = new SopSituation()
                            {
                                Name = situationJ.Value<string>("Name"),
                                Desc = situationJ.Value<string>("Desc"),
                                Operate = situationJ.Value<string>("Operate")
                            };
                            o.Add(situationJ.Value<string>("Name"));


                            //條件(每一條件and)
                            JArray conditionsJArray = situationJ.Value<JArray>("Conditions");
                            int cint = 1;
                            bool allCconditionAlert = false;
                            List<bool> allConditionAlertList = new List<bool>();
                            foreach (JToken CconditionJ in conditionsJArray)
                            {
                                SopSitCondition ssc = new SopSitCondition();
                                sops.Conditions.Add(ssc);
                                JArray mapJArray = CconditionJ.Value<JArray>("Map");
                                List<bool> malert = new List<bool>();
                                //單一參數
                                foreach (JToken mapJ in mapJArray)
                                {
                                    SopParameter sp = new SopParameter();
                                    ssc.Map.Add(sp);
                                    sp.Name = mapJ.Value<string>("Name");
                                    sp.Ge = mapJ.Value<double?>("Ge");
                                    sp.G = mapJ.Value<double?>("G");
                                    sp.Le = mapJ.Value<double?>("Le");
                                    sp.L = mapJ.Value<double?>("L");

                                    

                                    var v = GetValueByBcPointData_Interception(nbcp, bcrt, sp.Name);// nbcp.BcPoints.FirstOrDefault(s => s.Id == mname).Value;
                                    //測試調值用
                                    if (adjust != 0)
                                        v += adjust;

                                    sp.Value = v;
                                    sp.Desc = sop.Parameters.FirstOrDefault(s => s.Name == sp.Name).Desc;

                                    bool alert = CheckAlert(v, sp.Ge, sp.G, sp.Le, sp.L);
                                    o.Add($"{sp.Name}>v:{v},Ge:{sp.Ge},G:{sp.G},Le:{sp.Le},L:{sp.L} >>{ (alert ? "True************" : "False")}");
                                    malert.Add(alert);
                                }
                                var calert = malert.Where(s => s == false).Count() == 0;  //全true>>>單一條件成立
                                o.Add($"條件{cint++}/{conditionsJArray.Count()}結果 {(calert ? "成立" : "不成立")}   ");
                                allConditionAlertList.Add(calert);
                            }
                            allCconditionAlert = allConditionAlertList.Where(s => s == false).Count() == 0;//全true>>>所有條件成立
                            o.Add($"情境{scount++}/{situationJArray.Count()} 所有條件結果 {(allCconditionAlert ? "成立" : "不成立")}   ");
                            if (allCconditionAlert)
                            {
                                sop.Situation = sops;
                                o.Add("");
                                o.Add("<<<<<<<<警戒中訊息>>>>>>>>");
                                o.Add($"設施:{jt.Value<string>("Name")}");
                                o.Add($"情境別:{situationJ.Value<string>("Name")}");
                                o.Add($"狀況:{situationJ.Value<string>("Desc")}");
                                o.Add($"建議動作:{situationJ.Value<string>("Operate")}");
                                o.Add("<<<<<<<<======>>>>>>>>");
                                isAlert = true;
                                break;
                            }
                        }
                        o.Add("===================");
                        Debug.WriteLine(String.Join("\n", o));
                        if (!string.IsNullOrEmpty(all) || (all == null && isAlert))
                            r.Add(sop);
                    }
                    DouHelper.Misc.AddCache(r, k);
                    #region 存檔或記錄，Line通報用
                    if (adjust==0)
                    {
                        DouHelper.Misc.SerializeBinary(r, cachef); 
                        File.WriteAllText(cachef.Replace(".xml", ".json"), JsonConvert.SerializeObject(r));
                        //var sdd =JsonConvert.DeserializeObject<List<Sop>>(File.ReadAllText(cachef.Replace(".xml", ".json")));
                    }
                   
                    #endregion
                }
            }
            return r;
        }

        bool CheckAlert( double v, double? ge, double? g, double? le, double? l)
        {
            if(v==-999) //成大產出時，無抓到資料
                return false;   
            return (ge == null ||  v >= ge) && (g == null || v > g) && (le == null || v <= le) && (l == null || v < l);
        }

        double GetBcPointData(BcPointData nbcp, string mname)
        {
            var p = nbcp.BcPoints.FirstOrDefault(s => s.Id == mname);
            return p == null?-999:p.Value;

        }
        double GetValueByBcPointData_Interception(BcPointData nbcp,List<InterceptionStation> bcrt, string mname)
        {
            var p = nbcp.BcPoints.FirstOrDefault(s => s.Id == mname);
            double r = -999;
            if (p != null)
                r = p.Value;
            else if (mname.StartsWith("{")) //設管科資料
            {
                var _t = mname.Substring(1, mname.Length - 2);
                var _st = _t.Split(new char[] { '_' })[0];
                var _sti = bcrt.FirstOrDefault(s => s.Id == _st);
                if (_sti != null)
                {
                    var v = _sti.MechanicalInfos.First(s => s.Id == _t).Value;
                    if (v != null)
                       r = v.Value;
                }
            }
            return r;
        }
        #endregion
        #region 寶珠溝示範BCD即時資料
        [Route("bcd/rt")]
        public List<BCD> GetBCDnInfo()
        {
            string key = "~GetBCDnInfo~";
            List<BCD> result = DouHelper.Misc.GetCache<List<BCD>>(30 * 1000, key);

           
            if (result == null)
            {
                var nbcp = GetNewestBcPoint();
                var bcrt = GetInterceptionStationInfo(); //設管科資料
                // read file into a string and deserialize JSON to a type
                result = DeserializeJsonObject<List<BCD>>("寶珠溝示範區測站資料.json");// JsonConvert.DeserializeObject<List<BCD>>(File.ReadAllText(System.IO.Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Data")), "bcdisplayview.json")));

                result.ForEach(x => {
                    SetBCDDataValueFromRt(x, "Rt", "RtMap", nbcp, bcrt, nbcp.Time);
                    SetBCDDataValueFromRt(x, "F1H", "F1HMap", nbcp, bcrt, nbcp.Time);
                });

                DouHelper.Misc.AddCache(result, key);
            }
            return result;
        }

        void SetBCDDataValueFromRt(BCD bcd, string vf, string mf, BcPointData bcpd, List<InterceptionStation> bcrt, DateTime dtime)
        {
            var tf = "Time";
            string mfv = bcd.GetFieldValue<BCD, string>(mf);
            if (string.IsNullOrEmpty(mfv))
                return;
            if (mfv.StartsWith("{"))
            {
                var _t = mfv.Substring(1, mfv.Length - 2);
                var _st = _t.Split(new char[] { '_' })[0];
                var _sti = bcrt.FirstOrDefault(s => s.Id == _st);
                if (_sti != null)
                {
                    var v = _sti.MechanicalInfos.First(s => s.Id == _t).Value;
                    bcd.SetFieldValue(vf, v);
                    bcd.SetFieldValue(tf, _sti.MechanicalInfos.First(s => s.Id == _t).Time);
                }
            }
            else
            {
                var bcp = bcpd.BcPoints.FirstOrDefault(s => s.Id == mfv);
                if (bcp != null)
                {
                    bcd.SetFieldValue(vf, bcp.Value);
                    if (bcd.GetFieldValue<BCD, DateTime?>(tf) == null)
                        bcd.SetFieldValue(tf, dtime);

                }
            }
        }
    
        BcPointData GetNewestBcPoint()
        {
            BcPointData result = new BcPointData();
            var ls = GetCalData("POINT", 3);
            if (ls == null)
            {
                Logger.Log.For(null).Error("24小時內無BCP.Point演算資料");
                throw new Exception($"POINT 演算資料不存在!!");
            }
            if(ls.Time != null)
            {
                result.Time = ls.Time.Value;
                result.BcPoints =  ls.Datas.Select(s=>new BcPoint
                {
                    Id = s.First(),
                    Name = s.ElementAt(1),
                    Value = Convert.ToDouble(s.ElementAt(2))
                } ).ToList();
            }
            return result;
        }


        #endregion

        #region 寶珠溝斷面資料
        static object lockGetBCSectionInfo = new object();
        [Route("section/rt")]
        public BCSectionData GetBCSectionInfo()
        {
            string key = "~GetBCSectionInfo~";
            lock (lockGetBCSectionInfo)
            {

                BCSectionData result = DouHelper.Misc.GetCache<BCSectionData>(10*1000, key);
                if (result == null)
                {
                    List<BCSectionBase> bcbs = DeserializeJsonObject<List<BCSectionBase>>("斷面基本資料.json");
                    result = new BCSectionData();

                    result.Top = bcbs.Select(b => new Section { DX= b.DX, Value = b.TOPEL, Type = b.Type, Mark = b.Mark }).ToList();
                    result.Bed = bcbs.Select(b => new Section { DX = b.DX, Value = b.BEDEL, Type= b.Type, Mark=b.Mark}).ToList();
                    result.Rt = GetCalSection("SECTION.RT", ref result);
                    result.H1 = GetCalSection("SECTION.1H", ref result);
                    result.H2 = GetCalSection("SECTION.2H", ref result);

                    DouHelper.Misc.AddCache(result, key);
                }
                return result;
            }
        }
        List<Section> GetCalSection(string type,ref BCSectionData bsd )
        {
            List<Section> r = new List<Section>();
            var ls = GetCalData(type, 2);
            if (ls != null && ls.Time != null)
            {
                bsd.Time = ls.Time.Value;
                ls.Datas.RemoveAt(0);
                r = ls.Datas.Select(s => new Section { DX = Convert.ToInt32(s.First()), Value = Convert.ToDouble(s.ElementAt(1)) }).ToList();
            }
            return r;
        }
        #endregion

        #region 寶珠溝示範即時資料-設管科資料
        [Route("interception/info")]
        public List<InterceptionStation> GetInterceptionStationInfo()
        //public JToken GetInterceptionStationInfo()
        {
            int cachetime = 15000;
            var jas = (new DataController().GetJToken(Startup.AppSet.ks224, cachetime) as JArray).OrderByDescending(t => t.Value<DateTime>("locltime"));
            List<InterceptionStation> r = new List<InterceptionStation>();
            //寶珠溝監控站
            InterceptionStation s = new InterceptionStation { Id = "ks224", Name = "寶珠溝監控站", Desc = "寶珠溝監控站-孝順街505巷", MechanicalInfos = new List<MechanicalInfo>() };
            r.Add(s);
            //閘門
            for (var i = 1; i <= 3; i++)
            {
                var deg = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("00")}_DEG");
                var op = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("00")}_OP_ERROR");
                var info = deg;
                info.Name = $"{i}號閘門";
                
                if (op != null && deg.Time < op.Time && op.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = op.Time;
                }
                
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = deg.Value >= 5 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            //抽水站
            for (var i = 1; i <= 5; i++)
            {
                var nonow = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_ON_NOW");
                var ovel = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_OVEL");
                var info = nonow;
                info.Name = $"{i}號抽水站";
                
                if (ovel != null && nonow.Time < ovel.Time && ovel.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = ovel.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = nonow.Value == 1 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            MechanicalInfo temp = null;
            //寶珠溝中游水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01");
            temp.Name = "505巷內水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01_H");
            temp.Name = "505巷內H水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01_HH");
            temp.Name = "505巷內HH水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT02");
            temp.Name = "寶珠溝中游水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT02_H");
            temp.Name = "寶珠溝中游H水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT02_HH");
            temp.Name = "寶珠溝中游HH水位";
            s.MechanicalInfos.Add(temp);

            //十全監控站
            //api ks245_LEVEL_OUT01_H、ks245_LEVEL_OUT01_HH會有2筆
            jas = (new DataController().GetJToken(Startup.AppSet.ks245, cachetime) as JArray).OrderByDescending(t => t.Value<DateTime>("locltime"));
            s = new InterceptionStation { Id = "ks245", Name = "十全監控站", Desc = "十全監控站", MechanicalInfos = new List<MechanicalInfo>() };
            r.Add(s);
            //閘門
            for (var i = 1; i <= 1; i++)
            {
                var deg = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("00")}_DEG");
                var op = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("00")}_OP_ERROR");
                var info = deg;
                info.Name = $"{i}號閘門";
                if (op != null && deg.Time < op.Time && op.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = op.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = deg.Value >= 5 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            //抽水站
            for (var i = 1; i <= 2; i++)
            {
                var nonow = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_ON_NOW");
                var ovel = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_OVEL");
                var info = nonow;
                info.Name = $"{i}號抽水站";
                if (ovel != null && nonow.Time < ovel.Time && ovel.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = ovel.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = nonow.Value == 1 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01");
            temp.Name = "內水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01_H");
            temp.Name = "內水位H水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01_HH");
            temp.Name = "內水位HH水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT01");
            temp.Name = "外水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT01_H");
            temp.Name = "外水位H水位";
            s.MechanicalInfos.Add(temp);
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_OUT01_HH");
            temp.Name = "外水位HH水位";
            s.MechanicalInfos.Add(temp);

            //寶業里滯洪池
            jas = (new DataController().GetJToken(Startup.AppSet.ks31, cachetime) as JArray).OrderByDescending(t => t.Value<DateTime>("locltime"));
            s = new InterceptionStation { Id = "ks31", Name = "寶業里滯洪池", Desc = "寶業里滯洪池",Enabled = true, MechanicalInfos = new List<MechanicalInfo>() };
            r.Add(s);
            //閘門
            for (var i = 1; i <= 7; i++)
            {
                var deg = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("0")}_DEG");
                var op = FindMechanicalInfo(jas, $"{s.Id}_GATE{i.ToString("0")}_OP_ERROR");
                var info = deg;
                info.Name = $"{i}號閘門";
                if (op != null && deg.Time < op.Time && op.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = op.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = deg.Value >= 5 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            //抽水站
            for (var i = 1; i <= 3; i++)
            {
                var nonow = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("0")}_ON_NOW");
                var ovel = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("0")}_OVEL");
                var info = nonow;
                info.Name = $"{i}號抽水站";
                if (ovel != null && nonow.Time < ovel.Time && ovel.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = ovel.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = nonow.Value == 1 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            //義華路箱涵水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL06");
            temp.Name = "義華路箱涵水位";
            s.MechanicalInfos.Add(temp);
            //北池水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL07");
            temp.Name = "北池水位";
            s.MechanicalInfos.Add(temp);
            //南池水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL08");
            temp.Name = "南池水位";
            s.MechanicalInfos.Add(temp);
            //抽水站水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL01");
            temp.Name = "抽水站水位";
            s.MechanicalInfos.Add(temp);
            //褒揚東街引流箱涵肉水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL02");
            temp.Name = "褒揚東街引流箱涵肉水位";
            s.MechanicalInfos.Add(temp);
            //澄清路箱涵水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL04");
            temp.Name = "澄清路箱涵水位";
            s.MechanicalInfos.Add(temp);
            //文衡路箱涵水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL05");
            temp.Name = "文衡路箱涵水位";
            s.MechanicalInfos.Add(temp);

            //德山街抽水站
            jas = (new DataController().GetJToken(Startup.AppSet.ks245ds, cachetime) as JArray).OrderByDescending(t => t.Value<DateTime>("locltime"));
            s = new InterceptionStation { Id = "ks245DS", Name = "德山街抽水站", Desc = "德山街抽水站", Enabled=true, MechanicalInfos = new List<MechanicalInfo>() };
            r.Add(s);
            //抽水站
            for (var i = 1; i <= 2; i++)
            {
                var nonow = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_ON_NOW");
                var ovel = FindMechanicalInfo(jas, $"{s.Id}_PUMP{i.ToString("00")}_OVEL");
                var info = nonow;
                info.Name = $"{i}號抽水站";
                if (ovel != null && nonow.Time < ovel.Time && ovel.Value == 1)
                {
                    info.Status = MechanicalInfoStatus.Error;
                    info.Time = ovel.Time;
                }
                if (info.Status != MechanicalInfoStatus.Error)
                    info.Status = nonow.Value == 1 ? MechanicalInfoStatus.Open : MechanicalInfoStatus.Close;
                s.MechanicalInfos.Add(info);

            }
            //德山街內水位
            temp = FindMechanicalInfo(jas, $"{s.Id}_LEVEL_IN01");
            temp.Name = "德山街內水位";
            s.MechanicalInfos.Add(temp);
           
            return r;
        }
        MechanicalInfo FindMechanicalInfo(IEnumerable<JToken> jarray, string no)
        {
            var jt = jarray.FirstOrDefault(t => t.Value<string>("tag_no") == no);
            MechanicalInfo r = new MechanicalInfo { Id = no };
            if (jt != null)
            {
                r.Value = jt.Value<double?>("value");
                r.Time = jt.Value<DateTime>("locltime");
                if(r.Value == null)
                    Debug.WriteLine(no+":null");
            }
            else
                Debug.WriteLine(no+"no field");
            return r;
        }
        #endregion

        #region 方法
        T DeserializeJsonObject<T>(string fn)
        {
            T r = DouHelper.Misc.GetCache<T>(10 * 1000, fn);
            if (r == null)
            {
                r= JsonConvert.DeserializeObject<T>(File.ReadAllText(System.IO.Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Data")), fn)));
                DouHelper.Misc.AddCache(r, fn);
            }
            return r;
        }

        CalData GetCalData(string type, int? columncount)
        {
            DateTime n = DateTime.Now;
            n = Convert.ToDateTime(n.ToString("yyyy/MM/dd HH:mm").Substring(0, 15) + "0:00");
            CalData result = null;
            while (result == null)
            {
                try
                {
                    using (WebClient wc = new WebClient())
                    {
                        string url =Startup.AppSet.OUTSWMM+$"{n.Year}/{n.Month.ToString("00")}/{n.Day.ToString("00")}/{n.ToString("yyyyMMdd.HHmm")}.BC.{type}.txt";
                        var stream = wc.OpenRead(url);
                        using (StreamReader sr = new StreamReader(stream, System.Text.Encoding.GetEncoding("big5")))
                        {
                            result = new CalData { Time = n, Datas = new List<List<string>>() };
                            string l = null;
                            while ((l = sr.ReadLine()) != null)
                            {
                                var ds = l.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                                if (columncount != null && ds.Length != columncount)
                                    continue;
                                result.Datas.Add(ds.ToList());
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
        #endregion
    }

    public class InterceptionStation
    {
        public InterceptionStation()
        {
            Enabled = true;
        }
        public string Name { set; get; }
        public string Id { set; get; }
        public string Desc { set; get; }
        public bool Enabled { set; get; }
        public List<MechanicalInfo> MechanicalInfos { set; get; }
    }
    public class MechanicalInfo
    {
        public MechanicalInfo()
        {
            this.Status = MechanicalInfoStatus.Other;
        }

        public string Id { set; get; }
        public string Name { set; get; }
        public DateTime Time { set; get; }
        public double? Value { set; get; }
        public MechanicalInfoStatus Status { set; get; } //0:異常，1:紅色(開啟)，2:綠色(關閉)
    }
    public enum MechanicalInfoStatus
    {
        Error = 1,      //異常
        Open = 2,       //紅色(開啟)
        Close = 3,      //綠色(關閉)
        Other = 999     //其他
    }

    public class BcPointData
    {
        public DateTime Time { get; set; }
        public List<BcPoint> BcPoints { set; get; }
    }
    public class BcPoint
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public double Value { get; set; }
    }

    public class BCD
    {
        //[JsonProperty("名稱")]
        public string Name { set; get; }
        //[JsonProperty("類型")]
        public string Type { set; get; }
        public DateTime? Time { set; get; }
        public double X { set; get; }
        public double Y { set; get; }
        //[JsonProperty("即時水位")]
        public double? Rt { set; get; }
        public string RtMap { set; get; }
        //[JsonProperty("未來1H預報水位")]
        public double? F1H { set; get; }
        public string F1HMap { set; get; }
        //[JsonProperty("警戒")]
        public double? Warn { set; get; }
        //[JsonProperty("堤頂/路面高")]
        public double? Top { set; get; }
    }
    public class BCSectionBase
    {
        public int DX { get; set; }
        public double TOPEL { get; set; }
        public double BEDEL { get; set; }
        public string Type { get; set; }
        public string Mark { get; set; }
    }
    public class BCSectionData
    {
        public DateTime Time { set; get; }
        public List<Section> Top { set; get; }
        public List<Section> Bed { set; get; }
        public List<Section> Rt { set; get; }
        public List<Section> H1 { set; get; }
        public List<Section> H2 { set; get; }
    }
    public class Section
    {
        public int DX { set; get; }
        public double Value { set; get; }
        public string Type { get; set; }
        public string Mark { get; set; }
    }

    public class CalData {
        public DateTime? Time { set; get; }
        public List<List<string>> Datas;
    }
    public class Sop
    {
        public Sop()
        {
            Parameters = new List<SopParameter>();
        }
        public string Id { get; set; }
        public string Name { get; set; }
        public double X { set; get; }
        public double Y { set; get; }
        public bool OperateSop { set; get; }
        internal List<SopParameter> Parameters { set; get; }
        public SopSituation Situation { get; set; }
    }
    public class SopSituation {
        public SopSituation()
        {
            Conditions = new List<SopSitCondition>();
        }
        public string Name { get; set; }
        public string Desc { get; set; }
        public string Operate { get; set; }

        public List<SopSitCondition> Conditions { get; set; }
     }
    public class SopSitCondition
    {
        public SopSitCondition()
        {
            Map = new List<SopParameter>();
        }
       public List<SopParameter> Map { get; set; }
    }
    public class SopParameter
    {
        public string Name { get; set; }
        public string Desc { get; set; }
        public double Value { get; set; }
        public double? Ge { set; get; }
        public double? G { set; get; }
        public double? Le { set; get; }
        public double? L { set; get; }
    }
}
