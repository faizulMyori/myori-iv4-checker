const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');

// Secret key fallback - must match the one in license_helpers.ts
const DEFAULT_SECRET_KEY = 'myori-fallback-secret-key';

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
    } else if (key === '--validate' && value) {
      params.validateKey = value;
      i++;
    } else if (key === '--current-machine') {
      params.currentMachine = true;
    } else if (key === '--help' || key === '-h') {
      params.help = true;
    }
  }

  return params;
}

// Get machine ID using the same method as the application
function getMachineIdSync() {
  try {
    // Try to get system UUID on Windows
    if (process.platform === 'win32') {
      try {
        const uuid = execSync('powershell.exe -Command "(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID"', { encoding: 'utf8' }).trim();
        // Validate UUID format
        if (/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(uuid)) {
          return crypto.createHash('sha256').update(uuid).digest('hex');
        }
      } catch (error) {
        console.warn('Failed to get system UUID, falling back to hostname');
      }
    }

    // Fallback to hostname
    const hostname = os.hostname();
    return crypto.createHash('sha256').update(hostname).digest('hex');
  } catch (error) {
    console.error('Error getting machine ID:', error);
    return null;
  }
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

// Validate license key
function validateLicenseKey(licenseKey, machineId, secretKey) {
  try {
    // Remove formatting
    const cleanKey = licenseKey.replace(/-/g, '');

    // Extract the checksum (last 8 characters)
    const checksum = cleanKey.slice(-8);
    const encryptedWithIV = cleanKey.slice(0, -8);

    // Verify checksum
    const calculatedChecksum = crypto.createHash('md5').update(encryptedWithIV).digest('hex').substring(0, 8);
    if (checksum !== calculatedChecksum) {
      return { valid: false, error: 'Invalid license key (checksum mismatch)' };
    }

    // Split the IV and encrypted data
    const [ivHex, encryptedLicense] = encryptedWithIV.split(':');
    if (!ivHex || !encryptedLicense) {
      return { valid: false, error: 'Invalid license key format' };
    }

    // Convert IV from hex to buffer
    const iv = Buffer.from(ivHex, 'hex');

    // Create key buffer from the secret key
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    // Decrypt the license data using createDecipheriv
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedLicense, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Parse the license data
    const licenseData = JSON.parse(decrypted);

    // Check if the license is for this machine
    if (machineId && licenseData.machineId !== machineId) {
      return {
        valid: false,
        error: 'License key is not valid for this machine',
        licenseData
      };
    }

    // Check expiry date if present
    if (licenseData.expiryDate) {
      const expiryDate = new Date(licenseData.expiryDate);
      if (expiryDate < new Date()) {
        return { valid: false, expiryDate, error: 'License key has expired', licenseData };
      }
      return { valid: true, expiryDate, licenseData };
    }

    return { valid: true, licenseData };
  } catch (error) {
    console.error('Error validating license key:', error);
    return { valid: false, error: 'Invalid license key format' };
  }
}

// Show help
function showHelp() {
  console.log('\nLicense Key Generator');
  console.log('======================');
  console.log('\nUsage:');
  console.log('  node generate-license.js [options]\n');
  console.log('Options:');
  console.log('  --machine-id <id>        The machine ID to generate a license for');
  console.log('  --current-machine        Use the current machine\'s ID (overrides --machine-id)');
  console.log('  --expiry <date>          Optional. Expiry date in YYYY-MM-DD format');
  console.log('  --license-secret-key     Optional. Override the default license secret key');
  console.log('  --validate <key>         Validate the provided license key');
  console.log('  --help, -h               Show this help message\n');
}

// Main function
function main() {
  const params = parseArgs();

  if (params.help) {
    showHelp();
    process.exit(0);
  }

  const secretKey = params.secretKey || DEFAULT_SECRET_KEY;

  if (!params.secretKey) {
    console.warn('\nWarning: Using default license secret key. It is recommended to provide --license-secret-key in production.\n');
  }

  // Get current machine ID if requested
  if (params.currentMachine) {
    params.machineId = getMachineIdSync();
    if (!params.machineId) {
      console.error('Error: Failed to get current machine ID');
      process.exit(1);
    }
  }

  // Validate a license key
  if (params.validateKey) {
    console.log('\nLicense Key Validator');
    console.log('===================\n');

    const machineId = params.machineId || getMachineIdSync();
    console.log('Machine ID for validation:', machineId);

    const validationResult = validateLicenseKey(params.validateKey, machineId, secretKey);
    console.log('\nValidation Result:', validationResult.valid ? 'VALID' : 'INVALID');

    if (validationResult.error) {
      console.log('Error:', validationResult.error);
    }

    if (validationResult.licenseData) {
      console.log('\nLicense Data:');
      console.log('  Machine ID:', validationResult.licenseData.machineId);
      console.log('  Issued At:', validationResult.licenseData.issuedAt);
      if (validationResult.licenseData.expiryDate) {
        console.log('  Expiry Date:', validationResult.licenseData.expiryDate);
      }
    }

    process.exit(validationResult.valid ? 0 : 1);
  }

  // Generate a license key
  if (!params.machineId) {
    console.error('Error: Machine ID is required. Use --machine-id <id> or --current-machine');
    showHelp();
    process.exit(1);
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
