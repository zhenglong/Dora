import child_process from 'child_process';
import { ENV_PACKAGE_NAME } from './internal/env-def';

function main() {
    let argv: string[] = process.argv;

    if (argv.length != 3) {
        console.log(`command error: ${argv.length}`);
        return;
    }

    let packageNames = argv[argv.length - 1];
    let splittings = packageNames.split(',');

    let names = [];

    for (let i = 0; i < splittings.length; i++) {
        let [packageName, mainVersion] = splittings[i].split('@');
        names.push(packageName);
    }
    process.env[ENV_PACKAGE_NAME] = names.join();
    process.env.argv = packageNames;

    child_process.spawnSync('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true
    });
}

main();