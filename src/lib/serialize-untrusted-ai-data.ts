/**
 * Serialize user-controlled form fields into a JSON data region for an AI prompt.
 * Escaping angle brackets prevents values from terminating our XML-style tags.
 * This narrows instruction/data confusion; it cannot guarantee that a model
 * will ignore every malicious instruction contained inside a data field.
 */
export function serializeUntrustedAiData(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/[<>]/g, character =>
    character === '<' ? '\\u003c' : '\\u003e',
  );
}
