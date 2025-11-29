---
layout: post.njk
title: "Handling date strings and timezones in JavaScript"
date: 2021-02-15
excerpt: "Vanilla JavaScript doesn't have very good date/time handling. Here's one approach to dealing with dates/times in vanilla JS."
tags: ["post", "software-engineering", "javascript"]
permalink: /handling-date-strings-and-timezones-in-javascript/
---
Here is a simple scenario: you're writing client-side JavaScript. You query an API with a city name, and it returns with a bunch of useful information about the city, including the timezone, in this format:

```json
{
    "city": "New York",
    "timezone": -18000,
}
```

You want to use this information to display the local date and time in that city, as a string that looks something like this:

`Thu, 11 Feb 2021, 1:08 am`

How do you do this?

New York City's timezone is Eastern Standard Time, or UTC-05:00. The API gives us this information in the form -18000, or 18000 seconds behind [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) (UTC). (We're not going to worry about Daylight Savings Time, and we'll simply assume that the API is going to give us the correct time offset in seconds when DST kicks in.)

We need to find some way of representing time in seconds, or in something that can be converted to and from seconds. Then we need to turn that number into a string.

This is a good time to explain how computers represent dates and times.

### Timestamps explained

We take timekeeping for granted in 2021, but there's a lot of maths and science and engineering that goes into keeping track of time. (Don't believe me? Check out Jack Forster's [amazing article on horology's Easter problem](https://www.hodinkee.com/articles/patek-philippe-caliber-89-easter-problem), or his equally riveting read on [modern chronometer watches](https://www.hodinkee.com/articles/accuracy-the-modern-chronometer-watch-and-how-it-got-that-way).) Fortunately, for our purposes, we can operate at a fairly high level of abstraction, and we don't have to get into the nitty-gritty of timekeeping.

Broadly speaking, we need two things to keep track of time: first, we need a point in time that we can use as a reference, and secondly, we need to be able to count the time elapsed since that reference time.

The good news is that where computers are concerned, counting elapsed time isn't a concern. Computers can count milliseconds to a high degree to accuracy — after all, your computer has a [clock generator](https://en.wikipedia.org/wiki/Clock_generator) in it that oscillates billions of times a second (i.e at a frequency of several gigahertz, or whatever your processor's clock speed is). All that remains is to know what time computers are counting from.

Enter the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time): 1 January 1970, 0:00:00:000 UTC.

In most programming languages, objects and classes that handle date and time manipulation will represent the time as a timestamp, or the number of seconds that have passed since the Unix epoch. (Because of [leap seconds](https://en.wikipedia.org/wiki/Leap_second), that's [not strictly true](https://en.wikipedia.org/wiki/Unix_time#Leap_seconds), but we can ignore that corner case.)

For example, as I write this on Thursday, 11 Feb 2021 at 2:08 pm at UTC+08:00, the current Unix timestamp is `1613023705`.

### Human-readable dates and times

Computers are very good at counting large numbers, but humans are not. We need to turn the timestamp into something meaningful for humans. This is where [JavaScript's `Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) comes in useful: we can [create a new `Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date) by passing in a timestamp, then we'll have access to a whole host of `Date` methods, including `toString()` and `toLocaleString()`, which help us convert the `Date` object to human-readable strings.

Let's try it:
```js
const date = new Date(1613023705);
console.log(date.toString());
```

On my machine, this prints `Mon Jan 19 1970 23:33:43 GMT+0730 (Singapore Standard Time)`. On yours, it might print a different number, depending on what timezone you are in. In any case, it's clearly the incorrect time. **What happened?**

As it turns out, JavaScript timestamps are _not_ calculated as the number of **seconds** since 1 Jan 1970 0:00:00:000 UTC, but as the number of **milliseconds** since that time. We'll need to multiply our timestamp by 1000:

```js
const correctDate = new Date(1613023705 * 1000);
console.log(correctDate.toString());
```

This prints out `Thu Feb 11 2021 14:08:25 GMT+0800 (Singapore Standard Time)` on my machine.

### Timestamps and timezones

All right, we're one step closer, but we need to somehow convert the time from GMT+08:00 to UTC-05:00.

Computer timestamps based on an epoch are always in UTC, with no timezone offset. This makes sense: the number of seconds that have passed at the Greenwich Meridian since midnight of 1 January 1970 _is the same no matter where in the world you are_.

Manipulating time is as gnarly in JavaScript as it is in actual time travel, however. MDN's documentation for `Date` gives us the following innocuous warning:

> Note: It's important to keep in mind that while the time value at the heart of a Date object is UTC, the basic methods to fetch the date and time or its components all work in the local (i.e. host system) time zone and offset.

So your date is stored in UTC, but most of the `Date` methods will return results in the runtime's local time zone (UTC+08:00 in my case), and you need to output date and time in a third time zone (UTC-05:00, in our example). Great.

Looking down the list of `Date` methods, what do we have at our disposal? [`toString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toString) will always return a date and time string based on the runtime's time zone, so that's out. [`toUTCString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString) will always return a date and time string based on UTC, so that's out too.

[`toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) accepts an `options` argument that lets you set the `timeZone` property — this could be useful to us. How do we specify the timezone we need? MDN helpfully points us to the documentation for the [`Intl.DateTimeFormat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) constructor, which has a list of all the options that we can give to `toLocaleString()` for date and time formatting. Scroll down to `timeZone`, and let's see what we have:

> `timeZone`: The time zone to use. The only value implementations must recognize is "`UTC`"; the default is the runtime's default time zone. Implementations may also recognize the time zone names of the [IANA time zone database](https://www.iana.org/time-zones), such as "`Asia/Shanghai`", "`Asia/Kolkata`", "`America/New_York`".

How can we convert `{ city: "New York", timezone: -18000 }` into `America/New_York` to pass as an argument to `toLocaleString()`? We could use a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and map the number of seconds offset to one of the IANA time zones...

```js
const timeZones = new Map();
timeZones.set(-39600, 'Pacific/Niue');
timeZones.set(-36000, 'Pacific/Honolulu');
// etc...
```

You still need to be careful when choosing the timezones, because the IANA time zones take [daylight savings](https://en.wikipedia.org/wiki/Daylight_saving_time) into account. For example, imagine you had a `Map` that looked like this:
```js
// etc...
timeZones.set(-21600, 'America/Chicago');
timeZones.set(-18000, 'America/New_York');
// etc...
```

If you queried the city of Chicago during daylight savings time, the API might respond with a time offset of `-18000`. That corresponds to the timezone of `America/New_York` in your Map. `toLocaleString()` then applies _New York's_ daylight savings time offset, which is `-14400` instead of `-18000`.

Or we could avoid IANA time zones altogether, and just math instead.

### Detour: Do Not Do This

At this point, you might spot the [`getUTCHours()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCHours) and [`setUTCHours()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setUTCHours) methods. `getUTCHours()` returns an integer between `0` and `23`, representing the hour in UTC time in your `Date` object. For the `correctDate` `Date` object that we've been playing with, `getUTCHours()` returns `6`, since it is 6 am in Greenwich, London when it is 2 pm in Singapore.

`setUTCHours()` takes one argument, an integer between `0` and `23`, and updates the hour in UTC in your `Date` object.

"Aha!" you might think. "Let's calculate how many hours we need to add or subtract, and use `setUTCHours()` to manually offset the time! Then let's print using `toUTCString()`, so we don't have to worry about the user's timezone!"

```js
const correctDate = new Date(1613023705 * 1000);
const targetTimezone = -18000; // or whatever number the API returns
const offsetHours = targetTimezone / 3600;
const utcHours = correctDate.getUTCHours();
correctDate.setUTCHours(utcHours + offsetHours);
correctDate.toUTCString();
```

This gives us `Thu Feb 11 2021 01:08:25 GMT`. Of course, GMT is the incorrect timezone, but we'll have to live with it. We can easily truncate the GMT timezone out of the string if we don't need it, or replace it with the correct timezone. Perfect solution!

Wrong.

Leaving aside UTC offsets that are not a full hour (e.g. Iran at UTC+03:30, India at UTC+05:30, Nepal at UTC+05:45), the first problem you run into is when `utcHours + offsetHours` is less than `0` or more than `23`. No big deal, we can just check for those cases, right?

```js
let localHours = utcHours + offsetHours;
if (localHours < 0) localHours += 24;
if (localHours > 23) localHours -= 24;
correctDate.setUTCHours(localHours);
```

Now you're in trouble, because we don't just want to display the local time, we also want to display the local _date_, and now your `Date` object is _one day ahead of or one day behind the actual local date_.

Go ahead, try it with an offset that's big enough to trigger this problem:

```js
const correctDate = new Date(1613023705 * 1000);
const targetTimezone = -36000; // or whatever number the API returns
const offsetHours = targetTimezone / 3600;
const utcHours = correctDate.getUTCHours();
let localHours = utcHours + offsetHours;
if (localHours < 0) localHours += 24;
if (localHours > 23) localHours -= 24;
correctDate.setUTCHours(localHours);
correctDate.toUTCString();
```

This returns `Thu, 11 Feb 2021 20:08:25 GMT`, which is one day _ahead_ of the actual date in Honolulu based on the timestamp that we provided to the `Date` object.

There's a better solution along these lines, which is to apply the offset directly to the timestamp.

### Moving through time instead of space

Let's start over, but this time instead of trying to manipulate a `Date` object's timezone, let's just give the `Date` object a different timestamp altogether:

```js
const date = new Date((1613023705 - 18000) * 1000);
console.log(date.toUTCString());
```

Here, we're applying the offset of `-18000` directly to the timestamp, then creating a `Date` object out of it. Calling `toUTCString()` on this `Date` object gives us `Thu, 11 Feb 2021 01:08:25 GMT`. Now we have the correct date and time, but the incorrect timezone. If you don't need to display the timezone, you can truncate the timezone if you're okay with the format of `toUTCString()`, or use `toLocaleString('en-GB', { timeZone: 'UTC' })` and specify [your own set of formatting options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat).

I must admit that this solution is not very satisfying, because of the fact that conceptually, this is not the "correct" use of the UNIX timestamp or of timezones. We aren't moving through timezones, we're actually moving through UTC time itself. Ideally, we would be able to store both the timestamp _and_ our desired time offset in a single `Date` object, or we would be able to give `toLocaleString()` the time offset that we want in an alternative format (like... oh, I don't know, the number of milliseconds?) instead of in the form of IANA time zones.

Nonetheless, if your goal is to display the time in a specific time zone that isn't dependent on the user's local time, this is a workable solution. I'd love to hear of any alternatives in vanilla JS.
