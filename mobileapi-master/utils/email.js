const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function send(email){
  return new Promise((resolve) => {
    sgMail.send(email,(error, result)=>{
      if (error) {
        resolve({
          status: 'failure',
          message: error.message,
          address: email.to
        })
      }else{
        resolve({
          status: 'success',
          message: 'send successful!',
          address: email.to
        })
      }
    }).catch(err=>{})
  })
}

function multiSend(emails) {
  if(!Array.isArray(emails)) throw new Error('Arguments must be array.');
  return Promise.all(emails.map(email => {
    return send(email)
  }))
}

module.exports = {
  send: send,
  multiSend: multiSend
};