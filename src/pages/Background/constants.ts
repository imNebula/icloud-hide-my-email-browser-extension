import browser from 'webextension-polyfill';

export const CONTEXT_MENU_ITEM_ID = browser.runtime.id.concat(
  '/',
  'hme_generation_and_reservation'
);

export const SIGNED_OUT_CTA_COPY = '请先登录您的 iCloud_账号';
export const LOADING_COPY = '隐藏我的邮箱 — 等待生成中...';
export const SIGNED_IN_CTA_COPY = '在此处生成并填入“隐藏我的邮箱”地址';
export const NOTIFICATION_MESSAGE_COPY =
  'iCloud 隐藏我的邮箱扩展现已准备就绪！';
export const NOTIFICATION_TITLE_COPY = 'iCloud 隐藏我的邮箱扩展';
