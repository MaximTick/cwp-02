const fs = require('fs');
const net = require('net');
const exec = require('child_process');
const clientSwarm = require('./client-swarm.js');
const port = 8124;

clientSwarm(process.argv[2]);

var right = 0;
var quest;
var count = 0;
var arrQuestion = [];
var clientCount;

const client = new net.Socket();
client.setEncoding('utf8');

client.connect(port, function () {
  console.log('Connected');
  sendQA(client);

  var formJSON = fs.readFileSync('./qa.json', 'utf8');

  let str = JSON.parse(formJSON, function (key, value) {
    let quest = new question(key, value);
    arrQuestion.push(quest);
  });
  arrQuestion.pop();
});

client.on('data', function (data) {
  if(data.indexOf('ASK') == 0){
    clientCount = data.substring(3);
    console.log('----------start test----------');

    sendMessageToServer(client, arrQuestion);
  }
  else if(data == 'DEC'){
    client.destroy();
  }
  else if(data.indexOf('answer') == 0){
    let answer = data.substring(6);
    console.log('Вопрос: ' + quest + ' ' + 'Ответ: ' + answer);
    count = count + 1;

    fs.appendFileSync('config' + clientCount + '.txt', 'Вопрос: ' + quest + ' ' + 'Ответ: ' + answer + '\n');

    for(let i = 0; i < arrQuestion.length; i++){
      if(arrQuestion[i].ask == quest && arrQuestion[i].answer == answer){
        right = right + 1;;
      }
    }

    if(count != arrQuestion.length){
      sendMessageToServer(client, arrQuestion);
    }
    else{
      fs.appendFileSync('config' + clientCount + '.txt', 'Количество правильных ответов: ' + right);
      console.log('Количество правильных ответов: ' + right);
      client.destroy();
    }
  }
});

function sendQA(client) {
  console.log('func: sendQA');
  client.write('QA');
};

function sendMessageToServer(client, arrQuestion) {
  console.log('func: sendMessageToServer');

  //console.log(arrQuestion);

  arrQuestion.sort(compareRandom);
  max = arrQuestion.length;

  var rand = max * Math.random();
  rand = Math.floor(rand);

  quest = arrQuestion[rand].ask;
  client.write('ask' + arrQuestion[rand].ask);

  //client.write('DEC');
};

var question = function(ask, answer) {
  this.ask = ask;
  this.answer = answer;
};

function compareRandom(){
  return Math.random() - 0.5;
};

client.on('close', function () {
  console.log('Connection closed');
});
