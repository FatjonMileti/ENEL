const templater = require('./templater.js');
let fileHelper = require('./file.helper.js');
const Mailer = require('./mailer.js');
var path = require('path');
const { sendSMS } = require('./web2sms');

class Reminder {
	constructor(app, templatePath) {
		this.app = app;
		this.templatePath = templatePath;

		this.CLIENT_SEND_LINK = 'CLIENT_SEND_LINK';
		this.CLIENT_SIGNATURE_AGREE = 'CLIENT_SIGNATURE_AGREE';
		this.CLIENT_UPLOAD_AGREE = 'CLIENT_UPLOAD_AGREE';
		this.CLIENT_DOCS_AGREE = 'CLIENT_DOCS_AGREE';
		this.FC_CLIENT_BEFORE_OFFER_EXPIRE = 'FC_CLIENT_BEFORE_OFFER_EXPIRE';
		this.FC_CLIENT_OFFER_EXPIRE = 'FC_CLIENT_OFFER_EXPIRE';
		this.CLIENT_BEFORE_OFFER_EXPIRE = 'CLIENT_BEFORE_OFFER_EXPIRE';
		this.CLIENT_OFFER_EXPIRE = 'CLIENT_OFFER_EXPIRE';
		this.CLIENT_OFFER_ACCEPT = 'CLIENT_OFFER_ACCEPT';
		this.CLIENT_INCOMPLETE_DOCS = 'CLIENT_INCOMPLETE_DOCS';
	}

	async send(type, options = {}, channel, subject = 'Sign', sessionId = '') {
		let { html, txt} = await this.getByType(type, options);
		const emailSubject = this.getEmailSubject(type);

		if (html && channel === 'email') {
			const { email } = options;
			await (new Mailer(this.app)).sendMail(email, emailSubject, html, sessionId);
		} else if (txt && channel === 'sms') {
			const smsSubject = (subject !== '') ? subject : emailSubject;
			const { phone } = options;
			await sendSMS({ recipient: phone, message: txt, subject: smsSubject, sessionID: sessionId });
			// await fileHelper.writeFile(`${this.app.get('smsFolderPath')}/${phone}_${+ new Date()}_SMS.CSV`, `"${txt}";"${phone}"`);
		}
	}

	getEmailSubject(type) {
		const subjects = {
			[this.CLIENT_SEND_LINK]: "Continuare proces contractare",
			[this.CLIENT_SIGNATURE_AGREE]: "Accepta si semneaza oferta PPC!",
			[this.CLIENT_UPLOAD_AGREE]: "Asteptam raspunsul tau",
			[this.CLIENT_DOCS_AGREE]: "Accept documente",
			[this.CLIENT_BEFORE_OFFER_EXPIRE]: "Mai sunt 3 zile pana la expirarea ofertei",
			[this.CLIENT_OFFER_EXPIRE]: "Oferta ta a expirat",
			[this.FC_CLIENT_BEFORE_OFFER_EXPIRE]: "Așteptăm răspunsul tău!",
			[this.FC_CLIENT_OFFER_EXPIRE]: "Vești pentru tine!",
			[this.CLIENT_OFFER_ACCEPT]: "Multumim ca ai acceptat oferta PPC!",
			[this.CLIENT_INCOMPLETE_DOCS]: "Informații importante despre documentele contractuale",
		};

		return subjects[type];
	}

	async getByType(type, options) {
		let template = null;
		switch (type) {
			case this.CLIENT_SEND_LINK:
				template = {
					email: 'mail-initial',
					sms: 'sms-initial',
				};
				break;
			case this.CLIENT_SIGNATURE_AGREE:
				template = {
					email: 'mail-reminder-step1',
					sms: 'sms-reminder-step1',
				};
				break;
			case this.CLIENT_UPLOAD_AGREE:
				template = {
					email: 'mail-reminder-step2',
					sms: 'sms-reminder-step2',
				};
				break;
			case this.CLIENT_DOCS_AGREE:
				template = {
					email: 'mail-message-step3',
					sms: 'sms-message-step3',
				};
				break;
			case this.CLIENT_BEFORE_OFFER_EXPIRE:
				template = {
					email: 'mail-reminder-before-link-expires',
					sms: 'sms-reminder-before-link-expires',
				};
				break;
			case this.CLIENT_OFFER_EXPIRE:
				template = {
					email: 'mail-message-offer-expire',
					sms: 'sms-message-offer-expire',
				};
				break;
			case this.FC_CLIENT_BEFORE_OFFER_EXPIRE:
				template = {
					email: 'mail-reminder-fc-before-link-expires',
					sms: 'sms-reminder-fc-before-link-expires',
				};
				break;
			case this.FC_CLIENT_OFFER_EXPIRE:
				template = {
					email: 'mail-message-fc-offer-expire',
					sms: 'sms-message-fc-offer-expire',
				};
				break;
			case this.CLIENT_OFFER_ACCEPT:
				template = {
					email: 'mail-message-result-offer',
					sms: 'sms-message-result-offer',
				};
				break;
			case this.CLIENT_INCOMPLETE_DOCS:
				template = {
					email: 'mail-message-doc-not-ok',
					sms: 'sms-message-doc-not-ok',
				};
				break;
			case 'doc-all':
				template = {
					mail: null,
					sms: 'sms-message-doc-all',
				};
				break;
			case 'doc-partial':
				template = {
					mail: null,
					sms: 'sms-message-doc-partial',
				};
				break;
		}
		return await this.getTemplates(template, options);
	}

	async getTemplates(template, options = {}) {
		let html = null, txt = null;
		let file = null;

		if (template.email) {
			file = await fileHelper.readFile(`${this.templatePath}/telesales/${template.email}.html`);
			html = templater(file, options);
		}

		if (template.sms) {
			file = await fileHelper.readFile(`${this.templatePath}/telesales/${template.sms}.txt`);
			txt = templater(file, options);
		}

		return { html, txt };
	}
}

module.exports = Reminder;
