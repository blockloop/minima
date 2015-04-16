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

 1. [connect](#connect)
 1. [connectCallback](#connectcallback)
 1. [isConnected](#isconnected)
 1. [listPages](#listpages)
 1. [getPageContent](#getpagecontent)


## Constructor

Your constructor will be passed three things: logger, config, and store.

Signature: `function(logger, config, store) {}`

 1. logger - an instance of [log4js][]. It is highly recommended that you use this so that
 debugging issues doesn't become an issue in the future. All logging methods use [util.format][]
 because readability.
 1. config - object containing the configuration values for your middleware.  Also contains
 `callbackUrl` for oauth purposes (which will directly invoke the connectCallback method of your
 middleware.
 1. store - a key/value store which exposes `get(key)`, `set(key, value)`, and `remove(key)`.  It
 is sandboxed from the rest of the application. Use this sparingly (i.e. storing oauth tokens).

## connect

Signature: `function(req, res, next){}`

Called from the '/admin/connect' page. When the user first loads the application they will be
directed to connect their middleware. Middleware.connect is called directly from Express. You have
full access to the request and response objects. This might change in the future. In this method you
should perform your typical oauth functions, passing the config.callbackUrl so that the oauth
provider invokes your middleware's [connectCallback](#connectCallback) function.

## connectCallback

Signature: `function(req, res, next) {}`

This is only necessary if you're authorization process requires a callback URL (i.e oauth). In your
[connect](#connect) method you can use the config.callbackUrl to give to your oauth provider. Once
the oauth passes the provider should invoke this method. Once you've completed the oauth you should
persist the authentication into the [store](#store) and attempt to retrieve it in your
[constructor](#constructor).

## isConnected

Signature: `function() {}`

Returns: boolean - `true` if the middleware has been authorized and is prepared to take requests

## listPages

Signature: `function(callback) {}`

 1. callback: a Callback function to be invoked with **each** page.  When invoking the callback
 you should pass one single object which should match the following:

```js
{
    identifier: // some unique identifier that your middleware can identify this note by,
    title: // the title to be shown on the page
    slug: // the slug to use in the url for this page (will default to [slug][] the title)
    createDate: // Date (defaults to Date.now)
    modifiedDate: // Date (defaults to Date.now) and used to determine if an update is needed
    tags: // tags for the page
    unpublished: // boolean - passed if the article should be unpublished
}
```

## getPageContent

Only called when a page detects an update. This prevents Minima from having to load every page each
time the application starts. Sometimes it is not possible for your middleware to work this way (e.g.
Dropbox). If this is the case then you should cache the pages content when you receive it during the
listPages method and fetch that cached content during getPageContent.

Signature: `function(note) {}`

 1. note - an object containing everything received from [listPages](#listPages)

Returns:

 1. [Q.promise][Q promise]

Promise should be resolved with the FULL NOTE. Not just the content. This is necessary because the
receiving end of this callback is stateless and does not retain each call it makes to
getPageContent. When the promise is resolved it will depend on the Note object in it's entirety.


To see implementations of middleware see the examples listed above.




 [log4js]: https://github.com/nomiddlename/log4js-node
 [util.format]: https://nodejs.org/api/util.html#util_util_format_format
 [slug]: https://www.npmjs.com/package/slug
 [Q promise]: https://www.npmjs.com/package/q

