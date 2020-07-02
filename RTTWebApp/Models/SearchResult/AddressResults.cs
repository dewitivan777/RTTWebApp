using System.Collections.Generic;
using RTTWebApp.ServiceUser;

namespace RTTWebApp.Models.SearchResult
{
    public class AddressResults
    {
        public IEnumerable<UserAddressDetails> Addresses { get; set; }
        public long Total { get; set; }
    }
}