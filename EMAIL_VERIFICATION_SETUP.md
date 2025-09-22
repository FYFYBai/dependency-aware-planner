# Email Verification Setup

This document explains how to set up email verification for the Dependency Aware Planner application.

## Features Added

1. **Email Verification on Registration**: Users must verify their email before they can log in
2. **Verification Token Management**: Secure tokens with 24-hour expiration
3. **Resend Verification**: Users can request a new verification email
4. **Email Notifications**: Users receive confirmation emails

## Database Changes

The following fields have been added to the `app_user` table:
- `email_verified` (boolean): Whether the user's email is verified
- `verification_token` (varchar): Token for email verification

A new table `email_verification_token` has been created:
- `id` (bigint): Primary key
- `token` (varchar): Unique verification token
- `user_id` (bigint): Foreign key to user
- `expires_at` (timestamp): Token expiration time
- `created_at` (timestamp): Token creation time

## Configuration Required

### 1. Email Settings

Update `src/main/resources/application.properties`:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
app.frontend.url=http://localhost:5173
```

### 2. Gmail Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `spring.mail.password`

### 3. Database Migration

The application will automatically create the necessary database tables when you start it. Make sure your database is running and accessible.

## API Endpoints

### Registration
- **POST** `/api/auth/register`
- **Body**: `{ "username": "string", "email": "string", "password": "string" }`
- **Response**: Success message (no automatic login)

### Email Verification
- **POST** `/api/auth/verify-email?token={verification_token}`
- **Response**: Success message

### Resend Verification
- **POST** `/api/auth/resend-verification`
- **Body**: `{ "email": "string" }`
- **Response**: Success message

### Login
- **POST** `/api/auth/login`
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: JWT token (only if email is verified)

## Frontend Integration

The verification email will contain a link like:
```
http://localhost:5173/verify-email?token={verification_token}
```

Your frontend should:
1. Handle the verification link
2. Call the verification API
3. Show appropriate success/error messages
4. Redirect users to login after successful verification

## Security Features

1. **Token Expiration**: Verification tokens expire after 24 hours
2. **One-time Use**: Tokens are deleted after successful verification
3. **Email Verification Required**: Users cannot log in without verified email
4. **Secure Token Generation**: Uses UUID for token generation

## Testing

1. Register a new user
2. Check your email for the verification link
3. Click the link or call the verification API
4. Try to log in (should work after verification)
5. Try to log in with unverified account (should fail)

## Troubleshooting

- **Email not received**: Check spam folder, verify email configuration
- **Token expired**: Use the resend verification endpoint
- **Login fails**: Ensure email is verified first
- **Database errors**: Check database connection and table creation
