import { notImplementedError } from '../../utils';

/**
 * A two-way message channel between daily-js and the call machine (pluot-core).
 */
export default class ScriptMessageChannel {
  /**
   * Adds a listener for messages from the call machine (pluot-core).
   * For use by daily-js.
   */
  addListenerForMessagesFromCallMachine(listener, callClientId, thisValue) {
    notImplementedError();
  }

  /**
   * Adds a listener for messages from daily-js.
   * For use by the call machine (pluot-core).
   */
  addListenerForMessagesFromDailyJs(listener, callClientId, thisValue) {
    notImplementedError();
  }

  /**
   * Send a message to the call machine (pluot-core).
   * For use by daily-js.
   */
  sendMessageToCallMachine(message, callback, iframe, callClientId) {
    notImplementedError();
  }

  /**
   * Send a message to daily-js.
   * For use by the call machine (pluot-core).
   */
  sendMessageToDailyJs(message, callClientId) {
    notImplementedError();
  }

  /**
   * Remove an added listener.
   */
  removeListener(listener) {
    notImplementedError();
  }
}
