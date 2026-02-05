
// It takes an async function (fxn) as input and returns a new function that wraps the original function in a try/catch block.
// const asyncHandler = (fxn) => async(req,res,next) =>{

//     try{
//         await fn(req,res,next)
//     }catch(err){
//         next(err);
//     }
// }

// It catches errors from async functions automatically, so you don’t need try/catch in every route.

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export { asyncHandler };


// truy any one of 2 cause both work is to pass a async function and they will wrap try and catch block arund it
// in every fxn u need not to do try and catch
// it return in req,res,next which can be used in both routing and middleware