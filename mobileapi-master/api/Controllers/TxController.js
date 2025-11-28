const express = require('express');

class TxController {

  constructor(_txModule, _orbiterEndpoint, web3) {
    this.txModule = _txModule;
    this.orbiterEndpoint = _orbiterEndpoint;
    this.web3 = web3;
  };

  getTxDetails(Request, Response) {
    try {
      this.txModule.getTransactionDetails(Request.params.hash).then(res => {

        Response.send(res);
      }).catch(Error => {

        Response.send({
          error: Error.message
        })
      });
    } catch (Error) {
      Response.send({
        error: Error.message
      })
    }

  }

  getTx(Request, Response) {
    this.txModule.getTransaction(Request.params.hash).then(res => {
      Response.send(res);
    })
  }
  getTxReceipt(Request, Response) {
    this.txModule.getTransactionReceipt(Request.params.hash).then(res => {
      Response.send(res);
    })
  }
  getTxStatus(Request, Response) {
    this.txModule.getTransactionStatus(Request.params.hash).then(res => {
      let web3 = this.web3.getWeb3();

      let currentBlock = web3.eth.blockNumber;
      
      if (res && res.receipt) {
        let confirmNumber = Number(currentBlock - res.receipt.blockNumber);
        if(confirmNumber >= 100){
          Response.send({
            confirmed: false
          })
        }else{
          Response.send({
            confirmed: true,
            NumberOfConfirmations: confirmNumber
          })
        }
      } else {
        Response.send({
          confirmed: false
        })
      }
    }).catch(Error => {
      Response.send({
        error: Error.message
      })
    })
  }

  getTxHistory(Request, Response) {
    const web3 = this.web3.getWeb3();
    let currentBlock = web3.eth.blockNumber;
    // let myaccount = '0x2f56d753e4f10f2c88e95c5c147f4f2498beda17';
    let myaccount = Request.params.address;
    let txs = [];
    if(currentBlock<1000){
      return Response.send(txs);
    }
    for (let i = currentBlock - 1000; i < currentBlock; i++) {
      let block = web3.eth.getBlock(i, true);
      if (block && block.transactions.length > 0) {
        console.log('block = ' + (currentBlock - i));
        block.transactions.forEach(function(tx) {
          if (myaccount === tx.from || myaccount === tx.to) {
            let txInstance = {
              txid: tx.hash,
              from: tx.from,
              gas: tx.gas,
              to: tx.to,
              date: new Date(block.timestamp),
              amount: web3.fromWei(tx.value, 'ether'),
              paymentDate: tx.timestamp,
              blockHeight: tx.blockNumber,
              confirmNumber: currentBlock - tx.blockNumber,
              link: 'https://explorer.musicoin.org/tx/' + tx.hash
            };
            txs.push(txInstance);
          }
        })
      }
    }
    Response.send(txs);
  }
}

module.exports = TxController;
