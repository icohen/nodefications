var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Notification = new Schema({
  short_dscrptn  : { type: String }
  , long_dscrptn : { type: String }
  , confirmed_on : { type: Date }
  , confirmed_by : { type: String}
  , created_on   : { type: Date, default: Date.now }
  , created_by   : { type: String }
  , updated_on   : { type: Date, default: Date.now }
  , updated_by   : { type: String }
});

// registering schema
mongoose.model('Notification', Notification);
