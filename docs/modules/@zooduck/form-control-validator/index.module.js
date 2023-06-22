/**
 * A functional web component for normalizing form
 * validation message display across devices.
 *
 * Automatically blocks user agent validation
 * message tooltips and outputs validation messages
 * to an element of your choice.
 *
 * Supports custom validation messages for all known
 * validity states (valueMissing, patternMismatch, etc.)
 *
 * Custom validation messages can be merged with user agent
 * validation messages using the optional "merge" flag.
 * (Validation messages will be separated by a line break,
 * with the user agent message displayed on the first line).
 *
 * @example
 * // Add a text input and label to a form:
 * <form>
 *   <label for="user">User</label>
 *   <form-control-validator>
 *     <input id="user" name="user" required>
 *   </form-control-validator>
 *   <div data-validation-message-for="user"></div>
 *   <button>Submit</button>
 * </form>
 *
 * @example
 * // Add a checkbox and label to a form:
 * <form>
 *   <fieldset>
 *     <label for="terms">
 *       <form-control-validator>
 *         <input id="terms" name="terms" required type="checkbox">
 *       </form-control-validator>
 *       I have read the terms and conditions.
 *     </label>
 *     <div data-validation-message-for="terms"></div>
 *   </fieldset>
 * </form>
 *
 * @example
 * // Add custom validation to an input with "required" and "pattern" attributes:
 * <label for="user">User</label>
 * <form-control-validator>
 *   <input id="user" name="user" pattern="[a-zA-Z0-9_]+" required>
 * </form-control-validator>
 * <div data-validation-message-for="user"></div>
 * <script>
 *   document.getElementById('user').closest('form-control-validator').customValidationMessages = {
 *     valueMissing: { message: 'This field must not be empty.' },
 *     patternMismatch: {
 *       message: 'Please use alpha-numeric characters and underscores only.'
 *     }
 *   }
 * </script>
 *
 * @example
 * // Add custom validation with dynamic content to an input using a callback:
 * <form-control-validator>
 *   <label for="user">User</label>
 *   <input id="user" minlength="5" name="user">
 *   <div data-validation-message-for="user"></div>
 * </form-control-validator>
 * <script>
 *   document.getElementById('user').closest('form-control-validator').customValidationMessages = {
 *     tooShort: {
 *       message: (input) => {
 *        return `Please lengthen this text to {input.minLength} characters or more (you are currently using {input.value.length} characters).`
 *       }
 *     }
 *   }
 * </script>
 */
class HTMLFormControlValidatorElement extends HTMLElement {
  #canReportValidity = false;
  #customValidationMessages = {};
  #hasRendered = false;
  #input;
  #validationMessageElement;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#addEventListeners();
  }
  /**
   * @method
   * @returns {void}
   */
  connectedCallback() {
    if (this.#hasRendered) {
      return;
    }
    this.render();
  }
  /**
   * @type {Object.<string, {message: string|Function, merge?: boolean}>}
   */
  get customValidationMessages() {
    return this.#customValidationMessages;
  }
  set customValidationMessages(value) {
    this.#customValidationMessages = value;
  }
  /**
   * @type {string}
   * @readonly
   */
  get validationMessage() {
    let validityStateError;
    const validityState = this.#input.validity;
    for (let key in validityState) {
      if (validityState[key]) {
        validityStateError = key;
        break;
      }
    }
    const customValidationMessageConfig = this.customValidationMessages[validityStateError] || {};
    const { message, merge } = customValidationMessageConfig;
    let parsedMessage;
    if (message) {
      parsedMessage = typeof(message) === 'function' ? message(this.#input) : message;
    }
    if (message && merge) {
      return `${this.#input.validationMessage}\n${parsedMessage}`;
    }
    return parsedMessage || this.#input.validationMessage;
  }
  /**
   * @method
   * @returns {void}
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.#hasRendered = true;
  }
  /**
   * @method
   * @returns {void}
   */
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
  }
  /**
   * @method
   * @private
   * @returns {HTMLSlotElement}
   */
  #createContent() {
    return new DOMParser().parseFromString(`<slot></slot>`, 'text/html').body.firstElementChild;
  }
  /**
   * @type {EventListener}
   */
  #onFormControlInput() {
    if (!this.#canReportValidity) {
      return;
    }
    this.#updateValidationMessageDisplay();
    this.#updateValidityStateAttributes();
  }
  /**
   * @type {EventListener}
   */
  #onFormControlInvalid(event) {
    event.preventDefault();
    this.#canReportValidity = true;
    this.#updateValidationMessageDisplay();
    this.#updateValidityStateAttributes();
  }
  /**
   * @type {EventListener}
   */
  #onFormReset() {
    this.#resetValidationMessageDisplay();
    this.#resetValidityStateAttributes();
    this.#canReportValidity = false;
  }
  /**
   * @type {EventListener}
   */
  #onSlotChange(event) {
    this.#input = event.target.assignedElements()[0];
    this.#validationMessageElement = this.getRootNode().querySelector(`[data-validation-message-for="${this.#input?.id}"]`);
    if (!this.#input || !this.#validationMessageElement) {
      return;
    }
    this.#input.addEventListener('invalid', this.#onFormControlInvalid.bind(this));
    this.#input.addEventListener('input', this.#onFormControlInput.bind(this));
    this.#input.form && this.#input.form.addEventListener('reset', this.#onFormReset.bind(this));
  }
  /**
   * @method
   * @private
   * @returns {void}
   */
  #resetValidationMessageDisplay() {
    this.#validationMessageElement.innerText = '';
    this.#input.title = this.validationMessage;
  }
  #resetValidityStateAttributes() {
    this.#input.removeAttribute('aria-valid');
    this.#input.removeAttribute('aria-invalid');
  }
  /**
   * @method
   * @private
   * @returns {void}
   */
  #updateValidationMessageDisplay() {
    this.#validationMessageElement.innerText = this.validationMessage;
    this.#input.title = this.validationMessage;
  }
  /**
   * @method
   * @private
   * @returns {void}
   */
  #updateValidityStateAttributes() {
    const isValid = !this.validationMessage;
    this.#input.setAttribute('aria-valid', isValid);
    this.#input.setAttribute('aria-invalid', !isValid);
  }
}

customElements.define('form-control-validator', HTMLFormControlValidatorElement);
