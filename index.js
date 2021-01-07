const cron = require("node-cron");
const express = require("express");
const axios = require('axios');

app = express();


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cronwebscrapper@gmail.com',
    pass: '123456cron'
  }
});



function enviarEmail(mensagem){
    var mailOptions = {
        from: 'cronwebscrapper@gmail.com',
        to: 'williamsp1184@gmail.com',
        subject: 'Corre pro mercado do bitcoin',
        text: mensagem
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}


const MOEDAS_VALOR_ALERTA = {
    'BRLXRP' : { valor: 1.35, nome:'XRP'},
    'BRLBCH' : { valor: 2400, nome:'BITCOIN CASH'},
    'BRLBTC' : { valor: 190000, nome:'BITCOINN'},
    'BRLLTC' : { valor: 906, nome:'LITECOIN'}
}

let emailJaEnviado = {
    'BRLXRP' : false,
    'BRLBCH' : false,
    'BRLBTC' : false,
    'BRLLTC' : false
};

let contador  = 120;

cron.schedule("* * * * *", () => {
    
    console.log("Executando a tarefa a cada 1 minuto")
    const apiurl = "https://cdn.mercadobitcoin.com.br/api/tickers?pairs=BRLBTC,BRLBCH,BRLLINK,BRLCHZ,BRLETH,BRLLTC,BRLPAXG,BRLUSDC,BRLWBX,BRLXRP&ProntoRequestbuster=1609981180847";
    axios(apiurl).then(response => {
        if(response.data && response.data.ticker){
            response.data.ticker.map((moeda)=>{
                if(MOEDAS_VALOR_ALERTA[moeda.pair]){
                    console.log("VERIFICANDO MOEDA " + MOEDAS_VALOR_ALERTA[moeda.pair].nome + " valor minimo: " + MOEDAS_VALOR_ALERTA[moeda.pair].valor + " valor atual: " + moeda.last);
                    if(MOEDAS_VALOR_ALERTA[moeda.pair].valor >  moeda.last){

                        if(!emailJaEnviado[moeda.pair]){
                            let mensagem = `A moeda ${MOEDAS_VALOR_ALERTA[moeda.pair].nome} sofreu uma queda passando pelo minimo ${MOEDAS_VALOR_ALERTA[moeda.pair].valor} e chegando a ${ moeda.last }`;
                            enviarEmail(mensagem);
                            emailJaEnviado[moeda.pair]= true;
                        }else{
                            contador--;
                        }

                        if(contador <= 0){
                            contador = 30;
                            emailJaEnviado[moeda.pair]= false;
                        }




                    }

                }
            });
        }
        
    }).catch(console.error);


});

app.listen(1313);