import { format } from 'date-fns';
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function(eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("images");

    // Universal filters (Adds to Liquid, Nunjucks, and 11ty.js)
    eleventyConfig.addFilter("formattedDate", (date) => {
        // Given a Date object, returns a string of the format
        // Saturday, 11 February 1989
        return format(date, 'EEEE, do MMMM yyyy');
    });

    eleventyConfig.addFilter("isoDate", (date) => {
        // Given a Date object, returns a string of the format
        // 1989-02-11
        return format(date, 'yyyy-MM-dd');
    });

    eleventyConfig.addFilter("debugObject", (object) => {
        // Given an Object, prints its key/value pairs
        return Object.entries(object).map(([key, value]) => {
            return `${key}: ${value}`;
        }).join(", ");
    });
};

