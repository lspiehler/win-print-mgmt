require('dotenv').config({ path: require('path').join(__dirname, '.env')});

function getBoolean(str) {
	if(str) {
		if(str.toUpperCase()=='TRUE') {
			return true;
		} else if(str.toUpperCase()=='FALSE') {
			return false;
		} else {
			return str;
		}
	} else {
		return false;
	}
}

module.exports = {
    LISTENPORT: parseInt(process.env.LISTENPORT) || 80,
    BASICAUTH: getBoolean(process.env.BASICAUTH) || false,
    ENABLEDHCP: getBoolean(process.env.ENABLEDHCP) || false,
	BASICAUTHUSER: process.env.BASICAUTHUSER || false,
	BASICAUTHPASS: process.env.BASICAUTHPASS || false,
	MSFTAUTH: getBoolean(process.env.MSFTAUTH) || false,
	MSFTTENANTGUID: process.env.MSFTTENANTGUID || false,
	MSFTCLIENTID: process.env.MSFTCLIENTID || false,
	MSFTCLIENTSECRET: process.env.MSFTCLIENTSECRET || false,
	MSFTSESSIONSECRET: process.env.MSFTSESSIONSECRET || false,
	MSFTADMINGROUPID: process.env.MSFTADMINGROUPID || false,
	MSFTCOOKIEKEY1: process.env.MSFTCOOKIEKEY1 || false,
	MSFTCOOKIEIV1: process.env.MSFTCOOKIEIV1 || false,
	MSFTCOOKIEKEY2: process.env.MSFTCOOKIEKEY2 || false,
	MSFTCOOKIEIV2: process.env.MSFTCOOKIEIV2 || false,
	FQDN: process.env.FQDN || '',
	QUEUEDELETELIMIT: parseInt(process.env.QUEUEDELETELIMIT) || 5,
	QUEUEMODIFYLIMIT: parseInt(process.env.QUEUEMODIFYLIMIT) || 5,
	DHCPDELETELIMIT: parseInt(process.env.DHCPDELETELIMIT) || 5,
	DHCPMODIFYLIMIT: parseInt(process.env.DHCPMODIFYLIMIT) || 5
}