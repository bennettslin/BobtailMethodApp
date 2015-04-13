var db = require('./models');

db.user.create({name:"Bennett", password:"12345678", email:"bennett@gmail.com"}).then(function(user) {
  db.composition.create({melody:"CDEFGABC", harmony:"C F G C", userId:user.id}).then(function(composition) {
  }).catch(function(error) {
    console.log("error in composition", error);
  })
}).catch(function(error) {
  console.log("error in user", error);
})

// db.user.find(4).then(function(user) {
//   db.critique.create({comment:"hi", compositionId:1, userId:user.id}).then(function(critique) {
//     user.addCritique(critique);
//   })
// })

// db.composition.find(4).then(function(composition) {
//   db.critique.findAll().then(function(critiques) {
//     critiques.forEach(function(critique) {
//       composition.addCritique(critique);
//     })
//   })
// })