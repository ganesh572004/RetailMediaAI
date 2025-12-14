# RetailMediaAI 🛍️✨

RetailMediaAI is a powerful, AI-driven creative builder designed to revolutionize how retail media ads are created. It empowers users to generate, customize, and manage professional-grade ad creatives with ease, ensuring brand compliance and visual appeal without needing advanced design skills.

## 🚀 Features

### 🎨 Creative Studio
- **Visual Builder**: Intuitive interface for creating ads from scratch or templates.
- **Smart Templates**: Choose from pre-built styles like *Minimalist*, *Bold Sale*, *Lifestyle*, and *Retail Special*.
- **Image Enhancements**: Real-time controls for Brightness, Contrast, and Saturation.
- **Live Preview**: Instantly switch between Mobile and Desktop views to see how your ad looks on different devices.
- **Compliance Check**: Automated checks for brand colors, logo placement, and text-to-image ratios.

### 🖼️ Gallery & Management
- **My Creatives**: A centralized dashboard to view, manage, and organize your saved drafts.
- **One-Click Download**: Export your designs as high-quality PNGs ready for campaign deployment.
- **Social Sharing**: Seamlessly share your creatives to WhatsApp, Instagram, Facebook, and more (with auto-image download).
- **Zoom & View**: Inspect your creatives in high detail.

### 👤 User Experience
- **Secure Authentication**: Support for Google, Facebook, and Email/Password login via NextAuth.js.
- **Profile Management**: Customize your profile with photo cropping and personal details.
- **Local Persistence**: Your data (creatives and profile) is securely stored locally using `localforage`, ensuring privacy and speed.
- **Responsive Design**: Fully optimized for all screen sizes using Tailwind CSS v4.

## 🛠️ Technologies Used

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: [LocalForage](https://github.com/localForage/localForage) (Client-side persistence)
- **Image Processing**: `html-to-image` (Canvas generation), `react-easy-crop`
- **Animations**: Framer Motion

## 🏁 Getting Started

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/RetailMediaAI.git
    cd RetailMediaAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API Routes (Auth, etc.)
│   ├── dashboard/       # Creative Builder
│   ├── results/         # My Creatives Gallery
│   └── ...
├── components/          # Reusable React Components
│   ├── ui/              # Base UI elements (Buttons, Cards)
│   ├── DashboardForm.tsx# Main creative editor logic
│   ├── CreativesList.tsx# Gallery display logic
│   └── ...
├── lib/                 # Utilities (Storage, Helper functions)
└── ...
```

## 🚀 Deployment

For detailed instructions on how to deploy this application to Vercel, please refer to the [Deployment Guide](DEPLOYMENT.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
