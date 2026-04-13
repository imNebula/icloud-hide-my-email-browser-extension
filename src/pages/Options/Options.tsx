import React, { useState, useEffect } from 'react';
import './Options.css';
import { useBrowserStorageState } from '../../hooks';
import ICloudClient, { PremiumMailSettings } from '../../iCloudClient';
import {
  Spinner,
  LoadingButton,
  ErrorMessage,
  TitledComponent,
  Link,
} from '../../commonComponents';
import startCase from 'lodash.startcase';
import isEqual from 'lodash.isequal';
import { DEFAULT_STORE } from '../../storage';

const SELECT_FWD_TO_SIGNED_OUT_CTA_COPY =
  '要选择新的转发邮箱，请先点击扩展图标并按照引导登录您的 iCloud 账号。';

const SelectFwdToForm = () => {
  const [selectedFwdToEmail, setSelectedFwdToEmail] = useState<string>();
  const [fwdToEmails, setFwdToEmails] = useState<string[]>();
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listHmeError, setListHmeError] = useState<string>();
  const [updateFwdToError, setUpdateFwdToError] = useState<string>();
  const [clientState, setClientState, isClientStateLoading] =
    useBrowserStorageState('clientState', undefined);

  useEffect(() => {
    const fetchHmeList = async () => {
      setListHmeError(undefined);
      setIsFetching(true);

      if (clientState?.setupUrl === undefined) {
        setListHmeError(SELECT_FWD_TO_SIGNED_OUT_CTA_COPY);
        setIsFetching(false);
        return;
      }

      const client = new ICloudClient(clientState.setupUrl);
      const isClientAuthenticated = await client.isAuthenticated();
      if (!isClientAuthenticated) {
        setListHmeError(SELECT_FWD_TO_SIGNED_OUT_CTA_COPY);
        setIsFetching(false);
        return;
      }

      try {
        const pms = new PremiumMailSettings(client);
        const result = await pms.listHme();
        setFwdToEmails((prevState) =>
          isEqual(prevState, result.forwardToEmails)
            ? prevState
            : result.forwardToEmails
        );
        setSelectedFwdToEmail(result.selectedForwardTo);
      } catch (e) {
        setListHmeError(e.toString());
      } finally {
        setIsFetching(false);
      }
    };

    if (!isClientStateLoading) {
      fetchHmeList();
    }
  }, [setClientState, clientState?.setupUrl, isClientStateLoading]);

  const onSelectedFwdToSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (clientState === undefined) {
      // Entering this branch of the control flow should not be possible
      // as the client state is validated prior to rendering the form that
      // triggered this event handler.
      console.error('onSelectedFwdToSubmit: clientState is undefined');
      setUpdateFwdToError(SELECT_FWD_TO_SIGNED_OUT_CTA_COPY);
    } else if (selectedFwdToEmail) {
      try {
        const client = new ICloudClient(
          clientState.setupUrl,
          clientState.webservices
        );
        const pms = new PremiumMailSettings(client);
        await pms.updateForwardToHme(selectedFwdToEmail);
      } catch (e) {
        setUpdateFwdToError(e.toString());
      }
    } else {
      setUpdateFwdToError('未选择任何转发邮箱地址。');
    }
    setIsSubmitting(false);
  };

  if (isFetching) {
    return <Spinner />;
  }

  if (listHmeError !== undefined) {
    return <ErrorMessage>{listHmeError}</ErrorMessage>;
  }

  return (
    <form className="space-y-3" onSubmit={onSelectedFwdToSubmit}>
      {fwdToEmails?.map((fwdToEmail, key) => (
        <div className="flex items-center mb-3" key={key}>
          <input
            onChange={() => setSelectedFwdToEmail(fwdToEmail)}
            checked={fwdToEmail === selectedFwdToEmail}
            id={`radio-${key}`}
            type="radio"
            disabled={isSubmitting}
            name={`fwdto-radio-${key}`}
            className="cursor-pointer w-4 h-4 accent-gray-900 hover:accent-gray-500"
          />
          <label
            htmlFor={`radio-${key}`}
            className="cursor-pointer ml-2 text-gray-900"
          >
            {fwdToEmail}
          </label>
        </div>
      ))}
      <LoadingButton loading={isSubmitting}>保存更新</LoadingButton>
      {updateFwdToError && <ErrorMessage>{updateFwdToError}</ErrorMessage>}
    </form>
  );
};

const Disclaimer = () => {
  return (
    <div>
      <p>
        此扩展程序由第三方独立开发，并非由 Apple 赞助、授权或直接关联。
      </p>
      <p>
        原始项目由{' '}
        <Link href="https://twitter.com/dedoussis">Dimitrios Dedoussis</Link>{' '}
        独立开发。
      </p>
      <p>
        当前维护仓库请前往{' '}
        <Link href="https://github.com/imNebula/icloud-hide-my-email-browser-extension">
          GitHub
        </Link>{' '}
        查看开源代码。
      </p>
      <p>
        本扩展本身也遵循同样的 MIT 协议开源。
      </p>
    </div>
  );
};

const AutofillForm = () => {
  const [options, setOptions] = useBrowserStorageState(
    'iCloudHmeOptions',
    DEFAULT_STORE.iCloudHmeOptions
  );

  return (
    <form className="space-y-3">
      {Object.entries(options.autofill).map(([key, value]) => (
        <div className="flex items-center mb-3" key={key}>
          <input
            onChange={() =>
              setOptions({
                ...options,
                autofill: { ...options.autofill, [key]: !value },
              })
            }
            checked={value}
            id={`checkbox-${key}`}
            type="checkbox"
            name={`checkbox-${key}`}
            className="cursor-pointer w-4 h-4 accent-gray-900 hover:accent-gray-500"
          />
          <label
            htmlFor={`checkbox-${key}`}
            className="cursor-pointer ml-2 text-gray-900"
          >
            {startCase(key)}
          </label>
        </div>
      ))}
    </form>
  );
};

const Options = () => {
  return (
    <div className="w-9/12 m-auto my-3">
      <TitledComponent title="Hide My Email" subtitle="扩展设置">
        <div>
          <h3 className="font-bold text-lg mb-3">免责声明</h3>
          <Disclaimer />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">邮件转发至以下地址</h3>
          <SelectFwdToForm />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">保留地址并自动填充</h3>
          <AutofillForm />
        </div>
      </TitledComponent>
    </div>
  );
};

export default Options;
