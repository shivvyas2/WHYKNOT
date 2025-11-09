# Testing Knot API in Postman

This guide shows you how to test the Knot API session creation endpoint directly in Postman.

## Testing Your Next.js API Endpoint

### 1. Test Your App's Session Endpoint

**Endpoint:** `POST https://your-vercel-domain.com/api/knot/session`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "merchantIds": [19]
}
```

**Note:** Your app handles authentication internally, so you don't need to provide Knot credentials here.

---

## Testing Knot API Directly

### 2. Test Knot's Production API Directly

**Endpoint:** `POST https://knotapi.com/session/create`

**Headers:**
```
Content-Type: application/json
Authorization: Basic <base64_encoded_credentials>
```

**How to create Basic Auth:**
1. In Postman, go to the **Authorization** tab
2. Select **Basic Auth** from the Type dropdown
3. Enter:
   - **Username:** `a390e79d-2920-4440-9ba1-b747bc92790b` (your Client ID)
   - **Password:** `be1e86abb4fc42a3b904b2f52215847e` (your API Secret)
4. Postman will automatically encode it as `Basic <base64>`

**Body (JSON):**
```json
{
  "type": "transaction_link",
  "external_user_id": "test-user-123"
}
```

**Note:** Do NOT include `merchant_ids` in production - it causes 405 errors.

---

### 3. Test Knot's Development API

**Endpoint:** `POST https://development.knotapi.com/session/create`

**Headers:**
```
Content-Type: application/json
Authorization: Basic <base64_encoded_credentials>
```

**Basic Auth:**
- **Username:** Your development Client ID
- **Password:** Your development API Secret

**Body (JSON):**
```json
{
  "type": "transaction_link",
  "external_user_id": "test-user-123",
  "merchant_ids": [19]
}
```

**Note:** Development API accepts `merchant_ids` parameter.

---

## Step-by-Step Postman Setup

### For Your App's Endpoint:

1. **Create New Request**
   - Method: `POST`
   - URL: `https://your-vercel-domain.com/api/knot/session`

2. **Headers Tab**
   - Add: `Content-Type: application/json`

3. **Body Tab**
   - Select: `raw` and `JSON`
   - Enter:
     ```json
     {
       "merchantIds": [19]
     }
     ```

4. **Send** the request

### For Knot API Directly:

1. **Create New Request**
   - Method: `POST`
   - URL: `https://knotapi.com/session/create` (production)
   - OR: `https://development.knotapi.com/session/create` (development)

2. **Authorization Tab**
   - Type: `Basic Auth`
   - Username: Your Client ID
   - Password: Your API Secret

3. **Headers Tab**
   - Add: `Content-Type: application/json`

4. **Body Tab**
   - Select: `raw` and `JSON`
   - For Production:
     ```json
     {
       "type": "transaction_link",
       "external_user_id": "test-user-123"
     }
     ```
   - For Development:
     ```json
     {
       "type": "transaction_link",
       "external_user_id": "test-user-123",
       "merchant_ids": [19]
     }
     ```

5. **Send** the request

---

## Expected Responses

### Success Response:
```json
{
  "session": "session-id-here"
}
```

### Error Responses:

**405 Method Not Allowed:**
- Check the endpoint URL is correct
- Verify the HTTP method is POST
- For production, ensure you're NOT including `merchant_ids`

**401 Unauthorized:**
- Check your Client ID and Secret are correct
- Verify Basic Auth is set up correctly

**400 Bad Request:**
- Check the request body format
- Verify required fields are present

---

## Troubleshooting

1. **Getting 405 errors?**
   - Make sure you're using `POST` method
   - For production, remove `merchant_ids` from body
   - Try the endpoint without `/api` prefix: `/session/create`

2. **Getting 401 errors?**
   - Double-check your credentials
   - Make sure Basic Auth is selected (not Bearer)
   - Verify the base64 encoding is correct

3. **Testing locally?**
   - Use `http://localhost:3000/api/knot/session` for your app
   - Your app will use development Knot API automatically

---

## Quick Test Checklist

- [ ] Method is `POST`
- [ ] URL is correct (no typos)
- [ ] Basic Auth is configured
- [ ] Content-Type header is set
- [ ] Request body is valid JSON
- [ ] For production: `merchant_ids` is NOT included
- [ ] For development: `merchant_ids` IS included (optional)

---

## Your Current Credentials

**Production:**
- Client ID: `a390e79d-2920-4440-9ba1-b747bc92790b`
- Secret: `be1e86abb4fc42a3b904b2f52215847e`
- Base URL: `https://knotapi.com`
- Endpoint: `/session/create`

**Development:**
- Client ID: `dda0778d-9486-47f8-bd80-6f2512f9bcdb` (from docs)
- Secret: `ff5e51b6dcf84a829898d37449cbc47a` (from docs)
- Base URL: `https://development.knotapi.com`
- Endpoint: `/session/create`

