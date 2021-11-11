var users = {};

module.exports = {
  getUser: function(oid, fn) {
    if(users.hasOwnProperty(oid)) {
      //console.log('using cached user');
      //console.log(oid);
      //console.log(users[oid]);
      return fn(null, users[oid]);
    } else {
      //console.log('not using cached user');
      return fn(null, null);
    }
  },
  addUser: function(profile, fn) {
    //console.log(profile);
    users[profile.oid] = profile;
    return fn(null, null);
  },
  deleteUser: function(oid, fn) {
    if(users.hasOwnProperty(oid)) {
      delete users[oid];
    }
    return fn(null, null);
  }
}