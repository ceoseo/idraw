import { execa } from 'execa';

async function main() {
  await execa('rollup', ['-w', '-c', './scripts/rollup.config.js'], {
    stdio: 'inherit'
  });
}

main();
