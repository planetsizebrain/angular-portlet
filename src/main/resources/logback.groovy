appender("STDOUT", ConsoleAppender) {
    encoder(PatternLayoutEncoder) {
        pattern = "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{5} - %msg%n"
    }
}

logger("be.aca.liferay.angular.portlet", DEBUG)

root(INFO, ["STDOUT"])

