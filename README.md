# BobtailMethodApp
## WDI Seattle 02 Project

### This app allows musicians of all levels and abilities to write short compositions and receive critical feedback from others.

Any user can write new compositions and view those of others. Only registered users can save their compositions to the database, as well as leave feedback for others. Unregistered users may email themselves a link to their composition.

Because the melody is brief, there are only play and stop buttons. The user composes the melody using a grid interface.

###[Entity-relationship model](https://github.com/bennettslin/BobtailMethodApp/blob/master/public/BobtailMethodEntityRelations.png)
###[User experience flowchart](https://github.com/bennettslin/BobtailMethodApp/blob/master/public/BobtailMethodFlowchart.png)
###[Trello board](https://trello.com/b/vcIgGdyh/bobtailmethodapp)

## Technologies used
+ The usual that was covered in class.
+ Facebook OAuth using Passport.js, with additional user friends permission.
+ Web Audio API.

## Things left to fix
+ Connect play buttons in howto page
+ title needs to reflect after new from copy
+ title needs to be in string
+ method for code to abc, maybe have it taken care of in script.js rather than controller
+ delete button doesn't delete notation because it's a different row (will need to figure out layout first)
+ make responsive!

### Known knowns
+ Users should be able to add titles and descriptions to compositions, and update them. They should also be able to delete their own critiques, as well as those left by others.
+ Refactoring.
+ Content can be improved.

### Known unknowns
+ Deleting a composition should cascade down and delete its critiques as well.
+ Database queries should probably use sequelize to join tables, rather than rely on async to nest individual queries.
+ Major styling!

### Unknown unknowns
+ Sound is God-awful... Figure out how to implement sound fonts, or else tinker with waveforms and envelopes.
+ Stop button should change back to play when playback completes.