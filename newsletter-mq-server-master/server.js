require('dotenv').config();
const amqp = require('amqplib');
const largeSend = require('./utils/email').largeSend;
const Letter = require('./db/models/news-letter');

const queue = "email";

const INSERT_HTML_1 = `<table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; margin-top: 30px;"><tbody><tr><td style="padding:0px 00px 0px 24px;line-height:28px;text-align:justify;" height="100%" valign="top" bgcolor=""><div style="text-align: center;"><div style="font-family: helvetica, arial, sans-serif; font-size: 14px; caret-color: rgb(21, 21, 21); color: rgb(21, 21, 21); font-style: normal; font-variant-caps: normal; font-weight: 400; text-size-adjust: auto; font-variant-ligatures: normal; text-align: center;"><span style="font-family: helvetica, arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; background-color: transparent; font-size: 9px;"><font color="#3e3e3e" face="verdana, geneva, sans-serif"><span style="font-size: 9px;">Powered by&nbsp;<a href="http://www.musicoin.org" style="color: rgb(230, 165, 17); font-size: 9px;">musicoin.org</a></span></font></span><span style="font-family: helvetica, arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; background-color: transparent; font-size: 9px;">&nbsp;© 2018</span></div><div style="font-family: helvetica, arial, sans-serif; font-size: 14px; caret-color: rgb(21, 21, 21); color: rgb(21, 21, 21); font-style: normal; font-variant-caps: normal; font-weight: 400; text-size-adjust: auto; font-variant-ligatures: normal; text-align: center;"><span style="font-size: 9px;">2F, Enterprise Place, Science Park, Hong Kong,</span></div><div style="font-family: helvetica, arial, sans-serif; font-size: 14px; caret-color: rgb(21, 21, 21); color: rgb(21, 21, 21); font-style: normal; font-variant-caps: normal; font-weight: 400; text-size-adjust: auto; font-variant-ligatures: normal; text-align: center;"><div style="font-family: helvetica, arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400;"><span style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; font-family: verdana, geneva, sans-serif; font-size: 9px; color: rgb(62, 62, 62);">You receive this newsletter because you sub</span><span style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; font-family: verdana, geneva, sans-serif; font-size: 9px; color: rgb(62, 62, 62);">scribed to our service</span></div></div></div></td></tr></tbody></table>`;
const INSERT_HTML_2 = `<table class="module" role="module" data-type="social" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;"><tbody><tr><td valign="top" style="padding:0px 24px 0px 24px;font-size:6px;line-height:10px;"><table align="center"><tbody><tr><td style="padding: 0px 5px;"><a role="social-icon-link" href="https://www.facebook.com/lovemusicoin" target="_blank" alt="Facebook" data-nolink="false" title="Facebook " style="-webkit-border-radius:0px;-moz-border-radius:0px;border-radius:0px;display:inline-block;background-color:#3B579D;"><img role="social-icon" alt="Facebook" title="Facebook " height="30" width="30" style="height: 30px, width: 30px" src="https://marketing-image-production.s3.amazonaws.com/social/white/facebook.png"></a></td><td style="padding: 0px 5px;"><a role="social-icon-link" href="https://twitter.com/musicoins" target="_blank" alt="Twitter" data-nolink="false" title="Twitter " style="-webkit-border-radius:0px;-moz-border-radius:0px;border-radius:0px;display:inline-block;background-color:#7AC4F7;"><img role="social-icon" alt="Twitter" title="Twitter " height="30" width="30" style="height: 30px, width: 30px" src="https://marketing-image-production.s3.amazonaws.com/social/white/twitter.png"></a></td><td style="padding: 0px 5px;"><a role="social-icon-link" href="https://www.instagram.com/musicoinofficial" target="_blank" alt="Instagram" data-nolink="false" title="Instagram " style="-webkit-border-radius:0px;-moz-border-radius:0px;border-radius:0px;display:inline-block;background-color:#7F4B30;"><img role="social-icon" alt="Instagram" title="Instagram " height="30" width="30" style="height: 30px, width: 30px" src="https://marketing-image-production.s3.amazonaws.com/social/white/instagram.png"></a></td></tr></tbody></table></td></tr></tbody></table>`;
// 3DAYS
const TIMEOUT = 3*24*60*60*1000;
const URLUtil = require('./utils/url-utils');

const UNSUBSCRIBE_ENPOINT = process.env.UNSUBSCRIBE_SERVER+"/unsubscribe?token=";
const UNSUBSCRIBE_HTML_HEAD = `<div data-role="module-unsubscribe" class="module unsubscribe-css__unsubscribe___2CDlR" role="module" data-type="unsubscribe" style="color:#444444;font-size:12px;line-height:20px;padding:0px 16px 0px 16px;text-align:center;margin-top: 30px;border-top-color: '#80808038'; border-top-style: inset;border-top-width: 1px;"><p style="font-family:[Sender_Name];font-size:12px;line-height:20px"><a class="Unsubscribe--unsubscribeLink" href="`;
const UNSUBSCRIBE_HTML_TAIL = `">Want to Unsubscribe ?</a></p></div>`;

const argv0 = process.argv[2];
const mode = argv0 && argv0 === "--test"?"test":"live";
console.log("mode :",mode);

function start() {
  amqp.connect(process.env.RABBITMQ_SERVER).then(conn => {
    process.once('SIGINT', conn.close.bind(conn));
    return conn.createChannel().then(ch => {
      ch.prefetch(1);
  
      function _handleMessage(message) {
        handleMessage(ch, message);
      }
  
      return ch.assertQueue(queue, {
        durable: false
      }).then(() => {
        ch.consume(queue, _handleMessage, {
          noAck: false
        });
      }).then(() => {
        console.log('[*] Waiting for message. To exit press CRTL+C');
      });;
  
    });
  }).catch(error => {
    console.log("error: ", error.message);
    setTimeout(() => {
      start();
    }, 10*1000);
  });
}

async function handleMessage(channel, message) {
  let content;
  try {
    const json = message.content.toString();
    content = JSON.parse(json);
  } catch (error) {
    console.log("message is invalid: ",error.message);
    return channel.ack(message);
  }
  

  const id = content.id;
  console.log("task start:", id);
  let skip = content.skip || 0;
  let limit = content.limit || 1000;
  console.log("message content: ", content);

  try {
    const letter = await Letter.findById(id).exec();

    if(!letter){
      channel.ack(message);
      console.log("letter not found: ",id);
      return
    }

    const subject = letter.subject;
    const html = letter.html;
    const addresses = letter.addresses.slice(skip, skip+limit);
    const emails = addresses.map(address => {
      const token = URLUtil.createExpiringLink(address, TIMEOUT);
      const unsubscribeLink = UNSUBSCRIBE_ENPOINT+token;
      const unsubscribe_html = `${UNSUBSCRIBE_HTML_HEAD}${unsubscribeLink}${UNSUBSCRIBE_HTML_TAIL}`;
      const real_html = `${html}${unsubscribe_html}`;
      return {
        subject,
        html: real_html,
        from: 'news@musicoin.org',
        to: address
      }
    });

    try {
      const issues = await largeSend(emails,mode==='test');
      letter.issues = issues;
      letter.status = "sended";
      await letter.save();
      channel.ack(message);
      console.log("task complete.");
    } catch (error) {
      letter.status = "error";
      await letter.save();
      channel.ack(message);
      console.log("task abort, error: ",error.message);
    }

    
  } catch (error) {
    console.log("error:", error.message);
    channel.nack(message)
  }
}

start();