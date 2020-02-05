
const sgMail = require('@sendgrid/mail');
// WE CREATED ENVIRONMENT VARIABLE INSTEAD
//const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_GRID)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'danibenjamin46@gmail.com',
		subject: "welcome to the app!",
		text: `${name}, you are now registered to task manager app` //template string
	})
}

const sendCancellationEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'danibenjamin46@gmail.com',
		subject: "you cancelled your account :(",
		text: `${name}, you have cancelled your account, please let us know if somethig went wrong` //template string
	})
}
module.exports = {
	sendWelcomeEmail,
	sendCancellationEmail
}