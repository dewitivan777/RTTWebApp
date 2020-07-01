using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Schema;
using RTTWebApp.ServiceUser;

namespace RTTWebApp.Models.SearchResult
{
    public class UserResults
    {
        public IEnumerable<UserDetails> Users { get; set; }
        public long Total { get; set; }
    }
}