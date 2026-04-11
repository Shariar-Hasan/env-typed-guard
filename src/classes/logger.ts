/**
 * Internal logger class for formatting and outputting colored terminal messages.
 * 
 * This class implements a fluent/builder pattern for constructing and styling
 * terminal output with ANSI color codes. Messages are accumulated in an internal
 * buffer and flushed to console when .log() is called.
 * 
 * @internal This class is for internal use only. Not part of the public API.
 * 
 * @warning This class is stateful. Always call .log() to flush the buffer,
 * otherwise subsequent messages will append to the unflushed content.
 * 
 * @example
 * ```ts
 * logger
 *   .blue('Processing')
 *   .space()
 *   .green('✓')
 *   .log();
 * // Output: [blue]Processing[reset] [green]✓[reset]
 * ```
 */
class Logger {
    private result: string;
    private version: string;
    private name: string;

    /**
     * Creates a new Logger instance.
     * @param name - The name to display in the title (default: 'env-typed-guard')
     * @param version - The version to display in the title (default: '1.1.3')
     */
    constructor(name: string = 'env-typed-guard', version: string = '1.1.3') {
        this.result = '';
        this.name = name;
        this.version = version;
    }

    /**
     * Appends a formatted title to the message buffer.
     * @returns The logger instance for method chaining
     */
    title() {
        this.result += `\x1b[1m\x1b[34m ********${this.name} • v${this.version}******** \x1b[0m\n`; // Bold blue title
        return this;
    }

    /**
     * Appends a message with no special formatting.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    normal(message: string) {
        this.result += message; // Default color (no color)
        return this;
    }

    /**
     * Appends a message in red color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    red(message: string) {
        this.result += `\x1b[31m${message}\x1b[0m`; // Red color
        return this;
    }

    /**
     * Appends a message in yellow color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    yellow(message: string) {
        this.result += `\x1b[33m${message}\x1b[0m`; // Yellow color
        return this;
    }

    /**
     * Appends a message in green color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    green(message: string) {
        this.result += `\x1b[32m${message}\x1b[0m`; // Green color
        return this;
    }

    /**
     * Appends a message in blue color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    blue(message: string) {
        this.result += `\x1b[34m${message}\x1b[0m`; // Blue color
        return this;
    }

    /**
     * Appends a message in cyan color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    cyan(message: string) {
        this.result += `\x1b[36m${message}\x1b[0m`; // Cyan color
        return this;
    }

    /**
     * Appends a message in gray color.
     * @param message - The message to append
     * @returns The logger instance for method chaining
     */
    gray(message: string) {
        this.result += `\x1b[90m${message}\x1b[0m`; // Gray color
        return this;
    }

    /**
     * Appends a comma to the message buffer.
     * @returns The logger instance for method chaining
     */
    comma() {
        this.result += `,`;
        return this;
    }

    /**
     * Appends a space to the message buffer.
     * @returns The logger instance for method chaining
     */
    space() {
        this.result += ` `;
        return this;
    }

    /**
     * Appends newline characters to the message buffer.
     * @param times - The number of newlines to append (default: 1)
     * @returns The logger instance for method chaining
     */
    newLine(times: number = 1) {
        this.result += `\n`.repeat(times);
        return this;
    }

    /**
     * Returns the accumulated message buffer as a string.
     * Note: This does not clear the buffer.
     * @returns The current buffer content
     */
    toString() {
        return this.result;
    }

    /**
     * Flushes the accumulated message buffer to console.log() and resets the buffer.
     * Always call this when you're done building a message to release the buffer.
     */
    log() {
        console.log(this.result);
        this.result = ''; // reset buffer
    }
}

/**
 * Internal singleton logger instance.
 * 
 * @internal This is for internal use only. Not part of the public API.
 * 
 * @warning This is a shared, stateful instance. Always call .log() to flush
 * the buffer, otherwise subsequent messages will append to unflushed content.
 */
const logger = new Logger();

export default logger;