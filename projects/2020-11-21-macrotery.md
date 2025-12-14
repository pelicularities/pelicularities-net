---
layout: post.njk
title: "Le Wagon: Macrotery and Macrotery Redux"
date: 2020-11-21
excerpt: "Macrotery is my team's final project from Le Wagon batch #454. The idea is simple: What if you could search for food at eateries based on their macros?"
tags:
  - project
permalink: /macrotery/
---
_Now that [Heroku](https://www.heroku.com/) no longer has a free tier, the Macrotery demo is no longer online. You'll have to review the repo, the write-up and the screenshots._

- [Github Repo for Macrotery Redux](https://github.com/pelicularities/macrotery-redux)
- [Github Repo for Macrotery](https://github.com/pelicularities/macrotery)

### About Macrotery

Macrotery is a project that originated as a final project at [Le Wagon](https://www.lewagon.com/) batch #454 ([Singapore](https://www.lewagon.com/singapore)), by Allen Chung ([allenchungtw](https://github.com/allenchungtw)), Stephen Das ([steevesd](https://github.com/steevesd)), Zack Xu ([konfs](https://github.com/konfs)), and myself. The idea is simple: what if you could search for food at eateries near you based on their protein, carbohydrate and fat content?

Many people track the macros of the food they eat in order to meet their health and fitness goals. Those who are looking to lose weight might aim to keep their overall caloric intake low. Bodybuilders generally want high protein, low fat meals. Endurance athletes fuel their training with lots of carbohydrates. Unfortunately, this makes it difficult for individuals tracking their macros to eat out, since it can be hard to find food that fits their macro targets in eateries.

Macrotery is a minimum viable product / proof of concept aimed at solving this problem. Users enter their macro targets, and can then search for meals at nearby eateries that match their macro targets.

### Macrotery Redux

After our Le Wagon bootcamp ended, I decided I wanted to continue working on Macrotery for a little bit more, so I forked the [Github repository](https://github.com/pelicularities/macrotery) and continued working on it as [Macrotery Redux](https://github.com/pelicularities/macrotery-redux). I had two main goals with the Redux version:

1. **Completing the unhappy path:** all the work on Macrotery was directed at completing the happy path for our bootcamp demo. There were multiple niggling bugs and UI issues that would have resulted in a sub-par user experience for a real user, which I wanted to reduce.
2. **Fixing layout issues:** Macrotery is a [Progressive Web App (PWA)](https://en.wikipedia.org/wiki/Progressive_web_application), meaning it can be used on desktops, laptops, tablets and mobile phones. However, our bootcamp demo was optimised for mobile only, and was barely usable on any device larger than a mobile phone. Macrotery Redux is not truly responsive in that it does not make use of most of the screen space available on larger devices, but I wanted to at least make it look more presentable on non-mobile screens.

### Managing state in StimulusJS

Le Wagon's bootcamp does not delve deep into front-end frameworks, because Le Wagon does not consider it to be possible to learn properly both vanilla JavaScript and and heavyweight front-end frameworks such as React, Angular or Vue within the compressed timeframe of the bootcamp.

A caveat: I have played around with React, but am not comfortable enough with it yet. I don't truly have a sense of what React (or any other front-end framework other than StimulusJS) is capable of, and everything I say below should be read with this caveat in mind.

Since Le Wagon has such an intense Rails focus, there are two frameworks that we did use: [Turbolinks](https://github.com/turbolinks/turbolinks) and [StimulusJS](https://stimulusjs.org/). Both are sufficiently lightweight that they do not require the paradigm shift of React, Angular or the like, and can be quickly be learnt within hours by anyone who knows vanilla JavaScript. This replicates [Basecamp's](https://basecamp.com/) own stack, and you can read about the logic behind their choice in [The Origin of Stimulus](https://stimulusjs.org/handbook/origin).

How do you manage state in StimulusJS? Here's the Stimulus handbook on [managing state](https://stimulusjs.org/handbook/managing-state):

> Most contemporary frameworks encourage you to keep state in JavaScript at all times. They treat the DOM as a write-only rendering target, reconciled by client-side templates consuming JSON from the server.
> 
> Stimulus takes a different approach. A Stimulus application’s state lives as attributes in the DOM; controllers themselves are largely stateless.

Hmm. I can't say I know how much easier or more difficult this would be with React, especially with a state container like Redux or Flux. Stimulus's approach to state essentially means that whatever state you need to store needs to live somewhere in the DOM, or be otherwise retrievable without the use of a state container.

As we worked on Macrotery, we found that we needed to manage state in two of our key features:

- Remembering the user's selected macros
- Remembering the user's cart

I'll talk about my experience with the former, since that's the one that I implemented (the latter was implemented by my teammate [Zack](https://github.com/konfs)).

## The problem

When the user is searching for a meal, they have the option of selecting one of their preset macros, or entering custom macros on the fly. When they then click through to a specific eatery to order, the order page needs to know what their macros are, so that the app can warn them if they exceed their macros.

The search happens in the /dishes page (dishes#index), and the macros that the user selects have to be passed on to the /eateries/:id page (eateries#show). The quickest way to do this is to append a query string whenever the user clicks through to an eatery's page:

```js
// a method inside a StimulusJS Controller instance
appendMacros(e) {
  e.preventDefault();
  const path = e.currentTarget.href;
  // proteinTarget, carbsTarget and fatsTarget are essentially query selectors
  // defined at the top of the Stimulus controller
  const protein = this.proteinTarget.value;
  const carbs = this.carbsTarget.value;
  const fats = this.fatsTarget.value;

  const url = `${path}?protein=${protein}&carbs=${carbs}&fats=${fats}`;
  Turbolinks.visit(url);
}
```
```erb
<% # a StimulusJS action attached to a link to an eatery inside a Rails partial %>
<%= link_to eatery_path(dish.eatery), data: { action: 'click->macros#appendMacros' } do %>
  <% # bunch of HTML here %>
<% end %>
```

This is implemented using Stimulus and Rails helpers, but it should be fairly easy to understand, almost pseudo-code-ish, for anybody familiar with JavaScript and Ruby. Stimulus creates a "click" event listener that's bound to the eatery link. Whenever the user clicks through to an eatery page, the click is intercepted by the appendMacros function, where it reads the protein, carbs and fats values that the user carried out the search with. The function then appends the three variables as a query string to the URL that the user was going to visit in the first place, and hands the new URL to Turbolinks to handle.

The purpose of passing this information over to the /eateries/:id page is to warn the user if they have exceeded their desired macros. We discussed how to do this given the limited real estate of a mobile screen, and settled on using a collapse that could be displayed or hidden by clicking on a warning icon:

<figure>
  <img src="/assets/images/0KzcZi2Oa.png">
</figure>

Remember, in StimulusJS, the state lives in the DOM. This made the warning message a convenient place to store the state of the user's macros:

```rb
class EateriesController < ApplicationController
  def show
    @protein = params[:protein]
    @carbs = params[:carbs]
    @fats = params[:fats]
  end
end
```

```erb
<% # eateries#show view %>
<% if @fats && @carbs && @protein %>
  <div class="collapse py-3" id="your-macros" data-target="total.yourMacros">
    You have exceeded your selected macros of
    <span data-target="total.userProtein"><%=@protein%></span> g protein,
    <span data-target="total.userCarbs"><%=@carbs%></span> g carbs,
    and <span data-target="total.userFats"><%=@fats%></span> g fat!
  </div>
<% end %>
```

The collapse is not visible by default, and the warning icon serving as the collapse handler is only visible when the user has exceeded their macros. When the page loads and the Stimulus controller is connected, Stimulus reads the protein, carbs and fats from the warning message.

To be honest, I had the much easier assignment: I really only needed to pass three values from one page to the next, and doing this in StimulusJS is not significantly different from doing it in vanilla JS. Zack had the task of implementing state management for the order cart using Stimulus, and that is a much more difficult task.

Within the constraints of the bootcamp, I think we did a decent enough job. Of course, now I'd like to learn React and implement a shopping cart using React and Redux, to get a better feel for what state management is like in other JavaScript frameworks.

### Takeaway

Macrotery was, for us, an exercise in building a product using the tech skills we'd built up over the course of the preceding nine weeks, and a great way to showcase what we were capable of building as a team. However, Macrotery as a product is not a tech product.

I've been asked if I want to continue working on Macrotery beyond what I've done individually on Macrotery Redux, and my answer is no: I like code, and I like building stuff, but I want to build things that other people can use. For a product like Macrotery to be successful, it needs the infrastructure of an entire business around it: a partnerships team to bring eateries onto the platform (with the added difficulty of getting partners to input macros for every single item on their menu), sales and marketing teams to drive user adoption, business strategists to figure out where such a product could carve a niche in a market that already includes Deliveroo, Foodora and Grab, and an executive team to steer the ship.

If such a company existed, I would certainly consider joining it as a software developer, because I'd love to have a product like Macrotery as a user. But since it does not exist and neither I nor my teammates are interested in turning it into a business, it makes very little sense to me to continue working on Macrotery. I'd rather be focusing on software that can have a real impact on real users right now.

<!--kg-card-end: markdown-->