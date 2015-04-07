## Minima

The blog engine where you can do what you want

## What?

With the surge of text editors and cloud storage why can't I use any of them to write my
blog?  Why do I have to use some crappy HTML5 editor when I have native apps that give me rich
features?  Why do I have to use your crappy native app to write my blog?  Why can't I use plain text
markdown?  Why can't I use WYSIWYG?  How can I trust your document storage to keep my blogs?  Maybe
I'll keep them in Dropbox, Google Drive, Evernote, etc as a backup.

These are the questions I've heard and asked over and over again.  Almost every time I find a cool
new blog engine I go through this.  I always feel tied to whatever editor and storage the blog
engine decides on.

minima |ˈminəmə|<br/>
plural form of minimum.

Minima aims to be a middle man and a host.  The purpose is to let you write however you please.
You can write your blogs in *anything* you want (Evernote, Dropbox, Google Docs).  This also opens
the door to *any* text editor you wish.  Once you decide how you want to write,
[find a loader](https://www.npmjs.com/search?q=minima+loader)
and tell Minima to use it.  Can't find one for your middleware?
[Then write one](#how-to-write-middleware)!

## Choosing a Loader

Once you decide on an article loader, mark it as an npm dependency and tell minima to use it.  Do
this by modifying the app.config.js file.

```js
{
  //...

  articleMiddleware: 'minima-evernote-loader',

  //...

  'minima-evernote-loader': {
      notebookName: 'minima',
      key: '...',
      secret: '...',
      sandbox: false
  },

  //...
}
```

## How to Write Middleware

Examples:
 1. https://github.com/brettof86/minima-evernote-loader
 1. https://github.com/brettof86/minima-dropbox-loader

How you write your middleware is irrelevant.  The only requirements is that you exports an Object
(which will be constructed) and expose certain methods for Minima to use. They are as follows:

 1. connect
 1. connectCallback
 1. listPages
 1. getPageContent


## Constructor

Your constructor will be passed three things: logger, config, and store.

## logger: For any logging, tracing, errors, etc

#### Usage

`logger.error(messageFormat, [variables])`

 * Instance of [log4js][]
 * Methods: trace, debug, info, warn, error, fatal
 * All methods use [util.format][] because readability.

#### Examples

`logger.trace('retrieving %s having id %s', note.title, note.id)`

`logger.error('Could not find content for %s', note.title)`

## Config

 * An object containing the configuration values for your middleware.
 * Also contains `callbackUrl` for oauth purposes (which will directly invoke the connectCallback
 method of your middleware.

## Store

#### Usage

`var token = store.get('oauthToken')`

`store.set('oauthToken', token)`

`store.remove('oauthToken')`

 * Key/Value store.
 * Gives each middleware the ability to interact with a persistent storage. It is sandboxed from
the rest of the application. (useful for storing oauth tokens so the user doesn't have to
authenticate every time).

## Connect

Called from the '/admin/connect' page. When the user first loads the application they will be
directed to connect their middleware. This function is called directly from Express. You have full
access to the request and response objects. This might change in the future. Your method signature
should look like a traditional express endpoint `function(req, res, next){}`.



 [log4js]: https://github.com/nomiddlename/log4js-node
 [util.format]: https://nodejs.org/api/util.html#util_util_format_format
