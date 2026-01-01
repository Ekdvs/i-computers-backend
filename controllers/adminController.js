import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import UserModel from "../models/user.model.js";

export const getDashboardData = async (requset, response) => {
    try {
        // 📊 Parallel queries
        const [
            ordersCount,
            productsCount,
            usersCount,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments({ isAvailable: true }),
            UserModel.countDocuments({ status: "ACTIVE" }),

            // 💰 Revenue (only PAID + DELIVERED orders)
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        status: "delivered",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                    },
                },
            ]),

            // 🧾 Recent Orders
            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        return response.status(200).json({
            success: true,

            stats: {
                orders: ordersCount,
                products: productsCount,
                users: usersCount,
                revenue: revenueResult[0]?.totalRevenue || 0,
            },

            recentOrders: recentOrders.map((order) => ({
                id: order.orderId,
                customer: order.user?.name || order.name || "Guest",
                total: order.total,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
            })),
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        return response.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
        });
    }
};

export const getDailyRevenue = async (req, res) => {
  try {
    const dailyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } }, // ✅ FIX
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: dailyRevenue });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// 🔹 Order Status
export const getOrderStatusAnalytics = async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data });
};

// 🔹 Low Stock
export const getLowStockProducts = async (req, res) => {
  const products = await Product.find({ stock: { $lte: 5 } })
    .select("name stock brand");
  res.json({ success: true, products });
};

// 🔹 Top Products
export const getTopProducts = async (req, res) => {
  const products = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.productID", sold: { $sum: "$items.quantity" } } },
    { $sort: { sold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "productID",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        sold: 1,
      },
    },
  ]);

  res.json({ success: true, data: products });
};

// 🔹 Top Customers
export const getTopCustomers = async (req, res) => {
  const customers = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        email: "$user.email",
        totalSpent: 1,
        orders: 1,
      },
    },
  ]);

  res.json({ success: true, data: customers });
};

// 🔹 Payment Methods
export const getPaymentMethods = async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data });
};


