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

function getValue(variable) {
	try {
		let value = fs.readFileSync('/run/secrets/' + variable).toString().trim();
		console.log('Using secret for "' + variable + '"');
		return value;
	  } catch (err) {
		//console.log(err);
		if(process.env[variable]) {
			if(process.env[variable].toUpperCase()=='TRUE') {
				console.log('Using TRUE boolean environment variable for "' + variable + '"');
				return true;
			} else if(process.env[variable].toUpperCase()=='FALSE') {
				console.log('Using FALSE boolean environment variable for "' + variable + '"');
				return false;
			} else {
				console.log('Using environment variable for "' + variable + '"');
				return process.env[variable];
			}
		} else {
			console.log('Using default value for "' + variable + '"');
			return false;
		}
	  }
}

module.exports = {
    WSLISTENPORT: parseInt(process.env.WSLISTENPORT) || 3001,
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
	DHCPMODIFYLIMIT: parseInt(process.env.DHCPMODIFYLIMIT) || 5,
	EMAILHOST: process.env.EMAILHOST || 'notjustnetworks.com',
	EMAILPORT: parseInt(process.env.EMAILPORT) || 465,
	EMAILSECURE: getBoolean(process.env.EMAILSECURE) || false,
	SMTPIGNORETLS: getBoolean(process.env.SMTPIGNORETLS) || false,
	SMTPREQUIRETLS: getBoolean(process.env.SMTPREQUIRETLS) || false,
	EMAILFROM: process.env.EMAILFROM || '"Test" <test@fakeemail.com>',
	EMAILSENDER: process.env.EMAILSENDER || '"Test" <test@fakeemail.com>',
	EMAILUSER: getValue('EMAILUSER') || false,
	EMAILPASS: getValue('EMAILPASS') || false,
	EMAILNOTIFYTO: process.env.EMAILNOTIFYTO || false
}