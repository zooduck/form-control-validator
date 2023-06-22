import * as fs from 'node:fs/promises';
import { buildTools } from '@zooduck/build-tools';

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist', { recursive: true });
await fs.cp('src/formControlValidator.component.js', 'dist/index.module.js');

await fs.cp('dist', 'docs/modules/@zooduck/form-control-validator', { recursive: true });
await fs.cp('src/index.html', 'docs/index.html', { recursive: true });

const docsIndexHTMLContents = await fs.readFile('docs/index.html', 'utf-8');

await fs.writeFile('docs/index.html', docsIndexHTMLContents.replace(
  'script src="formControlValidator.component.js"',
  'script src="modules/@zooduck/form-control-validator/index.module.js"'
));

await buildTools.removeCommentsFromFile('dist/index.module.js');
await buildTools.stampFileWithVersion('dist/index.module.js', 'package.json');
