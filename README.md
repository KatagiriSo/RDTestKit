# RDTestKit

TypeScript unit test Kit

```ts
    import { Test, ContClass, TestResult, TestFunction, CPS, ErrorType } from "./RDTestKit";

function doUnitTest() {
    const test = new Test({});
    const t = doHogeTest(test);

    t.exec((r) => {
        console.log(r);
        console.log(test.testResults);
    })
}


function doHogeTest(test:Test):ContClass<TestResult> {

    const r =  test
                .pushTest(hogeTest)
                .pushTest(hogeTest2)
                .pushTest(hogeTest3)
                .pushTest(hogeTest4)
                .execTest()

    return r;
}






const hogeTest:TestFunction = (test:Test, comp:CPS<TestResult>):void => {
    console.log("hogeTest1");
    comp("Success")
}
const hogeTest2:TestFunction = (test:Test, comp:CPS<TestResult>):void => {
    console.log("hogeTest2");
    comp("Success")
}
const hogeTest3:TestFunction = (test:Test, comp:CPS<TestResult>):void => {
    console.log("hogeTest3");
    comp(new ErrorType<Error>(new Error("error!"), "error"))
}
const hogeTest4:TestFunction = (test:Test, comp:CPS<TestResult>):void => {
    console.log("hogeTest4");
    comp("Success")
}


//// test

doUnitTest()
```