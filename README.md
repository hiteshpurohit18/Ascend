# Ascend - Wellness & Period Tracking App

A comprehensive wellness application built with React Native and Expo, featuring mood tracking, period cycle monitoring, AI-powered chat, journaling, and mindfulness tools.

## ✨ Features

- **Mood Tracking** - Log and visualize your daily emotional state
- **Period Tracker** - Track menstrual cycles with predictions and insights
- **AI Chat Companion** - Peace AI powered by Google Gemini for mental wellness support
- **Gratitude Journal** - Daily journaling with photo attachments
- **Breathing Exercises** - Guided breathing for relaxation
- **Hydration Tracker** - Monitor daily water intake with reminders
- **Sleep Wind-Down** - Evening routine checklist
- **Quotes & Articles** - Daily inspiration and wellness content
- **Analytics Dashboard** - Visualize your wellness journey
- **Dark Mode** - Full theme support

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Ascend.git
   cd Ascend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 🔑 API Keys

This app requires a Google Gemini API key for AI features.

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file (never commit this file!)
3. The `.env.example` file shows the required format

## 📱 Building for Production

### Android APK/AAB
```bash
eas build --platform android --profile preview
```

### iOS
```bash
eas build --platform ios --profile preview
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Custom tab-based navigation
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **AI**: Google Gemini API
- **Charts**: Custom SVG-based visualizations
- **Notifications**: Expo Notifications
- **Date/Time**: @react-native-community/datetimepicker

## 📂 Project Structure

```
Ascend/
├── src/
│   ├── app/              # App core (providers, shell)
│   ├── components/       # Reusable UI components
│   ├── constants/        # Theme and data constants
│   ├── features/         # Feature modules
│   │   ├── ai/          # AI chat functionality
│   │   ├── auth/        # Authentication
│   │   ├── mood/        # Mood tracking
│   │   ├── period/      # Period tracking
│   │   ├── journal/     # Journaling
│   │   └── ...
│   └── screens/         # App screens
├── assets/              # Images, icons, fonts
├── .env.example         # Environment variables template
└── app.json            # Expo configuration
```

## 🔒 Security

- **Never commit `.env`** - It's in `.gitignore` for a reason
- **API keys** - Always use environment variables
- **Sensitive data** - Stored locally with AsyncStorage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Hitesh**
- GitHub: [@hitesh1801](https://github.com/hitesh1801)

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Expo team for the amazing framework
- React Native community

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for wellness and self-care
