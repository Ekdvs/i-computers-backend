import Coupon from "../models/coupon.model.js";


//create coupon code
export const createCoupon = async (request,response)=>{
    try {
        const { code, discountPercent, expiryDate, description, usageLimit } = request.body;

        //check all field
        if(!code||!discountPercent||!expiryDate||!description||!usageLimit){
        return response.status(400).json({
            message:'All field required',
            error:true,
            sucess:false
        })

        }
        const coupon = new Coupon({
        code: code.toUpperCase(),
        discountPercent,
        expiryDate,
        description,
        usageLimit,
        });

        // data base
        await coupon.save();
        response.status(201).json({ 
        success: true, 
        message: "Coupon created", 
        coupon ,
        sucess:false
        });
        
    } catch (error) {
        response.status(500).json({ 
        success: false, 
        message: error.message,

        });
    }
}

//get all coupons
export const getCoupons = async(request,response)=>{
    try {
        //find coupn from data base
        const coupons = await Coupon.find();
        response.status(200).json({ 
            success: true, 
            data:coupons,
            message: "Retview all coupon"
        });
    } catch (error) {
        response.status(500).json({ 
        success: false, 
        message: error.message 
        });
    }
}

//update Coupon
export const updateCoupon = async (request, response) => {
  try {
    //get coupon id
    const { id } = request.params;
    //find and update coupon
    const updated = await Coupon.findByIdAndUpdate(id, request.body, 
      { new: true, runValidators: true }
    );
    if (!updated) {
      return response.status(404).json({ 
        success: false, 
        message: "Coupon not found",

      });
    }

    response.status(200).json({ 
      success: true, 
      message: "Coupon updated", 
      coupon: updated 
    });
  } catch (error) {
    response.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete Coupon
export const deleteCoupon = async (request, response) => {
  try {
    //get coupon id
    const { id } = request.params;
    //deleted coupon
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) return response.status(404).json({ 
      success: false, 
      message: "Coupon not found" ,
    error:true,
  });

    response.status(200).json({ 
      success: true, 
      message: "Coupon deleted" 
    });
  } catch (error) {
    response.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};