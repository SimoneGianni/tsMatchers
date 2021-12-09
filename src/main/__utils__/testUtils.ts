import { assert, check, is, Matcher, MatcherFactory } from "../tsMatchers";

export function checkMessage<T>(obj :T, matcher :T|Matcher<T>|MatcherFactory<T>, msg :RegExp) :any {
    return assert("Checking message", () => check(obj, matcher), is.throwing(msg));
}
