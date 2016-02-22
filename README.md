# Emotes
Emotes from the old TastyPlug extension.

## Building
You need node.js and npm.
After you `npm install` in the project directory, run `npm run build`.
You should now have the project built in the `public/` folder.

## Adding emotes
Put files in the `emotes/` folder in whatever subdirectory you want.
The filename would be `butts.png` if I wanted to make an emote called butts.

You should only have a-z, 0-9, \_, or - in the filename (uppercase is fine).

That means that if I want to make a `butts!` emote, I would name the file something like `butts_bang.png`
and create a file called `butts_bang.png.json` in the same directory with the properly formatted json.
The correctly formatted json looks like below:

```json
{
  "name": "butts!",
  "mainCategory": "buttstuff",
  "subCategories": [
    "rectum",
    "Hershey Highway",
    "Moneymaker",
    "mud flaps"
  ]
}
```
Note that none of these are required, you are able to have all of them, some of them, one of them, or none
(none means no file, or a file with an empty `{}` - but you're not a monster, are you?).

Otherwise, if you are only using the characters I listed earlier,
the emote name will be automatically pulled from the filename.

Currently files (emotes) with the same name will overwrite each other, so don't do that until I get un-lazy.
Also, other crap probably isn't working or is broken, but I'm lazy.  Will come back to it later maybe?

## Format
There are 3 formats created when running the build.

The first is the `emotes.json` file:
```json
{
  "emotes": {
    "AngryMittens":"https://emotes.tastycat.org/emotes/cats/AngryMittens.png",
    "Basssss":"https://emotes.tastycat.org/emotes/cats/Basssss.png",
    "BoopBlock":"https://emotes.tastycat.org/emotes/cats/BoopBlock.png",
    ...
  }
}
```

The second is the `emotes-full.json` file:
```json
{
  "emotes": {
    "AngryMittens": {
      "url":"https://emotes.tastycat.org/emotes/cats/AngryMittens.png",
      "height":35,
      "width":36
    },
    "Basssss": {
      "url":"https://emotes.tastycat.org/emotes/cats/Basssss.png",
      "height":35,
      "width":36
    },
    "BoopBlock": {
      "url":"https://emotes.tastycat.org/emotes/cats/BoopBlock.png",
      "height":35,
      "width":35
    },
    ...
  }
}
```

The last is the `emotes-data.json` file:
```json
[
  {
    "name":"AngryMittens",
    "url":"https://emotes.tastycat.org/emotes/cats/AngryMittens.png",
    "height":35,
    "width":36
  },
  {
    "name":"Basssss",
    "url":"https://emotes.tastycat.org/emotes/cats/Basssss.png",
    "height":35,
    "width":36
  },
  ...
]
```

All of these files can be found at `https://emotes.tastycat.org/<jsonfile>`
(so like `https://emotes.tastycat.org/emotes.json`).
