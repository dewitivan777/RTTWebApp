using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using RTTWebApp.Models;
using RTTWebApp.Models.SearchResult;

namespace RTTWebApp.Controllers
{
    public class UsersController : Controller
    {
        // GET: Users
        public Task<ActionResult> Index()
        {
            var result = new UserSearch();

            return View(result);
        }


        public Task<ActionResult> Add(User Model)
        {
            var result = new UserSearch();

            return View(result);
        }

        public Task<ActionResult> Edit(User Model)
        {
            var result = new UserSearch();

            return View(result);
        }

        public Task<ActionResult> Delete(User Model)
        {
            var result = new UserSearch();

            return View(result);
        }
    }
}