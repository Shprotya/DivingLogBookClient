// The error every failed request turns into.
// fieldErrors maps a form field name to the server's message, e.g. { site: 'Site ... does not exist' }
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public fieldErrors: Record<string, string> = {},
    ) {
        super(message);
    }
}