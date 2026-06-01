const fs = require('fs');

const testCaseMd = fs.readFileSync('TestCase.md', 'utf-8');
const testListTxt = fs.readFileSync('test_list.txt', 'utf16le');

const regex = /\| ((AUTH|PROF|PROV|ADM|BOOK)-\d{3}) \|/g;
let match;
const expected = new Set();
while ((match = regex.exec(testCaseMd)) !== null) {
  expected.add(match[1]);
}

const actualRegex = /(AUTH|PROF|PROV|ADM|BOOK)-\d{3}/g;
const actual = new Set();
while ((match = actualRegex.exec(testListTxt)) !== null) {
  actual.add(match[0]);
}

const missing = [];
for (const id of expected) {
  if (!actual.has(id)) {
    missing.push(id);
  }
}

const extra = [];
for (const id of actual) {
  if (!expected.has(id)) {
    extra.push(id);
  }
}

console.log('Total Expected:', expected.size);
console.log('Total Actual:', actual.size);
console.log('Missing:', missing.length > 0 ? missing.join(', ') : 'None');
console.log('Extra (in code but not in MD):', extra.length > 0 ? extra.join(', ') : 'None');
