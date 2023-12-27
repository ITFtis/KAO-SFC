using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace SFC.Controllers
{
    public class HtmlIframeOtherMainLayoutController : Dou.Controllers.HtmlIFrameController
    {
        protected override void OnActionExecuting(ActionExecutingContext ctx)
        {
            base.OnActionExecuting(ctx);
            ctx.Result = View("HtmlIFramePartial");//, "OtherManLayout");
        }
        protected override IAsyncResult BeginExecute(RequestContext requestContext, AsyncCallback callback, object state)
        {
            return base.BeginExecute(requestContext, callback, state);
        }
        // GET: HtmlIframeOtherLauout
        public ActionResult Index()
        {
            return View();
        }
    }
}