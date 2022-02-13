import { Filter } from './Filter.js';
export type Operator = (packet: object, parameters: unknown[]) => any;
const
    er = Filter.evaluateReduce,
    en = Filter.evaluateFilterNode,
    And: Operator = (packet, parameters) => er(parameters, packet, (a: any, b: any)=>a&&b),
    Nand: Operator = (n, p) => !And(n, p),
    Or: Operator = (packet, parameters) => er(parameters, packet, (a: any, b: any)=>a||b),
    Nor: Operator = (n, p) => !Or(n, p),
    Equals: Operator = (packet, parameters) => {
        const paramZero = en(packet, parameters.splice(0,1)[0]);
        for (let p of parameters)
            if(paramZero != en(packet, p))
                return !1;
        return !0;
    },
    Nequals: Operator = (n, p) => !Equals(n, p),
    Under: Operator = (packet, parameters) => {
        for (let p = 1; p < parameters.length; p++)
            if(en(packet, parameters[p-1])
                >= en(packet, parameters[p]))
                return !1;
        return !0;
    },
    Nunder: Operator = (n, p) => !Under(n, p),
    Add: Operator = (c, m) => er(m, c, (a: any, b: any)=>a+b),
    Sub: Operator = (c, m) => er(m, c, (a: any, b: any)=>a-b),
    Mul: Operator = (c, m) => er(m, c, (a: any, b: any)=>a*b),
    Div: Operator = (c, m) => er(m, c, (a: any, b: any)=>a/b),
    Exp: Operator = (c, m) => er(m, c, (a: any, b: any)=>a**b),
    Includes: Operator = (packet, parameters) => {
        const paramZero = en(packet, parameters.splice(0,1)[0]);
        for (let p of parameters)
            if(paramZero.includes(en(packet, p)))
                return !1;
        return !0;
    };

export const Operators = { And, Nand, Or, Nor, Equals, Nequals, Under, Nunder, Add, Sub, Mul, Div, Exp, Includes };