---
layout: post.njk
title: "Thinking About Test Frameworks"
date: 2022-01-04
excerpt: "What does a minimum viable test framework look like? Part 2 of 2."
tags: post
permalink: /thinking-about-test-frameworks/
---
Yesterday, [I wrote a post](/thinking-about-testing) about why and how to write tests, inspired by my most recent project. The gist of it is that the key purpose of automated tests is to provide fast feedback. I ended the previous post with a remark that **the need for fast feedback is the reason test frameworks exist.**

You've used a test framework, but how much do you understand what it's doing? I know that before this social impact project, I had no clue. On this project, we were working in a game engine that, to the best of our knowledge, does not have a testing framework in its ecosystem. One of the things that our team explored over the course of the project, and which we eventually did, was to build a test framework.

### Evolving towards a test framework

(The idea behind this progression is shamelessly adapted from the first part of [Kent C. Dodd's Assert.js workshop](https://www.youtube.com/watch?v=VQZx1Z3sW0E). If not for this video, I don't think I would have dared to contemplate writing a test framework at all, but he demystified the process and made it so accessible. Thanks Kent!)

Beginning with [my definition of a test](/thinking-about-testing) (not Kent's):

> A test is a bit of code that, when run, tells you something about whether some other part of your code (the _subject under test_) is working as intended.

In my [previous post](/thinking-about-testing), I laid out the key pieces of information that the developer needs to be able to identify quickly, in order to understand what their tests are telling them:

- How many tests ran?
- How many tests passed?
- How many tests failed?
- Which tests failed?
  - What was the expected result?
  - What is the actual result?
  - Which line of code is the immediate cause of test failure?
    - If in doubt: What is the stack trace?

Let's now write a single test, the simplest test that fulfills these conditions.

### Writing one test

Let's say I need to write a function that converts inches to millimeters. For the rest of this post, I'll conveniently ignore the question of "how many tests ran?", and concern ourselves with the other pieces of information. If we want to determine if the subject under test is working as intended, we first need to define what "working as intended" means. In this case, let's say we want to convert 10 inches to millimeters:

```js
const testConvertInchesToMillimeters = () => {
  const expected = 25.4;
  const actual = convertInchesToMillimeters(10);

  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
};
```

This test prints `Passed` if it passes. If it fails, it prints out the expected result and the actual result.

"Wait a second," you might be thinking, "you said there should be a third piece of information given for test failures. Which line of code caused the test failure?"

I'll get there. Now, let's write the code to pass the test:

```js
const convertInchesToMillimeters = (inches) => inches * 2.54;
```

You'll notice that the subject under test is just one line. If the test fails, there's only one line to look at!

In all seriousness, there's an important observation to be made here. If an exception is thrown while running the code under test and that exception is not caught, [Jest](https://jestjs.io/) will point it out to you, as will most other testing frameworks. In that case, you know exactly where the immediate failure is inside the code under test.

However, uncaught exceptions are the exception (ba-dum-tss). They're the one time the testing framework can tell you, _from within the subject under test_, where the test failed. That's not what happens the rest of the time, because otherwise the test and the subject under test are insulated from each other. The test does not know about its subject's implementation details (or at least, it shouldn't).

So what is that "which line of code is the immediate cause of test failure" stuff? I'll admit, I may have tried to be too pithy with that one-liner. If an exception is thrown and not caught, your test output should identify where that line of code is. On the other hand, **if a test result does not meet its expectation, your test output should tell you where in the test that failed expectation is.**

As a case in point, I wrote a test in Jest and made it fail. Look at the information Jest gives me:

![Image: Output from a failing test in Jest](/assets/images/2022-01-05-factorial-fail.png)
_Output from a failing test in Jest_

Jest shows the expected result, the received (actual) result, and the line in the test defining the expected behaviour that didn't happen. In other words, Jest points you to the line of code _in the test_ that defines this as a failed test.

That is something that our test still lacks. Of course, there's only one test and that test has only one "assertion", so let's add more.

### Adding a second test

Now, I'll add a function that converts kilograms to pounds. Again, I write the test first:

```js
const testConvertKilogramsToPounds = () => {
  const expected = 22.2;
  const actual = convertKilogramsToPounds(10);

  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
};

const convertKilogramsToPounds = (kilograms) => kilograms * 2;
```

(If you spot the error... shh, keep it quiet!)

Great. I make a test file, and in it, I call:

```js
testConvertInchesToMillimeters();
testConvertKilogramsToPounds();
```

Rather irresponsibly, I commit this without running my tests ("it's just a toy codebase"), push it, and go off to lunch.

Now my teammate pulls the repo, runs the test file, and sees:

```
Passed
Expected: 22.2
Actual: 20
```

It's only two tests, but we've started to run into problems. From the test output alone, my teammate doesn't know which test passed, which test failed, and where to find the expectation that failed. Of course, with two tests, you might be tempted to dismiss this as a contrived and trivial problem, but it doesn't take much imagination to see that at just 10, 15, 20 tests, the feedback loop will already start to slow down. There's not enough information to quickly identify and fix failing tests.

This form of automated testing doesn't scale well.

### Minimum Viable Test Framework: Which Test Failed?

There are two problems with the test output to be solved here. At a glance, we are unable to identify:

1. Which test failed?
2. Where did it fail?

Let's look at our two tests:

```js
const testConvertInchesToMillimeters = () => {
  const expected = 25.4;
  const actual = convertInchesToMillimeters(10);

  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
};

const testConvertKilogramsToPounds = () => {
  const expected = 22.2;
  const actual = convertKilogramsToPounds(10);

  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
};
```

We might be tempted to fix this problem by writing a `console.log("testNameHere")` at the top of each test function. Don't do it -- that way lies lots of copy and paste and madness.

Instead, let's think of the test from the object-oriented perspective. What properties does a `Test` object need to have? It needs to have a name or a description, so that we can quickly identify which tests passed or failed. It needs to have test code that we can run. There are other things we can add to our `Test` object, but this is the absolute minumum.

Having conceptualised the test as an object, I'm now going to do a 180 and write it as a function instead:

```js
const test = (name, testCode) => {
  console.log(name);
  testCode();
};
```

Now we use our new `test()` function to invoke our tests:

```js
test("convert inches to millimeters", () => {
  const expected = 25.4;
  const actual = convertInchesToMillimeters(10);

  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
});
```

If this is starting to look familiar, it should. The function signature for Jest's `test()` function is `test(name, fn, timeout)`, with `timeout` being optional. We're slowly evolving our way towards a test framework. We're not there yet, though: all our `test()` function does is print the name of the test before running it. The `test()` function doesn't know anything about whether `testCode()` passes or fails -- it doesn't know _anything_ about `testCode()`. How can the `testCode()` callback tell the `test()` function whether there was a test failure?

**By throwing an exception!**

Here we can take the opportunity to write an `assertEquals()` function and also keep our code DRY. We'll start by simply moving the comparison between the expected and actual values into its own function:

```js
const assertEquals = (expected, actual) => {
  if (actual === expected) {
    console.log("Passed");
  } else {
    console.log("Expected: ", expected);
    console.log("Actual: ", actual);
  }
};

test("convert inches to millimeters", () => {
  const expected = 25.4;
  const actual = convertInchesToMillimeters(10);

  assertEquals(expected, actual);
});
```

Next, we need to make `assertEquals()` throw an error if the expected and actual values are not equal:

```js
const assertEquals = (expected, actual) => {
  if (actual !== expected) {
    throw new Error(`Expected: ${expected}, actual: ${actual}\n`);
  }
};
```

Then, the `test()` function needs to catch any error thrown from inside `testCode()`:
```js
const test = (name, testCode) => {
  try {
    testCode();
    console.log(`PASSED: ${name}`);
  } catch (error) {
    console.log(`FAILED: ${name}`);
    console.log(error.message);
  }
};
```

I've taken the opportunity to move the "Passed" message from the assertion block to the `test()` function. The `assertEquals()` function has no idea which test it's running inside of, and it shouldn't be `assertEquals()`'s job to decide if a test has passed or not. Besides, there may be multiple `assertEquals()` inside one `test()`.

If the `testCode()` callback runs without throwing any exceptions, it passes. Otherwise, it fails. At this point, running our tests will produce this test output:

```
PASSED: convert inches to millimeters
FAILED: convert kilograms to pounds
Expected: 22.2, actual: 25.4
```

Now we know exactly which test failed. The next step is to identify _where_ it failed.

### Minimum Viable Test Framework: Where Did The Test Fail?

Our little test framework looks like this now:

```js
const assertEquals = (expected, actual) => {
  if (actual !== expected) {
    throw new Error(`Expected: ${expected}, actual: ${actual}\n`);
  }
};

const test = (name, testCode) => {
  try {
    testCode();
    console.log(`PASSED: ${name}`);
  } catch (error) {
    console.log(`FAILED: ${name}`);
    console.log(error.message);
  }
};
```

It turns out that the task of identifying which assertion caused the test to fail is much easier than putting a name on the failed test. We can simply print `error.stack` instead of `error.message`, and get the call stack at the point the error was thrown:

```js
const test = (name, testCode) => {
  try {
    testCode();
    console.log(`PASSED: ${name}`);
  } catch (error) {
    console.log(`FAILED: ${name}`);
    console.log(error.stack);
  }
};
```

Now our test output looks like this:

```
PASSED: convert inches to millimeters
FAILED: convert kilograms to pounds
Error: Expected: 22.2, actual: 20

    at assertEquals (~/foo.js:3:11)
    at ~/foo.js:31:3
```

This is all the information we need. It is arguably _too much_ information. I've already manually truncated the stack trace, but we still have two line numbers -- 3 and 31 -- and we only care about line 31 (line 3 is the `throw new Error()` line from inside the `assertEquals()` function).

Still, the refinement of the minimum viable test framework is an exercise that I will leave to the reader.

### Minimum Viable Test Framework: Next Steps

This is a good time to revisit the information that we care about when getting fast feedback from tests:

- How many tests ran?
- How many tests passed?
- How many tests failed?
- Which tests failed?
  - What was the expected result?
  - What is the actual result?
  - Which line of code is the immediate cause of test failure?
    - If in doubt: What is the stack trace?

We've made a lot of progress here in identifying which tests failed and how. This test framework still doesn't tell us how many tests ran, passed or failed, but I think for most developers, that's a challenge that's approachable enough that I won't cover it here.

If you wanted to extend this test framework, there are a lot of things you could do next. You might want to distinguish `AssertionError`s from other types of runtime errors. You might want to time how long the tests take to run. You might want to have the ability to group tests into test suites, and to run only specified test suites. You might want to create lifecycle methods that run at the start and end of each test or test suite. You might want implement mocking or stubbing.

Regardless, I think you'll agree that two of the biggest workhorses of any test framework are the `test()` and `assertEquals()` functions, or their equivalents in the framework of your choice. Hopefully, this post has given you some insight into the inner workings of test frameworks, and a deeper appreciation for how the best test frameworks seamlessly tighten the feedback loop in software development.
