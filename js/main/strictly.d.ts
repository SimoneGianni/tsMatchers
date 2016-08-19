import { MatcherContainer, exactly } from './tsMatchers';
export interface StrictlyInterface extends MatcherContainer {
    equal: typeof exactly;
}
export interface OuterStrictly extends StrictlyInterface {
}
declare module './tsMatchers' {
    interface OuterIs {
        strictly: OuterStrictly;
    }
}
declare module './not' {
    interface NotInterface {
        strictly: OuterStrictly;
    }
}
