using SFC.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFC.Controllers.Manager
{
    // GET: User
    [Dou.Misc.Attr.MenuDef(Id ="User", Name = "使用者管理", MenuPath = "系統管理", Action = "Index", Func = Dou.Misc.Attr.FuncEnum.ALL, AllowAnonymous = false)]
    public class UserController : Dou.Controllers.UserBaseControll<User, Role>
    {
        // GET: User
        public ActionResult Index()
        {
            return View();
        }
       
        protected override Dou.Models.DB.IModelEntity<User> GetModelEntity()
        {
            return new Dou.Models.DB.ModelEntity<User>(RoleController._dbContext);
        }
        //https://fhy.wra.gov.tw/dmchyv2/Login.aspx?oauthServer=https%3A%2F%2Fcloud.wra.gov.tw&code=31363930373930393130383736&redirect_uri=https%3A%2F%2Ffhy.wra.gov.tw%2Fdmchyv2%2FLogin.aspx
    }

}