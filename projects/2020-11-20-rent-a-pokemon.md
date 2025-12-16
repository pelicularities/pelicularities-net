---
layout: post.njk
title: "Le Wagon: Rent-a-Pokémon and Rent-a-Pokémon Redux"
date: 2020-11-20
excerpt: "Rent-a-Pokémon is a Le Wagon project that my team from batch #454 put together."
tags: 
  - project
  - le-wagon
permalink: /rent-a-pokemon/
---
_Now that [Heroku](https://www.heroku.com/) no longer has a free tier, the Rent-a-Pokemon demo is no longer online. You'll have to review the repo, the write-up and the screenshots._

- [Github Repo for Rent-a-Pokémon Redux](https://github.com/pelicularities/rent-a-pokemon-redux)
- [Github Repo for Rent-a-Pokémon](https://github.com/konfs/RentAPokemon)

### About Rent-a-Pokemon

At [Le Wagon](https://www.lewagon.com/), every student builds an Airbnb clone in five days as part of a team. The Airbnb project is the first time during the Le Wagon bootcamp when we work in groups and collaborate on code. Although it's universally referred to as the Airbnb project, the web application does not have to involve apartment rental at all, as long as it involves the creation of a two-sided marketplace (e.g. mentors and mentees, party hosts and guests…).

Our group chose to build the Minimum Viable Product of a service that allows users to put up their Pokémon for rent, or to rent other users' Pokémon.

Naturally, this project built on many of the skills we put into practice in [Mister Cocktail](/mister-cocktail):

- **Database design:** the database schema gets a bit more complex, with five models and more associations between models:

<figure>
  <img src="/assets/images/AQfSRzdLx.png">
  <figcaption>Schema design for Rent-a-Pokémon</figcaption>
</figure>

- **Data retrieval using an API:** we used the excellent [PokeAPI](https://pokeapi.co/) to populate our Pokédex models. For the sake of simplicity, we seeded only five species of Pokémon during development and 50 for our project demo. Don't worry, I rectified that in Rent-a-Pokémon Redux, with all 151 Generation I Pokémon in the seed.
- **RESTful routing:** not only did we have more RESTful routes to implement this time, but we had nested routes for the first time during our bootcamp:

```rb
resources :pokemons do
  resources :rentals, only: [:new, :create]
end
resources :rentals, only: [] do
  resources :reviews, only: [:new, :create]
end
```

There was one key aspect of building Rent-a-Pokémon that was new:

- **JavaScript plugins:** We covered the use of JavaScript plugins during our front-end development module prior to the project weeks, but this was the first time we used plugins (specifically [flatpickr](https://flatpickr.js.org/)) in a Rails project (other than the standard jQuery / Popper / Bootstrap JS combo). I was trying to figure out how to create a date picker for the rental page when our instructor sent us this article written by Sonia Montero, a Le Wagon instructor in Bali: [Date validation and flatpickr setup for Rails](https://medium.com/@sonia.montero/date-validations-and-flatpickr-setup-for-rails-24c78d6eb784). I write a little bit more about this below, under "A point of learning".

### Rent-a-Pokemon Redux

Post-bootcamp, I forked the [Rent-A-Pokémon repository](https://github.com/konfs/RentAPokemon) and continued working on it, with the goal of making the code cleaner and more maintainable, the layout more responsive, and fixing niggling bugs and finishing features that we did not get to in time during the week of the project itself.

The changes I made included:

- Cutting off [unhappy paths](https://en.wikipedia.org/wiki/Happy_path) by preventing invalid user input from being submitted to the server
- Displaying and giving ratings using stars instead of simply a number
- Making the website fully responsive on mobile devices
- Stripping out the CSS and rebuilding it from scratch

The last point is worth some elaboration. My teammates and I had put in a good amount of work to make the site look good, so why did I choose to throw out the CSS and start over? A big reason I opted to do that after reviewing the code was that we did not have a unified code style or approach to our front-end development. Everyone coded in the style that we each felt most comfortable with and fell back on habits that we'd developed before the project. One person would put headers inside the container, while another would put headers outside; some views utilised the Bootstrap grid while others did not; some components received custom styling while others defaulted to the basic Bootstrap class (or worse, were not styled at all).

Normally, in a team environment, code would be carefully reviewed for both function and style _before_ any pull requests were merged to the master branch. Being new to working collaboratively, however, we approved each other's pull requests as long as the feature was complete and there were no conflicts. Our product developed quickly, but we were accumulating a lot of unnecessary technical debt. When I returned to the project weeks later, I found myself lost and confused about where to start untangling. Stripping out the CSS and rewriting it from scratch allowed me to kill two birds with one stone: I could rebuild the design system, and at the same time make sure that the code was consistent throughout the web application.

Of course, this type of waste (as Scrum's Jeff Sutherland would term it) would be unacceptable in a professional setting. This is a lesson to be learnt once, in an educational context, and remembered in future workplaces.

### A point of learning

After we finished our Airbnb project and presented the demo to the class, I went home and showed my sister the Rent-a-Pokemon website on my phone. "Play around with it," I said. "Everything should be working fine."

Within minutes, she returned my phone to me with a big red ActiveController error page: she had managed to submit the rental form with an end date before the start date.

I was baffled. Our Rental model has a custom validation that prevents the rental from being created if the start date is after the end date, and this was the error that she had triggered. But before the dates even get sent to the server, the flatpickr code I'd copied from [Sonia's article](https://medium.com/@sonia.montero/date-validations-and-flatpickr-setup-for-rails-24c78d6eb784) was supposed to prevent the user from selecting an end date before the currently selected start date.

Here's how the date pickers are implemented:

1. There are two text fields, one for the start date and one for the end date.
2. The flatpickr date picker for the start date is initialised, with a predefined set of unavailable dates sent over by the Rails controller to the view, embedded as part of a HTML element's dataset and retrieved by JavaScript to be given to the flatpickr initializer.
3. The date picker for the end date is initially disabled. (To be more precise: the text input that contains the end date is disabled.)
4. When the user selects a start date, the text input for the end date is enabled and the flatpickr date picker for the end date is initialised, with a minimum date equal to the start date. This prevents the user from selecting an invalid end date.

However, it does not prevent the user from selecting a valid end date, _and then changing the value of the start date to an invalid date after the end date._ That was what my sister had done.

The fix is easy: add a validity check whenever the start date changes. If the new start date is after the end date, clear the end date input:

```js
const startDateInput = document.getElementById('rental_start_date');
const endDateInput = document.getElementById('rental_end_date');

const checkValidity = () => {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  if (Date.parse(endDate) - Date.parse(startDate) < 0) {
    endDateInput.value = "";
  }
}

startDateInput.addEventListener("change", (e) => {
  // if start date is after end date, clear existing end date
  checkValidity();
});
```

There are some obvious lessons to be learnt from this:

1. **Your product must hold up to real-life use.** User behaviour is unpredictable, but no user should be able to break your application within minutes of monkeying around. Test thoroughly and often with people who don't know how your product is "supposed to" work.
2. **Adapting tutorials to your use case is not simply a matter of copy and paste.** Sonia's article is written for Le Wagon students doing exactly what we were doing, building an Airbnb clone. There are doubtless many other Le Wagon students who have implemented a date picker by following her article. I assumed that if I followed the instructions to solve the problem, I would be home free. Had I invested a little bit of my own time playing around with the result, I would probably have caught the bug myself. I can't blame the fact that the code didn't catch unexpected user behaviour on the tutorial — _I_ copied it and _I_ put it in the project. The bug is on _me_.
3. **If you're afraid to touch copy-pasted code, you might not fully understand it yet.** Part of why I didn't dig deeper into the code to begin with was that I didn't want to break it. I didn't quite understand how it worked, I only knew that it did work. When I returned to the project a few weeks later to improve it and fix its issues, I had a few more weeks of JavaScript under my belt, and now the magic incantations of the code made much more sense. I didn't have the confidence to mess around with the code then, but now I do.

### Takeaway

After a group project like this, I gained an appreciation for a lot of the organisational infrastructure that enables different individuals to work on a product as a single team. We had daily standup meetings and development moved at a quick clip because the team communicated freely and frequently. Everyone was always on the same page about what items in the backlog we were going to work on next. On the other hand, we didn't review code for style or establish UI/UX guidelines, resulting in code that was difficult to maintain and a disorganised user interface.

All the same, I'm proud of what we managed to achieve in five days, and we took many of the lessons we learned from this project into the development of [Macrotery](/macrotery), which was a much more complex product to build.
