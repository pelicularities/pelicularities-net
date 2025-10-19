---
layout: post.njk
title: "Le Wagon: Mister Cocktail"
date: 2020-11-19
excerpt: "Mister Cocktail is a classic Le Wagon project. Here's my interpretation from batch #454."
tags: 
  - project
permalink: /mister-cocktail/
---
_Now that [Heroku](https://www.heroku.com/) no longer has a free tier, the Mister Cocktail demo is no longer online._

- [Github Repo for Mister Cocktail](https://github.com/pelicularities/rails-mister-cocktail)

### About Mister Cocktail

Mister Cocktail comes at the end of week 6 of [Le Wagon's](https://www.lewagon.com/) Full-Stack Web Development bootcamp, and it is the first chance for students to synthesise everything we've learnt into a single Rails project.

The assignment is simple: build a cocktail recipe manager. Users should be able to perform the following actions:

- View all cocktails in the catalogue
- View details of a single cocktail, including ingredients and a picture
- Add and delete doses from a cocktail recipe
- Add a new cocktail to the catalogue, including an image of the cocktail

In order to do this, I needed to:

- **Design a database schema:** a cocktail can have many ingredients and an ingredient can go into many cocktails, so the relationship between cocktails and ingredients is many to many. To normalise this relationship into two one-to-many relationships, I created an intermediate table for doses: a dose belongs to one cocktail, and contains one ingredient.
- **Retrieve information from an API:** the database is seeded using information from [TheCocktailDB's](https://www.thecocktaildb.com/) free API. Because TheCocktailDB's free API has limitations, the information that goes into the database seed is inaccurate: the cocktail names are real, the ingredients are real cocktail ingredients, but the doses are randomised and fictional. Nonetheless, I needed to pull data from the API and store it in the database in order to populate the recipe catalogue.
- **Attach images to Active Record models using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) and [Cloudinary](https://cloudinary.com/):** TheCocktailDB's API includes a link to a photo of each cocktail in their database. I pulled the URL of each photo, uploaded the photo to Cloudinary, and attached it to the corresponding Active Record cocktail instance using Active Storage.
- **Understand and adhere to the Rails [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (MVC) architecture:** the first time I came across the term "model-view-controller" was in [CS50x](https://cs50.harvard.edu/x/2020/), when I attempted (and failed to complete) the iOS track. Back then, I simply did not understand what the MVC architecture was, and did not have a good way to learn about it until I started the Le Wagon bootcamp. Over time, through repeated exposure to the concept and Le Wagon drilling the MVC design pattern into us, I came to understand the division of work between these different facets of software design.
- **Create RESTful routes in Rails:** the routing for Mister Cocktail is pretty simple, since there are only four routes. It's a good first step into RESTful routing before the routes get more varied and complex during the project weeks (see [Rent-a-Pokemon](/rent-a-pokemon) and [Macrotery](/macrotery)).
- **Implement a web design using HTML, CSS and Bootstrap:** this is a bread-and-butter task for front-end and full-stack developers. Many Le Wagon students take the opportunity to go above and beyond the bare necessities of a navbar and a list of cocktails. In my case, I selected 11 cocktail-related images from Unsplash and made a rotating background. I also made the layout (mostly) responsive for mobile devices.
- **Deploy the app to [Heroku](https://heroku.com/):** a web application is useless if it only lives on localhost. I deployed my app to Heroku, though unfortunately with the end of Heroku's free tier, the app is no longer online.

### Post-bootcamp

After the bootcamp, I returned to my Mister Cocktail project with two main goals:

1. **Paginate the cocktails#index page:** my Mister Cocktail seed pulls every cocktail beginning with the letter A, then B, then C, and so on, until the API stops responding or the Heroku dyno terminates the process, which usually happens somewhere between the letters N and T. That's hundreds of cocktails, and having 371 pictures of cocktails load on the index page is a suboptimal experience. I used the [Pagy](https://github.com/ddnexus/pagy) gem to paginate them, resulting in a faster load time and an improved user experience.
2. **Improve responsiveness:** we're given two days to complete Mister Cocktail, and at the end of those two days my layout was not fully responsive. Cocktail images would extend past the viewport width on mobile devices, and text would align oddly when the viewport shrank below certain breakpoints. I reworked the layout a little to make it display properly on screen sizes as small as an iPhone SE (320 x 568). There's still a misaligned button that bothers me a bit... but I've decided to put this project down and move on to other things.

### Takeaway

Mister Cocktail was the first Rails project I did that felt like a real web application. I've since built bigger and more complex Rails projects, but I have a great appreciation for the fundamentals that we had to learn in the bootcamp in order to truly understand the plumbing of Ruby on Rails. Mister Cocktail laid the groundwork for what I've since been able to accomplish with Rails.
