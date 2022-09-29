const nodemailer = require('nodemailer');
const config = require('../config');

var ignoretimeout = true;

//wait 20 seconds after startup before allowing any connect or disconnect notifications to be sent
setTimeout(function() {
    ignoretimeout = false;
}, 20000)

let nodemailertransportparams = {
    host: config.EMAILHOST,
    port: config.EMAILPORT,
    secure: config.EMAILSECURE
}

if(config.EMAILSECURE===false) {
    nodemailertransportparams.ignoreTLS = true;
    nodemailertransportparams.requireTLS = false;
}

module.exports = {
    sendNotification: function(params, callback) {
        if(ignoretimeout) {
            //console.log("Ignoring notification message:");
            //console.log(params);
            callback(null);
        } else {
            let html = '<html>' + params.message + '</html>';
            let text = params.message;
            this.sendEmail(params.email, params.subject, text, html, false, function(err) {
                if(err) {
                    console.log(err);
                    callback(err);
                } else {
                    console.log('Email sent successfully to ' + email);
                    callback(null);
                }
            });
        }
    },
    sendEmail: function(to, subject, text, html, attachments, callback) {
        let transporter = nodemailer.createTransport(
			nodemailertransportparams
        );

        let mailOptions = {
            from: config.EMAILFROM,
            sender: config.EMAILSENDER,
            to: to,
            subject: subject,
            html: html,
            text: text
            /*auth: {
                user: config.EMAILUSER,
                pass: config.EMAILPASS
            }*/
        }

        if(config.EMAILUSER && config.EMAILUSER) {
            mailOptions.auth = {
                user: config.EMAILUSER,
                pass: config.EMAILPASS
            }
        }

        //console.log(mailOptions);

        if(attachments) {
            mailOptions.attachments = attachments;
        }
        
        transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
                //console.log(error);
                callback(error);
			} else {
                callback(null);
            }
			//console.log('Message sent: %s', info.messageId);
			// Preview only available when sending through an Ethereal account
			//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		});
    }
}