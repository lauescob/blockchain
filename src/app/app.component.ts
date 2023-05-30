import { Component } from '@angular/core';
import * as CryptoJS from 'crypto-js';

interface Block {
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
}

interface ActionLog {
  timestamp: number;
  action: string;
  block?: Block;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  blockchain: Block[];
  newData: string = '';
  actionLog: ActionLog[] = [];

  constructor() {
    const savedBlockchainData = sessionStorage.getItem('blockchainData');
    if (savedBlockchainData) {
      const { blockchain, actionLog } = JSON.parse(savedBlockchainData);
      this.blockchain = blockchain;
      this.actionLog = actionLog;
    } else {
      this.blockchain = [this.createGenesisBlock()];
    }
  }

  createGenesisBlock(): Block {
    return {
      timestamp: Date.now(),
      data: "",
      previousHash: '000000000',
      hash: '034DFA357',
    };
  }

  getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  newBlock(): void {
    const newBlock: Block = {
      timestamp: Date.now(),
      previousHash: '',
      hash: '',
      data: this.newData
    };
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = this.calculateHash(newBlock);
    newBlock.data = this.newData;
    this.addBlock(newBlock);
    this.newData = '';
  }

  calculateHash(block: Block): string {
    const { timestamp, data, previousHash } = block;
    const dataString = JSON.stringify(data) + previousHash;
    return CryptoJS.SHA256(timestamp + dataString).toString();
  }

  addBlock(newBlock: Block): void {
    this.blockchain.push(newBlock);
    console.log('El usuario ha agregado un nuevo bloque', newBlock);
    this.logAction('addBlock', { block: newBlock });
    this.saveBlockchain();
  }

  updateData(): void {
    if (this.blockchain.length > 0) {
      const lastIndex = this.blockchain.length - 1;
      const blockToUpdate = this.blockchain[lastIndex];
      if (lastIndex !== 0) { // Evitar la actualización del primer bloque
        blockToUpdate.data = this.newData;
        blockToUpdate.timestamp = Date.now();
        blockToUpdate.hash = this.calculateHash(blockToUpdate);
        console.log('El usuario ha actualizado el último bloque', { block: blockToUpdate });
        this.logAction('updateBlock', { block: blockToUpdate });
        this.saveBlockchain();
      } else {
        console.log('No se puede actualizar el primer bloque');
      }
    }
    this.newData = '';
  }

  resetBlockchain(): void {
    this.blockchain = [this.createGenesisBlock()];
    console.log('El usuario ha eliminado los bloques')
    this.logAction('resetBlockchain');
    this.saveBlockchain();
  }

  //Registra una acción en el registro de acciones.
  logAction(action: string, details?: any): void {
    const timestamp = Date.now();
    const logEntry: ActionLog = {
      timestamp: timestamp,
      action: action,
      ...details
    };
    this.actionLog.push(logEntry);
    this.saveActionLog();
  }


  //Guarda el registro de acciones en el Session Storage
  saveActionLog(): void {
    sessionStorage.setItem('actionLog', JSON.stringify(this.actionLog));
  }
  //Guarda la cadena de bloques en el Session Storage.
  saveBlockchain(): void {
    sessionStorage.setItem('blockchain', JSON.stringify(this.blockchain));
  }

  //Guarda los datos actuales de la cadena de bloques (blockchain) y el registro de acciones (actionLog) en el Session Storage.
  saveBlockchainData(): void {
    const blockchainData = {
      blockchain: this.blockchain,
      actionLog: this.actionLog
    };
    console.log('El usuario ha guardado los bloques', blockchainData.blockchain);
    sessionStorage.setItem('savedBlockchainData', JSON.stringify(blockchainData));
  }
}