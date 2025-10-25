# Fix It AI - E-commerce Assistant

**Fix It AI** is an intelligent assistant that helps you manage and improve your online store without needing to be a technical expert. Think of it as having a smart developer on your team who can understand what you want in plain English and make the changes for you.

## What This Tool Does (In Simple Terms)

- **Talks to Your Store**: Connects to your Shopify or WordPress website
- **Understands You**: You can tell it what you want in normal language (like "make my products look better" or "speed up my website")
- **Shows You First**: Before making any changes, it shows you exactly what will happen
- **Makes It Safe**: You can test changes without breaking your live store
- **Keeps Track**: Remembers everything it does so you can undo changes if needed

## Why Use Fix It AI?

Running an online store can be complicated. You might want to:
- Fix slow loading pages
- Improve how your products look
- Add special discounts for customers
- Make your site easier to find on Google
- Update product information quickly

Usually, these tasks require hiring a developer or learning complex technical skills. Fix It AI does all of this for you by simply chatting with an AI assistant.

## 🚀 Key Features Explained

### 🤖 Smart Chat Interface
**What it does**: You can talk to the AI assistant like you're texting a friend who knows everything about websites.

**How it works**:
- **Natural Language Processing**: Instead of learning complex commands, just say "make my checkout page faster" or "add a sale badge to discounted products"
- **Streaming Responses**: The AI types back to you in real-time, so you can see it thinking and working
- **Context Awareness**: The AI remembers your store's setup and gives suggestions that actually work for your specific situation

**Example**: Instead of learning how to edit code, you just say "I want all my sale items to have a red 'SALE' badge" and the AI figures out how to make it happen.

### 🛍️ Shopify Store Management
**What it does**: Connects to your Shopify store and can make changes to almost everything.

**Specific capabilities**:
- **Product Management**: 
  - Update product descriptions, titles, and prices in bulk
  - Add or remove product tags (like "new arrival" or "bestseller")
  - Organize products into collections automatically
- **Theme Editing**: 
  - Modify how your store looks without breaking anything
  - Add custom sections to product pages
  - Change colors, fonts, and layouts
- **Discount Creation**: 
  - Set up automatic discounts (like "20% off for new customers")
  - Create seasonal promotions
  - Set up free shipping rules
- **Shipping Configuration**: 
  - Set up different shipping rates for different areas
  - Create free shipping thresholds
  - Manage shipping zones and rates
- **Metafields**: 
  - Add custom information to products (like size charts, care instructions)
  - Create custom product attributes

### 📝 WordPress Website Management
**What it does**: Works with WordPress websites to improve content, speed, and SEO.

**Specific capabilities**:
- **Content Management**: 
  - Update blog posts, pages, and product descriptions
  - Bulk edit content across multiple pages
  - Add new pages or sections
- **SEO Optimization**: 
  - Improve how your site appears in Google search results
  - Add proper titles and descriptions to pages
  - Fix broken links and improve site structure
- **Plugin Management**: 
  - Safely activate or deactivate plugins
  - Update plugins without breaking your site
  - Recommend plugins that would help your store
- **Theme Customization**: 
  - Modify your website's appearance
  - Add custom functionality
  - Fix theme issues
- **Performance Optimization**: 
  - Speed up slow-loading pages
  - Optimize images for faster loading
  - Fix common performance problems

### 🔍 Smart Analysis & Recommendations
**What it does**: Automatically checks your store for problems and suggests improvements.

**How it works**:
- **Lighthouse Audits**: 
  - Tests your site's speed, accessibility, and SEO
  - Gives you a score and tells you exactly what to fix
  - Like having a professional audit your site for free
- **Store Scanning**: 
  - Analyzes your entire store structure
  - Finds broken links, missing images, or other issues
  - Identifies opportunities for improvement
- **Issue Detection**: 
  - Spots common problems that hurt sales
  - Finds security issues or broken functionality
  - Suggests fixes for better customer experience
- **AI Recommendations**: 
  - Gets smarter over time by learning what works
  - Suggests improvements based on best practices
  - Helps you stay ahead of your competition

### 🛡️ Safety Features (Why You Can Trust It)
**What it does**: Makes sure you never break your store or lose important data.

**Safety measures**:
- **Preview Changes**: 
  - Shows you exactly what will change before it happens
  - Like a "preview mode" where you can see the results first
  - No surprises - you know exactly what you're getting
- **Rollback System**: 
  - If something goes wrong, you can instantly undo any change
  - Like an "undo" button for your entire website
  - Keeps your store safe from mistakes
- **Change Logging**: 
  - Records everything that gets changed
  - Shows you a history of all modifications
  - Helps you track what's been done
- **Dry Run Mode**: 
  - Test changes without actually making them
  - Perfect for trying new ideas safely
  - Like a sandbox where you can experiment

## 📋 Example Commands

### Shopify
- "Make all discounted products show a red badge"
- "Exclude discounted items from free shipping in Canada"
- "Add a 'New Arrival' tag to products created in the last 7 days"
- "Update the product page template to show customer reviews"
- "Create a 20% discount for first-time customers"

### WordPress
- "Fix my homepage SEO basics"
- "Speed up my WordPress homepage"
- "Add schema markup to my product pages"
- "Optimize images for better performance"
- "Update the contact page with new information"

## 🛠️ Getting Started - Step by Step Guide

### What You'll Need Before Starting

**Technical Requirements** (Don't worry, we'll explain each one):
- **Node.js 18+**: This is the programming language that runs the application. Think of it as the engine that makes everything work.
- **npm**: This is a package manager that helps install all the tools the app needs to run.
- **Grok API key**: This is your key to use the AI assistant. It's like a password that lets the app talk to the AI.
- **Store credentials**: You'll need access to your Shopify store or WordPress website.

### Step 1: Download and Set Up the Application

**1.1 Download the code**
```bash
# Copy this command and run it in your terminal/command prompt
git clone <repository-url>
cd fixit-ai
```

**What this does**: Downloads all the code files to your computer and moves you into the project folder.

**1.2 Install all the required tools**
```bash
npm install
```

**What this does**: Downloads all the software libraries and tools that the application needs to work. This might take a few minutes.

**Why it's needed**: Just like you need to install apps on your phone, this app needs to install its "helper apps" to work properly.

### Step 2: Configure Your Settings

**2.1 Create your settings file**
```bash
cp env.example .env.local
```

**What this does**: Creates a settings file where you'll put your personal information (like passwords and API keys).

**2.2 Edit your settings file**

Open the `.env.local` file in any text editor and fill in your information:

```env
# Database (This is where the app stores information)
DATABASE_URL="file:./dev.db"

# AI API Key (This lets the app use the AI assistant)
GROK_API_KEY="your-grok-api-key-here"

# Shopify Store Settings (If you're using Shopify)
SHOPIFY_STORE_URL="your-shopify-store.myshopify.com"
SHOPIFY_ACCESS_TOKEN="your-shopify-access-token"

# WordPress Settings (If you're using WordPress)
WP_BASE_URL="https://your-wordpress-site.com"
WP_USERNAME="your-wordpress-username"
WP_APP_PASSWORD="your-wordpress-app-password"
```

**Important**: Replace the example values with your actual information. Don't share these with anyone!

### Step 3: Set Up the Database

**3.1 Generate the database structure**
```bash
npm run db:generate
```

**What this does**: Creates the database structure that the app needs to store information.

**3.2 Create the database**
```bash
npm run db:push
```

**What this does**: Actually creates the database file on your computer.

**Why it's needed**: The app needs somewhere to store information about changes it makes, user settings, and other data.

### Step 4: Start the Application

**4.1 Start the development server**
```bash
npm run dev
```

**What this does**: Starts the application and makes it available on your computer.

**4.2 Open your web browser**
Navigate to [http://localhost:3000](http://localhost:3000)

**What this means**: 
- `localhost` means "this computer"
- `3000` is the port number (like a specific door to your application)
- You should see the Fix It AI interface in your browser

### Step 5: Connect Your Store

Once the application is running, you'll need to connect it to your Shopify store or WordPress website. The app will guide you through this process, but you'll need the credentials we mentioned in Step 2.

### Troubleshooting Common Issues

**If the app won't start:**
- Make sure you have Node.js installed (version 18 or higher)
- Check that all the commands completed without errors
- Try running `npm install` again

**If you can't connect to your store:**
- Double-check your API keys and credentials
- Make sure your store is accessible from the internet
- Verify that you have the correct permissions set up

**If you see error messages:**
- Check the terminal/command prompt for specific error details
- Make sure all required fields in `.env.local` are filled out
- Try restarting the application

## 🔧 Detailed Configuration Guide

### Setting Up Shopify Connection

**What you need to do**: Give Fix It AI permission to access your Shopify store so it can make changes for you.

**Step-by-step process**:

**1. Create a Private App in Shopify**
- Log into your Shopify admin panel
- Go to **Settings** → **Apps and sales channels**
- Click **Develop apps** (at the bottom)
- Click **Create an app**
- Give it a name like "Fix It AI Assistant"
- Click **Create app**

**2. Set Up Permissions (Scopes)**
This tells Shopify what the app is allowed to do. You need to enable these permissions:

- **Products**: `read_products, write_products (read and write product information)`
- **Themes**: `read_themes, write_themes` (modify your store's appearance)
- **Shipping**: `read_shipping, write_shipping` (manage shipping settings)
- **Discounts**: `read_discounts, write_discounts` (create and manage discounts)
- **Metafields**: `read_metafields, write_metafields` (add custom product information)

**How to enable permissions**:
- In your app settings, click **Configuration**
- Scroll down to **Admin API access scopes**
- Check the boxes for all the permissions listed above
- Click **Save**

**3. Get Your Access Token**
- In your app settings, click **API credentials**
- Click **Install app** (this activates the permissions)
- Copy the **Admin API access token**
- Paste this token into your `.env.local` file as `SHOPIFY_ACCESS_TOKEN`

**4. Add Your Store URL**
- Your store URL should look like: `your-store-name.myshopify.com`
- Add this to your `.env.local` file as `SHOPIFY_STORE_URL`

### Setting Up WordPress Connection

**What you need to do**: Give Fix It AI permission to access your WordPress website so it can make changes.

**Step-by-step process**:

**1. Enable REST API (Usually Already Enabled)**
- Most WordPress sites have this enabled by default
- If you're not sure, ask your hosting provider or developer

**2. Create an Application Password**
This is a special password that lets the app access your WordPress site safely.

- Log into your WordPress admin dashboard
- Go to **Users** → **Profile** (or **Users** → **All Users** → click your username)
- Scroll down to **Application Passwords** section
- In the **Application Name** field, type "Fix It AI"
- Click **Add New Application Password**
- **Important**: Copy the password immediately - you won't be able to see it again!
- Add this password to your `.env.local` file as `WP_APP_PASSWORD`

**3. Add Your WordPress Details**
- Your WordPress username (the one you use to log in)
- Your WordPress site URL (like `https://yourwebsite.com`)
- Add these to your `.env.local` file

### Setting Up Grok AI API

**What you need to do**: Get access to the AI assistant that powers Fix It AI.

**Step-by-step process**:

**1. Sign Up for Grok API**
- Visit the Grok API website
- Create an account (you'll need to provide some basic information)
- Choose a plan that fits your needs (there's usually a free tier to start)

**2. Get Your API Key**
- Log into your Grok API dashboard
- Look for **API Keys** or **Credentials** section
- Click **Generate New Key** or **Create API Key**
- Give it a name like "Fix It AI Integration"
- Copy the key immediately - you won't be able to see it again!

**3. Add to Your Settings**
- Add the API key to your `.env.local` file as `GROK_API_KEY`

### Understanding the Settings File

**What is `.env.local`?**
This is a special file that stores your personal settings and passwords. It's like a notebook where you write down all the keys and passwords the app needs.

**Important Security Notes**:
- Never share this file with anyone
- Don't upload it to public websites or GitHub
- Keep it on your computer only
- If someone gets access to this file, they could access your stores

**What each setting does**:
- `DATABASE_URL`: Tells the app where to store its data
- `GROK_API_KEY`: Lets the app use the AI assistant
- `SHOPIFY_STORE_URL`: Your Shopify store address
- `SHOPIFY_ACCESS_TOKEN`: Permission to access your Shopify store
- `WP_BASE_URL`: Your WordPress website address
- `WP_USERNAME`: Your WordPress login username
- `WP_APP_PASSWORD`: Special password for the app to access WordPress

### Testing Your Connections

**After setting everything up, you can test if it's working**:

1. Start the application (`npm run dev`)
2. Open the app in your browser
3. Look for connection test buttons or status indicators
4. The app should show "Connected" or "Ready" for each service you've configured

**If something isn't working**:
- Double-check all your credentials
- Make sure there are no extra spaces in your settings
- Verify that your API keys are still valid
- Check that your store/website is accessible from the internet

## 🆘 Troubleshooting Common Issues

### Application Won't Start

**Problem**: You run `npm run dev` but nothing happens or you get an error.

**Solutions**:
1. **Check Node.js version**: Run `node --version` in your terminal. You need version 18 or higher.
   - If you have an older version, download the latest from [nodejs.org](https://nodejs.org)
2. **Clear npm cache**: Run `npm cache clean --force`
3. **Delete node_modules**: Delete the `node_modules` folder and run `npm install` again
4. **Check for port conflicts**: Make sure nothing else is using port 3000
   - Try `npm run dev -- -p 3001` to use a different port

### Database Issues

**Problem**: You get database-related errors when starting the app.

**Solutions**:
1. **Regenerate the database**: Run `npm run db:generate` then `npm run db:push`
2. **Check database file permissions**: Make sure the app can read and write to the database file
3. **Reset the database**: Delete the `dev.db` file and run the database commands again

### Connection Problems

**Problem**: The app can't connect to your Shopify store or WordPress site.

**Shopify Connection Issues**:
- **Check your store URL**: Make sure it's exactly `your-store.myshopify.com` (no https://)
- **Verify access token**: Make sure you copied the entire token without extra spaces
- **Check permissions**: Ensure all required scopes are enabled in your Shopify app
- **Test the connection**: Try visiting `https://your-store.myshopify.com/admin/api/2023-10/products.json` in your browser (replace with your store URL)

**WordPress Connection Issues**:
- **Check your site URL**: Make sure it includes `https://` and doesn't end with a slash
- **Verify application password**: Make sure you copied the entire password correctly
- **Test REST API**: Try visiting `https://your-site.com/wp-json/wp/v2/posts` in your browser
- **Check user permissions**: Make sure your WordPress user has admin privileges

### AI Assistant Not Working

**Problem**: The chat interface doesn't respond or gives errors.

**Solutions**:
1. **Check Grok API key**: Make sure it's valid and not expired
2. **Verify API quota**: Check if you've exceeded your API usage limits
3. **Test the API**: Try making a simple request to see if the API is working
4. **Check internet connection**: Make sure you have a stable internet connection

### Performance Issues

**Problem**: The app is slow or unresponsive.

**Solutions**:
1. **Close other applications**: Free up memory and CPU resources
2. **Check your internet speed**: Slow connections can make the app feel sluggish
3. **Restart the application**: Sometimes a simple restart fixes performance issues
4. **Clear browser cache**: If using the web interface, clear your browser's cache

### Error Messages You Might See

**"Module not found" errors**:
- Run `npm install` again
- Make sure you're in the correct directory
- Check that all dependencies are properly installed

**"Permission denied" errors**:
- On Mac/Linux: Try `sudo npm install` (be careful with sudo)
- Check file permissions in your project folder
- Make sure you have write access to the directory

**"Port already in use" errors**:
- Kill any processes using port 3000: `lsof -ti:3000 | xargs kill -9`
- Use a different port: `npm run dev -- -p 3001`

**"Database locked" errors**:
- Make sure no other process is using the database
- Restart the application
- Delete the database file and recreate it

### Getting Help

**If you're still having issues**:

1. **Check the logs**: Look at the terminal output for specific error messages
2. **Search the issues**: Check if others have had the same problem
3. **Create a detailed report**: Include:
   - Your operating system (Windows, Mac, Linux)
   - Node.js version (`node --version`)
   - The exact error message you're seeing
   - What you were trying to do when the error occurred
   - Steps you've already tried

**Common Solutions That Work for Most Issues**:
1. Restart your computer
2. Update Node.js to the latest version
3. Delete `node_modules` and run `npm install` again
4. Check that all your environment variables are set correctly
5. Make sure you have a stable internet connection

## 📁 Project Structure

```
fixit-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main chat interface
│   │   ├── settings/          # Store connection settings
│   │   └── logs/              # Change history and rollback
│   ├── components/            # React components
│   │   ├── ChatBox.tsx        # Chat interface
│   │   ├── ChangePreview.tsx  # Change preview panel
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── shopify.ts         # Shopify API integration
│   │   ├── wordpress.ts       # WordPress API integration
│   │   ├── lighthouse.ts      # Performance analysis
│   │   ├── store.ts           # Zustand state management
│   │   └── utils.ts           # Utility functions
│   └── pages/api/             # API routes
│       ├── chat.ts            # AI chat endpoint
│       ├── shopify/           # Shopify API endpoints
│       ├── wordpress/         # WordPress API endpoints
│       └── logs.ts            # Change logging
├── prisma/                    # Database schema
├── public/                    # Static assets
└── package.json
```

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Send messages to AI assistant

### Shopify
- `POST /api/shopify/scan` - Scan store data
- `POST /api/shopify/apply` - Apply changes
- `POST /api/shopify/test` - Test connection

### WordPress
- `POST /api/wordpress/scan` - Scan site data
- `POST /api/wordpress/apply` - Apply changes
- `POST /api/wordpress/test` - Test connection

### Logs
- `GET /api/logs` - Get change history
- `POST /api/logs` - Log new changes

## 🎨 Customization

### Adding New AI Models
The application supports multiple AI providers. To add a new model:

1. Update the chat API in `src/pages/api/chat.ts`
2. Add model configuration to environment variables
3. Update the system prompt for your use case

### Extending Platform Support
To add support for other e-commerce platforms:

1. Create a new API integration in `src/lib/`
2. Add API routes in `src/pages/api/`
3. Update the chat system prompt
4. Add platform-specific components

### Custom Actions
Create custom actions by:

1. Adding new API endpoints
2. Updating the AI system prompt
3. Creating platform-specific handlers
4. Adding UI components for new features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build the image
docker build -t fixit-ai .

# Run the container
docker run -p 3000:3000 fixit-ai
```

### Self-Hosted
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Set up a reverse proxy (nginx recommended)
4. Configure SSL certificates

## 🔒 Security

### API Key Management
- Store all API keys in environment variables
- Never commit secrets to version control
- Use different keys for development and production
- Rotate keys regularly

### Data Protection
- All API calls are made server-side
- No sensitive data is stored in the browser
- Database is encrypted at rest
- HTTPS is required in production

### Access Control
- Implement user authentication (future feature)
- Role-based access control
- Audit logging for all actions
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.fixit-ai.com](https://docs.fixit-ai.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/fixit-ai/issues)
- **Discord**: [Join our community](https://discord.gg/fixit-ai)
- **Email**: support@fixit-ai.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Grok](https://grok.x.ai/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Database with [Prisma](https://www.prisma.io/)

---

**Fix It AI** - Making e-commerce management effortless with AI. 🚀
