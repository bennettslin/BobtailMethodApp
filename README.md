# BobtailMethodApp
## WDI Seattle 02 Project

### This app allows musicians of all levels and abilities to write short compositions and receive critical feedback from others.

Any user can write new compositions and view those of others. Only registered users can save their compositions to the database, as well as leave feedback for others. Unregistered users may email themselves a link to their composition.

Because the melody is brief, there are only play and stop buttons. The user composes the melody using a grid interface.

# Technologies used
+ Facebook OAuth using Passport.js, with additional user friends permission.
+ Web Audio API.

# Things left to fix
### Known knowns
+ Users should be able to update profiles, including uploading cover pictures.
+ Users should be able to add titles and descriptions to compositions, and update them. They should also be able to delete their own critiques, as well as those left by others.
+ Refactoring.
+ Content can be improved.

### Known unknowns
+ Deleting a composition should cascade down and delete its critiques as well.
+ Major styling!

### Unknown unknowns
+ Sound is God-awful...
+ Stop button should change back to play when composition ends.
+ Show notated music on staff line rather than string literal