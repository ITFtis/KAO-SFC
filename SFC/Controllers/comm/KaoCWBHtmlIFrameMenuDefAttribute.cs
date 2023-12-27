using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Controllers.comm
{
    public class KaoCWBHtmlIFrameMenuDefAttribute : HtmlIFrameMenuDefAttribute
    {
        string _Url = null;
        public override string Url
        {
            set
            {
                if (_Url == null)
                {
                    _Url = "https://wrbswi.kcg.gov.tw/"+value;

                }
            }
            get
            {
                return _Url;
            }
        }
    }
}