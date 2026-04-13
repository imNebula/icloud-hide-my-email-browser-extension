import {
  ActiveInputElementWriteData,
  GenerationResponseData,
  Message,
  MessageType,
  ReservationRequestData,
  ReservationResponseData,
} from '../../messages';
import { v4 as uuidv4 } from 'uuid';
import './index.css';
import browser from 'webextension-polyfill';
import { getBrowserStorageValue } from '../../storage';

const EMAIL_INPUT_QUERY_STRING =
  'input[type="email"], input[name="email"], input[id="email"]';

const LEGACY_HME_BUTTON_SELECTOR = '.hme-autofill-btn';

const LOADING_COPY = '隐藏我的邮箱 — 等待生成中...';

// A unique CSS class prefix is used to guarantee that the style injected
// by the extension does not interfere with the existing style of
// a web page.
const STYLE_CLASS_PREFIX = 'd1691f0f-b8f0-495e-9ffb-fe4e6f84b518';

const className = (shortName: string): string =>
  `${STYLE_CLASS_PREFIX}-${shortName}`;

type AutofillableInputElement = {
  inputElement: HTMLInputElement;
  buttonSupport?: {
    btnElement: HTMLButtonElement;
    inputOnFocusCallback: (ev: FocusEvent) => void;
    inputOnBlurCallback: (ev: FocusEvent) => void;
    btnOnMousedownCallback: (ev: MouseEvent) => void;
  };
};

const hideLegacyHmeButtonElement = (el: HTMLElement): void => {
  el.style.setProperty('display', 'none', 'important');
  el.style.setProperty('visibility', 'hidden', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
};

const escapeForAttributeSelector = (value: string): string => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const hideLegacyHmeButtonsForInput = (inputElement: HTMLInputElement): void => {
  const legacyId = inputElement.getAttribute('data-hme-id');
  if (!legacyId) {
    return;
  }

  const selector = `${LEGACY_HME_BUTTON_SELECTOR}[data-hme-for="${escapeForAttributeSelector(
    legacyId
  )}"]`;
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    hideLegacyHmeButtonElement(el);
  });
};

const hideLegacyHmeButtons = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(LEGACY_HME_BUTTON_SELECTOR).forEach((el) => {
    hideLegacyHmeButtonElement(el);
  });
};

const disableButton = (
  btn: HTMLButtonElement,
  cursorClass: string,
  copy?: string
): void => {
  if (copy && copy !== LOADING_COPY && !copy.includes('等待')) {
    btn.setAttribute('data-tooltip', copy);
    btn.setAttribute('data-show-tooltip', 'true');
    setTimeout(() => btn.removeAttribute('data-show-tooltip'), 3500); // 错误提示展示 3.5秒
  } else {
    btn.removeAttribute('data-tooltip');
  }
  btn.setAttribute('disabled', 'true');
  btn.classList.forEach((name) => {
    if (name.startsWith(className('cursor-'))) {
      btn.classList.remove(name);
    }
  });
  btn.classList.add(className(cursorClass));
};

const enableButton = (
  btn: HTMLButtonElement,
  cursorClass: string,
  copy: string
): void => {
  btn.setAttribute('data-tooltip', '点击填充: ' + copy);
  btn.dataset.hme = copy;
  btn.removeAttribute('disabled');
  btn.classList.forEach((name) => {
    if (name.startsWith(className('cursor-'))) {
      btn.classList.remove(name);
    }
  });
  btn.classList.add(className(cursorClass));
};

const makeButtonSupport = (
  inputElement: HTMLInputElement
): AutofillableInputElement['buttonSupport'] => {
  const btnElement = document.createElement('button');
  const btnElementId = uuidv4();
  btnElement.setAttribute('id', btnElementId);
  btnElement.setAttribute('type', 'button');
  btnElement.classList.add(className('button'));

  disableButton(btnElement, 'cursor-not-allowed', LOADING_COPY);

  const updatePos = () => {
    if (!inputElement.isConnected) {
      clearInterval((btnElement as any)._posInterval);
      btnElement.remove();
      return;
    }
    const rect = inputElement.getBoundingClientRect();
    // 隐藏宽或高极小（或不可见）的蜜罐输入框的图标
    if (rect.width < 30 || rect.height < 10 || window.getComputedStyle(inputElement).display === 'none' || window.getComputedStyle(inputElement).visibility === 'hidden') {
      btnElement.style.setProperty('display', 'none', 'important');
    } else {
      btnElement.style.setProperty('display', 'flex', 'important');
      btnElement.style.top = `${rect.top + (rect.height - 28) / 2}px`;
      btnElement.style.left = `${rect.right - 34}px`;
    }
  };

  const inputOnFocusCallback = async () => {
    hideLegacyHmeButtonsForInput(inputElement);
    disableButton(btnElement, 'cursor-progress', LOADING_COPY);
    if (!btnElement.parentNode) {
      document.body.appendChild(btnElement);
    }
    updatePos();
    clearInterval((btnElement as any)._posInterval);
    (btnElement as any)._posInterval = window.setInterval(updatePos, 50);

    await browser.runtime.sendMessage({
      type: MessageType.GenerateRequest,
      data: btnElementId,
    });
  };

  inputElement.addEventListener('focus', inputOnFocusCallback);

  const inputOnBlurCallback = () => {
    setTimeout(() => {
      // Allow mousedown to preventDefault and keep focus
      if (document.activeElement !== inputElement) {
        clearInterval((btnElement as any)._posInterval);
        btnElement.remove();
        disableButton(btnElement, 'cursor-not-allowed', LOADING_COPY);
      }
    }, 150);
  };

  inputElement.addEventListener('blur', inputOnBlurCallback);

  const btnOnMousedownCallback = async (ev: MouseEvent) => {
    ev.preventDefault(); // Prevents input from losing focus!
    const hme = btnElement.dataset.hme;
    if (!hme) return;
    disableButton(btnElement, 'cursor-progress', LOADING_COPY);
    await browser.runtime.sendMessage({
      type: MessageType.ReservationRequest,
      data: { hme, label: window.location.host, elementId: btnElement.id },
    } as Message<ReservationRequestData>);
  };

  btnElement.addEventListener('mousedown', btnOnMousedownCallback);

  return {
    btnElement,
    inputOnFocusCallback,
    inputOnBlurCallback,
    btnOnMousedownCallback,
  };
};

const removeButtonSupport = (
  inputElement: HTMLInputElement,
  buttonSupport: NonNullable<AutofillableInputElement['buttonSupport']>
): void => {
  const { btnElement, inputOnFocusCallback, inputOnBlurCallback } =
    buttonSupport;
  clearInterval((btnElement as any)._posInterval);
  inputElement.removeEventListener('focus', inputOnFocusCallback);
  inputElement.removeEventListener('blur', inputOnBlurCallback);
  btnElement.remove();
};

export default async function main(): Promise<void> {
  hideLegacyHmeButtons();

  const emailInputElements = document.querySelectorAll<HTMLInputElement>(
    EMAIL_INPUT_QUERY_STRING
  );

  const options = await getBrowserStorageValue('iCloudHmeOptions');

  const makeAutofillableInputElement = (
    inputElement: HTMLInputElement
  ): AutofillableInputElement => ({
    inputElement,
    buttonSupport:
      options?.autofill.button === false
        ? undefined
        : makeButtonSupport(inputElement),
  });

  const autofillableInputElements = Array.from(emailInputElements).map(
    makeAutofillableInputElement
  );

  const mutationCallback: MutationCallback = (mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (
          node instanceof HTMLElement &&
          node.matches(LEGACY_HME_BUTTON_SELECTOR)
        ) {
          hideLegacyHmeButtonElement(node);
        }
        hideLegacyHmeButtons(node);

        const addedElements = node.querySelectorAll<HTMLInputElement>(
          EMAIL_INPUT_QUERY_STRING
        );
        addedElements.forEach((el) => {
          hideLegacyHmeButtonsForInput(el);
          const elementExists = autofillableInputElements.some((item) =>
            el === item.inputElement
          );
          if (!elementExists) {
            autofillableInputElements.push(makeAutofillableInputElement(el));
          }
        });
      });

      mutation.removedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        const removedElements = node.querySelectorAll<HTMLInputElement>(
          EMAIL_INPUT_QUERY_STRING
        );
        removedElements.forEach((el) => {
          const foundIndex = autofillableInputElements.findIndex((item) =>
            el === item.inputElement
          );
          if (foundIndex !== -1) {
            const [{ inputElement, buttonSupport }] =
              autofillableInputElements.splice(foundIndex, 1);

            if (buttonSupport) {
              removeButtonSupport(inputElement, buttonSupport);
            }
          }
        });
      });
    });
  };

  const observer = new MutationObserver(mutationCallback);
  observer.observe(document.body, {
    childList: true,
    attributes: false,
    subtree: true,
  });

  browser.runtime.onMessage.addListener((uncastedMessage: unknown) => {
    const message = uncastedMessage as Message<unknown>;

    switch (message.type) {
      case MessageType.Autofill:
        autofillableInputElements.forEach(({ inputElement, buttonSupport }) => {
          inputElement.value = message.data as string;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          if (buttonSupport) {
            removeButtonSupport(inputElement, buttonSupport);
          }
        });
        break;
      case MessageType.GenerateResponse:
        {
          const { hme, elementId, error } =
            message.data as GenerationResponseData;

          const element = document.getElementById(elementId);

          if (!element || !(element instanceof HTMLButtonElement)) {
            break;
          }

          if (error) {
            disableButton(element, 'cursor-not-allowed', error);
            break;
          }

          if (!hme) {
            break;
          }

          enableButton(element, 'cursor-pointer', hme);
        }
        break;
      case MessageType.ReservationResponse:
        {
          const { hme, error, elementId } =
            message.data as ReservationResponseData;

          const btnElement = document.getElementById(elementId);

          if (!btnElement || !(btnElement instanceof HTMLButtonElement)) {
            break;
          }

          if (error) {
            disableButton(btnElement, 'cursor-not-allowed', error);
            break;
          }

          if (!hme) {
            break;
          }

          const found = autofillableInputElements.find(
            (ael) => ael.buttonSupport?.btnElement.id === btnElement.id
          );
          if (!found) {
            break;
          }

          const { inputElement, buttonSupport } = found;
          inputElement.value = hme;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));

          if (buttonSupport) {
            removeButtonSupport(inputElement, buttonSupport);
          }
        }
        break;
      case MessageType.ActiveInputElementWrite:
        {
          const { activeElement } = document;
          if (!activeElement || !(activeElement instanceof HTMLInputElement)) {
            break;
          }

          const {
            data: { text, copyToClipboard },
          } = message as Message<ActiveInputElementWriteData>;
          activeElement.value = text;
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));
          activeElement.dispatchEvent(new Event('change', { bubbles: true }));
          if (copyToClipboard) {
            navigator.clipboard.writeText(text);
          }

          // Remove button if it exists. This should rarely happen as context menu
          // users are expected to have turned off button support.
          const found = autofillableInputElements.find((ael) =>
            ael.inputElement.isEqualNode(activeElement)
          );
          const buttonSupport = found?.buttonSupport;
          if (buttonSupport) {
            removeButtonSupport(activeElement, buttonSupport);
          }
        }
        break;
      default:
        break;
    }

    return undefined;
  });
}
