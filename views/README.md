# Views

PL-10 uses a templating system called EJS. It's essentially HTML with some extra features the server can use to render some dynamic content.

For the most part, the EJS modules as they're set up are pretty simple.

## The main layout

File: `index.ejs`

This is the main layout of the web application, and your starting point. Anything to be displayed on the page must be included here, if not directly, then as a block containing other view modules.

## Modules

The rest of the modules are in the `includes` folder, and are appropriately named for the section of the page they represent.

- `associations.ejs`: use this for record label links, grant organizations, and so on.
- `cover-art.ejs`: the cover art image at the top of the page
- `footer.ejs`: the block containing the copyright information
- `head.ejs`: the HTML `<head>` element. Only change this one if you understand what it does.
- `player-help.ejs`: the small details section with some helpful information for the player
- `player.ejs`: the layout of the player and its display and controls
- `scripts.ejs`: the block that imports any javascript files necessary
- `splash.ejs`: the block containing the page metadata like the title, subtitle, and supporting text
- `title.ejs`: a block containing the site title. This isn't currently used. It may be useful for a large piece of text separate from the rest.

---

&copy; 2022-2023 [BRC](https://burns.fm)
