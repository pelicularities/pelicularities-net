import { format } from 'date-fns';
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import path from "node:path";
import * as sass from "sass";

export default function(eleventyConfig) {
    // passthrough copy for all assets folders except CSS, which needs compilation
    // but passthrough copy .css files in the .css folders
    eleventyConfig.addPassthroughCopy("assets/css/*.css");
    eleventyConfig.addPassthroughCopy("assets/favicons");
    eleventyConfig.addPassthroughCopy("assets/images");
    eleventyConfig.addPassthroughCopy("assets/js");
    eleventyConfig.addPassthroughCopy("assets/webfonts");

    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css",

        // opt-out of Eleventy Layouts
        useLayouts: false,

        compile: async function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            // Don’t compile file names that start with an underscore
            if(parsed.name.startsWith("_")) {
                return;
            }

            let result = sass.compileString(inputContent, {
                loadPaths: [
                    parsed.dir || ".",
                    this.config.dir.includes,
                ]
            });

            // Map dependencies for incremental builds
            await this.addDependencies(inputPath, result.loadedUrls);

            return async (data) => {
                return result.css;
            };
        },
    });

    eleventyConfig.addTemplateFormats("scss");

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

    // Collection filters
    eleventyConfig.addFilter("filterUntagged", (posts) => {
        // returns set of posts that are tagged only as "post"
        return posts.filter((post) => {
            return post.data.tags.length === 1
                && post.data.tags[0] === "post";
        });
    });
};

