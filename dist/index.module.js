/* -------------------------------------- */
/* @zooduck/form-control-validator v0.0.1 */
/* -------------------------------------- */
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
  connectedCallback() {
    if (this.#hasRendered) {
      return;
    }
    this.render();
  }
  get customValidationMessages() {
    return this.#customValidationMessages;
  }
  set customValidationMessages(value) {
    this.#customValidationMessages = value;
  }
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
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.#hasRendered = true;
  }
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
  }
  #createContent() {
    return new DOMParser().parseFromString(`<slot></slot>`, 'text/html').body.firstElementChild;
  }
  #onFormControlInput() {
    if (!this.#canReportValidity) {
      return;
    }
    this.#updateValidationMessageDisplay();
    this.#updateValidityStateAttributes();
  }
  #onFormControlInvalid(event) {
    event.preventDefault();
    this.#canReportValidity = true;
    this.#updateValidationMessageDisplay();
    this.#updateValidityStateAttributes();
  }
  #onFormReset() {
    this.#resetValidationMessageDisplay();
    this.#resetValidityStateAttributes();
    this.#canReportValidity = false;
  }
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
  #resetValidationMessageDisplay() {
    this.#validationMessageElement.innerText = '';
    this.#input.title = this.validationMessage;
  }
  #resetValidityStateAttributes() {
    this.#input.removeAttribute('aria-valid');
    this.#input.removeAttribute('aria-invalid');
  }
  #updateValidationMessageDisplay() {
    this.#validationMessageElement.innerText = this.validationMessage;
    this.#input.title = this.validationMessage;
  }
  #updateValidityStateAttributes() {
    const isValid = !this.validationMessage;
    this.#input.setAttribute('aria-valid', isValid);
    this.#input.setAttribute('aria-invalid', !isValid);
  }
}
customElements.define('form-control-validator', HTMLFormControlValidatorElement);