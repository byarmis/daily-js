import ScriptMessageChannel from './ScriptMessageChannel';
import { EventEmitter } from 'events';
import { randomStringId } from '../../utils';

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a React Native context.
 */
export default class ReactNativeMessageChannel extends ScriptMessageChannel {
  constructor() {
    super();

    // A ReactNativeMessageChannel is constructed both in daily-js and the call
    // machine. Make sure we only instantiate emitters once.
    global.callMachineToDailyJsEmitter =
      global.callMachineToDailyJsEmitter || new EventEmitter();
    global.dailyJsToCallMachineEmitter =
      global.dailyJsToCallMachineEmitter || new EventEmitter();

    this._wrappedListeners = {}; // Mapping between listeners and wrapped listeners
    this._messageCallbacks = {};
  }

  addListenerForMessagesFromCallMachine(listener, callClientId, thisValue) {
    this._addListener(
      listener,
      global.callMachineToDailyJsEmitter,
      callClientId,
      thisValue,
      'received call machine message'
    );
  }

  addListenerForMessagesFromDailyJs(listener, callClientId, thisValue) {
    this._addListener(
      listener,
      global.dailyJsToCallMachineEmitter,
      callClientId,
      thisValue,
      'received daily-js message'
    );
  }

  sendMessageToCallMachine(message, callback, callClientId) {
    this._sendMessage(
      message,
      global.dailyJsToCallMachineEmitter,
      callClientId,
      callback,
      'sending message to call machine'
    );
  }

  sendMessageToDailyJs(message, callClientId) {
    this._sendMessage(
      message,
      global.callMachineToDailyJsEmitter,
      callClientId,
      null,
      'sending message to daily-js'
    );
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners[listener];
    if (wrappedListener) {
      // The listener was added to one of these. Might as well try removing
      // from both (otherwise we would've needed two remove methods in this
      // class, targeting each side of the channel).
      global.callMachineToDailyJsEmitter.removeListener(
        'message',
        wrappedListener
      );
      global.dailyJsToCallMachineEmitter.removeListener(
        'message',
        wrappedListener
      );
      delete this._wrappedListeners[listener];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _addListener(listener, messageEmitter, callClientId, thisValue, _logMessage) {
    const wrappedListener = (msg) => {
      if (msg.callClientId !== callClientId) return;
      // console.log(`[ReactNativeMessageChannel] ${_logMessage}`, msg);
      if (msg.callbackStamp && this._messageCallbacks[msg.callbackStamp]) {
        // console.log('[ReactNativeMessageChannel] handling message as callback', msg);
        const callbackStamp = msg.callbackStamp; // Storing here since the callback could delete msg.callbackStamp
        this._messageCallbacks[callbackStamp].call(thisValue, msg);
        delete this._messageCallbacks[callbackStamp];
      }
      listener.call(thisValue, msg);
    };
    this._wrappedListeners[listener] = wrappedListener;
    messageEmitter.addListener('message', wrappedListener);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _sendMessage(message, messageEmitter, callClientId, callback, _logMessage) {
    let msg = { ...message };
    msg.callClientId = callClientId;
    if (callback) {
      let stamp = randomStringId();
      this._messageCallbacks[stamp] = callback;
      msg.callbackStamp = stamp;
    }
    // console.log(`[ReactNativeMessageChannel] ${_logMessage}`, msg);
    messageEmitter.emit('message', msg);
  }
}
