using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using RTTWebApp.Models.SearchResult;
using RTTWebApp.ServiceUser;

namespace RTTWebApp.Controllers
{
    public class AddressController : Controller
    {
        ServiceUserClient userService = new ServiceUserClient();

        // GET: Address
        public ActionResult Index()
        {
            return View();
        }

        //Search
        public async Task<JsonResult> Search(AddressSearchQuery model)
        {
            var result = new AddressResults();
            try
            {
                var response = await userService.GetAllAddressAsync(model);
                result.Addresses = response.Addresses;
                result.Total = response.Total;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        //Create: Address
        [HttpPost]
        public async Task<ActionResult> Create(UserAddressDetails Model)
        {
            var results = new ServerResponse();

            try
            {
                results = await userService.InsertUserAddressAsync(Model);
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

                    TempData["AddressErrors"] = ModelState;
                    return new HttpStatusCodeResult(422, "Validation Errors.");
                }
                else
                {
                    return Json(results, JsonRequestBehavior.AllowGet);
                }
            }

            return Json(results, JsonRequestBehavior.AllowGet);
        }

        //Edit: Address
        [HttpPost]
        public async Task<ActionResult> Edit(UserAddressDetails Model)
        {
            var results = new ServerResponse();

            try
            {
                results = await userService.UpdateAddressAsync(Model);
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

                    TempData["AddressErrors"] = ModelState;
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
            var errorStateDictionary = TempData["AddressErrors"] as ModelStateDictionary;
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

        //Delete: Address
        [HttpPost]
        public async Task<JsonResult> Delete(string Id)
        {
            var results = new ServerResponse();
            try
            {
                results = await userService.DeleteAddressAsync(Id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Json(results);
        }
    }
}