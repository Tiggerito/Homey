'use strict';

const Homey = require('homey');

// testing via stripe cli (installed) https://stripe.com/docs/cli/trigger
// can also send in test mode fromt he webhook https://dashboard.stripe.com/test/webhooks/we_1JA8sGBoUjWbRYwAFVb5ca4K

class MyApp extends Homey.App {
	
	async onInit() {
		const id = Homey.env.WEBHOOK_ID; 
		const secret = Homey.env.WEBHOOK_SECRET; 
		const data = {
		  // Provide unique properties for this Homey here
		  deviceId: 'stripe1',
		};

		const stripe_invoice_payment_succeededTrigger = this.homey.flow.getTriggerCard('stripe_invoice_payment_succeeded');

		const myWebhook = await this.homey.cloud.createWebhook(id, secret, data);
	
		myWebhook.on('message', async args => {
		  this.log('Got a webhook message!');
		  this.log('headers:', args.headers);
		  this.log('query:', args.query);
		  this.log('body:', args.body);

		  this.log('amount_paid:', args.body.data.object.amount_paid);

		  await stripe_invoice_payment_succeededTrigger.trigger();


		});
	  }
	
}

module.exports = MyApp;