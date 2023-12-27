using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace SFC
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute( //一定要在Default前，會造成Menu /DeviceReliableDailyF變成ReliableMonth
                 name: "DeviceReliableMonth",                                           // Route name
                 url: "ReliableMonth",                            // URL with parameters
                 defaults: new { controller = "DeviceReliableMonthF", action = "IFrame", id = UrlParameter.Optional }
             );
            routes.MapRoute( //一定要在Default前，會造成Menu /DeviceReliableDailyF變成ReliableDaily
                 name: "DeviceReliableDaily",                                           // Route name
                 url: "ReliableDaily",                            // URL with parameters
                 defaults: new { controller = "DeviceReliableDailyF", action = "IFrame", id = UrlParameter.Optional }
             );
            //routes.MapRoute( //一定要在Default前，會造成Menu /DeviceReliableDailyF變成ReliableDaily
            //    name: "F3DSData",                                           // Route name
            //    url: "F3DS/Data/Scene",                            // URL with parameters
            //    defaults: new { controller = "F3DS", action = "Scene", id = UrlParameter.Optional }
            //);
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "RtHydro", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
