type MaybeSuccess<T> = "Success"|ErrorType<T>
type MaybeSuccess_ = "Success"|Error

export class ErrorType<T> implements Error {
    private m_errorType:T
    private m_error:Error
    constructor(value:T, message:string) {
        this.m_error = new Error(message);
        this.m_errorType = value;
    }
    get name():string { return this.m_error.name};
    get message():string { return this.m_error.message};
    get stack():string|undefined { return this.m_error.stack};

    get errorType():T { return this.m_errorType};
}

export namespace MaybeSuccess {
    function and<T>(l:MaybeSuccess<T>, r:MaybeSuccess<T>) : MaybeSuccess<T> {
        if (l != "Success") {
            return l
        }
        if (r != "Success") {
            return r
        }
        return l;
    }

    function prod<T>(list:MaybeSuccess<T>[]) {
        return list.reduce((x,y) => and(x,y))
    }

    function or<T>(l:MaybeSuccess<T>, r:MaybeSuccess<T>) : MaybeSuccess<T> {
        if (l == "Success") {
            return l
        }
        if (r == "Success") {
            return r
        }
        return l;
    } 
}

export function curry2<T1,T2,R>(f:(t1:T1,t2:T2)=>R):(t1:T1)=>(t2:T2)=>R {
    return (t1:T1) => {
        return (t2:T2) => {
            return f(t1,t2);
        }
    }
}

export type CPS<T> = (t:T) => void
export type Cont<T> = (c:CPS<T>) => void
export type ContFuncC<In,Out> = (inp:In) => ContClass<Out>
export type ContFunc<In,Out> = (inp:In) => Cont<Out>


export class ContClass<T> {
    private c:Cont<T>
    constructor(c:Cont<T>) {
        this.c = c;
    }

    static create<T>(t:T):ContClass<T> {
        const f = (c:CPS<T>) => {
            c(t);
        }
        return new ContClass<T>(f);
    }

    exec(comp:CPS<T>) {
        return this.c(comp);
    }

    bindC<Out>(af:ContFuncC<T,Out>):ContClass<Out> {
        const r:ContClass<Out> = new ContClass<Out>(((o:CPS<Out>) => {
            this.exec((t) => {
                af(t).exec(o);
            })
        }));
        return r;
    }

    bind<Out>(af:ContFunc<T,Out>):ContClass<Out> {
        const r:ContClass<Out> = new ContClass<Out>(((o:CPS<Out>) => {
            this.exec((t) => {
                af(t)(o);
            })
        }));
        return r;
    }
}

export interface TestContext {

}

export type TestResult = MaybeSuccess<Error>

export class Test {
    context:TestContext
    private tests:TestFunction[] = []
    public testResults:TestResult[] = []
    constructor(context:TestContext) {
        this.context = context
    }

    pushTest(t:TestFunction):Test {
        this.tests.push(t);
        return this;
    }

    execTest():ContClass<TestResult> {
        const testActions = this.tests.map((f) => transTestFunctToContFuncC(f));
        const testActionsAddResult = testActions.map((f) => {
            return (test:Test) => {
                return f(test).bindC((res) => {
                    test.testResults.push(res);
                    return ContClass.create<TestResult>(res);
                })
            }
        })
        const r = testActionsAddResult.reduce((pre, current, cuindex) => {
            return (test) => pre(test).bindC((res) => {
                return current(test);
            })
        })
        return r(this);
    }

}

export type TestFunction = (test:Test, comp:CPS<TestResult>) => void

function transTestFunctToContFunc(tf:TestFunction) : ContFunc<Test,TestResult> {
    return curry2(tf);
}

function transTestFunctToContFuncC(tf:TestFunction) : ContFuncC<Test,TestResult> {
    const f = transTestFunctToContFunc(tf);
    const rr =  (test:Test) => {
        const r =  new ContClass<TestResult>(f(test));
        return r;
    }
    return rr;
}


