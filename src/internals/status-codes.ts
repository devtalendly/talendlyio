const HTTP_STATUS_REGISTRY = [
  // 1xx Informational
  ['CONTINUE', 100, 'Continue'],
  ['SWITCHING_PROTOCOLS', 101, 'Switching Protocols'],
  ['PROCESSING', 102, 'Processing'],
  ['EARLY_HINTS', 103, 'Early Hints'],

  // 2xx Success
  ['OK', 200, 'OK'],
  ['CREATED', 201, 'Created'],
  ['ACCEPTED', 202, 'Accepted'],
  ['NON_AUTHORITATIVE_INFORMATION', 203, 'Non Authoritative Information'],
  ['NO_CONTENT', 204, 'No Content'],
  ['RESET_CONTENT', 205, 'Reset Content'],
  ['PARTIAL_CONTENT', 206, 'Partial Content'],
  ['MULTI_STATUS', 207, 'Multi-Status'],

  // 3xx Redirection
  ['MULTIPLE_CHOICES', 300, 'Multiple Choices'],
  ['MOVED_PERMANENTLY', 301, 'Moved Permanently'],
  ['MOVED_TEMPORARILY', 302, 'Moved Temporarily'],
  ['SEE_OTHER', 303, 'See Other'],
  ['NOT_MODIFIED', 304, 'Not Modified'],
  ['USE_PROXY', 305, 'Use Proxy'],
  ['TEMPORARY_REDIRECT', 307, 'Temporary Redirect'],
  ['PERMANENT_REDIRECT', 308, 'Permanent Redirect'],

  // 4xx Client Errors
  ['BAD_REQUEST', 400, 'Bad Request'],
  ['UNAUTHORIZED', 401, 'Unauthorized'],
  ['PAYMENT_REQUIRED', 402, 'Payment Required'],
  ['FORBIDDEN', 403, 'Forbidden'],
  ['NOT_FOUND', 404, 'Not Found'],
  ['METHOD_NOT_ALLOWED', 405, 'Method Not Allowed'],
  ['NOT_ACCEPTABLE', 406, 'Not Acceptable'],
  ['PROXY_AUTHENTICATION_REQUIRED', 407, 'Proxy Authentication Required'],
  ['REQUEST_TIMEOUT', 408, 'Request Timeout'],
  ['CONFLICT', 409, 'Conflict'],
  ['GONE', 410, 'Gone'],
  ['LENGTH_REQUIRED', 411, 'Length Required'],
  ['PRECONDITION_FAILED', 412, 'Precondition Failed'],
  ['REQUEST_TOO_LONG', 413, 'Request Entity Too Large'],
  ['REQUEST_URI_TOO_LONG', 414, 'Request-URI Too Long'],
  ['UNSUPPORTED_MEDIA_TYPE', 415, 'Unsupported Media Type'],
  ['REQUESTED_RANGE_NOT_SATISFIABLE', 416, 'Requested Range Not Satisfiable'],
  ['EXPECTATION_FAILED', 417, 'Expectation Failed'],
  ['IM_A_TEAPOT', 418, "I'm a teapot"],
  ['INSUFFICIENT_SPACE_ON_RESOURCE', 419, 'Insufficient Space on Resource'],
  ['METHOD_FAILURE', 420, 'Method Failure'],
  ['MISDIRECTED_REQUEST', 421, 'Misdirected Request'],
  ['UNPROCESSABLE_ENTITY', 422, 'Unprocessable Entity'],
  ['LOCKED', 423, 'Locked'],
  ['FAILED_DEPENDENCY', 424, 'Failed Dependency'],
  ['UPGRADE_REQUIRED', 426, 'Upgrade Required'],
  ['PRECONDITION_REQUIRED', 428, 'Precondition Required'],
  ['TOO_MANY_REQUESTS', 429, 'Too Many Requests'],
  ['REQUEST_HEADER_FIELDS_TOO_LARGE', 431, 'Request Header Fields Too Large'],
  ['UNAVAILABLE_FOR_LEGAL_REASONS', 451, 'Unavailable For Legal Reasons'],

  // 5xx Server Errors
  ['INTERNAL_SERVER_ERROR', 500, 'Internal Server Error'],
  ['NOT_IMPLEMENTED', 501, 'Not Implemented'],
  ['BAD_GATEWAY', 502, 'Bad Gateway'],
  ['SERVICE_UNAVAILABLE', 503, 'Service Unavailable'],
  ['GATEWAY_TIMEOUT', 504, 'Gateway Timeout'],
  ['HTTP_VERSION_NOT_SUPPORTED', 505, 'HTTP Version Not Supported'],
  ['INSUFFICIENT_STORAGE', 507, 'Insufficient Storage'],
  ['NETWORK_AUTHENTICATION_REQUIRED', 511, 'Network Authentication Required'],
] as const;

type Registry = typeof HTTP_STATUS_REGISTRY;
type RegistryEntry = Registry[number];

type StatusCodeName = RegistryEntry[0];

type StatusCode = RegistryEntry[1];

type ReasonPhrase = RegistryEntry[2];

type StatusForCode<C extends StatusCodeName> = Extract<
  RegistryEntry,
  readonly [string, C, string]
>[1];

type PhraseForCode<C extends StatusCodeName> = Extract<
  RegistryEntry,
  readonly [string, number, C]
>[2];

type PhraseForStatusCode<C extends StatusCode> = Extract<
  RegistryEntry,
  readonly [string, C, string]
>[2];

type CodeForPhrase<P extends ReasonPhrase> = Extract<
  RegistryEntry,
  readonly [string, number, P]
>[1];

export type {
  CodeForPhrase,
  PhraseForStatusCode,
  ReasonPhrase,
  StatusCode,
  StatusCodeName,
  StatusForCode,
  PhraseForCode,
};

type StatusCodesMap = { readonly [E in RegistryEntry as E[0]]: E[1] };

/** Numeric status codes — `StatusCodes.NOT_FOUND === 404` */
const StatusCodes: StatusCodesMap = /* @__PURE__ */ (() => {
  const obj: Record<string, number> = {};
  for (const [name, code] of HTTP_STATUS_REGISTRY) {
    obj[name] = code;
  }
  return obj as StatusCodesMap;
})();

export { StatusCodes };

type ReasonPhrasesMap = { readonly [E in RegistryEntry as E[0]]: E[2] };

const ReasonPhrases: ReasonPhrasesMap = /* @__PURE__ */ (() => {
  const obj: Record<string, string> = {};
  for (const [name, , phrase] of HTTP_STATUS_REGISTRY) {
    obj[name] = phrase;
  }
  return obj as ReasonPhrasesMap;
})();

export { ReasonPhrases };

// Runtime lookup tables — built lazily on first call
let _codeToPhrase: Map<number, string> | undefined;
let _phraseToCode: Map<string, number> | undefined;

function ensureLookups(): void {
  if (_codeToPhrase) return;
  _codeToPhrase = new Map();
  _phraseToCode = new Map();
  for (const [, code, phrase] of HTTP_STATUS_REGISTRY) {
    _codeToPhrase.set(code, phrase);
    _phraseToCode.set(phrase, code);
  }
}

/**
 * Get the reason phrase for a numeric status code.
 *
 * ```ts
 * getReasonPhrase(StatusCodes.NOT_FOUND)  // "Not Found"  (literal type)
 * getReasonPhrase(404)                    // "Not Found"  (literal type)
 * ```
 *
 * @throws {Error} if the status code is not recognised
 */
function getReasonPhrase<C extends StatusCode>(code: C): PhraseForStatusCode<C>;
function getReasonPhrase(code: number): ReasonPhrase;
function getReasonPhrase(code: number): string {
  ensureLookups();
  const phrase = _codeToPhrase!.get(code);
  if (phrase === undefined) {
    throw new Error(`Unknown status code: ${code}`);
  }
  return phrase;
}

/**
 * Get the numeric status code for a reason phrase.
 *
 * ```ts
 * getStatusCode("Internal Server Error")               // 500  (literal type)
 * getStatusCode(ReasonPhrases.INTERNAL_SERVER_ERROR)    // 500  (literal type)
 * ```
 *
 * @throws {Error} if the phrase is not recognised
 */
function getStatusCode<P extends ReasonPhrase>(phrase: P): CodeForPhrase<P>;
function getStatusCode(phrase: string): StatusCode;
function getStatusCode(phrase: string): number {
  ensureLookups();
  const code = _phraseToCode!.get(phrase);
  if (code === undefined) {
    throw new Error(`Unknown reason phrase: ${phrase}`);
  }
  return code;
}

export { getReasonPhrase, getStatusCode };

/**
 * Narrow an arbitrary number to the `StatusCode` union.
 *
 * ```ts
 * const raw: number = 404;
 * if (isStatusCode(raw)) {
 *   getReasonPhrase(raw);  // ✅ typed
 * }
 * ```
 */
function isStatusCode(code: number): code is StatusCode {
  ensureLookups();
  return _codeToPhrase!.has(code);
}

/**
 * Narrow an arbitrary string to the `ReasonPhrase` union.
 */
function isReasonPhrase(phrase: string): phrase is ReasonPhrase {
  ensureLookups();
  return _phraseToCode!.has(phrase);
}

export { isReasonPhrase, isStatusCode };
