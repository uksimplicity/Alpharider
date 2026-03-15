# Alpharider
Your trusted rider app

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connect to Backend

Create a `.env.local` file in the project root and set:

```bash
NEXT_PUBLIC_API_BASE_URL=https://marketplace.archintell.com/api/v1
NEXT_PUBLIC_API_LOGIN_PATH=/auth/login
NEXT_PUBLIC_API_SIGNUP_PATH=/auth/register
NEXT_PUBLIC_API_VERIFY_OTP_PATH=/auth/verify-email
NEXT_PUBLIC_API_VERIFY_PHONE_OTP_PATH=/auth/verify-phone
NEXT_PUBLIC_API_RESEND_OTP_PATH=/auth/resend-verification
NEXT_PUBLIC_API_FORGOT_PASSWORD_PATH=/auth/forgot-password
NEXT_PUBLIC_API_RESET_PASSWORD_PATH=/auth/reset-password
```

You can change the endpoint paths if your backend uses different routes.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
