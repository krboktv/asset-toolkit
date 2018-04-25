import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Connection, ContractData } from '../shared/types';
import { Account, Contract, Tx } from 'web3/types';
import Web3 from 'web3';
import to from 'await-to-js';
import { HelperService } from '.';
import { ErrorMessageService } from '../shared/services';
import { ToastyService } from 'ng2-toasty';
import { BlockingNotificationOverlayService } from '../shared/services';
declare const require: any;

@Injectable()
export class ConnectionService extends BehaviorSubject<Connection> {
  /**
   * Service for Connection to Blockchain
   */
  public isRinkeby: boolean;
  public err: Subject<Error> = new Subject();
  public web3: any;
  public contract: Contract;
  public contractData: ContractData;
  public account: string;

  private utils = (Web3 as any).utils;
  private useHardcodedContractData = false;
  private balances: any;

  public constructor(
    private $error: ErrorMessageService,
    private $toasty: ToastyService,
    private $blockingNotificationOverlay: BlockingNotificationOverlayService,
  ) {
    super(Connection.None); // set initial connection state
    this.web3 = this.checkAndInstantiateWeb3();
    this.connect();
  }

  public async connect(contractHash?: string) {
    this.next(Connection.InProcess);
    this.contractData = new ContractData(contractHash);
    try {
      await this.init();
      this.contract = new this.web3.eth.Contract(this.contractData.abi, this.contractData.address);
      this.next(Connection.Estableshed);
      this.startLoops();
    } catch (e) {
      this.$blockingNotificationOverlay.setOverlayMessage(e);
      this.$blockingNotificationOverlay.showOverlay();
      this.next(Connection.None);
      console.error(e);
    }
  }

  public getAccount = () => this.account;

  private init = () => {
    return new Promise((resolve, reject) => {
      if (!this.web3) {
        this.$blockingNotificationOverlay.setOverlayMessage('No Metamask');
        this.$blockingNotificationOverlay.showOverlay();
        return reject('No Metamask');
      }
      this.web3.eth.getAccounts((err, acc) => {
        if (err) {
          reject(err);
        }
        if (!acc[0]) {
          this.$blockingNotificationOverlay.setOverlayMessage('Metamask Locked');
          this.$blockingNotificationOverlay.showOverlay();
          return reject('Metamask Locked');
        }
        this.account = acc[0]; // save account data
        this.web3.eth.net.getNetworkType((e, net) => {
          if (e) { reject(e); return; }
          if (net !== 'rinkeby' && net !== 'private') { // && net !== 'private'
            this.$blockingNotificationOverlay.setOverlayMessage('Choose Rinkeby Network');
            this.$blockingNotificationOverlay.showOverlay();
            return reject('Choose Rinkeby Network');
          } else {
            this.isRinkeby = net === 'rinkeby';
          }
          this.next(Connection.InProcess);
          this.$blockingNotificationOverlay.hideOverlay();
          resolve();
        });
      });
    });
  };

  private startLoops() {
    const accountInterval = setInterval(this.watchAccountChange.bind(this), 1000);
  }

  private checkAndInstantiateWeb3() {
    // tslint:disable:max-line-length
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof (window as any).web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      return new Web3((window as any).web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      return new Web3(new Web3.providers.HttpProvider('https://rpcprovider.staging.bankex.team:8635'));
    }
  }

  private watchAccountChange() {
    this.web3.eth.getAccounts((err, acc) => {
      if (err) {
        this.err.next(err);
        console.error(err.message);
        return;
      }
      if (acc[0] !== this.account) {
        // account = this.web3.eth.accounts[0];
        window.location.reload();
      }
    })
  }
}
