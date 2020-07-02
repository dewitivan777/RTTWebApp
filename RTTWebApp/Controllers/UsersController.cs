using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using RTTWebApp.Models.SearchResult;
using RTTWebApp.ServiceUser;

namespace RTTWebApp.Controllers
{
    public class UsersController : Controller
    {
        ServiceUserClient userService = new ServiceUserClient();

        // GET: Users
        public async Task<ViewResult> Index()
        {
            return View();
        }

        //Search
        public async Task<JsonResult> Search(UserSearchQuery model)
        {
            var result = new UserResults();
            try
            {
                var response = await userService.GetAllAsync(model);
                result.Users = response.Users;
                result.Total = response.Total;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        //Create: User
        [HttpPost]
        public async Task<ActionResult> Create(UserDetails Model)
        {
            var results = new ServerResponse();

            try
            {
                results = await userService.InsertUserDetailsAsync(Model);
            }
            catch (FaultException ex)
            {
                var arr = ex.Message.Split('\n').ToArray();

                if (arr[0].Contains("validation errors"))
                {
                    arr = arr.Skip(2).ToArray();

                    foreach (var error in arr)
                    {
                        if (!string.IsNullOrWhiteSpace(error.Trim()))
                        {
                            var key = error.Split(' ')[1];

                            ModelState.AddModelError(key, error.TrimEnd());
                        }
                    }

                    TempData["UserErrors"] = ModelState;
                    return new HttpStatusCodeResult(422, "Validation Errors.");
                }
                else
                {
                    return Json(results, JsonRequestBehavior.AllowGet);
                }
            }

            return Json(results, JsonRequestBehavior.AllowGet);
        }

        //Edit: User
        [HttpPost]
        public async Task<ActionResult> Edit(UserDetails Model)
        {
            var results = new ServerResponse();

            try
            {
                results = await userService.UpdateAsync(Model);
            }
            catch (FaultException ex)
            {
                var arr = ex.Message.Split('\n').ToArray();

                if (arr[0].Contains("validation errors"))
                {
                    arr = arr.Skip(2).ToArray();

                    foreach (var error in arr)
                    {
                        if (!string.IsNullOrWhiteSpace(error.Trim()))
                        {
                            var key = error.Split(' ')[1].TrimEnd('.');

                            ModelState.AddModelError(key, error.TrimEnd());
                        }
                    }

                    TempData["UserErrors"] = ModelState;
                    return new HttpStatusCodeResult(422, "Validation Errors.");
                }
                else
                {
                    return Json(results, JsonRequestBehavior.AllowGet);
                }
            }

            return Json(results, JsonRequestBehavior.AllowGet);
        }

        //Fetch form validation errors
        public async Task<ActionResult> FetchErrors()
        {
            var errorStateDictionary = TempData["UserErrors"] as ModelStateDictionary;
            var model = new Dictionary<string, string>();

            foreach (var key in errorStateDictionary.Keys)
            {
                if (errorStateDictionary[key].Errors.Any())
                {
                    //Only display first error for element
                    model.Add(key, errorStateDictionary[key].Errors[0].ErrorMessage);
                }
            }

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        //Delete: User
        [HttpPost]
        public async Task<JsonResult> Delete(string Id)
        {
            var results = new ServerResponse();
            try
            {
                results = await userService.DeleteAsync(Id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Json(results);
        }

        //ExportCSV
        public async Task<JsonResult> ExportUsers()
        {
            var response = await userService.GetAllExportDetailsAsync();

            var dt = response.ExportTable;

            var sb = new StringBuilder();

            foreach (DataColumn col in dt.Columns)
            {
                sb.Append(col.ColumnName + ',');
            }

            sb.Remove(sb.Length - 1, 1);
            sb.Append(Environment.NewLine);

            foreach (DataRow row in dt.Rows)
            {
                for (int i = 0; i < dt.Columns.Count; i++)
                {
                    sb.Append(row[i].ToString().Replace(",", "") + ",");
                }

                sb.Append(Environment.NewLine);
            }

            string id = Guid.NewGuid().ToString();
            string filename = $"users-address-export-{string.Format("{0:yyyy-MM-dd}", DateTime.Today)}.csv";

            var myString = sb.ToString();
            var myByteArray = System.Text.Encoding.UTF8.GetBytes(myString);
            var ms = new MemoryStream(myByteArray);

            ms.Position = 0;
            TempData[id] = ms.ToArray();

            return Json(new
            {
                id,
                filename
            });

        }

        public virtual ActionResult GetUserExport(string id, string filename)
        {
            if (TempData[id] != null)
            {
                byte[] data = TempData[id] as byte[];
                try
                {
                    return File(data, "text/csv", filename);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }
            else
            {
                // if we are here, an an error has occurred
                return new EmptyResult();
            }
        }
    }
}