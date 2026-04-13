import React, { InputHTMLAttributes, useState } from 'react';
import { TitledComponent, Link } from '../../commonComponents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faCheckCircle,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { isFirefox } from '../../browserUtils';

const Notice = (props: {
  title: string;
  children: React.ReactNode;
  isAlert?: boolean;
}) => {
  const { title, children, isAlert = false } = props;

  const colourPalette = isAlert
    ? 'bg-yellow-50 border-yellow-400 text-yellow-600'
    : 'text-gray-600 bg-gray-50';

  return (
    <div
      className={`flex p-3 text-sm border rounded-lg ${colourPalette}`}
      role={isAlert ? 'alert' : 'info'}
    >
      <FontAwesomeIcon
        icon={isAlert ? faWarning : faInfoCircle}
        className="mr-2 mt-1"
      />
      <span className="sr-only">Info</span>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
};

const SignInInstructions = () => {
  return (
    <div className="space-y-4">
      <div>
        <p>
          To setup this extension, you need to sign-in to your iCloud account
          from within the browser. Navigate to{' '}
          <Link
            href="https://icloud.com"
            className="font-semibold"
            aria-label="Go to iCloud.com"
          >
            icloud.com
          </Link>{' '}
          and complete the full sign-in process, including the{' '}
          <span className="font-semibold">two-factor authentication</span> and{' '}
          <span className="font-semibold">Trust This Browser</span> steps.
        </p>
        <div className="text-center">
          <img
            src="./icloud-sign-in.webp"
            alt="Screenshots of the icloud.com sign-in flow"
          />
        </div>
        <p>
          Once you&apos;re signed-in to your account you&apos;re set to go. Open
          the extension pop-up (🍏 icon) to generate a new{' '}
          <span className="font-semibold">HideMyEmail</span> address! ✨
        </p>
      </div>
      {isFirefox && (
        <Notice title="Using Firefox Multi-Account Containers?" isAlert>
          <p>
            The extension won&apos;t work if you log-in to icloud.com from a tab
            within a container. Instead, you need to log-in from a{' '}
            <i>default</i> tab that is not part of any container. Once logged
            in, the extension will work in any tab, whether it&apos;s part of a
            container or not.
          </p>
        </Notice>
      )}
      <Notice title="Already signed-in?">
        <p>No further action needed. The extension is ready to use!</p>
      </Notice>
      <Notice title='Do I have to ✅ the "Keep me signed in" box?'>
        <p>
          This is not necessary. You may also choose to not trust this browser
          in the relevant step of the sign-in flow. The extension will work
          regardless. However, by opting to remain signed in, you ensure that
          the extension will also remain signed in, which will save you from
          frequently repeating the sign-in process. Hence, even though not
          necessary,{' '}
          <span className="font-semibold">
            it&apos;s strongly recommended to tick the &quot;Keep me signed
            in&quot; box
          </span>
          .
        </p>
      </Notice>
    </div>
  );
};

const SignInInstructionsZh = () => {
  return (
    <div className="space-y-4">
      <div>
        <p>
          要启用本扩展，您需要先在当前浏览器中登录 iCloud。请前往{' '}
          <Link
            href="https://icloud.com"
            className="font-semibold"
            aria-label="前往 iCloud.com"
          >
            icloud.com
          </Link>{' '}
          并完成完整登录流程，包括{' '}
          <span className="font-semibold">双重认证</span> 和{' '}
          <span className="font-semibold">信任此浏览器</span>。
        </p>
        <div className="text-center">
          <img src="./icloud-sign-in.webp" alt="icloud.com 登录流程截图" />
        </div>
        <p>
          完成登录后即可开始使用。打开扩展弹窗（🍏 图标）即可生成新的{' '}
          <span className="font-semibold">HideMyEmail</span> 地址。
        </p>
      </div>
      {isFirefox && (
        <Notice title="正在使用 Firefox 多账户容器？" isAlert>
          <p>
            如果您在容器标签页里登录 icloud.com，扩展将无法工作。请改为在不属于任何容器的
            <i>默认</i>标签页中登录。登录完成后，无论标签页是否属于容器，扩展都可以正常使用。
          </p>
        </Notice>
      )}
      <Notice title="已经登录了？">
        <p>不需要额外操作，扩展已可直接使用。</p>
      </Notice>
      <Notice title='需要勾选“保持登录状态”吗？'>
        <p>
          不是强制要求。您也可以在登录流程中选择不信任当前浏览器，扩展仍然可以工作。但如果保持登录，扩展也会更稳定地维持登录状态，避免频繁重新登录。因此即使不是必需，仍强烈建议
          <span className="font-semibold">勾选“保持登录状态”</span>。
        </p>
      </Notice>
      <Notice title="不要使用 Passkey 登录" isAlert>
        <p>
          使用 Passkey 登录通常无法让扩展稳定保持登录状态，建议改用常规登录流程。
        </p>
      </Notice>
    </div>
  );
};

const AutofillableDemoInput = (props: {
  inputAttributes: InputHTMLAttributes<HTMLInputElement>;
  label: string;
}) => {
  const [autofillableInputValue, setAutoFillableInputValue] =
    useState<string>();

  return (
    <div className="space-y-2">
      <label
        htmlFor={props.inputAttributes.id}
        className="block font-semibold text-gray-600"
      >
        {props.label}{' '}
        {autofillableInputValue?.endsWith('@icloud.com') && (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="ml-1 mt-1 text-green-500"
          />
        )}
      </label>
      <input
        className="bg-[Canvas] block w-full rounded-md relative px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-hidden focus:ring-sky-400 focus:border-sky-400 focus:z-10 sm:text-sm"
        defaultValue={autofillableInputValue}
        onInput={(e) =>
          setAutoFillableInputValue((e.target as HTMLInputElement).value)
        }
        {...props.inputAttributes}
      />
    </div>
  );
};

const UsageInstructions = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p>
          In the extension pop-up (🍏 icon) you can find a
          MacOS-System-Settings-like UI that enables you to generate new
          HideMyEmail addresses and manage existing ones.
        </p>
        <p>
          <span className="font-semibold">
            In most cases though, you don&apos;t need to interact with the
            pop-up UI
          </span>
          . The extension will automatically detect email input fields and
          prompt you to autofill new addresses! Alternatively, you can
          right-click on any text input field and select the menu item of the
          extension.
        </p>
      </div>
      <div className="space-y-2">
        <p>Try it yourself:</p>
        <div className="w-full max-w-md p-3 border rounded-lg bg-gray-50">
          <form className="space-y-2">
            <AutofillableDemoInput
              label="Autofill via button"
              inputAttributes={{
                id: 'autofill-by-button',
                name: 'email',
                type: 'email',
                placeholder: 'Click (focus) on this field',
              }}
            />
            <AutofillableDemoInput
              label="Autofill via right-click context menu"
              inputAttributes={{
                id: 'autofill-by-right-click',
                type: 'text',
                placeholder:
                  'Right click on this field and select the menu item of the extension',
              }}
            />
          </form>
        </div>
      </div>
      <div>
        If you find the autofill-via-button feature intrusive, you can disable
        it in the <Link href="./options.html">extension Options</Link>.
      </div>
      <div>
        Don&apos;t forget to delete the HideMyEmail addresses you created above
        for the purposes of trying this out:
        <ol className="list-decimal list-inside">
          <li>Open the extension pop-up (🍏 icon)</li>
          <li>Navigate to the &quot;Manage emails&quot; view</li>
          <li>Select, deactivate, and delete the relevant addresses</li>
        </ol>
      </div>
    </div>
  );
};

const UsageInstructionsZh = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p>
          在扩展弹窗（🍏 图标）中，您可以使用类似 MacOS 系统设置风格的界面来生成新的
          HideMyEmail 地址，并管理已有地址。
        </p>
        <p>
          <span className="font-semibold">
            但大多数情况下，您并不需要频繁打开弹窗
          </span>
          。扩展会自动识别邮箱输入框并提示自动填充；或者您也可以在输入框上右键使用扩展菜单项。
        </p>
      </div>
      <div className="space-y-2">
        <p>可以在下面试用：</p>
        <div className="w-full max-w-md p-3 border rounded-lg bg-gray-50">
          <form className="space-y-2">
            <AutofillableDemoInput
              label="通过按钮自动填充"
              inputAttributes={{
                id: 'autofill-by-button',
                name: 'email',
                type: 'email',
                placeholder: '点击（聚焦）此输入框',
              }}
            />
            <AutofillableDemoInput
              label="通过右键菜单自动填充"
              inputAttributes={{
                id: 'autofill-by-right-click',
                type: 'text',
                placeholder: '在此输入框上右键并选择扩展菜单项',
              }}
            />
          </form>
        </div>
      </div>
      <div>
        如果您觉得“按钮自动填充”较为打扰，可以在{' '}
        <Link href="./options.html">扩展选项</Link> 中关闭该功能。
      </div>
      <div>
        试用完成后，别忘了清理上面创建的 HideMyEmail 地址：
        <ol className="list-decimal list-inside">
          <li>打开扩展弹窗（🍏 图标）</li>
          <li>进入 &quot;Manage emails&quot; 页面</li>
          <li>选择相关地址并执行停用、删除</li>
        </ol>
      </div>
    </div>
  );
};

const TechnicalOverview = () => {
  return (
    <div className="space-y-2">
      <p>
        How does it work? At a high level, the extension interacts with the
        iCloud APIs by simulating the client behavior (i.e. the network
        requests) of the{' '}
        <Link href="https://icloud.com" aria-label="Go to iCloud.com">
          icloud.com
        </Link>{' '}
        web app. For authentication, it relies on the icloud.com cookies that
        have been stored in your browser following the sign-in flow outlined at
        the top of this guide.
      </p>
      <p>
        How does it access the icloud.com cookies? The extension has{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions">
          host permissions
        </Link>{' '}
        on several paths of the icloud.com host. When an extension has host
        permissions on a host, all extension ➡️ host-server requests are treated
        as{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy">
          same-origin
        </Link>{' '}
        by the browser. By default, browsers include{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials">
          credentials
        </Link>{' '}
        (e.g. cookies) in all same-origin requests.
      </p>
      <p>
        <span className="font-semibold">
          At no point does the extension have access to the Apple ID email and
          password that you feed into the icloud.com sign-in form
        </span>
        . The source of the extension is{' '}
        <Link
          href="https://github.com/dedoussis/icloud-hide-my-email-browser-extension"
          aria-label="source code"
        >
          publicly available in GitHub
        </Link>
        .
      </p>
      <p>
        If you&apos;re skeptical about using this extension, and looking for an
        alternative way of interacting with the HideMyEmail service outside of
        Safari, you can still use icloud.com on any browser. This extension only
        offers a more ergonomic browser experience compared to icloud.com.
      </p>
    </div>
  );
};

const TechnicalOverviewZh = () => {
  return (
    <div className="space-y-2">
      <p>
        这个扩展是如何工作的？高层来说，扩展通过模拟{' '}
        <Link href="https://icloud.com" aria-label="前往 iCloud.com">
          icloud.com
        </Link>{' '}
        Web 应用的客户端行为（即网络请求）来与 iCloud API 交互。身份认证依赖于您按照本指南顶部流程登录后，浏览器里保存的 icloud.com
        Cookie。
      </p>
      <p>
        扩展如何访问 icloud.com 的 Cookie？扩展对 icloud.com
        的多个路径申请了{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions">
          host permissions
        </Link>
        。当扩展拥有某个主机的 host permissions 时，扩展发往该主机的请求会被浏览器视为{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy">
          same-origin
        </Link>{' '}
        请求。浏览器默认会在 same-origin 请求中携带{' '}
        <Link href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials">
          credentials
        </Link>
        （例如 Cookie）。
      </p>
      <p>
        <span className="font-semibold">
          扩展在任何时候都不会接触您在 icloud.com 登录表单中输入的 Apple ID 邮箱和密码
        </span>
        。扩展源码已在{' '}
        <Link
          href="https://github.com/dedoussis/icloud-hide-my-email-browser-extension"
          aria-label="源码仓库"
        >
          GitHub
        </Link>{' '}
        公开。
      </p>
      <p>
        如果您对该扩展仍有顾虑，您仍然可以直接在浏览器中使用 icloud.com 的 HideMyEmail
        服务。本扩展只是提供了比 icloud.com 更顺手的使用体验。
      </p>
    </div>
  );
};

const Userguide = () => {
  const [guideLanguage, setGuideLanguage] = useState<'en' | 'zh'>('en');
  const isZh = guideLanguage === 'zh';

  return (
    <div className="w-9/12 m-auto mt-3 mb-24">
      <TitledComponent
        title="Hide My Email"
        subtitle={isZh ? '快速开始指南' : 'Quickstart guide'}
      >
        <div className="mb-6 flex justify-end">
          <div className="inline-flex p-1 bg-white border border-gray-200 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <button
              className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${
                !isZh
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setGuideLanguage('en')}
              aria-pressed={!isZh}
              type="button"
            >
              English
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${
                isZh
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setGuideLanguage('zh')}
              aria-pressed={isZh}
              type="button"
            >
              中文
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">
            {isZh ? '登录 iCloud' : 'Sign-in to iCloud'}
          </h3>
          {isZh ? <SignInInstructionsZh /> : <SignInInstructions />}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">
            {isZh ? '如何使用' : 'How to use?'}
          </h3>
          {isZh ? <UsageInstructionsZh /> : <UsageInstructions />}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">
            {isZh ? '进阶说明' : 'Advanced'}
          </h3>
          {isZh ? <TechnicalOverviewZh /> : <TechnicalOverview />}
        </div>
      </TitledComponent>
    </div>
  );
};

export default Userguide;
