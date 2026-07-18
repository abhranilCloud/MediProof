const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('import * as StellarSdk from \'@stellar/stellar-sdk\';')) {
                // Determine what Named imports to use
                content = content.replace('import * as StellarSdk from \'@stellar/stellar-sdk\';', 'import { Contract, xdr, scValToNative, nativeToScVal } from \'@stellar/stellar-sdk\';');
                content = content.replace(/StellarSdk\./g, '');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

traverse(srcDir);
