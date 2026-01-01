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

// 🔹 Finance summary
export const getFinanceSummary = async (req, res) => {
  try {
    const [
      revenue,
      totalOrders,
      paidOrders,
      pendingOrders,
      refundedOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ paymentStatus: "pending" }),
      Order.countDocuments({ paymentStatus: "refunded" }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.total || 0,
        totalOrders,
        paidOrders,
        pendingOrders,
        refundedOrders,
        avgOrderValue:
          revenue[0]?.total && paidOrders
            ? revenue[0].total / paidOrders
            : 0,
      },
    });
  } catch (error) {
    console.error("Finance summary error:", error);
    res.status(500).json({ success: false, message: "Finance summary failed" });
  }
};

// 🔹 Monthly sales
export const getMonthlySalesReport = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: "paid"} },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: monthlySales });
  } catch (error) {
    console.error("Monthly sales error:", error);
    res.status(500).json({ success: false, message: "Monthly sales failed" });
  }
};

// 🔹 Order status analytics
export const getOrderStatusAnalytics = async (req, res) => {
  try {
    const statusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: statusStats });
  } catch (error) {
    console.error("Order analytics error:", error);
    res.status(500).json({ success: false, message: "Order analytics failed" });
  }
};

// 🔹 Low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 5 }, isAvailable: true })
      .select("name stock brand")
      .sort({ stock: 1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Low stock error:", error);
    res.status(500).json({ success: false, message: "Low stock fetch failed" });
  }
};

// 🔹 Top selling products
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
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
          _id: 0,
          productID: "$_id",
          name: "$product.name",
          sold: 1,
        },
      },
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({ success: false, message: "Top products failed" });
  }
};

// 🔹 Top customers
export const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: "$user", totalSpent: { $sum: "$total" }, orders: { $sum: 1 } } },
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
          _id: 0,
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          orders: 1,
        },
      },
    ]);

    res.json({ success: true, data: topCustomers });
  } catch (error) {
    console.error("Top customers error:", error);
    res.status(500).json({ success: false, message: "Top customers failed" });
  }
};

// 🔹 Payment method breakdown
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: methods });
  } catch (error) {
    console.error("Payment methods error:", error);
    res.status(500).json({ success: false, message: "Payment methods failed" });
  }
};

// 🔹 Daily revenue
export const getDailyRevenue = async (req, res) => {
  try {
    const dailyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid", status: "delivered" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: dailyRevenue });
  } catch (error) {
    console.error("Daily revenue error:", error);
    res.status(500).json({ success: false, message: "Daily revenue failed" });
  }
};



