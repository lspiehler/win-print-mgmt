require('dotenv').config({ path: require('path').join(__dirname, '.env')});

module.exports = {
    LISTENPORT: parseInt(process.env.LISTENPORT) || 80
}