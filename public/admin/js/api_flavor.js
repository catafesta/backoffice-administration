function requestInterceptor(RestangularProvider) {

    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {

        if (operation == "getList") {
            // custom pagination params

            params._start = (params._page - 1) * params._perPage;
            params._end = params._page * params._perPage;
            delete params._page;
            delete params._perPage;

            // custom sort params
            if (params._sortField) {
                params._orderBy = params._sortField;
                params._orderDir = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }

            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }

        return { params: params };
    });
}

export default { requestInterceptor }
