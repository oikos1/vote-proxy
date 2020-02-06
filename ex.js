const TronWeb = require('tronweb');
const fs = require('fs');
const CryptoUtils = require("@tronscan/client/src/utils/crypto");
const TransactionUtils = require("@tronscan/client/src/utils/transactionBuilder")
const BigNumber = require('bignumber.js');
const colors = require('colors');

const web3 = require('web3');

const HttpProvider = TronWeb.providers.HttpProvider;
// Full node http endpoint
const fullNode = new HttpProvider("http://192.168.0.108:9090");
// Solidity node http endpoint
const solidityNode = new HttpProvider("http://192.168.0.108:9090");
// Contract events http endpoint
const eventServer = "http://192.168.0.108:9090";

// update with your private key here
const privateKey = '3f2cdb5f5d5c8618b1aeb6b32ca4f32c9254c01150161962898eab4c089bc554';
const _address = 'TJzcZvmyrztfHhvCD8s6zi2AVYoscgWqtJ';



const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
tronWeb.setAddress(_address);

//const VoteProxy_Address          = '';
const VoteProxyFactory_Address   = 'TUqMs6C2TpYiobK4qLM2mMRENuLshPKngo';
const Chief_Address              = 'THZttibHjGqqazpR3HL8TAfYJideiMu1TU';

console.log(tronWeb.address.toHex(VoteProxy_Address))

const deployContract = async (name, ...args) => {
    const Contract = loadArtifact(name);
    const contractInstance = await tronWeb.contract().new({
        abi: Contract.abi,
        bytecode: Contract.bytecode,
        feeLimit: 1000000000,
        callValue: 0,
        userFeePercentage: 100,
        from : 123,
        parameters: args
    });

    const address = tronWeb.address.fromHex(contractInstance.address);
    console.log(
        `Contract ${name} Deployed: address: ${address}, hexAddress: ${contractInstance.address}`
    );
    return contractInstance;
};

const loadArtifact = name => {
    return JSON.parse(fs.readFileSync(`./build/contracts/${name}.json`));
};

const loadContract = async address => {
    return await tronWeb.contract().at(address);
};


/*const hotAddress = '';
const daiAddress = '';
const exchangeAddress = '';
const multiSigWalletAddress = '';*/

const waitSendResponse = async txID => {
    for (let i = 0; i < 100; i++) {
        console.log(`wait Transaction ${txID}`);
        res = await tronWeb.trx.getTransactionInfo(txID);

        if (res.id) {
            if (res.receipt.result === 'SUCCESS') {
                return res.contractResult;
            } else {
                throw `${res.receipt.result} ${JSON.stringify(res)}`;
            }
        }
        await new Promise(r => {
            setTimeout(r, 1000);
        });
    }
};

const run = async () => {

    //deploy
    //const VoteProxy = !!VoteProxy_Address ? await loadContract(VoteProxy_Address) : await deployContract('VoteProxy', Chief_Address, "410000000000000000000000000000000000000000", _address); // web3.utils.asciiToHex('SAI').padEnd(66, '0')        
    const VoteProxyFactory = !!VoteProxyFactory_Address ? await loadContract(VoteProxyFactory_Address) : await deployContract('VoteProxyFactory', Chief_Address); // web3.utils.asciiToHex('SAI').padEnd(66, '0')        
/*      
    console.log(await VoteProxy.self().call());

    VoteProxyFactory.linkSelf(VoteProxy_Address).send({
            shouldPollResponse: true,
            callValue: 0, 
            from : _address
        }).then(function (res) {
           
            console.log("linkSelf " , res);

        }).catch(function (err) {
            console.log(err)
    });
*/    
};

run();

const repeat = (x, n) => n > 0 ? new Array(n + 1).join(x) : ""
//const rpad = (x, y, n) => x + repeat(y, n - x.length)
const lpad = (x, y, n) => repeat(y, n - x.length) + x
const toHex = wad => new BigNumber(wad.toString().replace(".", "")).toString(16)
const toBytes12 = (wad) => `0x${lpad(toHex(`${wad}`), "0", 24)}`
const toBytes32 = (wad) => `0x${lpad(toHex(`${wad}`), "0", 64)}`

//16进制的ASCII字符串转为byteArray格式。

//16进制的ASCII字符串转为byteArray格式。
function hexStr2byteArray(str) {
  var byteArray = Array();
  var d = 0;
  var j = 0;
  var k = 0;

  for (let i = 0; i < str.length; i++) {
    var c = str.charAt(i);
    if (isHexChar(c)) {
      d <<= 4;
      d += hexChar2byte(c);
      j++;
      if (0 === (j % 2)) {
        byteArray[k++] = d;
        d = 0;
      }
    }
  }
  return byteArray;
}

/* Check if a char is hex char */
function isHexChar(c) {
  if ((c >= 'A' && c <= 'F') ||
      (c >= 'a' && c <= 'f') ||
      (c >= '0' && c <= '9')) {
    return 1;
  }
  return 0;
}
/* Convert a hex char to value */
function hexChar2byte(c) {
  var d = 0;
  if (c >= 'A' && c <= 'F') {
    d = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }
  else if (c >= 'a' && c <= 'f') {
    d = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
  }
  else if (c >= '0' && c <= '9') {
    d = c.charCodeAt(0) - '0'.charCodeAt(0);
  }
  return d;
}
