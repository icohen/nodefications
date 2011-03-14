var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var User = new Schema({
  email  : { type: String}
  , created_on   : { type: Date, default: Date.now }
});

// registering schema
mongoose.model('User', User);

