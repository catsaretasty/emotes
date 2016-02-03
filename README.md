# emotes
emotes from the old tastyplug extension

## building
you need node.js and npm.
after you `npm install` in the directory, run `npm run build`

## about
so you put files in the `emotes/` folder in whatever subdirectory you want
the filename should be something like `butts.png` if i want to make an emote called butts.  you should only have A-Z (a-z), 0-9, \_, or - in the filename.  that means that if i want to make a `butts!` emote, i would name the file something like `butts_bang.png` and create a file called `butts_bang.png.txt` in the same directory with what i want to call the emote (so it would only have `butts!` inside).  Otherwise, if you are only using the characters i listed earlier, the emote name will be automatically pulled from the filename.

currently files (emotes) with the same name will overwrite eachother, so dont do that until i get un-lazy.  also other crap probably isnt working or is broken, but im lazy.  will come back to it later maybe

## format
there are 2 formats created when running the build.

the first in the `emotes.json` file:
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

the second in the `emotes-full.json` file:
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

both of these files can be found at `https://emotes.tastycat.org/emotes.json` and `https://emotes.tastycat.org/emotes-full.json` (when i put the server up)
