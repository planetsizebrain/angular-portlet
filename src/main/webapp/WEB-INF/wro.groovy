groups {
    controllers {
        js(minimize: false, "/js/controller/Init.js")
        js(minimize: false, "/js/controller/*Controller.js")
    }
    services {
        js(minimize: false, "/js/service/Init.js")
        js(minimize: false, "/js/service/*Factory.js")
        js(minimize: false, "/js/service/ErrorMessageResolver.js")
    }
    directives {
        js(minimize: false, "/js/directive/Init.js")
        js(minimize: false, "/js/directive/*Directive.js")
    }
    all {
        controllers()
        services()
        directives()
    }
}