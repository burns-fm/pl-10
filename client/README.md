# PL-10 Front end code

If you want to be able to do anything like tweak the visualizer math or colour, adapt the player to allow other media types and so on, this is where you need to make those changes.

The front end for PL-10 is largely organized into a couple of primary classes, some helper functions and classes, and sets of constants.

Until this documentation is more complete, it's recommended that you only change those files if you know your way around TypeScript or at least don't mind blowing things up and having to start over. You can always do that.

## Styles

All of the stylesheets for the web application can be found in the `client/styles` directory. If you're not familiar with SCSS, these files will have the file extension `.scss` and use a language similar to CSS, but with some convenient features that make organizing the project a little easier.

### Shared Styles

- `_brc.scss`: styles related to the Burns Recording Company logo element.
- `_colors.scss`: colour variables and any other helpers
- `_fonts.scss`: defines some locally used fonts, and also variables with common font settings.
- `_layout.scss`: basic layout classes, mixins, and other helpers

### Modules

The module files are mostly organized similar to the EJS views in order to make it easy to find the style you want to adjust.

- `association.scss`: the blocks at the bottom of the page you might use to link out to a resource like a record label, a grant organization, engineering, or arts club, etc.
- `example.scss`: styles for an example view that you can use to extend and create new modules and view elements
- `footer.scss`: the page footer styles — this is where the copyright info is
- `main.scss`: page-level views and layout adjustments, and any other global styles and settings. **Note:** import all of your modules here.
- `player.scss`: all of the styles related to the player element and it's child elements.
- `splash.scss`: styles for anything contained in the block below the player, like the artist name and album title. Freely change these to suit your needs!

#### Add a new module

Adding a new module is easy. Just create a `.scss` new file in the `client/styles` folder and import it in the `main.scss` file:

```scss
// ...existing code...
@import './association.scss';
@import './splash.scss';
@import './player.scss';
@import './footer.scss';
@import './example.scss';
@import './new_module.scss'; // <-- Your new file. Name it anything you want!

```

Once the styles and module are in place, you can use your new classes in the front end as soon as you build the styles into browser-friendly CSS

To build the styles for the web, just run the following command in your shell/terminal:

```sh
npm run build:client:styles
```

## JavaScript

The player and other interactive code is written in a dialect called [TypeScript](https://www.typescriptlang.org). It helps with some aspects of organizing the code and preventing annoying bugs.

More documentation for this section is forthcoming, but you will find the code pretty well commented!

If you make any changes to the code, you will also need to build it to allow the changes to show up in your application.

```sh
npm run build:client:scripts
```

---

&copy; 2022-2023 Burns Recording Company
