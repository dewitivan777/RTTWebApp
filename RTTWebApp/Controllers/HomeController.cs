using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNetCore.Mvc;

namespace RTTWebApp.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ViewResult> Index()
        {
            return View();
        }
    }
}