# Orgon Snap

A MetaMask Snap for secure wallet management on the Orgon blockchain network.

## 🚀 Features

- 🔐 **Secure Key Management** - Private keys stored in MetaMask's secure snap environment
- 💼 **Multi-Account Support** - Create and manage multiple Orgon accounts
- 🌐 **Network Switching** - Support for Mainnet, Testnet, and Nile networks
- 📤 **Transaction Management** - Sign and broadcast transactions securely
- 🔄 **Import/Export** - Import existing accounts or export for backup
- ⚡ **TypeScript** - Fully typed for better developer experience

## 📦 Installation

### For Users

Install via npm:

```bash
npm install orgon-snap
```

Or use through the companion dApp interface.

### For Developers

```bash
# Clone the repository
git clone https://github.com/olzhaset/orgon-wallet-snap.git
cd orgon-wallet-snap/packages/snap

# Install dependencies
yarn install

# Build the snap
yarn build

# Start development mode with hot reload
yarn start
```

## 🔧 Usage

This snap integrates seamlessly with MetaMask to provide Orgon blockchain functionality. Users interact with the snap through compatible dApps or the companion interface.

### Available RPC Methods

| Method | Description |
|--------|-------------|
| `orgon_getAccount` | Get current account information |
| `orgon_createAccount` | Create a new Orgon account |
| `orgon_importAccount` | Import an existing account by private key |
| `orgon_exportAccount` | Export account private key (requires user confirmation) |
| `orgon_sendTransaction` | Sign and send a transaction |
| `orgon_switchNetwork` | Switch between Mainnet, Testnet, and Nile |

## 🛠️ Development

### Build Commands

```bash
# Clean build
yarn build:clean

# Regular build
yarn build

# Watch mode (development)
yarn start

# Run tests
yarn test

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix
```

### Project Structure

```
packages/snap/
├── src/
│   ├── blockchain/      # Blockchain interaction logic
│   ├── constants/       # Network configs and constants
│   ├── services/        # Account, network, transaction services
│   ├── storage/         # State management
│   ├── types/           # TypeScript type definitions
│   ├── ui/              # Snap UI dialogs
│   └── index.ts         # Main entry point
├── dist/                # Compiled output
├── images/              # Snap icons
└── snap.manifest.json   # Snap configuration
```

## 📚 Dependencies

### Core Dependencies

- **@metamask/snaps-sdk** (~9.3.0) - MetaMask Snaps SDK
- **orgonweb** (^6.0.3) - Orgon blockchain JavaScript library
- **secp256k1** (^5.0.1) - Elliptic curve cryptography for signing
- **keccak** (^3.0.4) - Cryptographic hashing
- **bs58** (^5.0.0) - Base58 encoding/decoding
- **crypto-js** (^4.2.0) - Cryptographic functions
- **tronweb** (^6.0.4) - TRON network compatibility

## 🔒 Security

- Private keys are managed by MetaMask's secure keyring system
- Keys never leave the snap's isolated environment
- All sensitive operations require user confirmation via snap dialogs
- Built with security best practices for blockchain applications

## 🌐 Networks

The snap supports the following Orgon networks:

- **Mainnet** - Production network
- **Testnet** - Testing network with test tokens
- **Nile** - Development network

## 📄 License

This project is dual-licensed under:
- MIT-0 License
- Apache-2.0 License

Choose the license that best suits your needs.

## 🔗 Links

- [GitHub Repository](https://github.com/olzhaset/orgon-wallet-snap)
- [Report Issues](https://github.com/olzhaset/orgon-wallet-snap/issues)
- [npm Package](https://www.npmjs.com/package/orgon-snap)
- [Orgon Network](https://orgon.network)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For bug reports and feature requests, please [open an issue](https://github.com/olzhaset/orgon-wallet-snap/issues).

## 🙏 Acknowledgments

Built with [MetaMask Snaps](https://metamask.io/snaps/) technology.

---

Made with ❤️ for the Orgon community


