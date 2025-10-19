---
layout: post.njk
title: "Thinking About Testing"
date: 2022-01-03
excerpt: "What is a test? Why write tests? How do you write tests? Part 1 of 2."
tags: post
permalink: /thinking-about-testing/
---
Over the course of my last project, I found myself examining many of my own implicit assumptions about testing. I'd like to explore some of them today and share what I've learned.

### What is a test?

This is a simple question, but the first time I heard it posed was a couple weeks ago, while watching Kent C. Dodd's Assert.js workshop from 2018:

<iframe class="video" src="https://www.youtube.com/embed/VQZx1Z3sW0E?start=1316&amp;feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
_Kent C. Dodds talks about testing software_

I was actually befuddled by this question, because I'd never thought about it! Up until mid December, the way I thought about tests was primarily in terms of frameworks and levels of the [test pyramid](https://martinfowler.com/bliki/TestPyramid.html).

My immediate response (since this was at a JavaScript conference) was "it's a thing you write in Jest, or Mocha, or some other test framework, to check if your code is working." The problem with this definition is that it's circular: What is Jest? Jest is a test framework. What is a test framework? It's a thing that helps you run tests. What is a test? A test is a thing you write in Jest or some other framework...

[Kent C. Dodds](https://kentcdodds.com/blog/but-really-what-is-a-javascript-test) defines a test like this:

> A test is code that throws an error when the actual result of something does not match the expected output.

Personally, I would go even further and argue that throwing an error is an implementation detail (although an extremely useful detail, as we'll see in the next blog post or two). **From a technical perspective, a test is simply a bit of code that, when run, tells you something about whether some other part of your code (the _subject under test_) is working as intended.**

This test code doesn't have to be run inside a test framework, it doesn't have to use an assertion library, it doesn't have to do any fancy things like calculate test coverage, take snapshots, or even print out a test summary.

The funny thing is, I knew this implicitly. I just finished the [Introduction to Computer Systems](https://www.seas.upenn.edu/~cit593/) class in my part-time degree program, and in our C programming assignments we were exhorted to write tests. And yet, in the course, there was no expectation that we would use a test framework or assertion library to do so (I don't think the words "test framework" or "assertion library" were ever uttered in the course).

So what did I do? During development, I stuck code like this directly in `main()`:

```c
// this...
// 1 is a pass, 0 is a fail
printf("%d\n", expected == actual);

// ... or this...
printf("Expected: %s\n", expected);
printf("Actual: %s\n", actual);

// ... or this!
if (actual != expected) {
  printf("ERROR!!!!!!!!!1!1!!11!!!\n");
  printf("Expected: %s\n", expected);
  printf("Actual: %s\n", actual);
}
```

Those were my tests, and because I never needed to run more than a few at any given time, this simple setup worked perfectly fine. Nothing we wrote in class was ever complicated enough for me to need more than a few `printf` statements. It doesn't take long, however, before this approach becomes unwieldy, even for simple command line applications.

This brings me to the next question: what is the purpose of writing tests?

### Why write tests?

The question "why test?" is a simple one to answer. We test software so that we know if it works the way it's supposed to.

The question "why write tests?" is not the same question as "why test?" It's a small but subtle difference: _writing tests_ implies automated testing against a specification, while "why test?" does not.

Sure, we often talk about automated testing as giving us confidence in our code – and yet, how often does code go into production without any manual testing whatsoever? _Rigorous testing in general_ is what gives us confidence in our code, and automated testing is just one dimension of that.

This means that writing tests requires an additional layer of justification. Test automation is not free: it costs developer time, as any stakeholder desperate to get the next release into production will tell you. A manual tester can do everything that an automated test can do, and a manual tester can also do many things that an automated test _cannot_ do.

So _why write tests_?

The purpose of writing tests is **to get fast feedback**. This is the principle that justifies the economic cost of writing tests. It's an investment of time that pays back dividends in the shorter time it takes to detect bugs, allowing developers not to lose context during debugging or refactoring, and freeing up developer and QA time for higher-value activities.

You know this, I know this, and we still struggle to convey the full impact that good test coverage has on development. We often frame writing tests as "providing confidence in our code", which is true, but as I mentioned above, automated testing is not the only way to be confident that our code performs to spec. The real reason for test automation is that this confidence can be provided _quickly_.

This is also the reason that the test pyramid looks the way it does, with unit tests forming the base and E2E tests at the top. If we have E2E or functional tests that mimic an entire user journey, why do we even need unit tests? After all, E2E tests are the tests that give us the greatest confidence that the application performs as expected – but E2E tests also impose a lot of overhead, have many potential points of failure, and take more time to run. We use unit tests _because unit tests give us faster feedback._

(An aside: if we want fast feedback, why do we run automated E2E tests, since they're slow? It's important to consider what E2E testing is, and what it's meant to be an alternative to. Unit tests and E2E tests are not substitutes for each other. Instead, E2E tests are meant to replace repetitive manual testing, and automated E2E tests definitely give faster feedback than a human. I should know – I used to be that human.)

The value of a test suite that can run in seconds rather than minutes is the difference between refactoring being tolerable or intolerable. If you have to wait three minutes every time you refactor something minor to confirm that your tests still pass, the refactoring is not going to happen. That's why fast tests are essential to any refactoring.

Understanding that we write tests to get fast feedback then helps us to frame how we go about writing our tests.

### How do you write tests?

This section isn't about the mechanics of writing tests. Instead, it's about what information you need from a test in order to extract fast feedback from it.

There are three aspects of getting fast feedback from a test:

1. How long does it take the test to run?
2. How long does it take to determine whether the test has passed?
3. How long does it take to determine why a test failed?

I'm going to skip over the first point, for the simple reason that it's trivially obvious that all else being equal, a faster test provides faster feedback. There's been plenty of ink spilled elsewhere about how to write fast tests, by people much smarter and with far more experience than me.

The second point also looks trivial. _What do you mean, how long does it take to determine whether the test has passed?_ I'll point you up to one of my wonderful C "tests":

```c
// this...
// 1 is a pass, 0 is a fail
printf("%d\n", expected == actual);
```

Imagine ten of these tests:

```
1
1
1
1
1
1
1
1
1
```

How quickly can you determine that all your tests have passed?

Count again: there are only 9 outputs, and none of them are `0`. Why? Which of the 10 failed silently?

This is an easy problem to solve: **don't write tests like this!** Make sure you can see at a glance whether a test passed or failed, _which_ test passed or failed, and how many tests were run. That's part of the answer to "how do you write tests?". You write them so that the most important information is reported most prominently:

- **How many tests ran, and did they all pass?**
  - If the answer to the second question is yes, these two pieces of information are all I need to know. Anything else is gravy.
  - Why do we care how many tests ran? If you expected 20 tests but only 15 of them ran, a 100% pass rate could be a false positive.
- **If there were failures, how many were there, and what were they?**

From this point, it's an easy jump to the third point: if a test fails, you want as much _relevant_ information as possible to determine why it failed – and nothing else.

The relevant pieces of information answer these questions:

1. What is the expected result?
2. What is the actual result?
3. Which line of code is the immediate cause of the test failure?
  - If in doubt: what is the stack trace?

The risk of adding more information into the test output (logging intermediate states, etc.) as a matter of routine is that it generally slows debugging down. Remember, the purpose of writing tests is to provide fast feedback. **Every additional piece of information that is not essential to debugging a failed test is noise,** and it will slow you down.

In order for a test to provide fast feedback, then, the test needs to:

1. Run fast (duh)
2. Clearly convey the most critical information about test passes and failures

That's how to write tests: write them in such a way that they fulfill their purpose of giving fast feedback. If you've only ever written tests in the context of test frameworks, none of this seems groundbreaking or meaningful, but that's probably because you're used to getting feedback from your tests so quickly you don't even have to think about what your test framework is doing for you.

### Next: thinking about test frameworks

This is the motivation behind a test framework. A test framework gives you the tools to quickly write repeatable, automated tests that give you fast feedback.

In my next post, I want to explore the parts that make up a test framework – a "minimum viable test framework", as it were.
