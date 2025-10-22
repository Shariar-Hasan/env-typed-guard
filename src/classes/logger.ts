import packageJson from '../../package.json';
class Logger {
    private result: string;
    constructor() {
        this.result = '';
    }

    title() {
        this.result = `\x1b[1m\x1b[34m ********${packageJson.name} • v${packageJson.version}******** \x1b[0m\n`; // Bold blue title
        return this;
    }

    normal(message: string) {
        this.result = message; // Default color (no color)
        return this;
    }

    red(message: string) {
        this.result = `\x1b[31m${message}\x1b[0m`; // Red color
        return this;
    }

    yellow(message: string) {
        this.result = `\x1b[33m${message}\x1b[0m`; // Yellow color
        return this;
    }

    green(message: string) {
        this.result = `\x1b[32m${message}\x1b[0m`; // Green color
        return this;
    }

    blue(message: string) {
        this.result = `\x1b[34m${message}\x1b[0m`; // Blue color
        return this;
    }

    cyan(message: string) {
        this.result = `\x1b[36m${message}\x1b[0m`; // Cyan color
        return this;
    }

    gray(message: string) {
        this.result = `\x1b[90m${message}\x1b[0m`; // Gray color
        return this;
    }

    comma() {
        this.result = `,`;
        return this;
    }

    space() {
        this.result = ` `;
        return this;
    }

    newLine(times: number = 1) {
        this.result = this.result + `\n`.repeat(times);
        return this;
    }

    toString() {
        return this.result;
    }

    log() {
        console.log(this.result);
        this.result = ''; // reset buffer
    }
}

export const logger = new Logger();

export default logger;