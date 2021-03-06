import {MatcherContainer, isContainer, ContainerObj, exactly} from './tsMatchers';
import './not'; // Need this not to make declare module below to fail in .d.ts

export interface StrictlyInterface extends MatcherContainer {
    equal :typeof exactly;
}

export interface OuterStrictly extends StrictlyInterface {

}

var strictlyContainer = new ContainerObj();
isContainer.registerSub('strictly', strictlyContainer);
//var notStrictly = makeWrapper(strictly, (m)=>not(m));

// TODO these should not be here if wrappers could wrap wrappers
//registerWrapper(is.not, 'strictly', notStrictly);

//var strictly = <OuterStrictly><any>strictlyContainer;

strictlyContainer.registerMatcher('equal', exactly);

declare module './tsMatchers' {
    export interface OuterIs {
        strictly :OuterStrictly;
    }
}
declare module './not' {
    export interface NotInterface {
        strictly :OuterStrictly;
    }
}

