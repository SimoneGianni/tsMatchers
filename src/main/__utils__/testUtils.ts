import { assert, check, is, SomethingMatches } from "../tsMatchers";

export function checkMessage<T>(obj :T, matcher :SomethingMatches<T>, msg :RegExp) :any {
    return assert("Checking message", () => check(obj, matcher), is.throwing(msg));
}
