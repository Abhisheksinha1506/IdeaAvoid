# PayPal Donate Button Setup Guide

This guide will help you set up your PayPal Donate button for the Excel download feature.

## Step 1: Create a PayPal Donate Button

1. **Log in to your PayPal account** at https://www.paypal.com
2. Go to **Tools** → **All Tools** → **PayPal buttons**
3. Click **Create new button**
4. Select **Donate** as the button type
5. Configure your button:
   - **Button type**: Donate
   - **Donation amount**: $2.50 (or leave blank for user to enter)
   - **Currency**: USD
   - **Button style**: Choose your preferred style
6. Click **Create Button**

## Step 2: Get Your Button ID

1. After creating the button, PayPal will show you the button code
2. Look for a line that contains `hosted_button_id` - it will look like this:
   ```html
   <input type="hidden" name="hosted_button_id" value="YOUR_BUTTON_ID_HERE">
   ```
3. Copy the value (the part after `value="` and before `"`)

## Step 3: Configure Return URL

1. In the PayPal button settings, find **"Website preferences"** or **"Advanced options"**
2. Set the **Return URL** to:
   ```
   https://yourdomain.com/?payment=success&amount=2.50
   ```
   Replace `yourdomain.com` with your actual domain
   
   For local development, use:
   ```
   http://localhost:3000/?payment=success&amount=2.50
   ```

3. Set the **Cancel Return URL** to:
   ```
   https://yourdomain.com/?payment=cancelled
   ```

## Step 4: Update Your Code

1. Open `src/App.vue`
2. Find the line that says:
   ```javascript
   paypalButtonId: 'YOUR_PAYPAL_BUTTON_ID'
   ```
3. Replace `'YOUR_PAYPAL_BUTTON_ID'` with your actual button ID from Step 2

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Click the "Download Excel" button
3. The payment modal should appear
4. Click "Pay $2.50 via PayPal"
5. Complete a test payment (you can use PayPal's sandbox for testing)
6. After payment, you should be redirected back and the file should download automatically

## Important Notes

- **Payment Status**: Payment status is stored in browser's localStorage and is valid for 24 hours
- **Security**: For production, consider implementing server-side payment verification using PayPal IPN (Instant Payment Notification)
- **Testing**: Use PayPal Sandbox for testing before going live
- **Personal Account**: This setup works with personal PayPal accounts using the Donate button

## Troubleshooting

### Payment not working?
- Verify your button ID is correct
- Check that return URLs are properly configured
- Make sure your PayPal account is active

### Download not working after payment?
- Check browser console for errors
- Verify localStorage is enabled in your browser
- Check that the return URL matches your site URL

### Need help?
- PayPal Support: https://www.paypal.com/support
- PayPal Developer Documentation: https://developer.paypal.com/docs/


