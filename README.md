# ShareWaves

ShareWaves is a modern web application that enables seamless content sharing between devices on the same local network. Built with Next.js, TypeScript, and Tailwind CSS, this app allows users to quickly share text, links, and other content with anyone connected to the same IP address.

## Live Demo

🌐 **[https://sharewaves.vercel.app](https://sharewaves.vercel.app)**

## Features

- **Local Network Sharing**: Share content instantly with all devices on the same network
- **IP-Based Filtering**: Shared content is only visible to users with the same IP address
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Copy Reference**: Easily copy shared content with a single click
- **Responsive Design**: Works seamlessly across desktops, tablets, and mobile devices
- **Real-time Updates**: See shared content immediately without refreshing the page

## How It Works

1. **Connect**: Ensure all devices are connected to the same WiFi network
2. **Access**: Visit [sharewaves.vercel.app](https://sharewaves.vercel.app) from any device
3. **Share**: Enter your content in the sharing form and submit
4. **View**: All devices on the same network will see the shared content automatically
5. **Copy**: Use the copy reference button to quickly copy shared content

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **State Management**: React Hooks
- **Routing**: Next.js App Router

## Local Development

Clone the repository:

```bash
git clone https://github.com/khadka27/share-with-me.git
cd share-with-me
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running locally.

## Testing Local Network Sharing

To test the sharing functionality across different devices on your local network:

1. Find your local IP address (e.g., 192.168.1.1)
2. Run the development server
3. On other devices, navigate to `http://your-local-ip:3000` (e.g., http://192.168.1.1:3000)
4. Share content from any device to see it appear on all connected devices

## Future Enhancements

- File sharing capabilities
- User authentication (optional)
- End-to-end encryption
- Custom room creation
- Persistent storage options

## Author

- **Abishek Khadka**
  - GitHub: [khadka27](https://github.com/khadka27)
  - Email: abishekkhadka90@gmail.com

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Thanks to the Next.js, React, and Tailwind CSS teams for their amazing tools
- Deployed with [Vercel](https://vercel.com)
