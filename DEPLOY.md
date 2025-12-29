# How to Publish Your Portfolio (Vercel)

The easiest way to publish this site is using **Vercel**. It's free, fast, and works perfectly with Supabase.

### Step 1: Push Code to GitHub
Ensure all your code is committed and pushed to a GitHub repository.
1.  Initialize Git: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Ready for launch"`
4.  Create a new repo on GitHub.com and follow the instructions to push.

### Step 2: Connect to Vercel
1.  Go to [Vercel.com](https://vercel.com) and sign up (login with GitHub).
2.  Click **"Add New Project"**.
3.  Select your `dave-madigan-portfolio` repository from the list.

### Step 3: Configure Environment Variables
**Crucial Step**: You must tell Vercel about your Supabase keys.
In the Vercel project setup screen, find the **"Environment Variables"** section and add these two:

| Name | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | *Your Supabase URL (from your .env file)* |
| `VITE_SUPABASE_ANON_KEY` | *Your Supabase Anon Key (from your .env file)* |

### Step 4: Deploy
1.  Click **"Deploy"**.
2.  Wait ~1 minute.
3.  Vercel will give you a live URL (e.g., `dave-madigan-portfolio.vercel.app`).

---

### Important Note on the "File System"
Current Status:
- **Admin Panel**: Has the full "Folder/File" system.
- **Public Site**: Currently displays all images (the `WorkGrid`), but it doesn't **visually show folders** yet. 

If you publish right now, the site works perfectly, but visitors will just see a stream of images. If you want them to navigate through Folders, I just need to finish updating the `WorkGrid.jsx` file.

**Should I finish the "Public Folder View" for you before you deploy?**
