import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

const RingSpinner = (props: {
  size: number;
  borderWidth: number;
  className?: string;
}) => {
  const { size, borderWidth, className } = props;

  return (
    <span
      className={`inline-block animate-spin rounded-full ${className || ''}`}
      style={{
        width: size,
        height: size,
        borderStyle: 'solid',
        borderWidth,
        borderColor: 'rgba(11, 87, 208, 0.2)',
        borderTopColor: '#0b57d0',
      }}
      aria-hidden="true"
    />
  );
};

export const Spinner = () => {
  return (
    <div className="text-center">
      <RingSpinner size={34} borderWidth={3} />
    </div>
  );
};

export const LoadingButton = (
  props: {
    loading: boolean;
  } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  const { loading, disabled, ...btnHtmlAttrs } = props;

  const defaultClassName =
    'w-full justify-center text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 focus:ring-4 focus:outline-hidden focus:ring-gray-100 font-bold rounded-full px-5 py-2.5 text-center mr-2 inline-flex items-center transition-all shadow-[0_4px_16px_rgba(0,0,0,0.06)]';

  const diabledClassName =
    'w-full justify-center text-gray-400 bg-gray-50 border border-gray-100 font-bold rounded-full px-5 py-2.5 text-center mr-2 inline-flex items-center';

  const btnClassName = disabled ? diabledClassName : defaultClassName;

  return (
    <button
      type="submit"
      className={btnClassName}
      disabled={loading || disabled}
      {...btnHtmlAttrs}
    >
      {loading && !disabled && (
        <RingSpinner size={16} borderWidth={2} className="mr-1" />
      )}
      {props.children}
    </button>
  );
};

export const ErrorMessage = (props: { children?: React.ReactNode }) => {
  return (
    <div
      className="p-2 text-sm text-red-700 bg-red-100 rounded-lg"
      role="alert"
    >
      {props.children}
    </div>
  );
};

export const TitledComponent = (props: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) => {
  const children =
    props.children instanceof Array ? props.children : [props.children];

  return (
    <div className="text-base space-y-3">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{props.title}</h1>
        <h2 className="font-medium text-gray-400">{props.subtitle}</h2>
      </div>
      {children?.map((child, key) => {
        return (
          child && (
            <React.Fragment key={key}>
              <hr />
              {child}
            </React.Fragment>
          )
        );
      })}
    </div>
  );
};

export const Link = (
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
) => {
  // https://github.com/jsx-eslint/eslint-plugin-react/issues/3284
  // eslint-disable-next-line react/prop-types
  const { className, children, ...restProps } = props;
  return (
    <a
      className={`text-blue-600 hover:text-blue-700 ${className}`}
      target="_blank"
      rel="noreferrer"
      {...restProps}
    >
      {children}
    </a>
  );
};
