import { rootQuestion } from "./questions";
import { QuestionRenderer } from "./questionRenderer";
import { buildNetwork, NetworkContext } from "./networkBuilder";
import yargs = require('yargs/yargs');
import chalk from "chalk";

export async function main(): Promise<void> {
    if (process.platform === "win32") {
        console.error(chalk.red(
            "Unfortunately this tool is not compatible with Windows at the moment.\n" +
            "We recommend running it under Windows Subsystem For Linux 2 with Docker Desktop.\n" +
            "Please visit the following pages for installation instructions.\n\n" +
            "https://docs.microsoft.com/en-us/windows/wsl/install-win10\n" +
            "https://docs.docker.com/docker-for-windows/wsl/"
        ));
        process.exit(1);
    }

    let answers = {};

    if(process.argv.slice(2).length > 0){
      const args = await yargs(process.argv.slice(2)).options({
        clientType: { type: 'string', demandOption: true, choices:['besu','goquorum'], describe: 'Ethereum client to use.' },
        outputPath: { type: 'string', default: './quorum-test-network', describe: 'Location for config files.'},
        elk: { type: 'boolean', default: false, demandOption: false, describe: 'Enable support for logging with ELK.' },
        privacy: { type: 'boolean', demandOption: true, describe: 'Enable support for private transactions' },
        orchestrate: { type: 'boolean', default: true, demandOption: false, describe: 'Try out Codefi Orchestrate?' },
      }).argv;

      answers = {
        clientType: args.clientType,
        outputPath: args.outputPath,
        elk: args.elk,
        privacy: args.privacy,
        orchestrate: args.orchestrate,
      };

    } else{
      const qr = new QuestionRenderer(rootQuestion);
      answers = await qr.render();
    }

    await buildNetwork(answers as NetworkContext);
    setTimeout(() => {
        process.exit(0);
    }, 500);
}

if (require.main === module) {
    // note: main returns a Promise<void>, but we don't need to do anything
    // special with it, so we use the void operator to indicate to eslint that
    // we left this dangling intentionally...
    try {
        void main();
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (err && err.stack && process.argv.length >= 3 && process.argv[2] === "--stackTraceOnError") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            console.error(`Fatal error: ${err.stack as string}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (err && err.message) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            console.error(`Fatal error: ${err.message as string}`);
        } else if (err) {
            console.error(`Fatal error: ${err as string}`);
        } else {
            console.error(`Fatal error: unknown`);
        }
        process.exit(1);
    }
}
