const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));  // Fixed error handling
    }
}

export { asyncHandler };

// const asyncHandler = (fn) => async(req,res,next)=> {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code||500).json({
//             sucess:false,
//             message:error.message
//         })
//     }
// }

// const asyncHandler = (fn) => {()=> {}}   like this  

