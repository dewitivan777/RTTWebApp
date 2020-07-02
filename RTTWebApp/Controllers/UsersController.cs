using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
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

        public async Task<JsonResult> Search(UserSearchQuery model)
        {
            var result = new UserResults();
            var response = await userService.GetAllAsync(model);

            result.Users = response;
            result.Total = response.Length;

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
        [HttpDelete]
        public async Task<JsonResult> Delete(string Id)
        {
            var results = await userService.DeleteAsync(Id);
            return Json(results);
        }

        //[HttpPost("ExportUserEventsXLSX")]
        //public async Task<IActionResult> ExportUserEventsXLSX(string requestUri, int offset = 0, int limit = 50000)
        //{
        //    requestUri = "?" + requestUri + "&limit=" + limit;
        //    var result = await userService.GetAllExportDetailsAsync();

        //    if (!result.ExportTable.HasErrors)
        //    {
        //        using (var exl = new ExcelPackage())
        //        {
        //            var worksheet = exl.Workbook.Worksheets.Add("user events");

        //            // headers
        //            worksheet.Cells[1, 1].Value = "Id";
        //            worksheet.Cells[1, 2].Value = "UserId";
        //            worksheet.Cells[1, 3].Value = "ActionedBy";
        //            worksheet.Cells[1, 4].Value = "EventDate";
        //            worksheet.Cells[1, 5].Value = "EventType";
        //            worksheet.Cells[1, 6].Value = "State";
        //            worksheet.Cells[1, 7].Value = "Package";

        //            // data
        //            int row = 2;
        //            int current = 0;
        //            while (!result.ExportTable.HasErrors && result.ExportTable.Rows.Count > current)
        //            {
        //                foreach (var user in result.ExportTable.Rows)
        //                {
        //                    //worksheet.Cells[row, 1].Value = user.Id;
        //                    //worksheet.Cells[row, 2].Value = user.UserId;
        //                    //worksheet.Cells[row, 3].Value = user.ActionedBy;
        //                    //worksheet.Cells[row, 4].Value = user.EventDate;
        //                    //worksheet.Cells[row, 5].Value = user.EventType;
        //                    //worksheet.Cells[row, 6].Value = user.State;
        //                    //worksheet.Cells[row, 7].Value = user.Package;

        //                    using (var range = worksheet.Cells[row, 1, row, 7])
        //                    {
        //                        range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        //                        range.Style.Border.Top.Color.SetColor(Color.FromArgb(141, 180, 226));
        //                        range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        //                        range.Style.Border.Bottom.Color.SetColor(Color.FromArgb(141, 180, 226));
        //                    }

        //                    row++;
        //                    current++;
        //                }

        //                // next
        //                if (result.Content.Total > limit + offset)
        //                {
        //                    current = 0;
        //                    offset += limit;
        //                    requestUri = requestUri.TrimEnd('?');
        //                }
        //            }

        //            using (var range = worksheet.Cells[1, 1, 1, 7])
        //            {
        //                range.Style.Font.Bold = true;
        //                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
        //                range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(79, 129, 189));
        //                range.Style.Font.Color.SetColor(Color.White);
        //            }

        //            if (row > 1)
        //            {
        //                worksheet.Cells[1, 1, 1, 7].AutoFilter = true;
        //                worksheet.Cells[2, 4, row, 4].Style.Numberformat.Format = "yyyy-MM-dd HH:mm";

        //                using (var range = worksheet.Cells[1, 1, row, 7])
        //                {
        //                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        //                    range.Style.Border.Left.Color.SetColor(Color.FromArgb(141, 180, 226));
        //                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
        //                    range.Style.Border.Right.Color.SetColor(Color.FromArgb(141, 180, 226));
        //                }
        //            }

        //            worksheet.Cells.AutoFitColumns(0);

        //            string id = Guid.NewGuid().ToString();
        //            string filename = $"user-events-export-{string.Format("{0:yyyy-MM-dd}", DateTime.Today)}.xlsx";

        //            using (MemoryStream memoryStream = new MemoryStream())
        //            {
        //                exl.SaveAs(memoryStream);
        //                memoryStream.Position = 0;
        //                TempData[id] = memoryStream.ToArray();
        //            }

        //            return Json(new
        //            {
        //                id,
        //                filename
        //            });
        //        }
        //    }

        //    return Json(new { });
        //}
    }
}