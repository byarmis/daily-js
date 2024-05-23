export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

// url assumed to start with 'https://'
export function maybeProxyHttpsUrl(url, dailyConfig) {
  if (dailyConfig?.proxyUrl) {
    return (
      dailyConfig.proxyUrl +
      (dailyConfig.proxyUrl.slice(-1) === '/' ? '' : '/') +
      url.substring(8)
    );
  }
  return url;
}

export function callObjectBundleUrl(dailyConfig) {
  // ADVANCED: if a custom bundle URL override is specified, use that.
  if (dailyConfig?.callObjectBundleUrlOverride) {
    return dailyConfig.callObjectBundleUrlOverride;
  }

  // 1. Dev build of daily-js --> load bundle from __devCallMachineUrl__, which
  //    is either:
  //    - DEV_CALL_MACHINE_URL env variable (read at build time)
  //    - default local dev URL
  //    See webpack or rollup config for details.
  // 2. Prod build of daily-js --> load bundle from version-specific prod URL.
  return process.env.NODE_ENV === 'development'
    ? __devCallMachineUrl__
    : maybeProxyHttpsUrl(
        `https://c.daily.co/call-machine/versioned/${__dailyJsVersion__}/static/call-machine-object-bundle.js`,
        dailyConfig
      );
}

export function validateHttpUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
