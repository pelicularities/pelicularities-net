---
layout: post.njk
title: "Python cheatsheet for Ruby devs"
date: 2021-01-18
excerpt: "Common operations translated from Ruby to Python."
tags: post
permalink: /python-cheatsheet-for-ruby-devs/
---
I cut my programming teeth at [Le Wagon](https://www.lewagon.com/), where the bulk of coding time is spent on Ruby. I've also started in the [Masters in Computer and Information Technology](https://onlinelearning.seas.upenn.edu/mcit/) program at Penn, where the teaching languages are Python and Java. Naturally, it's been a trip taking my Ruby cap off and putting a Python hat on. The Python hat isn't too comfortable yet, but I'm sure it'll break in as I get more Python under my fingers.

As I work more and more with Python, I've been putting together a mental cheatsheet for "translating" Ruby to Python, and it's time for me to take the cheatsheet out of my brain and put it into writing. I know I'm not the only programmer who has moved from Ruby to Python, so I hope others will find this useful. (But hey, even if nobody else finds it useful, it’s helpful for me to put this in writing!)

### Some basic stuff first

Integer and float division in Ruby:
```rb 
5 / 2 #=> returns 2
5 / 2.0 #=> returns 2.5
```

Integer and float division in Python:
```py
5 / 2 #=> returns 2.5
5 // 2 #=> returns 2
```

String interpolation in Ruby:
```rb
planet = 'world'
puts "Hello #{planet}!" #=> prints "Hello world!"
```

Formatted strings in Python:
```py
planet = 'world'
print(f'Hello {planet}!') #=> prints "Hello world!"
```

### String manipulation in Ruby and Python

#### Split a string into an array using a separator

Also known in PHP as [`explode()`](https://www.php.net/explode), still my favourite name for this operation.

Ruby:
```rb
'abracadabra'.split('a')
# returns ['', 'br', 'c', 'd', 'br']
```

Python:
```py
'abracadabra'.split('a')
# returns ['', 'br', 'c', 'd', 'br', '']
```

#### Split a string on whitespace

Ruby:
```rb
    'the quick brown fox'.split
    # returns ['the', 'quick', 'brown', 'fox']
```

Python:
```py
    'the quick brown fox'.split()
    # returns ['the', 'quick', 'brown', 'fox']
```

So far, so good.

#### Split a string using a regular expression

Ruby:
```rb
'a1b12c123d1234'.split(/\d+/)
# returns ['a', 'b', 'c', 'd']
```

You’ll probably be using Ruby’s built-in [`Regexp`](https://ruby-doc.org/core-2.6.6/Regexp.html) methods for complex operations involving regular expressions, but for splits on a simple regex, the [`String#split`](https://ruby-doc.org/core-2.6.6/String.html#method-i-split) method works just fine.

In Python, regular expression operations require the `re` module:
```py
import re
re.split(r'\d+', 'a1b12c123d1234')
# returns ['a', 'b', 'c', 'd', '']
```

#### Join array/list elements into a string

Also known in PHP as [`implode()`](https://www.php.net/implode), still my favourite name for this operation.

Ruby:
```rb
['the', 'quick', 'brown', 'fox'].join(' ')
# returns 'the quick brown fox'
```

Python:
```py
' '.join(['the', 'quick', 'brown', 'fox'])
# returns 'the quick brown fox'
```

🤯

In Ruby, `join` is a method [called on an array](https://ruby-doc.org/core-2.6.6/Array.html#method-i-join) taking a string as an argument. In Python, `join` is a method [called on a string](https://docs.python.org/3/library/stdtypes.html#str.join) taking a list (array) as an argument.

### Enumerable patterns and list comprehension

#### Quickly generate an array from a range

Ruby:
```rb
array = (1..5).to_a
# array = [1, 2, 3, 4, 5]
```

The literal “translation” of this in Python is:
```py
array = list(range(1, 6))
# array = [1, 2, 3, 4, 5]
```

However, to be a true Pythonista, you must use [list comprehension](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions) wherever list comprehension can be used:
```py
array = [i for i in range(1, 6)]
# array = [1, 2, 3, 4, 5]
```

#### Apply the same operation to all elements of an array

Ruby:
```rb
array = (1..5).to_a
squares = array.map { |i| i**2 }
# squares = [1, 4, 9, 16, 25]
```

Again, you can do this using a combination of `list()` and `map()` in Python:
```py
array = [i for i in range(1, 6)]
squares = list(map(lambda i: i**2, array))
# squares = [1, 4, 9, 16, 25]
```

Yuck. Instead, use [list comprehension](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions):
```py
array = [i for i in range(1, 6)]
squares = [i**2 for i in array]
# squares = [1, 4, 9, 16, 25]
```

#### Iterate over an array/a list with indices

Ruby:
```rb
array = ['Alice', 'Bob', 'Charlie']
array.each_with_index do |element, index|
    puts "Index #{index}: #{element}"
end
# prints the following:
# Index 0: Alice
# Index 1: Bob
# Index 2: Charlie
```

Python:
```py
list = ['Alice', 'Bob', 'Charlie']
for (index, element) in enumerate(list):
    print(f'Index {index}: {element}')
# prints the following:
# Index 0: Alice
# Index 1: Bob
# Index 2: Charlie
```

#### Iterate over a hash/a dictionary

Ruby:
```rb
hash = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
hash.each { |key, value| puts "#{key}: #{value}" }
# prints the following:
# Alice: 9
# Bob: 11
# Charlie: 14
```

Python:
```py
dict = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
for key, value in dict.items():
    print(f'{key}: {value}')
# prints the following:
# Alice: 9
# Bob: 11
# Charlie: 14
```

Let’s take a step back and see what happens if you iterate over `dict` instead of `dict.items()`. In that case, the for loop will iterate over the **keys only** :
```py
dict = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
for i in dict:
    print(i)
# prints the following:
# Alice
# Bob
# Charlie
```

You can still access the values using the key, of course:
```py
dict = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
for i in dict:
    print(f'{i}: {dict[i]}')
# prints the following:
# Alice: 9
# Bob: 11
# Charlie: 14
```

Iterating over a hash in Ruby, on the other hand, always returns an **array** of two elements per iteration, with the first element being the key and the second element being the value:

```rb
hash = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
hash.each do |i| 
    pp i
    puts "#{i[0]}: #{i[1]}"
end
# prints the following:
# [:Alice, 9]
# Alice: 9
# [:Bob, 11]
# Bob: 11
# [:Charlie, 14]
# Charlie: 14
```

With `dict.items()` in Python, what’s really happening is that `dict.items()` is returning a **tuple** of two elements per iteration, with the first element being the key and the second element being the value:
```py
dict = { 'Alice': 9, 'Bob': 11, 'Charlie': 14 }
for i in dict.items():
    print(i)
    print(f'{i[0]}: {i[1]}')
# prints the following:
# ('Alice', 9)
# Alice: 9
# ('Bob', 11)
# Bob: 11
# ('Charlie', 14)
# Charlie: 14
```

### Keyword arguments / last argument hash

[I'm not touching that hot potato.](https://discuss.rubyonrails.org/t/new-2-7-3-0-keyword-argument-pain-point/74980)

