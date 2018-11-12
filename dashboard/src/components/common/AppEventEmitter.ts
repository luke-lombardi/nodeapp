import { EventEmitter } from 'events';

export class AppEventEmitter {
  actions: any = [];
  private eventEmitter: EventEmitter;

  constructor() {
    this.actions = [];
    this.eventEmitter = new EventEmitter();

    this.eventEmitter.on('mainEvent', function (eventData: any) {
      console.log('event on function: ', eventData);
    });
  }

  emit(eventType: string, eventData: any) {
    this.eventEmitter.emit(eventType, eventData);
  }
  // @ts-ignore
  addActions(eventData: any) {
    this.actions.push(eventData);
  }

}