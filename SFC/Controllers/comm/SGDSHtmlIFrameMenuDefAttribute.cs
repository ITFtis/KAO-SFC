using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Controllers.comm
{
    public class SFCHtmlIFrameMenuDefAttribute: HtmlIFrameMenuDefAttribute
    {
        string _Url = null;
        public override string Url { 
            set
            {
                if (_Url == null)
                {
                    if (value.IndexOf("http") >= 0)
                    {
                        _Url = value;
                    }
                    else
                    {
                        var rurl = HttpContext.Current.Request.Url;
                        if (rurl.Host.Equals("127.0.0.1") || rurl.Host.Equals("localhost"))
                            _Url = "https://www.dprcflood.org.tw/SFC/" + value;
                        else
                            _Url = rurl.Scheme + "://" + rurl.Host + "/SFC/" + value;
                    }
                }
            }
            get
            {
                return _Url;
            }
        }
    }
}