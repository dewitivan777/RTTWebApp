function userViewModel() {
    var self = this;

    self['Users'] = ko.observableArray([]);

    self['Exporting'] = ko.observable(false);

    self['userId'] = ko.observable("");
    self['firstName'] = ko.observable("");
    self['surName'] = ko.observable("");
    self['dOB'] = ko.observable("");
    self['gender'] = ko.observable("");
    self['mobile'] = ko.observable("");
    self['workMobile'] = ko.observable("");
    self['email'] = ko.observable("");

    self.FirstPage = 1;
    self['Total'] = ko.observable(20);
    self['Limit'] = ko.observable(20);
    self['Query'] = ko.observable('?');
    self['CurrentPage'] = ko.observable(1);
    self['NextPageResultsLoading'] = ko.observable(false);
    self['HeaderText'] = ko.observable("Users");

    self.SearchBaseUri = '/users/search';

    self['Search'] = function() {
        var sb = [];
        $('input,select').each(function (i, e) {
            var value = $(e).val().trim();
            if (value && value != 'Any') {
                var name = $(e).attr('name');

                if (name == 'Limit') return;

                if (name == 'Cell') {
                    sb.push('should=cell:' + value + ';tel:' + value);
                } else if (name == 'ReportingSource' && value == 'Junk Mail') {
                    sb.push('reportingSource=Web|Android');
                }
                else {
                    sb.push(camelize($(e).attr('name')) + '=' + value);
                }
            }
        });
        self.Query(sb.join('&'));

        if (self['CurrentPage']() != 1) {
            self.SetCurrentPage(self.FirstPage);
        } else {
            var requestUri = self.SearchBaseUri + '?limit=' + self['Limit']();
            if (self.Query()) {
                requestUri += '&' + self.Query();
            }

            $.get(requestUri, function (data) {
                self['Users'](data.Users);
                self['Total'](data.Total);
                self['SetHeaderText'](data.Total);
            });
        }
    };

    self.CreateUser = function (page) {
        var data = new FormData();

        $('#CreateUserForm input,select').each(function(i, e) {
            var value = $(e).val().trim();

            data.append($(e).attr('name'), value);
        });

        $.ajax({
            'url': '/Users/Create',
            'data': data,
            'processData': false,
            'contentType': false,
            'type': "POST",
            'beforeSend': function () {
                $('#ajax-loader').css("visibility", "visible");
            },
            'success': function (result) {
 
            },
            'error': function (result) {
            },
            'complete': function () {
                $('#ajax-loader').css("visibility", "hidden");
            }
        });
    };

    self.NumberOfPages = ko.pureComputed(function () {
        return Math.ceil(self['Total']() / self['Limit']());
    });

    self.SetCurrentPage = function (page) {
        if (page < self.FirstPage) {
            page = self.FirstPage;
        } else if (page > self.NumberOfPages()) {
            page = self.NumberOfPages();
        }

        var offset = (page - 1) * self['Limit'](), pagination = '?limit=' + self['Limit']() + '&offset=' + offset;

        var requestUri = self.SearchBaseUri + pagination;
        if (self.Query()) {
            requestUri += '&' + self.Query();
        }

        $.get(requestUri, function (data) {
            self['Users'](data.entities);
            self['Total'](data.total);
            self['CurrentPage'](page);
            self['SetHeaderText'](data.total);
            self['NextPageResultsLoading'](true);
        });
    };

    self.PreviousPage = ko.pureComputed(function () {
        var previousPage = self['CurrentPage']() - 1;
        if (previousPage < self.FirstPage)
            return null;
        return previousPage;
    });

    self.NextPage = ko.pureComputed(function () {
        var nextPage = self['CurrentPage']() + 1;
        if (nextPage > self.NumberOfPages())
            return null;
        return nextPage;
    });

    self['ShowPagingControl'] = ko.pureComputed(function () {
        return self.NumberOfPages() > 1;
    });

    self['HasPrevious'] = ko.pureComputed(function () {
        return self.PreviousPage() != null;
    });

    self['HasNext'] = ko.pureComputed(function () {
        return self.NextPage() != null;
    });

    self['FirstPageActive'] = ko.pureComputed(function () {
        return self.FirstPage == self['CurrentPage']();
    });

    self['GoToFirstPage'] = function () {
        self.SetCurrentPage(self.FirstPage);
    };

    self['GoToPreviousPage'] = function () {
        var previousPage = self.PreviousPage();
        if (previousPage != null) {
            self.SetCurrentPage(previousPage);
        }
    };

    self['GoToNextPage'] = function () {
        var nextPage = self.NextPage();
        if (nextPage != null)
            self.SetCurrentPage(nextPage);
    };

    self['GoToPage'] = function (page) {
        if (page >= self.FirstPage && page <= self.NumberOfPages()) {
            self.SetCurrentPage(page);
        }
    };

    self['Pages'] = ko.pureComputed(function () {
        var pages = [];

        for (var page = self['CurrentPage']() - self.MaxPageLookAhead; page <= self['CurrentPage']() + self.MaxPageLookAhead; page++) {
            if (page < 1) continue;
            if (page > self.NumberOfPages()) break;
            pages.push(page);
        }

        return pages;
    });

    self['ExportXLSX'] = function () {
        if (!self['Exporting']()) {
            self['Exporting'](true);
            var requestUri = self.Query();
            $.post('/users/exportxlsx', { 'requestUri': requestUri }, function (result) {
                self['Exporting'](false);
                var exportUri = '/users/getuserexport?id=' + result.id + '&filename=' + result.filename;
                var link = document.createElement("a");
                if (link.download !== undefined) {
                    link.setAttribute("href", exportUri);
                    link.setAttribute("download", result.filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            })['fail'](function () {
                self['Exporting'](false);
            });
        }
    };

    self['OnExport'] = ko.pureComputed(function () {
        if (self['Exporting']()) {
            return '<i class="fa fa-refresh fa-spin"></i> Exporting...';
        } else {
            return '<i class="fa fa-share-square-o"></i> Export'
        }
    });

    self['SetHeaderText'] = function (total) {
        var headerText = '';
        if (total == 0) {
            headerText = '0 to 0 of 0 Users';
        } else {
            var limit = parseInt(self['Limit'](), 10);
            var fromUser = (self['CurrentPage']() - 1) * limit + 1;
            var toUser = fromUser + limit - 1;

            if (toUser > total) {
                toUser = total;
            }

            if (self['ShowPagingControl']()) {
                headerText = 'Page ' + self['CurrentPage']() + ': ' + fromUser + ' to ' + toUser + ' of ' + total + ' Users';
            } else {
                headerText = fromUser + ' to ' + toUser + ' of ' + total + ' Users';
            }
        }

        self['HeaderText'](headerText);
    };
};


(function () {
    var vm = new userViewModel();
    ko.applyBindings(vm);

    vm['Search']();
})();

//Camel case field names for api compatibility
function camelize(str) {
    if (str != undefined) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }
}