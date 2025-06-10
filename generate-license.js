const crypto = require('crypto');

// Secret key fallback
const DEFAULT_SECRET_KEY = 'myori-label-checker-secret-key-2024';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const value = args[i + 1];

    if (key === '--machine-id' && value) {
      params.machineId = value;
      i++;
    } else if (key === '--expiry' && value) {
      params.expiryDate = value;
      i++;
    } else if (key === '--license-secret-key' && value) {
      params.secretKey = value;
      i++;
    } else if (key === '--help' || key === '-h') {
      params.help = true;
    }
  }

  return params;
}

// Generate license key
function generateLicenseKey(machineId, expiryDate, secretKey) {
  const licenseData = {
    machineId,
    issuedAt: new Date().toISOString(),
  };

  if (expiryDate) {
    licenseData.expiryDate = expiryDate;
  }

  const licenseStr = JSON.stringify(licenseData);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(licenseStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const ivHex = iv.toString('hex');
  const encryptedWithIV = `${ivHex}:${encrypted}`;
  const checksum = crypto.createHash('md5').update(encryptedWithIV).digest('hex').substring(0, 8);
  const licenseKey = `${encryptedWithIV}${checksum}`;
  return formatLicenseKey(licenseKey);
}

// Format into groups of 5 characters
function formatLicenseKey(key) {
  const groups = [];
  for (let i = 0; i < key.length; i += 5) {
    groups.push(key.slice(i, i + 5));
  }
  return groups.join('-');
}

// Show help
function showHelp() {
  console.log('\nLicense Key Generator');
  console.log('======================');
  console.log('\nUsage:');
  console.log('  node generate-license.js --machine-id <id> [--expiry YYYY-MM-DD] [--license-secret-key <secret>] [--help]\n');
  console.log('Options:');
  console.log('  --machine-id <id>        Required. The machine ID to generate a license for');
  console.log('  --expiry <date>          Optional. Expiry date in YYYY-MM-DD format');
  console.log('  --license-secret-key     Optional. Override the default license secret key');
  console.log('  --help, -h               Show this help message\n');
}

// Main function
function main() {
  const params = parseArgs();

  if (params.help || !params.machineId) {
    showHelp();
    process.exit(params.help ? 0 : 1);
  }

  const secretKey = params.secretKey || DEFAULT_SECRET_KEY;

  if (!params.secretKey) {
    console.warn('\nWarning: Using default license secret key. It is recommended to provide --license-secret-key in production.\n');
  }

  if (params.expiryDate) {
    const date = new Date(params.expiryDate);
    if (isNaN(date.getTime())) {
      console.error('Error: Invalid expiry date. Use format YYYY-MM-DD.');
      process.exit(1);
    }
  }

  const licenseKey = generateLicenseKey(params.machineId, params.expiryDate, secretKey);

  console.log('\nLicense Key Generator');
  console.log('======================\n');
  console.log('Machine ID:', params.machineId);
  if (params.expiryDate) {
    console.log('Expiry Date:', params.expiryDate);
  }
  console.log('\nGenerated License Key:\n' + licenseKey + '\n');
}

main();
