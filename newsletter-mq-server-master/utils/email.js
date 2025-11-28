require('dotenv').config();
const PromisePool = require('es6-promise-pool');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const concurrency = 50;

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

async function largeSend(emails, test=false) {

  if(!Array.isArray(emails)) throw new Error('Arguments must be array.');

  let count = 0;
  const maxCount = emails.length;
  const failureList = [];

  function promiseProducer() {
    if(count < maxCount){
      const promise = test? Promise.resolve({
        status: 'success',
        message: 'send successful!',
        address: 'test@musicoin.org'
      }):send(emails[count]);
      count++;
      return promise;
    }else{
      return null;
    }
  }

  const pool = new PromisePool(promiseProducer, concurrency);

  pool.addEventListener('fulfilled', function (event) {
    if(event.data.result&&event.data.result.status === 'failure'){
      failureList.push(event.data.result.address);
    }
    console.log(`send to email: `, event.data.result.address);
  })

  const poolPromise = pool.start();
  return poolPromise.then(function () {
    return failureList;
  })
}

module.exports = {
  send: send,
  multiSend: multiSend,
  largeSend: largeSend
};