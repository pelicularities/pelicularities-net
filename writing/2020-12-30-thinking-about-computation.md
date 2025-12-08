---
layout: post.njk
title: "Thinking About Computation"
date: 2020-12-30
excerpt: "Breaking out of tutorial hell by understanding how to move between different layers of abstraction."
tags: ["post", "abstraction"]
permalink: /thinking-about-computation/
---
In the beginning were zeroes and ones, and the zeroes and ones were with Boolean operators, and the zeroes and ones and Boolean operators were two-element Boolean algebra. All computation was made through Boolean algebra, and without Boolean algebra was not any computation made that was made. There is only so far I can take this strained analogy, before I start comparing Leibniz with John the Baptist.

Most of our interactions with computers these days happen at a very high level, in the sense that we don’t have to think too much about how a computer works. Our mental model of computation can be fairly abstract: I press a key on my keyboard, and the corresponding letter appears on my monitor. I drag a file on my desktop into a folder in my dock, and the file moves into the folder. I don’t have to think about how the switch under my left mouse button closes a circuit, how the mouse sends a signal to the operating system, how the operating system keeps track of the cursor’s position on the screen, or how the operating system knows which part of the disk drive to look for my file — I don’t have to think about any of that.

Web developers live in a world one level lower than most end users. We don’t have to live as close to the metal as developers working on embedded systems or operating systems, but we do have to understand how computers manipulate data. **Fundamentally, all computers do is accept an input, do stuff to that input, and produce an output.** (This is not _all_ of computing, of course — the craft of computing includes considerations like algorithmic efficiency, systems architecture, information security, and much more besides.) Different types of developers might work with different types of inputs or outputs, but at the end of the day, whether your input is a rotary dial, a webcam image or a user’s keystrokes, that’s all we are doing. We take inputs, manipulate them, and return an output to the user.

### Turtles All The Way Down

How close to the metal can we get? Obviously, when you get to the level of thinking about what’s inside the processor itself, you’re living in the world of logic gates and ones and zeroes. If you’re curious about what it really means when a computer runs on ones and zeros, there are two videos that I really like and recommend:

<iframe src="https://www.youtube.com/embed/gI-qXk7XojA?si=MFQQ9b_-8NBifox6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

[Carrie Anne Philbin](https://en.wikipedia.org/wiki/Carrie_Anne_Philbin) of [Crash Course Computer Science](https://thecrashcourse.com/topic/computerscience/) talks about how transistors can be used to perform Boolean operations.

<iframe src="https://www.youtube.com/embed/lNuPy-r1GuQ?si=gNa_VJGRRSpZPyNg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Matt Parker of [Stand-Up Maths](https://www.youtube.com/user/standupmaths) and [Numberphile](https://www.youtube.com/@numberphile) builds a binary calculator by constructing logic gates out of dominoes.

How does understanding binary addition at the level of a circuit help us to think about computation? This is where _abstraction_ comes in.

### The Abstraction Layer Cake

Think about when you first learned to ride a bicycle. Your instructor (a parent, a relative, a teacher) told you to keep your hands on the brakes at all times. They showed you how to mount the bike and lean it to the right, then to spin the crank on the left side into position. They held your handlebars or your saddle as they told you to push down on the pedal with your left foot, and push off the ground with your right. Then they yelled at you to put your right foot on the pedal as it came up, and to look ahead, not down, look ahead! Keep your head up and pedal! _Now you’re riding a bike._

If you bike regularly, you have all of this in muscle memory. Most of the time, you don’t have to remember to put your hands on the brakes, or to position the crank before you push off. When your riding buddy says “let’s go”, all of this happens all at once: the details of what it takes to ride a bicycle from a standing start have been _abstracted away_ in your brain.

Learning to write is another instructive example. A child first has to develop gross motor skills. How do I pick up a pencil? How do I move it around? Then the fine motor skills: how do I control the movement of a pencil on paper? After that comes learning the alphabet: how do I write the letter a, b, c? At some point, the child graduates from letters to words, then from words to sentences, then from sentences to paragraphs, then from paragraphs to essays. When a student has reached the essay-writing stage, they no longer have to think about what their hands are doing to produce shapes on paper. The writing of letters and words has become _abstract_.

This is what happens with computers as well. When you are working with logic gates, all you have are NOT, AND and OR gates. These gates take one or two inputs, and produce one output. Out of these three gates, you can create a XOR gate. With these four gates and some way to store bits in memory, you can do math, represent letters and numbers, or store a pixel’s colour information. Crash Course Computer Science has [an excellent video](https://www.youtube.com/watch?v=1GSjbWt0c9M) about how you can use bits to build primitive data types like integers, floats and chars.

Now we’re starting to approach a level of abstraction that most web developers recognise. I don’t know how C implements an integer _exactly_, but I know how to add integers together in C. I don’t know how JavaScript allocates memory for strings, but I know how to manipulate a string in JS. I don’t know which part of the spinning platter my text file is stored on, but Ruby’s Core Library has a File class that handles those details for me (and Ruby implements that File class using C, and…)

### Peeling Apart The Layers

I can’t speak for other developers, but here’s what I’m usually thinking about when I’m working on a problem.

If I know what the input and output types are, then there are three questions I’m trying to answer:

1. How is the input information represented?
2. What information in the input do I care about?
3. How do I manipulate this information into the type I need?

If I’m building a simple command-line application that asks the user for two numbers and adds them together, the answers might look like this:

1. I have two inputs and they are both strings.
2. I care about the numerical information that the strings contain.
3. I can probably typecast the strings into integers or floats, then add them together.

If I’m doing something a little more complex, like reading monthly sales data from a CSV file and totalling up sales for the year, the answers might look like this instead:

1. I have a CSV file, which the parser will parse into an array of arrays. Each element in each nested array is a string.
2. I need the number that’s inside the last element of each array.
3. I can use a [reduce function](https://en.wikipedia.org/wiki/Fold_%28higher-order_function%29) to sum the last elements of each array. When iterating through the arrays, I need to make sure that the last element of each array is typecast into a float before adding it to the accumulator.

I want to dwell on that last point a little bit. The `reduce` function was hard for me to grasp intuitively as a student, and I’ve found it to be challenging to explain to students as a TA. What was helpful for me was reading the documentation for `reduce` carefully and working through it step by step — in effect, I dropped down one layer of abstraction until I felt comfortable enough to return to the higher level of abstraction. It’s like doing long division or differentiation by hand, until you feel comfortable enough with the mechanics of it to use a calculator. If you use a calculator and get an unexpected result, do it by hand, and see how your mental model diverges from the implementation of the abstraction.

### The Law of Leaky Abstractions

In JavaScript, the largest integer that the Number type can store safely is 2<sup>53</sup>-1, or 9,007,199,254,740,991.

```js
console.log(9007199254740992 + 1);
// prints 9007199254740992
```

Why is that? The JavaScript Number type is a [64-bit floating point number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) that conforms to the [IEEE 754 standard](https://en.wikipedia.org/wiki/IEEE_754). That means that JavaScript uses 64 bits to store numbers in the form _m times 2<sup>n</sup>_. One bit is dedicated to the sign (positive or negative), 11 bits are dedicated to the _exponent_ _n_, and the remaining 52 bits are dedicated to the _mantissa_, or the _significand_, _m_. That means that the mantissa _m_ can never be larger than 2<sup>53</sup>-1. (Bonus question: Where does the extra bit come from?) If you want to store an integer larger than 2<sup>53</sup>-1 as a number in JavaScript, you can try — it’s just that JavaScript cannot store integers larger than 2<sup>53</sup>-1 with precision.

If you really want to peek under the hood, you can check out this [decimal to binary 64-bit floating point converter](https://binary-system.base-conversion.ro/convert-real-numbers-from-decimal-system-to-64bit-double-precision-IEEE754-binary-floating-point.php). This converter walks you through each step of converting a decimal number to a binary 64-bit float, and shows you the steps where you start to lose precision. I highly recommend trying this with the numbers 9007199254740991, 9007199254740992 and 9007199254740993, so you can see why JavaScript can store integers up to 9,007,199,254,740,991 but not one bit more.

This is a case of a [_leaky abstraction_](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/). A JavaScript developer typically does not need to think about how JavaScript represents integers in bits. For the overwhelming majority of use cases, JavaScript handles integer arithmetic just fine. However, when the abstraction _leaks_, when the abstraction doesn’t behave how we expect it to behave, that’s when the ability to drop down through the layers of abstraction and think about the moving parts one level down (or several, if need be) is critical.

### Whatever Goes Down Should Also Come Up

It’s 2020, and developers spend far more time learning frameworks than programming languages. Frameworks are a layer of abstraction on top of programming languages, and most of us think and work at that high level of abstraction, dropping down to lower levels of abstraction as needed to debug problems. As a junior-level developer, that’s probably where I spend the most time and how I learn most of what I know.

Another thing I do to sharpen my skills is solve katas on [Codewars](https://www.codewars.com/) and [Hackerrank](https://www.hackerrank.com/). Of course, just thinking through problems and writing code that passes the tests is a great way to learn and grow as a programmer. However, the biggest benefit of doing katas on these platforms is that I get to see how _other_ programmers approach the problem. I’ve often painstakingly worked my way through a problem in many lines of code, only find that more experienced programmers know of a built-in method or library that does the same thing in just a few lines.

For example, take a look at this portion of code I wrote for [this kata on Codewars](https://www.codewars.com/kata/55f5efd21ad2b48895000040/solutions/ruby):

```rb
numbers = (1000..nmax).to_a.select do |number|
    number_str = number.to_s
    number_digits = number_str.length
    (number_digits - 3).times do |first_index|
        four_digits = number_str[first_index, 4].chars.map { |char| char.to_i }.sum
        break false unless four_digits <= maxsm
        true
    end
end
```

Compare this with the portion of the top-rated solution that does the same thing:

```rb
arr = (1000..nmax).to_a.select{ |n| n.to_s.chars.map(&:to_i).each_cons(4).to_a.map{ |k| k.reduce(:+) }.max <= maxsm }
```

Why is my solution so much more laboured than the top-rated solution? Until I saw other programmers’ solutions, I had no idea that the [`each_cons`](https://ruby-doc.org/core-2.5.1/Enumerable.html#method-i-each_cons) method even existed, so I wrote my own loops to achieve the same result. Fortunately, someone smarter and wiser than I am has realised that these mechanics can be abstracted away, and already written a method to do it.

_(Note on 2023-12-28, with the benefit of three years of experience: Today, I would not hold up this snippet as a shining example of good code. Good for [code golf](https://en.wikipedia.org/wiki/Code_golf), not good for your co-workers.)_

I’ve learnt a lot about Ruby and JavaScript this way: this is how I learnt about the existence of the [Prime singleton class](https://ruby-doc.org/stdlib-2.5.1/libdoc/prime/rdoc/Prime.html) in Ruby, and it’s how I started to get the hang of `reduce`.

Thinking about computation doesn’t only involve being able to drill _down_ into the details, but also being able to move _up_ a level of abstraction to move faster and think more efficiently (and more abstractly) when it makes sense to do so. This also helps to keep code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and more easily maintainable, by allowing your fellow programmers to work at a higher level of abstraction instead of being bogged down in your implementation details.

### Implications for Novice Developers

There’s plenty of advice out there for junior developers, especially in the realm of how to break out of tutorial hell, where you can only do something by following a tutorial but you don’t know why it works — or worse, when you _can’t_ do something even when you follow the tutorial and you _don’t_ know why it doesn’t work.

My humble addition to this pool of advice is this: **get comfortable moving between different layers of abstraction**. Learn to love working in the weeds, learn what your tools are doing for you so that you can use them to the most efficient extent possible, and start getting a sense of what the right level of abstraction for each problem should be. This way, you’ll be able to break down problems into just the right-sized chunks for you to tackle with the set of tools you have, and you’ll slowly expand your toolbox to work with the layers of abstraction both above and below where you spend most of your time thinking about computation.
