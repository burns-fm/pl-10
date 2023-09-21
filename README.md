<img src="./public/img/brc-wordmark.png" height="50" alt="Burns Recording Company" />

# PL-10

*Simple self-hosted audio streaming for the web*

PL-10 is an open-source, simple, and customizable audio streaming server and website designed for smaller labels, artists, hobbyists, and projects. It provides an opportunity for learning and exploration in the fields of web and audio applications.

Just drop your files in the `media` folder and start the server.

## Contents

- <a href="#demo">Demo</a>
- <a href="#usage">Usage</a>
- <a href="#setup">Setup</a>
- <a href="#startup">Startup</a>
  - <a href="#build-the-server">Build the server</a>
  - <a href="#start-the-server">Start the server</a>
- <a href="#configuration">Configuration</a>
  - <a href="#set-the-page-title">Set the page title</a>
  - <a href="#set-the-page-subtitle">Set the page subtitle</a>
  - <a href="#set-supporting-text">Set the supporting text</a>
  - <a href="#media-directory">Media Directory</a>
  - <a href="#max-file-number">Maximum file number</a>
- <a href="#customization">Customization</a>
  - <a href="#front-end">Front End</a>
  - <a href="#back-end">Back End</a>
- <a href="#embedding">Embedding</a> <small>in a web page, blog, etc</small>
- <a href="#libraries-and-other-references">Libraries and other references</a>

## Demo

There is an interactive demo running at: https://pl-10.x.burns.fm

Note: the machine its running on is not suited for large audiences, so performance may not be ideal.

## Setup

Install all of the dependencies:

```sh
npm install
```

### Authentication

There is a page (`/embedded/preview`) that allows you to set up an embedded player with a username and password, otherwise it will be visible to all users who know about the route.

#### Enable

> **NOTE** If you enable this without setting the username and password, the default credentials will be used. These are logged to the console on startup and change every time you restart the server.

Set the environment variable `PL_10_PREVIEW_AUTH=true`

#### Set username & password

Set the variables:
- Username: `PL_10_PREVIEW_USER="<username>"`
- Password: `PL_10_PREVIEW_PASS="<password>"`

## Startup

Once the packages are installed you'll need to build the server code and start it up.

> **Note on Docker use:** While there is a `Dockerfile`, and it should work for many cases, you may need to make adjustments to allow it to work properly for your server if that's your preferred deployment method. There are a couple of relevant `npm` commands you and view in the `package.json` file.

### Build the server
```sh
npm run build:server
```

### Build the client/UI

If you start the server and the buttons don't seem to do anything, you probably forgot to to this step.

```sh
npm run build:client
```

If you want to rebuild the styles only then run
```sh
npm run build:client:styles
```

or the code only
```sh
npm run build:client:scripts
```

If you want to see your changes on the page as you edit the styles, then while your server is running, run this command in another terminal window to auto-compile your styles every time you save:

```sh
npm run watch:client:styles
```

### Start the server
Start the server in production mode
```sh
npm start
```

Start the server in development mode
```sh
npm run start:dev
```

### Debug Mode
This will enable additional logging if you're running into any trouble. It might help diagnose the problem.

```sh
npm run start:debug
```

## Configuration

> ***Did you know?*** *(Turning on the homepage route)*</br>
  You can use the provided preview homepage as a template and customize it to suit your record release, or whatever your project is. It is disabled by default, and won't show unless you set an environment variable `PL_10_USE_HOMEPAGE` to `true`. You can do this from your command line as in the example below, or in your
  shell environment's configuration.<br/>`export PL_10_USE_HOMEPAGE=true`

Some settings configuration is possible if you want to make some minor changes to how things are run.

- <a href="#set-the-page-title">Set the page title</a>
- <a href="#set-the-page-subtitle">Set the page subtitle</a>
- <a href="#set-supporting-text">Set the supporting text</a>
- <a href="#media-directory">Media Directory</a>
- <a href="#maximum-file-number">Maximum File Number</a>

> **Note:** *The custom values below have a limited set of characters they can support. Characters like*
> *double-quotes (`"`), dollar signs (`$`), and others will need to be 'escaped' in order to work correctly.*
> *For that reason, if you want more flexibility then you should edit the template file directly.*
> <div><small>The splash template: `/views/includes/splash.ejs`</div>

---

### Set the page title

If you want to use the default layout and set the title text, use the following environment variable `PL_10_PAGE_TITLE`.

Use this for the main page text. Ideal for an artist name or album name, or short promo text. It will also be used for the browser page title (that will show up on the tab).

#### DEFAULT VALUE

| Variable name    | Value |
|------------------|-------|
| PL_10_PAGE_TITLE |   BRC |

---

### Set the page subtitle

If you want to use the default layout and set the subtitle text, use the following environment variable `PL_10_PAGE_SUBTITLE`.

Use this for an artist name or album name. Something like that.

#### DEFAULT VALUE

| Variable name       | Value |
|---------------------|-------|
| PL_10_PAGE_SUBTITLE | PL-10 |

---

### Set supporting text

If you want to use the default layout and set the supporting text, use the following environment variable `PL_10_SUPPORTING_TEXT`.

Use this if you have some extra info you want to include like a promotional tagline, shout-out, or release date.

#### DEFAULT VALUE

| Variable name         | Value                         |
|-----------------------|-------------------------------|
| PL_10_SUPPORTING_TEXT | Simple, self-hosted streaming |

---

### Copyright notice

If you want to use the default layout and set the copyright text, use the following environment variable `PL_10_COPYRIGHT`.

The copyright symbol and date are already set for you, so just add any more text you'd like.

> **Note:** *To change this text in more detail, you can edit the footer*
> *template: `/views/includes/footer.ejs`*

#### EXAMPLE

> &copy; 2023 `<your-text-here>`. All rights reserved.


#### DEFAULT VALUE

| Variable name   | Value |
|-----------------|-------|
| PL_10_COPYRIGHT |  None 

---

### Media Directory

You can set an alternative media directory by setting the environment variable `PL_10_MEDIA_DIR` to where your files are stored. Not all file types are supported yet. See: [server/constants.ts](server/constants.ts)

While the server could theoretically stream any audio file type that includes parse-able metadata, the client code relies on browser compatibility and not all file types are guaranteed to work with every browser. So, Pl-10 by default tries to work with as many browsers as possible for audio playback. You can change those settings if it suits your project.

#### DEFAULT VALUE
| Variable name   | Value |
|-----------------|-------|
| PL_10_MEDIA_DIR | media |

---

### Maximum file number

By default, the server has a maximum number of files it will pick up. You can override that number by setting `PL_10_MAX_FILES` to a different number.

#### DEFAULT VALUE
| Variable name   | Value |
|-----------------|-------|
| PL_10_MAX_FILES |    10 |


## Customization

### Front End

You can change anything in the application to suit your needs in as much detail as you'd like. The styles and code are laid out with intention and in a modular way to make finding your way around pretty easy.

- <a href="./client/README.md">See the readme</a>

### Back End

If you are familiar with JavaScript, HTTP, NPM workflows, then you should find changing the backend functionality relatively simple.

In-depth documentation won't be included with PL-10 at launch, but if you know what you're doing, the best starting point is the set of scripts in `package.json` and the files in the `./server` folder.

- ~~See the readme~~ (forthcoming)

## Embedding

PL-10 now supports embedding a player. You can use the direct URL, or set one up using the previewer. You can also make a request to the API for new embed code HTML.

### URL

To embed the player, point an iframe or a popup window at `<your-pl-10-base-url>/embedded`

Demo: https://pl-10.x.burns.fm/embedded

### Previewer

To set up an HTML embed code, go to  `<your-pl-10-base-url>/embedded/preview`

There you can set the height/width and an optional track ID if you want it to start on a specific song.

Demo: https://pl-10.x.burns.fm/embedded/preview

### API

You can get a preset HTML code without using the previewer. Send the height, width, and/or track ID as query parameters.

Make the request to `<your-pl-10-base-url>/embed-code`

Set a query parameter by adding one of the following to your url. [Learn more about query parameters](https://en.wikipedia.org/wiki/Query_string)

| PARAM | TYPE | EXAMPLE |
|-------|------|---------|
| `w`   | number | `480`   |
| `h`   | number | `250`   |
| `trackId` | string | `648fc2e6-31db-432c-b315-c1bb9b2bbb9a` |

You'll receive a JSON response that looks like this:

```json
{
  "html": "<iframe width=\"888\" height=\"333\" src=\"http://localhost:8347/embedded\"></iframe>"
}
```

Demo: https://pl-10.x.burns.fm/embedCode

## Libraries and other references

This project uses several open source fonts, code libraries, and icon sets.

If you need to understand how to work with some of the files included, you might find more information in the list below.

| Name | URL | Usage |
| --- | --- | --- |
| Inter | <a href="https://rsms.me/inter/" target="_blank">https://rsms.me/inter/</a> | Titles, body test, small footer text, etc.
| JD LCD Rounded | <a href="https://jeckodevelopment.com/fonts/jd-lcd-rounded" target="_blank">https://jeckodevelopment.com/fonts/jd-lcd-rounded</a> | Player display components |
| Feather Icons | <a href="https://feathericons.com" target="_blank">https://feathericons.com</a> | Player transport and other icons |
| TypeScript | <a href="https://www.typescriptlang.org" target="_blank">https://www.typescriptlang.org</a> | Programming language used for the client and server code|
| ExpressJS | <a href="https://expressjs.com" target="_blank">https://expressjs.com</a> | HTTP Server framework |
| music-metadata | <a href="https://github.com/borewit/music-metadata" target="_blank">https://github.com/borewit/music-metadata</a> | Parsing metadata from audio files |
| EJS | <a href="https://ejs.co" target="_blank">https://ejs.co</a> | HTML-based templating language used for setting up the `views` files |
| SASS/SCSS | <a href="https://sass-lang.com" target="_blank">https://sass-lang.com</a> | The style language used for customizing the look of the HTML (see `./public/app/styles/scss`) |

---

Some images are included for demo and display purposes. Except for `noise.png` and the Canada Wordmark, the images are owned by Rob Fairley and Burns Recording Company and should not be redistributed without permission. Feel free to share the cover art included, provided it's unmodified.

&copy; 2022-2023 <a href="https://burns.fm">BRC</a>
