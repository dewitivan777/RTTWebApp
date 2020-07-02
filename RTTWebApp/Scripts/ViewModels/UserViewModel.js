function userViewModel() {
    var self = this;

    self['Users'] = ko.observableArray([]);

    self['Exporting'] = ko.observable(false);

    self['userId'] = ko.observable("");
    self['firstName'] = ko.observable("");
    self['surname'] = ko.observable("");
    self['dOB'] = ko.observable("");
    self['gender'] = ko.observable("");
    self['mobile'] = ko.observable("");
    self['workMobile'] = ko.observable("");
    self['email'] = ko.observable("");
    self['datecreated'] = ko.observable("");
    self['dateupdated'] = ko.observable("");

    self['errorList'] = ko.observableArray([]);

    self.FirstPage = 1;
    self['Total'] = ko.observable(20);
    self['Limit'] = ko.observable(10);
    self['Query'] = ko.observable('?');
    self['CurrentPage'] = ko.observable(1);
    self['NextPageResultsLoading'] = ko.observable(false);
    self['HeaderText'] = ko.observable();

    self.SearchBaseUri = '/users/search';

    self['Search'] = function (initialQuery) {
        var sb = [];
        $('input,select').each(function (i, e) {
            var value = $(e).val().trim();
            if (value && value != 'Any') {
                var name = $(e).attr('name');

                if (name == 'Limit') return;

                if (name == 'Mobile') {
                    sb.push('mobile=' + value + '&workMobile=' + value);
                }
                else {
                    sb.push("UserQuery." + camelize($(e).attr('name')) + '=' + value);
                }
            }
        });
        self.Query(sb.join('&'));

        if (initialQuery != undefined && typeof initialQuery == 'string') {
            self.Query(self.Query() + initialQuery);
        }

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

        $('#CreateUserForm input,select').each(function (i, e) {
            //Remove error Messages
            if ($(e).next('span').find('span').length) {
                $(e).next('span').find('span').remove();
            }

            var value = $(e).val().trim();
            if (value.length) {
                data.append($(e).attr('name'), value);
            }
        });

        $.ajax({
            'url': '/Users/Create',
            'data': data,
            'processData': false,
            'contentType': false,
            'type': "POST",
            'beforeSend': function () {
                $('.loading').show();
            },
            'success': function (result) {
                if (result.Success == true) {
                    popup.showNotification("Notice", "User successfully created.", "top", "left", 3000, "true");
                } else {
                    popup.showNotification("Notice", "User creation failed.", "top", "left", 3000, "true");
                }
                $("#CreateUser").modal('toggle');
            },
            'error': function (result) {
                if (result.status == 422) {
                    $.get('/Users/FetchErrors', function (data) {
                        var errorList = {};
                        $.each(data, function (errorField, errorMessage) {
                            errorList[errorField] = errorMessage;
                        });

                        $('#CreateUserForm input,select').each(function (i, e) {
                            if (e.name in errorList) {
                                $(e).next('span').append('<span id="Error">' + errorList[e.name] + '</span>');
                            }
                        });
                    });
                } else {
                    popup.showNotification("Notice", "User creation failed.", "top", "left", 3000, "true");
                }
            },
            'complete': function () {
                $('.loading').hide();
            }
        });
    };

    self.EditUser = function (page) {
        var data = new FormData();

        $('#EditUserForm input,select').each(function (i, e) {
            //Remove error Messages
            if ($(e).next('span').find('span').length) {
                $(e).next('span').find('span').remove();
            }

            var value = $(e).val().trim();
            if (value.length) {
                data.append($(e).attr('name'), value);
            }
        });

        //Add UserId to form data
        data.append("UserId", self['userId']());

        $.ajax({
            'url': '/Users/Edit',
            'data': data,
            'processData': false,
            'contentType': false,
            'type': "POST",
            'beforeSend': function () {
                $('.loading').show();
            },
            'success': function (result) {
                if (result.Success == true) {
                    popup.showNotification("Notice", "User successfully Edited.", "top", "left", 3000, "true");
                } else {
                    popup.showNotification("Notice", "User edit failed.", "top", "left", 3000, "true");
                }

                $("#EditUser").modal('toggle');
            },
            'error': function (result) {
                if (result.status == 422) {
                    $.get('/Users/FetchErrors', function (data) {
                        var errorList = {};
                        $.each(data, function (errorField, errorMessage) {
                            errorList[errorField] = errorMessage;
                        });

                        $('#EditUserForm input,select').each(function (i, e) {
                            if (e.name in errorList) {
                                $(e).next('span').append('<span id="Error">' + errorList[e.name] + '</span>');
                            }
                        });
                    });
                } else {
                    popup.showNotification("Notice", "User edit failed.", "top", "left", 3000, "true");
                }
            },
            'complete': function () {
                $('.loading').hide();
            }
        });
    };

    self.CreateAddress = function (page) {
        var data = new FormData();
        $('#CreateAddressForm input,select,textarea').each(function (i, e) {
            if ($(e).next('span').find('span').length) {
                $(e).next('span').find('span').remove();
            }
            var value = $(e).val().trim();
            if (value.length) {
                data.append($(e).attr('name'), value);
            }
        });
        //Add UserId to form data
        data.append("UserId", self['userId']());

        $.ajax({
            'url': '/Address/Create',
            'data': data,
            'processData': false,
            'contentType': false,
            'type': "POST",
            'beforeSend': function () {
                $('.loading').show();
            },
            'success': function (result) {
                if (result.Success == true) {
                    popup.showNotification("Notice", "Address successfully Added.", "top", "left", 3000, "true");
                } else {
                    popup.showNotification("Notice", "Address creation failed.", "top", "left", 3000, "true");
                }

                $("#CreateAddress").modal('toggle');
            },
            'error': function (result) {
                if (result.status == 422) {
                    $.get('/Address/FetchErrors', function (data) {
                        var errorList = {};
                        $.each(data, function (errorField, errorMessage) {
                            errorList[errorField] = errorMessage;
                        });

                        $('#CreateAddressForm input,select,textarea').each(function (i, e) {
                            if (e.name in errorList) {
                                $(e).next('span').append('<span id="Error">' + errorList[e.name] + '</span>');
                            }
                        });
                    });
                } else {
                    popup.showNotification("Notice", "Address creation failed.", "top", "left", 3000, "true");
                }
            },
            'complete': function () {
                $('.loading').hide();
            }
        });
    };

    self['deleteUser'] = function () {
        $.ajax({
            'type': "POST",
            'url': '/Users/Delete',
            'data': 'Id=' + self['userId'](),
            'success': function (result) {
                if (result.Success == true) {
                    location.reload();
                } else {
                }
            },
            'error': function () {
            }
        });
    };

    self['showEditDialog'] = function (
        userid,
        firstname,
        surname,
        gender,
        dob,
        email,
        mobile,
        workmobile,
        datecreated,
        dateupdated) {

        self['userId'](userid);
        self['firstName'](firstname);
        self['surname'](surname);
        self['gender'](gender);
        self['dOB'](dob);
        self['mobile'](mobile);
        self['workMobile'](workmobile);
        self['email'](email);
        self['datecreated'](datecreated);
        self['dateupdated'](dateupdated);
    };

    self['showDeleteDialog'] = function (
        userid,
        firstname,
        surname) {
        self['userId'](userid);
        self['firstName'](firstname);
        self['surname'](surname);
    };

    self['showAddressDialog'] = function (
        userid) {
        self['userId'](userid);
    };

    self['convertToJsDate'] = function (date) {
        if (date !== null) {
            if (date.length > 0) {
                var newDate = new Date(parseInt(date.substr(6)));
                var month = newDate.getMonth() + 1;
                var day = newDate.getDate();
                var year = newDate.getFullYear();
                return day + "/" + month + "/" + year;
            }
        }
        return date;
    }

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
            self['Users'](data.Users);
            self['Total'](data.Total);
            self['CurrentPage'](page);
            self['SetHeaderText'](data.Total);
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

    self['ExportUsers'] = function () {
        if (!self['Exporting']()) {
            self['Exporting'](true);
            var requestUri = self.Query();
            $.post('/users/exportusers', { 'requestUri': requestUri }, function (result) {
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

    if (location.search.length) {
        vm['Search'](location.search.replace("?", ""));
    } else {
        vm['Search']();
    }
})();

//Camel case field names for api compatibility
function camelize(str) {
    if (str != undefined) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }
}