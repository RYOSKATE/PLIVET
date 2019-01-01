import { exec } from 'child_process';
import * as fs from 'fs';
const outputFilePath = './docs/licenses.html';

exec(
  'yarn licenses generate-disclaimer --ignore-platform  --ignore-optional --ignore-engines',
  { maxBuffer: 1024 * 1024 },
  (err, stdout, stderr) => {
    if (err || stderr) {
      console.log('exec error');
      throw err || stderr;
    }
    // tslint:disable-next-line:prettier
    const softwares = 'THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED IN PORTIONS OF THE PLIVET PRODUCT.';
    const software = 'The following software may be included in this product: ';
    // tslint:disable:prettier
    const software2 = 'This software contains the following license and notice below:';
    const copyof = 'A copy of the source code may be downloaded from';
    const licenses = stdout
      .replace(softwares, `<div class="c1">${softwares}.</div>`)
      .split(software)
      .map((text: string) =>
      `<div class="c0">` + text
          .trim()
          .replace(copyof, `\n</div><div class="c1">${copyof}`)
          .replace(/\r?\n/g, '<br>')
          .replace(/\r?\n/g, '<br>')
          .replace(
            software2,
            `<br>This software may be included in this product contains the following license and notice below:</div><div class="c2">`
          ) + '</div>'
      )
      .join('');
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>THIRD PARTY SOFTWARE LICENSES</title>
<style>
body		{ text-align:center; background-color: #f9f9f9; font-family: 'Segoe UI','メイリオ','Meiryo','ヒラギノ角ゴ Pro W3','Hiragino Kaku Gothic Pro','Osaka','ＭＳ Ｐゴシック','MS PGothic','Arial',sans-serif; }
h2			{ color: #333333; font-size: 28px; }
h3			{ color: #333333; font-size: 24px; }
div			{ font-size: 14px; line-height: 2; word-wrap: break-word; }
div.c0		{ color: #333333; font-size: 20px; }
div.c1		{ padding-bottom: 8px; color: #555555; font-size: 12px; }
div.c2		{ padding-bottom: 24px; color: #888888; font-size: 9px; }
</style>
</head>
<body>

<h3>Licenses</h3><div class="c0">
PLIVET
</div>

<div class="c1">
MIT License
<br>
Copyright (c) 2018 Ryosuke Ishizue
</div>

<div class="c2">
[]
Permission is hereby granted, free of charge, to any person obtaining a copy<br>of this software and associated documentation files(the “Software”), to deal<br>in the Software without restriction, including without limitation the rights<br>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell<br>copies of the Software, and to permit persons to whom the Software is<br>furnished to do so, subject to the following conditions :<br><br>The above copyright notice and this permission notice shall be included in all<br>copies or substantial portions of the Software.<br><br>THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR<br>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,<br>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE<br>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER<br>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,<br>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE<br>SOFTWARE.
</div>

${licenses}
</body>
</html>`;
    fs.writeFile(outputFilePath, html, err => {
      if (err) {
        console.log('write error');
        throw err;
      } else {
        console.log('done.');
      }
    });
  }
);
