import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import UserModel from "../models/user.model.js";


//add review & rating
export const addReview = async (request, response) => {
  try {
    const { productId, rating, comment } = request.body;
    const userId = request.userId;

    if (!productId || !rating || !comment?.trim()) {
      return response.status(400).json({
        message: "Product, rating, and comment are required",
        success: false,
        error: true,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const already = await Review.findOne({ user: userId, product: productId });
    if (already) {
      return response.status(400).json({
        message: "You already reviewed this product",
        success: false,
      });
    }

    // ✅ CREATE REVIEW (FIXED)
    const review = await Review.create({
      user: userId,
      product: productId,
      name: user.name,
      rating: Number(rating),
      comment: comment.trim(),
      
    });

    // ✅ RECALCULATE RATINGS
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);

    product.averageRating = totalRating / reviews.length;
    product.totalReviews = reviews.length;
    await product.save();

    response.status(201).json({
      message: "Review added successfully",
      data: review,
      success: true,
    });

  } catch (error) {
    console.error("addReview error:", error);
    response.status(500).json({
      message: "Something went wrong",
      success: false,
      error: true,
    });
  }
};


//get reviews for product id
export const getReviews = async (requset, response) => {
  try {
    const { productId } = requset.params;

    //check product id
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .lean();

    const total = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const rt = Number(r.rating || 0);
      if (rt >= 1 && rt <= 5) distribution[rt] += 1;
      sum += rt;
    });

    const average = total ? sum / total : 0;

    return response.status(200).json({
      reviews,
      total,
      average,
      distribution,
      success: true,
    });
  } catch (error) {
    //console.error("getReviews error:", error);
    return response.status(500).json({
      message: "Failed to fetch reviews",
      error: true,
      success: false,
    });
  }
};

//Update Review
export const updateReview = async (requset, response) => {
  try {
    const { reviewId } = requset.params;
    const { rating, comment } = requset.body;
    const userId = requset.userId;

    //find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return response.status(404).json({ 
        message: "Review not found", 
        success: false,
        error:true,
      });
    }

    //check user id match
    if (review.user.toString() !== userId.toString()) {
      return response.status(403).json({ 
        message: "Not authorized", 
        success: false,
        error:true,
      });
    }

    //update data base
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product });
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = reviews.length ? totalRating / reviews.length : 0;

    //update data base using average rating
    await Product.findByIdAndUpdate(review.product, {
      averageRating: avgRating,
      totalReviews: reviews.length,
    });

    return response.status(200).json({
      message: "Review updated successfully",
      data: review,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({ 
      message: "Server error", 
      error: error.message, 
      success: false 
    });
  }
};

// Delete Review (User or Admin)
export const deleteReview = async (requset, response) => {
  try {
    const reviewId  = requset.params.reviewId;
     // Assuming your auth middleware sets this

    //find review from data base
    const review = await Review.findById(reviewId);
    console.log(review)
    if (!review) {
      return response.status(404).json({ 
        message: "Review not found", 
        success: false 
      });
    }


    //deleting from data base
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product });
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = reviews.length ? totalRating / reviews.length : 0;

    // updating rating using average rating
    await Product.findByIdAndUpdate(review.product, {
      averageRating: avgRating,
      totalReviews: reviews.length,
    });

    return response.status(200).json({ 
      message: "Review deleted successfully", 
      success: true 
    });
  } 
  catch (error) {
    console.log(error)
    response.status(500).json({
       message: "Server error", 
       error: error.message, 
       success: false 
      });
  }
};

//get all reviews for admin
export const getAllReviews = async (requset, response) => {
  try {
    //get all rating
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data:reviews,
      
    });
  } 
  catch (error) {
    response.status(500).json({
      success: false,
      message: "Failed to fetch all reviews",
      error: error.message,
    });
  }
};

// Get all reviews written by a specific user
export const getUserReviews = async (requset, response) => {
  try {
    const { userId } = requset.params;

    // user id match all reviews
    const reviews = await Review.find({ user: userId })
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    response.status(200).json({
      message: "User reviews fetched successfully",
      data: reviews,
      success: true,
    });
  } 
  catch (error) {
    response.status(500).json({
      message: "Failed to fetch user reviews",
      error: error.message,
      success: false,
    });
  }
};

