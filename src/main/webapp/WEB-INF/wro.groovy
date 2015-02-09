groups {
    controllers {
        js(minimize: false, "/js/controller/*.js")
    }
    services {
        js(minimize: false, "/js/service/*.js")
    }
    all {
        controllers()
        services()
    }
}