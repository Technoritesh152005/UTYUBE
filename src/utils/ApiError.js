// ApiError is used to throw structured, consistent errors from anywhere in your app instead of raw Error.
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    error = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = error;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;

// Mostly use of this is to handle error in standardized format
// means suppose u got a error  u do
// throw new ApiError(404, "User not found");
// then in global error handler u can send this error in structured format to frontend

// WHY this code is used (first)

// 👉 This ApiError class is used to create custom API errors with proper HTTP status + structured response, instead of throwing messy normal Error.

// In simple words:

// Normal Error → only message ❌

// ApiError → status + message + data + success ❌/✅

// So your backend can send consistent error responses to frontend.

// That’s the purpose.

// Now explanation (line by line)
// 1️⃣
// class ApiError extends Error {


// Means:

// 👉 Create your own error class based on JavaScript’s built-in Error.

// So ApiError behaves like Error + extra features.

// 2️⃣ Constructor
// constructor(
//   statusCode,
//   message = "Something went wrong",
//   error = [],
//   stack = ""
// )


// These are inputs when you throw error:

// Example:

// throw new ApiError(404, "User not found");


// So:

// statusCode → 404

// message → "User not found"

// error → [] (default)

// stack → "" (default)

// 3️⃣
// super(message);


// Calls parent Error constructor.

// Without this → message won’t exist.

// So now:

// this.message = message

// 4️⃣
// this.statusCode = statusCode;


// Stores HTTP code (400, 401, 500…)

// Used later in response.

// 5️⃣
// this.data = error;


// Stores extra error info.

// Example:

// throw new ApiError(400, "Invalid", ["email required"]);


// Then:

// data = ["email required"]

// 6️⃣
// this.success = false;


// So frontend immediately knows request failed.

// 7️⃣ Stack trace logic
// if (stack) {
//   this.stack = stack;
// } else {
//   Error.captureStackTrace(this, this.constructor);
// }


// Purpose:

// 👉 Keep correct stack trace for debugging.

// If stack provided → use it

// Else → auto-generate stack trace

// This helps developers see where error happened.

// 🔁 Typical flow
// throw new ApiError(401, "Unauthorized");


// ↓

// asyncHandler catches

// ↓

// next(err)

// ↓

// global error middleware sends:

// {
//   "success": false,
//   "message": "Unauthorized",
//   "data": []
// }

// 🧠 Final one-line takeaway (important)

// 👉 ApiError creates standardized API errors with status code + data + stack so your backend handles all errors cleanly in one format.

// That’s it.

// If you want next: I can explain global error middleware using this ApiError — just tell me.

// on what basis error is given? what r we passing

// Good — this is the right question now.

// Let’s answer clearly.

// ✅ On what basis is error given?

// 👉 YOU decide.

// Your code throws ApiError manually based on your business logic.

// There is NO automatic magic.

// ✅ What are we passing?

// When you write:

// throw new ApiError(404, "User not found");


// You are passing:

// statusCode → 404

// message → "User not found"

// error → not passed → defaults to []

// stack → not passed → defaults to ""

// Matches constructor:

// constructor(statusCode, message, error, stack)

// Common examples
// 🔹 User not found
// if (!user) {
//   throw new ApiError(404, "User not found");
// }

// 🔹 Unauthorized
// if (!token) {
//   throw new ApiError(401, "Unauthorized");
// }

// 🔹 Bad input
// if (!email) {
//   throw new ApiError(400, "Email required");
// }

// 🔹 Database error (catch block)
// catch(err){
//   throw new ApiError(500, "Database failed", err);
// }


// Here:

// status → 500

// message → "Database failed"

// error → actual DB error object

// So:

// this.data = err

// Who uses these values?

// Your global error middleware:

// res.status(err.statusCode).json({
//   success: err.success,
//   message: err.message,
//   data: err.data
// });


// So frontend receives what YOU passed.

// 🧠 Simple rule (remember)

// 👉 You pass error values based on your conditions (not found, unauthorized, invalid input, server fail).

// Backend logic decides — not Express.