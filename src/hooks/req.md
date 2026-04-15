Ab is site ke authentication aur enrollment flow ko 100% fully functional (live) banane ke liye, humein Frontend (jo abhi ready hai) ko ek Backend Architecture ke sath connect karna hoga.

Yahan detailed requirements ki list hai jo humein implement karni hogi:

1. Authentication Service (Login/Signup/Forgot Password)
Abhi hum forms mein sirf UI validations (Formik + Yup) kar rahe hain. Isko functional banane ke liye humein ek Auth Provider chahiye.

Technology Choices: Firebase Auth, Supabase, ya NextAuth.js (agar custom backend hai).
Requirements:
Signup API: Naye user ka data (Email, Name, Phone) database mein save karna aur ek secure password hash create karna.
Login API: Email/Password check karke ek secure Session Token (JWT) generate karna.
OTP/Email Service: Forgot Password flow ke liye ek email service (jaise Resend, SendGrid, ya AWS SES) integrate karni hogi jo user ko OTP bheje.
2. Global State Management (Context API)
Abhi agar user login karta hai, toh baaki pages (jaise Home, Catalog) ko nahi pata chalta ki user logged in hai.

Kya karna hoga: Humein ek AuthContext (React Context) ya Zustand store banana hoga.
Kaam: Ye website ke har page ko batayega ki user authenticated hai. Isse Header automatically "Sign In" button ki jagah user ka "Profile / Dashboard" dikhayega.
3. Payment Gateway Integration
Signup page par abhi humne "Pay Now" pe ek demo success screen lagayi hai. Asal mein paise lene ke liye:

Provider: Razorpay, Stripe, ya Cashfree.
Flow:
User "Proceed to Pay" click karega.
Backend ek Order ID generate karega.
Razorpay/Stripe ka popup screen par open hoga.
Payment success hone ke baad, gateway humare backend ko ek "Webhook" (signal) bhejaega ki payment mil gayi hai. Uske baad hum user ko "Enrolled" mark karenge.
4. Database (Backend Storage)
Users ka data aur unka purchase status save karne ke liye.

Database Choices: PostgreSQL (via Prisma/Supabase) ya MongoDB.
Tables/Collections required:
Users (Name, Email, Phone, Work Status, Password Hash)
Subscriptions/Enrollments (Payment status, Transaction ID, Active plan)
5. Protected Routes
Jab ye sab connect ho jayega, humein Next.js mein ek middleware (routing logic) add karna hoga taki:

Unauthenticated Users: Agar koi bina login kiye /profile ya /dashboard kholne ki koshish kare, toh wo automatically /login par redirect ho jaye.
Authenticated Users: Agar koi logged-in user dobara /login kholne ki koshish kare, toh wo Home page par redirect ho jaye.
Next Step Kya Hona Chahiye? Agar aap chahte hain ki hum isko functional banana shuru karein, toh mera suggestion hai ki hum NextAuth.js aur AuthContext setup karne se shuruat karein.

Aap bataiye aap backend ke liye konsi technology use karna chahte hain? (e.g., Firebase, Supabase, ya custom Node.js/MongoDB)