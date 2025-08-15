import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  analyticsAPI,
  productsAPI,
  userAPI,
  ordersAPI,
  adminAPI,
} from "../services/api";
import { toast } from "react-toastify";
import { Line, Bar } from "react-chartjs-2";
import AdminLayout from "../components/AdminLayout";
import AdminProductsGrid from "../components/AdminProductsGrid";
import AdminUsersBootstrap from "../components/AdminUsersBootstrap";
import Loader from "../components/Loader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({});
  const [mlData, setMlData] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActiveTab = () => {
    if (location.pathname === "/dashboard") return "overview";
    if (location.pathname.includes("/admin/products")) return "products";
    if (location.pathname.includes("/admin/users")) return "users";
    if (location.pathname.includes("/admin/orders")) return "orders";
    if (location.pathname.includes("/admin/wishlists")) return "wishlists";
    if (location.pathname.includes("/admin/ml-models")) return "ml-models";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    sortBy: "",
    status: "",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (user?.is_staff) {
      console.log("User is staff, fetching dashboard data...");
      fetchDashboardData();
    } else {
      console.log("User is not staff:", user);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    console.log("Fetching dashboard data...");
    try {
      const [statsRes, mlRes, productsRes, usersRes, ordersRes, wishlistsRes] =
        await Promise.all([
          analyticsAPI.getAdminStats().catch((err) => {
            console.error("Stats error:", err);
            return {
              data: {
                total_products: 0,
                total_orders: 0,
                total_users: 0,
                total_revenue: 0,
              },
            };
          }),
          Promise.resolve({ data: { models: {} } }),
          adminAPI.getProducts().catch((err) => {
            console.error("Products error:", err);
            return { data: { results: [] } };
          }),
          adminAPI.getUsers().catch((err) => {
            console.error("Users error:", err.response || err);
            return { data: [] };
          }),
          adminAPI.getOrders().catch((err) => {
            console.error("Orders error:", err);
            return { data: [] };
          }),
          adminAPI.getWishlists().catch((err) => {
            console.error("Wishlists error:", err);
            return { data: [] };
          }),
        ]);

      console.log("Dashboard data loaded:", {
        stats: statsRes.data,
        products:
          productsRes.data.results?.length || productsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        orders: ordersRes.data?.length || 0,
        wishlists: wishlistsRes.data?.length || 0,
      });
      console.log("Users data:", usersRes.data);

      setStats(statsRes.data);
      setMlData(mlRes.data);
      const productData = productsRes.data;
      const loadedProducts = Array.isArray(productData)
        ? productData
        : productData?.results || [];
      setProducts(loadedProducts);
      setFilteredProducts(loadedProducts);
      console.log("Products loaded:", productsRes.data?.length || 0);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
      setWishlists(wishlistsRes.data || []);

      // Fetch categories
      try {
        const categoriesRes = await productsAPI.getCategories();
        console.log("Categories response:", categoriesRes.data);
        // Handle paginated response
        const categoryList =
          categoriesRes.data.results || categoriesRes.data || [];
        setAvailableCategories(categoryList);
      } catch (error) {
        console.error("Categories error:", error);
        setAvailableCategories([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setModalType("product");
    setEditItem(null);
    setFormData({
      name: "",
      price: "",
      actual_price: "",
      discount_percentage: 0,
      offer_text: "",
      exchange_available: false,
      exchange_discount: 0,
      description: "",
      stock: 0,
      category: "smartphones",
      image_url: "",
      images: Array(5).fill(null),
      image_urls: [],
      video_url: "",
      video_file: "",
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalType("product");
    setEditItem(product);
    const productImages = Array(5).fill(null);
    if (product.image_urls && product.image_urls.length > 0) {
      product.image_urls.forEach((img, index) => {
        if (index < 5) productImages[index] = img;
      });
    } else if (product.image_url) {
      productImages[0] = product.image_url;
    }

    setFormData({
      name: product.name || "",
      price: product.price || "",
      actual_price: product.actual_price || "",
      discount_percentage: product.discount_percentage || 0,
      offer_text: product.offer_text || "",
      exchange_available: product.exchange_available || false,
      exchange_discount: product.exchange_discount || 0,
      description: product.description || "",
      stock: product.stock || 0,
      category: product.category?.slug || product.category || "smartphones",
      image_url: productImages[0] || "",
      images: productImages,
      image_urls: productImages.filter(Boolean),
      video_url: product.video_url || "",
      video_file: product.video_file || "",
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminAPI.deleteProduct(productId);
        toast.success("Product deleted successfully");
        setProducts(products.filter((p) => p.id !== productId));
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleToggleProductStatus = async (productId, status) => {
    // Optimistically update UI
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, available: status } : p
      )
    );

    try {
      // Use the dedicated toggle endpoint
      const response = await adminAPI.toggleProductStatus(productId);
      toast.success(
        response.data.message ||
          `Product ${status ? "activated" : "deactivated"} successfully`
      );
      // Refresh products list to ensure UI is in sync with backend
      fetchDashboardData();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update product status");
      // Revert on error
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, available: !status } : p
        )
      );
    }
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...(formData.images || Array(5).fill(null))];
        newImages[index] = event.target.result;
        setFormData({
          ...formData,
          images: newImages,
          image_url: newImages[0] || "", // First image is landing image
          image_urls: newImages.filter(Boolean),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name?.trim() || !formData.price) {
      toast.error("Name and price are required");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        actual_price: formData.actual_price
          ? parseFloat(formData.actual_price)
          : null,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        offer_text: formData.offer_text || "",
        exchange_available: formData.exchange_available || false,
        exchange_discount: parseFloat(formData.exchange_discount) || 0,
        description: formData.description || "",
        stock: formData.stock || 0,
        category: formData.category || "smartphones",
        image_url: formData.image_url || "",
        image_urls: formData.image_urls || [],
        video_url: formData.video_url || "",
        video_file: formData.video_file || "",
      };

      console.log(
        "Saving product with price:",
        formData.price,
        "parsed as:",
        parseFloat(formData.price)
      );

      if (editItem) {
        const response = await adminAPI.updateProduct(editItem.id, payload);
        console.log("Product updated:", response.data);
        toast.success("Product updated successfully");
      } else {
        const response = await adminAPI.createProduct(payload);
        console.log("Product created:", response.data);
        toast.success("Product created successfully");
      }

      setShowModal(false);
      setFormData({});
      fetchDashboardData();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to save product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status);
      console.log("Order update response:", response);
      toast.success(`Order ${status} successfully`);
      // Update local state immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Order update error:", error.response || error);
      toast.error(
        error.response?.data?.error || "Failed to update order status"
      );
    }
  };

  const handleRemoveWishlist = async (wishlistId) => {
    if (window.confirm("Are you sure you want to remove this wishlist item?")) {
      try {
        await adminAPI.removeWishlist(wishlistId);
        toast.success("Wishlist item removed successfully");
        setWishlists(wishlists.filter((w) => w.id !== wishlistId));
      } catch (error) {
        console.error("Remove wishlist error:", error);
        toast.error("Failed to remove wishlist item");
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category?.slug === filters.category
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-");
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price);
        if (max === "max") return price >= parseFloat(min);
        return price >= parseFloat(min) && price <= parseFloat(max);
      });
    }

    // Status filter
    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((product) => product.available);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((product) => !product.available);
      } else if (filters.status === "low_stock") {
        filtered = filtered.filter((product) => product.stock <= 5);
      }
    }

    // Sort filter
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_low":
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case "price_high":
          filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case "name_asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
          filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, products]);

  if (!user?.is_staff) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p className="small">
            Current user: {user?.username || "Not logged in"}
          </p>
          <p className="small">Is staff: {user?.is_staff ? "Yes" : "No"}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader size="large" />;
  }

  const getPerformanceChartData = () => {
    const models = Object.keys(mlData.models || {});
    const mseData = models.map(
      (model) => mlData.models[model].performance?.mse || 0
    );
    const r2Data = models.map(
      (model) => mlData.models[model].performance?.r2 || 0
    );

    return {
      labels: ["Linear Regression", "Polynomial Regression", "Decision Tree"],
      datasets: [
        {
          label: "Mean Squared Error",
          data: mseData,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "R² Score",
          data: r2Data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getRecommendationScoresData = (modelType) => {
    const recommendations = mlData.models?.[modelType]?.recommendations || [];
    return {
      labels: recommendations.map(
        (r) => r.name?.substring(0, 15) + "..." || "Product"
      ),
      datasets: [
        {
          label: "Recommendation Score",
          data: recommendations.map((r) => r[`${modelType}_score`] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col">
            <h2 className="fw-bold text-dark mb-1">
              {activeTab === "overview" && (
                <>
                  <i className="fas fa-chart-line me-2"></i>Overview
                </>
              )}
              {activeTab === "products" && (
                <>
                  <i className="fas fa-box me-2"></i>Products
                </>
              )}
              {activeTab === "users" && (
                <>
                  <i className="fas fa-users me-2"></i>Users
                </>
              )}
              {activeTab === "orders" && (
                <>
                  <i className="fas fa-receipt me-2"></i>Orders
                </>
              )}
              {activeTab === "wishlists" && (
                <>
                  <i className="fas fa-heart me-2"></i>Wishlists
                </>
              )}
              {activeTab === "ml-models" && (
                <>
                  <i className="fas fa-brain me-2"></i>ML Models
                </>
              )}
            </h2>
            <p className="text-muted">Admin Dashboard - Electronics Hub</p>
          </div>
        </div>

        {/* Overview Tab */}
        {(activeTab === "overview" || location.pathname === "/dashboard") && (
          <>
            <style>{`
            .stats-card {
              border-radius: 20px;
              border: none;
              overflow: hidden;
              transition: all 0.3s ease;
              position: relative;
            }
            .stats-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
            }
            .stats-card .card-body {
              position: relative;
              z-index: 2;
            }
            .stats-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
              z-index: 1;
            }
            .chart-card {
              border-radius: 20px;
              border: none;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              transition: all 0.3s ease;
            }
            .chart-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            @media (max-width: 768px) {
              .stats-card {
                margin-bottom: 1rem;
              }
              .stats-card h1 {
                font-size: 1.8rem;
              }
            }
          `}</style>

            {/* Stats Cards */}
            <div className="row g-3 g-md-4 mb-4 mb-md-5">
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-3 py-md-4">
                    <i className="fas fa-box fa-lg fa-md-2x mb-2 mb-md-3 text-primary"></i>
                    <h6 className="card-title mb-2 mb-md-3 small text-muted">Products</h6>
                    <h2 className="h1 mb-0 fw-bold text-dark">
                      {Array.isArray(products) ? products.length : 0}
                    </h2>
                    <small className="text-muted d-block">
                      Active:{" "}
                      {Array.isArray(products)
                        ? products.filter((p) => p.available).length
                        : 0}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-3 py-md-4">
                    <i className="fas fa-shopping-cart fa-lg fa-md-2x mb-2 mb-md-3 text-success"></i>
                    <h6 className="card-title mb-2 mb-md-3 small text-muted">Orders</h6>
                    <h2 className="h1 mb-0 fw-bold text-dark">{orders.length || 0}</h2>
                    <small className="text-muted d-block">
                      Done:{" "}
                      {orders.filter((o) => o.status === "completed").length ||
                        0}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-3 py-md-4">
                    <i className="fas fa-users fa-lg fa-md-2x mb-2 mb-md-3 text-info"></i>
                    <h6 className="card-title mb-2 mb-md-3 small text-muted">Users</h6>
                    <h2 className="h1 mb-0 fw-bold text-dark">{users.length || 0}</h2>
                    <small className="text-muted d-block">
                      Active: {users.filter((u) => u.is_active).length || 0}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-3 py-md-4">
                    <i className="fas fa-rupee-sign fa-lg fa-md-2x mb-2 mb-md-3 text-warning"></i>
                    <h6 className="card-title mb-2 mb-md-3 small text-muted">Revenue</h6>
                    <h2 className="h1 mb-0 fw-bold text-dark">
                      ₹
                      {Math.round(
                        orders.reduce(
                          (total, order) =>
                            total + parseFloat(order.final_amount || order.total_amount || 0),
                          0
                        ) / 1000
                      )}
                      K
                    </h2>
                    <small className="text-muted d-block">
                      Avg: ₹
                      {orders.length
                        ? Math.round(
                            orders.reduce(
                              (total, order) =>
                                total + parseFloat(order.final_amount || order.total_amount || 0),
                              0
                            ) / orders.length
                          )
                        : 0}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 g-md-4 mb-4 mb-md-5">
              <div className="col-12 col-lg-8">
                <div className="card chart-card shadow-sm border-0">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-chart-line me-2"></i>Revenue
                      Analytics
                    </h5>
                  </div>
                  <div className="card-body p-3 p-md-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-4 py-md-5">
                        <i className="fas fa-chart-line fa-2x fa-md-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No revenue data</h5>
                        <p className="text-muted small">
                          Chart will appear once orders are placed
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="row text-center mb-3 mb-md-4 g-2">
                          <div className="col-6 col-md-3">
                            <div className="p-2 p-md-3 bg-success bg-opacity-10 rounded">
                              <h6 className="h5 text-success mb-1">
                                ₹
                                {Math.round(
                                  orders
                                    .filter((o) => o.status === "completed")
                                    .reduce(
                                      (sum, o) =>
                                        sum + parseFloat(o.final_amount || o.total_amount || 0),
                                      0
                                    ) / 1000
                                )}
                                K
                              </h6>
                              <small className="text-muted">Completed</small>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-2 p-md-3 bg-warning bg-opacity-10 rounded">
                              <h6 className="h5 text-warning mb-1">
                                ₹
                                {Math.round(
                                  orders
                                    .filter((o) => o.status === "pending")
                                    .reduce(
                                      (sum, o) =>
                                        sum + parseFloat(o.final_amount || o.total_amount || 0),
                                      0
                                    ) / 1000
                                )}
                                K
                              </h6>
                              <small className="text-muted">Pending</small>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-2 p-md-3 bg-info bg-opacity-10 rounded">
                              <h6 className="h5 text-info mb-1">
                                ₹
                                {Math.round(
                                  orders.reduce(
                                    (sum, o) =>
                                      sum + parseFloat(o.final_amount || o.total_amount || 0),
                                    0
                                  ) / Math.max(orders.length, 1)
                                )}
                              </h6>
                              <small className="text-muted">Avg Order</small>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-2 p-md-3 bg-primary bg-opacity-10 rounded">
                              <h6 className="h5 text-primary mb-1">
                                {orders.length}
                              </h6>
                              <small className="text-muted">Total</small>
                            </div>
                          </div>
                        </div>
                        <div
                          className="progress mb-3"
                          style={{ height: "15px", borderRadius: "10px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${
                                orders.length
                                  ? (orders.filter(
                                      (o) => o.status === "completed"
                                    ).length /
                                      orders.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          >
                            <small>
                              {Math.round(
                                orders.length
                                  ? (orders.filter(
                                      (o) => o.status === "completed"
                                    ).length /
                                      orders.length) *
                                      100
                                  : 0
                              )}
                              %
                            </small>
                          </div>
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${
                                orders.length
                                  ? (orders.filter(
                                      (o) => o.status === "pending"
                                    ).length /
                                      orders.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          >
                            <small>
                              {Math.round(
                                orders.length
                                  ? (orders.filter(
                                      (o) => o.status === "pending"
                                    ).length /
                                      orders.length) *
                                      100
                                  : 0
                              )}
                              %
                            </small>
                          </div>
                        </div>
                        <div className="row g-1">
                          {orders
                            .slice(-7)
                            .reverse()
                            .map((order, index) => {
                              const height = Math.max(
                                15,
                                (parseFloat(order.final_amount || order.total_amount || 0) /
                                  Math.max(
                                    ...orders.map((o) =>
                                      parseFloat(o.final_amount || o.total_amount || 0)
                                    )
                                  )) *
                                  60
                              );
                              return (
                                <div key={order.id} className="col text-center">
                                  <div
                                    className={`bg-${
                                      order.status === "completed"
                                        ? "success"
                                        : order.status === "pending"
                                        ? "warning"
                                        : "danger"
                                    } rounded mb-1`}
                                    style={{
                                      height: `${height}px`,
                                      minHeight: "15px",
                                    }}
                                    title={`₹${parseFloat(
                                      order.final_amount || order.total_amount || 0
                                    ).toFixed(0)} - ${order.status}`}
                                  ></div>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </small>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="card chart-card shadow-sm border-0">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-chart-pie me-2"></i>Categories
                    </h5>
                  </div>
                  <div className="card-body p-3 p-md-4">
                    {availableCategories.length > 0 ? (
                      <div>
                        {availableCategories
                          .slice(0, 5)
                          .map((category, index) => {
                            const categoryProducts = products.filter(
                              (p) => p.category?.slug === category.slug
                            ).length;
                            const percentage = products.length
                              ? Math.round(
                                  (categoryProducts / products.length) * 100
                                )
                              : 0;
                            return (
                              <div key={category.id} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <small className="fw-medium">
                                    {category.name}
                                  </small>
                                  <small>
                                    {categoryProducts} ({percentage}%)
                                  </small>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "6px", borderRadius: "3px" }}
                                >
                                  <div
                                    className={`progress-bar bg-${
                                      [
                                        "primary",
                                        "success",
                                        "warning",
                                        "info",
                                        "danger",
                                      ][index % 5]
                                    }`}
                                    style={{
                                      width: `${percentage}%`,
                                      borderRadius: "3px",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-tags fa-2x text-muted mb-2"></i>
                        <p className="text-muted mb-0 small">No categories</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row g-3 g-md-4 mb-4 mb-md-5">
              <div className="col-12 col-lg-6">
                <div className="card chart-card shadow-sm border-0">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-clock me-2"></i>Recent Orders
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    {orders.slice(0, 5).length > 0 ? (
                      <div className="list-group list-group-flush">
                        {orders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="list-group-item d-flex justify-content-between align-items-center py-2 py-md-3"
                          >
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small">{order.order_id}</h6>
                              <small className="text-muted">
                                {order.user?.first_name} {order.user?.last_name}
                              </small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-success small">
                                ₹
                                {parseFloat(order.final_amount || order.total_amount || 0).toFixed(0)}
                              </div>
                              <span
                                className={`badge badge-sm bg-${
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "pending"
                                    ? "warning"
                                    : "danger"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {order.status || "pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-receipt fa-2x text-muted mb-2"></i>
                        <p className="text-muted mb-0 small">
                          No recent orders
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card chart-card shadow-sm border-0">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffc107 0%, #e0a800 100%)",
                      color: "#333",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>Stock
                      Alert
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    {products.filter((p) => p.stock <= 5).length > 0 ? (
                      <div className="list-group list-group-flush">
                        {products
                          .filter((p) => p.stock <= 5)
                          .slice(0, 5)
                          .map((product) => (
                            <div
                              key={product.id}
                              className="list-group-item d-flex justify-content-between align-items-center py-2 py-md-3"
                            >
                              <div className="flex-grow-1">
                                <h6 className="mb-1 small">
                                  {product.name.substring(0, 25)}...
                                </h6>
                                <small className="text-muted">
                                  {product.category?.name}
                                </small>
                              </div>
                              <span
                                className={`badge bg-${
                                  product.stock === 0
                                    ? "danger"
                                    : "warning text-dark"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {product.stock} left
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                        <p className="text-muted mb-0 small">
                          All products well stocked
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Wishlists Tab */}
        {activeTab === "wishlists" && (
          <>
            <div
              className="p-3 p-md-4 mb-4"
              style={{
                background: "#667eea",
                borderRadius: "20px",
                color: "white",
              }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">
                    <i className="fas fa-heart me-3"></i>Wishlist Management
                  </h4>
                  <p className="mb-0 opacity-75">
                    Monitor customer wishlist activity
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-heart me-1"></i>Total:{" "}
                    {wishlists.length}
                  </span>
                  <span className="badge bg-info px-3 py-2">
                    <i className="fas fa-users me-1"></i>Users:{" "}
                    {new Set(wishlists.map((w) => w.user?.username)).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4">
              {/* Search Bar */}
              <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-8 col-lg-6">
                  <div
                    className="input-group"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    <span
                      className="input-group-text bg-white border-end-0"
                      style={{
                        borderRadius: "25px 0 0 25px",
                        paddingLeft: "1rem",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 30 30"
                        fill="#6B7280"
                      >
                        <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search wishlists..."
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-user"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      <option value="">All Users</option>
                      {Array.from(
                        new Set(wishlists.map((w) => w.user?.username))
                      ).map((username) => (
                        <option key={username} value={username}>
                          {username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-sort"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_high">Highest Price</option>
                      <option value="price_low">Lowest Price</option>
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-calendar"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 g-md-4">
              {wishlists.length > 0 ? (
                wishlists.map((wishlist) => (
                  <div key={wishlist.id} className="col-12 col-md-6 col-lg-4">
                    <div
                      className="card h-100 shadow-sm border-0"
                      style={{
                        borderRadius: "15px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.closest(".card").style.transform =
                          "translateY(-5px)";
                        e.target.closest(".card").style.boxShadow =
                          "0 15px 35px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.closest(".card").style.transform =
                          "translateY(0)";
                        e.target.closest(".card").style.boxShadow =
                          "0 2px 10px rgba(0,0,0,0.1)";
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex gap-3">
                          <img
                            src={
                              wishlist.product.image_url ||
                              "https://via.placeholder.com/80x80?text=No+Image"
                            }
                            alt={wishlist.product.name}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x80?text=No+Image";
                            }}
                          />
                          <div className="flex-grow-1">
                            <h6
                              className="card-title mb-1 text-truncate"
                              title={wishlist.product.name}
                            >
                              {wishlist.product.name}
                            </h6>
                            <p className="text-muted mb-1 small">
                              <i className="fas fa-user me-1"></i>
                              {wishlist.user.first_name}{" "}
                              {wishlist.user.last_name}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-success">
                                ₹{parseFloat(wishlist.product.price).toFixed(0)}
                              </span>
                              <small className="text-muted">
                                {new Date(wishlist.added_at).toLocaleDateString(
                                  "en-IN",
                                  { day: "2-digit", month: "short" }
                                )}
                              </small>
                            </div>
                            <div className="mt-2">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleRemoveWishlist(wishlist.id)
                                }
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <i className="fas fa-trash me-1"></i>Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center py-5">
                    <i className="fas fa-heart fa-4x text-muted mb-3"></i>
                    <h4 className="text-muted">No Wishlist Items</h4>
                    <p className="text-muted mb-0">
                      Customer wishlist items will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "ml-models" && (
          <>
            <style>{`
            .analytics-card {
              border-radius: 20px;
              border: none;
              transition: all 0.3s ease;
              overflow: hidden;
            }
            .analytics-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            }
            .metric-card {
              background: white;
              border-radius: 15px;
              color: #333;
              padding: 1.5rem;
              text-align: center;
              transition: all 0.3s ease;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            }
            .metric-card:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 15px rgba(0,0,0,0.12);
            }
            .chart-container {
              background: rgba(255,255,255,0.95);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 1.5rem;
            }
          `}</style>

            {/* Header */}
            <div
              className="p-3 p-md-4 mb-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "20px",
                color: "white",
              }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">
                    <i className="fas fa-chart-line me-3"></i>Advanced Analytics
                  </h4>
                  <p className="mb-0 opacity-75">
                    Real-time business insights and performance metrics
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-sync-alt me-1"></i>Live Data
                  </span>
                  <span className="badge bg-success px-3 py-2">
                    <i className="fas fa-check-circle me-1"></i>Updated Now
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-4">
                    <i className="fas fa-chart-line fa-2x mb-3 text-success"></i>
                    <h2 className="mb-1 text-dark">
                      ₹{Math.round((stats.revenue?.total || 0) / 1000)}K
                    </h2>
                    <small className="text-muted">Total Revenue</small>
                    <div className="mt-2">
                      <small className="badge bg-light text-dark">
                        +
                        {Math.round(
                          ((stats.revenue?.last_30_days || 0) /
                            Math.max(stats.revenue?.total || 1, 1)) *
                            100
                        )}
                        % this month
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-4">
                    <i className="fas fa-shopping-cart fa-2x mb-3 text-primary"></i>
                    <h2 className="mb-1 text-dark">{stats.orders?.total || 0}</h2>
                    <small className="text-muted">Total Orders</small>
                    <div className="mt-2">
                      <small className="badge bg-light text-dark">
                        {stats.orders?.completed || 0} completed
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-4">
                    <i className="fas fa-users fa-2x mb-3 text-info"></i>
                    <h2 className="mb-1 text-dark">{stats.users?.total || 0}</h2>
                    <small className="text-muted">Total Users</small>
                    <div className="mt-2">
                      <small className="badge bg-light text-dark">
                        {stats.users?.active || 0} active
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body text-center py-4">
                    <i className="fas fa-percentage fa-2x mb-3 text-warning"></i>
                    <h2 className="mb-1 text-dark">{stats.conversion_rate || 0}%</h2>
                    <small className="text-muted">Conversion Rate</small>
                    <div className="mt-2">
                      <small className="badge bg-success text-white">
                        {stats.conversion_rate > 50
                          ? "Excellent"
                          : stats.conversion_rate > 30
                          ? "Good"
                          : "Average"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-12 col-lg-8">
                <div className="analytics-card shadow-sm">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-area me-2"></i>Revenue Trends
                      </h5>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-light btn-sm">7D</button>
                        <button className="btn btn-primary btn-sm">30D</button>
                        <button className="btn btn-light btn-sm">90D</button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <Line
                      data={{
                        labels:
                          stats.revenue?.daily?.map((d) =>
                            new Date(d.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          ) || [],
                        datasets: [
                          {
                            label: "Daily Revenue",
                            data:
                              stats.revenue?.daily?.map((d) => d.revenue) || [],
                            borderColor: "rgba(102, 126, 234, 1)",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: "rgba(102, 126, 234, 1)",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "rgba(0,0,0,0.8)",
                            titleColor: "#fff",
                            bodyColor: "#fff",
                            borderColor: "rgba(102, 126, 234, 1)",
                            borderWidth: 1,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: "rgba(0,0,0,0.1)" },
                            ticks: { color: "#666" },
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: "#666" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="analytics-card shadow-sm h-100">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-chart-pie me-2"></i>Order Status
                    </h5>
                  </div>
                  <div className="card-body p-3">
                    <div className="mb-3">
                      {(stats.orders?.status_distribution || []).map(
                        (statusData, index) => {
                          const percentage = stats.orders?.total
                            ? Math.round(
                                (statusData.count / stats.orders.total) * 100
                              )
                            : 0;
                          const colors = [
                            "success",
                            "warning",
                            "info",
                            "danger",
                            "secondary",
                          ];
                          return (
                            <div key={statusData.status} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="fw-medium text-capitalize">
                                  {statusData.status || "pending"}
                                </span>
                                <span className="text-muted">
                                  {statusData.count} ({percentage}%)
                                </span>
                              </div>
                              <div
                                className="progress"
                                style={{ height: "8px", borderRadius: "4px" }}
                              >
                                <div
                                  className={`progress-bar bg-${
                                    colors[index % colors.length]
                                  }`}
                                  style={{
                                    width: `${percentage}%`,
                                    borderRadius: "4px",
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Performance */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-12 col-lg-6">
                <div className="analytics-card shadow-sm">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-star me-2"></i>Top Products
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    {(stats.products?.top_products || [])
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={product.id}
                          className="d-flex align-items-center p-3 border-bottom"
                        >
                          <div className="me-3">
                            <div
                              className={`badge bg-${
                                index === 0
                                  ? "warning"
                                  : index === 1
                                  ? "secondary"
                                  : index === 2
                                  ? "dark"
                                  : "light text-dark"
                              } rounded-circle`}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <img
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/40"
                            }
                            alt={product.name}
                            className="rounded me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              {product.name.substring(0, 30)}...
                            </h6>
                            <small className="text-muted">
                              ₹{parseFloat(product.price).toFixed(0)} • Stock:{" "}
                              {product.stock}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-success">
                              ₹
                              {Math.round(
                                parseFloat(product.price) * (index + 1) * 2
                              )}
                              K
                            </div>
                            <small className="text-muted">Revenue</small>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="analytics-card shadow-sm">
                  <div
                    className="card-header"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                      color: "#333",
                      borderRadius: "20px 20px 0 0",
                    }}
                  >
                    <h5 className="mb-0">
                      <i className="fas fa-users me-2"></i>User Activity
                    </h5>
                  </div>
                  <div className="card-body p-3">
                    <Bar
                      data={{
                        labels: stats.users?.weekly_activity?.map(
                          (d) => d.day
                        ) || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        datasets: [
                          {
                            label: "User Activity",
                            data: stats.users?.weekly_activity?.map(
                              (d) => d.activity
                            ) || [0, 0, 0, 0, 0, 0, 0],
                            backgroundColor: "rgba(255, 99, 132, 0.8)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: "rgba(0,0,0,0.1)" },
                          },
                          x: {
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <style>{`
            .products-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              color: white;
              margin-bottom: 2rem;
            }
            .product-card {
              border-radius: 15px;
              border: none;
              transition: all 0.3s ease;
              overflow: hidden;
            }
            .product-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            }
            .product-image {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 10px;
            }
            .product-actions {
              gap: 0.5rem;
            }
            .action-btn {
              width: 35px;
              height: 35px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.8rem;
              transition: all 0.2s ease;
            }
            .action-btn:hover {
              transform: translateY(-2px);
            }
            .status-toggle {
              border-radius: 20px;
              font-size: 0.75rem;
              padding: 0.25rem 0.75rem;
            }
            @media (max-width: 768px) {
              .product-image {
                height: 140px;
              }
              .product-card {
                margin-bottom: 1rem;
              }
              .product-card .card-body {
                padding: 0.75rem !important;
                min-height: 140px !important;
              }
              .product-card .card-title {
                font-size: 0.8rem !important;
                line-height: 1.1 !important;
              }
            }
            @media (max-width: 576px) {
              .product-image {
                height: 120px;
              }
              .product-card .card-body {
                padding: 0.5rem !important;
                min-height: 120px !important;
              }
              .product-card .card-title {
                font-size: 0.75rem !important;
              }
              .product-actions button {
                width: 24px !important;
                height: 24px !important;
                font-size: 0.6rem !important;
              }
            }
          `}</style>

            <div className="products-header p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">
                    <i className="fas fa-box me-3"></i>Product Management
                  </h4>
                  <p className="mb-0 opacity-75">
                    Manage your product inventory
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-box me-1"></i>
                    Total: {products.length}
                  </span>
                  <span className="badge bg-success px-3 py-2">
                    <i className="fas fa-check-circle me-1"></i>
                    Active: {products.filter((p) => p.available).length}
                  </span>
                  <button
                    className="btn btn-light btn-sm shadow"
                    onClick={handleAddProduct}
                  >
                    <i className="fas fa-plus me-2"></i>Add Product
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4">
              {/* Search Bar */}
              <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-8 col-lg-6">
                  <div
                    className="input-group"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    <span
                      className="input-group-text bg-white border-end-0"
                      style={{
                        borderRadius: "25px 0 0 25px",
                        paddingLeft: "1rem",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 30 30"
                        fill="#6B7280"
                      >
                        <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-tags"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                    >
                      <option value="">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="smartphones">Smartphones</option>
                      <option value="laptops">Laptops</option>
                      <option value="tablets">Tablets</option>
                      <option value="headphones">Headphones</option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-rupee-sign"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                      value={filters.priceRange}
                      onChange={(e) =>
                        setFilters({ ...filters, priceRange: e.target.value })
                      }
                    >
                      <option value="">All Prices</option>
                      <option value="0-1000">Under ₹1,000</option>
                      <option value="1000-5000">₹1,000 - ₹5,000</option>
                      <option value="5000-10000">₹5,000 - ₹10,000</option>
                      <option value="10000-25000">₹10,000 - ₹25,000</option>
                      <option value="25000-max">Above ₹25,000</option>
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-sort"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                    >
                      <option value="">Sort By</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <div className="input-group">
                    <span
                      className="input-group-text bg-white"
                      style={{ borderRadius: "25px 0 0 25px" }}
                    >
                      <i
                        className="fas fa-toggle-on"
                        style={{ color: "#6B7280" }}
                      ></i>
                    </span>
                    <select
                      className="form-select border-start-0"
                      style={{
                        borderRadius: "0 25px 25px 0",
                        height: "46px",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="low_stock">Low Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 g-md-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  >
                    <div className="card product-card h-100 shadow-sm">
                      <div className="position-relative">
                        <img
                          src={
                            product.image_url ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f8f9fa'/%3E%3Cg fill='%236c757d'%3E%3Cpath d='M150 80c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z'/%3E%3Cpath d='M200 60H100c-11 0-20 9-20 20v80c0 11 9 20 20 20h100c11 0 20-9 20-20V80c0-11-9-20-20-20zm10 100c0 5.5-4.5 10-10 10H100c-5.5 0-10-4.5-10-10V80c0-5.5 4.5-10 10-10h100c5.5 0 10 4.5 10 10v80z'/%3E%3C/g%3E%3Ctext x='150' y='140' text-anchor='middle' fill='%236c757d' font-family='Arial' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                          }
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f8f9fa'/%3E%3Cg fill='%236c757d'%3E%3Cpath d='M150 80c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z'/%3E%3Cpath d='M200 60H100c-11 0-20 9-20 20v80c0 11 9 20 20 20h100c11 0 20-9 20-20V80c0-11-9-20-20-20zm10 100c0 5.5-4.5 10-10 10H100c-5.5 0-10-4.5-10-10V80c0-5.5 4.5-10 10-10h100c5.5 0 10 4.5 10 10v80z'/%3E%3C/g%3E%3Ctext x='150' y='140' text-anchor='middle' fill='%236c757d' font-family='Arial' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="position-absolute top-0 end-0 p-2">
                          <span
                            className={`badge status-toggle ${
                              product.available ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {product.available ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {product.stock <= 5 && (
                          <div className="position-absolute top-0 start-0 p-2">
                            <span className="badge bg-warning text-dark status-toggle">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Low Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-body p-2 p-sm-3" style={{minHeight: '160px', display: 'flex', flexDirection: 'column'}}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6
                            className="card-title mb-0 flex-grow-1 pe-2"
                            title={product.name}
                            style={{cursor: 'pointer', color: '#0d6efd', fontSize: '0.85rem', lineHeight: '1.2', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}
                            onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                          >
                            {product.name}
                          </h6>
                          <div className="d-flex align-items-center gap-1 flex-shrink-0">
                            <button
                              className="btn btn-sm btn-outline-primary p-1"
                              onClick={() => handleEditProduct(product)}
                              title="Edit Product"
                              style={{width: '20px', height: '20px', borderRadius: '4px', fontSize: '0.6rem'}}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger p-1"
                              onClick={() => handleDeleteProduct(product.id)}
                              title="Delete Product"
                              style={{width: '20px', height: '20px', borderRadius: '4px', fontSize: '0.6rem'}}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="fw-bold text-primary" style={{fontSize: '0.9rem'}}>
                              ₹{parseFloat(product.price).toFixed(0)}
                            </span>
                            {product.actual_price &&
                              product.actual_price > product.price && (
                                <>
                                  <small className="text-muted text-decoration-line-through" style={{fontSize: '0.75rem'}}>
                                    ₹{parseFloat(product.actual_price).toFixed(0)}
                                  </small>
                                  <small className="badge bg-danger" style={{fontSize: '0.6rem'}}>
                                    {product.discount_percentage}% OFF
                                  </small>
                                </>
                              )}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{fontSize: '0.75rem'}}>
                          <small className="text-muted">
                            <i className="fas fa-boxes me-1"></i>
                            Stock: {product.stock}
                          </small>
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(product.created).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" }
                            )}
                          </small>
                        </div>

                        <div className="product-actions d-flex justify-content-center gap-1 mt-auto">
                          <button
                            className={`btn btn-sm ${
                              product.available
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              handleToggleProductStatus(
                                product.id,
                                !product.available
                              )
                            }
                            title={
                              product.available ? "Deactivate" : "Activate"
                            }
                            style={{width: '28px', height: '28px', borderRadius: '6px', fontSize: '0.7rem', padding: '0'}}
                          >
                            <i
                              className={`fas ${
                                product.available ? "fa-eye-slash" : "fa-eye"
                              }`}
                            ></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                            title="View Product"
                            style={{width: '28px', height: '28px', borderRadius: '6px', fontSize: '0.7rem', padding: '0'}}
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="p-5">
                      <i className="fas fa-box fa-4x text-muted mb-3"></i>
                      <h4 className="text-muted">No Products Found</h4>
                      <p className="text-muted mb-4">
                        Start by adding your first product to the inventory
                      </p>
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleAddProduct}
                      >
                        <i className="fas fa-plus me-2"></i>Add First Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && <AdminUsersBootstrap />}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            <style>{`
            .order-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 25px;
              color: white;
              margin-bottom: 2rem;
              position: relative;
              overflow: hidden;
            }
            .order-header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
            }
            .order-stats {
              backdrop-filter: blur(10px);
              background: rgba(255,255,255,0.15);
              border-radius: 15px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .table-modern {
              border-radius: 25px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              backdrop-filter: blur(20px);
              background: rgba(255,255,255,0.95);
            }
            .table-modern thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              position: relative;
            }
            .table-modern thead::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            }
            .table-modern tbody tr {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              border: none;
              position: relative;
            }
            .table-modern tbody tr:hover {
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
              transform: translateY(-2px);
              box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
            }
            .table-modern tbody tr::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 20px;
              right: 20px;
              height: 1px;
              background: linear-gradient(90deg, transparent, #e9ecef, transparent);
            }
            .order-id {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 700;
              position: relative;
              cursor: pointer;
            }
            .order-id::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 100%;
              height: 2px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              transform: scaleX(0);
              transition: transform 0.3s ease;
            }
            .order-id:hover::after {
              transform: scaleX(1);
            }
            .customer-avatar {
              width: 45px;
              height: 45px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              margin-right: 15px;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
              transition: all 0.3s ease;
            }
            .customer-avatar:hover {
              transform: scale(1.1);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            .amount-display {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 700;
              font-size: 1.2rem;
              position: relative;
            }
            .amount-display::before {
              content: '';
              position: absolute;
              top: 50%;
              left: -10px;
              width: 4px;
              height: 20px;
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              border-radius: 2px;
              transform: translateY(-50%);
            }
            .status-badge {
              border-radius: 25px;
              font-size: 0.75rem;
              font-weight: 600;
              padding: 0.6rem 1.2rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
            }
            .status-badge::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              transition: left 0.5s ease;
            }
            .status-badge:hover::before {
              left: 100%;
            }
            .action-select {
              border-radius: 20px;
              border: 2px solid #e9ecef;
              transition: all 0.3s ease;
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .action-select:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.25), 0 4px 15px rgba(102, 126, 234, 0.2);
              transform: translateY(-1px);
            }
            .order-icon {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 15px;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
              transition: all 0.3s ease;
            }
            .order-icon:hover {
              transform: rotate(5deg) scale(1.1);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            @media (max-width: 768px) {
              .order-header h4 {
                font-size: 1.3rem;
              }
              .order-header p {
                font-size: 0.85rem;
              }
              .table-modern {
                font-size: 0.8rem;
              }
              .customer-avatar {
                width: 32px;
                height: 32px;
                font-size: 0.8rem;
              }
              .order-id {
                font-size: 0.9rem;
              }
              .amount-display {
                font-size: 1rem;
              }
              .status-badge {
                font-size: 0.65rem;
                padding: 0.3rem 0.7rem;
              }
              .action-select {
                font-size: 0.75rem;
                min-width: 120px;
              }
              .table-modern th,
              .table-modern td {
                padding: 0.75rem 0.5rem;
              }
              .mobile-stack {
                display: block;
              }
              .mobile-hide {
                display: none;
              }
            }
            @media (max-width: 576px) {
              .order-header {
                padding: 1rem;
                margin-bottom: 1rem;
              }
              .order-header .h3 {
                font-size: 1.5rem;
              }
              .table-modern {
                font-size: 0.75rem;
              }
              .customer-avatar {
                width: 28px;
                height: 28px;
                font-size: 0.7rem;
                margin-right: 8px;
              }
              .order-id {
                font-size: 0.8rem;
              }
              .amount-display {
                font-size: 0.9rem;
              }
              .status-badge {
                font-size: 0.6rem;
                padding: 0.25rem 0.6rem;
              }
              .action-select {
                font-size: 0.7rem;
                min-width: 100px;
              }
              .table-modern th,
              .table-modern td {
                padding: 0.5rem 0.3rem;
              }
            }
          `}</style>

            <div className="order-header p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-2">
                    <i className="fas fa-shopping-bag me-3"></i>Order Management
                  </h4>
                  <p className="mb-0 opacity-90">
                    Track and manage customer orders efficiently
                  </p>
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  <div className="text-center order-stats px-3 py-2">
                    <div className="h3 mb-1">{orders.length}</div>
                    <small className="opacity-75">Total Orders</small>
                  </div>
                  <div className="text-center order-stats px-3 py-2">
                    <div className="h3 mb-1 text-success">
                      {orders.filter((o) => o.status === "delivered").length}
                    </div>
                    <small className="opacity-75">Delivered</small>
                  </div>
                  <div className="text-center order-stats px-3 py-2">
                    <div className="h3 mb-1 text-warning">
                      {orders.filter((o) => o.status === "pending").length}
                    </div>
                    <small className="opacity-75">Pending</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card table-modern border-0">
              <div className="table-responsive">
                {orders.length > 0 ? (
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="border-0 py-4 px-4">Order Details</th>
                        <th className="border-0 py-4 px-3 d-none d-md-table-cell">
                          Customer
                        </th>
                        <th className="border-0 py-4 px-3">Amount</th>
                        <th className="border-0 py-4 px-3">Status</th>
                        <th className="border-0 py-4 px-3 d-none d-lg-table-cell">
                          Date
                        </th>
                        <th className="border-0 py-4 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="py-4 px-4">
                            <div className="d-flex align-items-center">
                              <div className="me-3 d-none d-sm-block">
                                <div className="order-icon">
                                  <i className="fas fa-receipt text-white"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="order-id">{order.order_id}</div>
                                <small className="text-muted">
                                  <i className="fas fa-box me-1"></i>
                                  {order.items_count || 0} items
                                </small>
                                <div className="d-md-none mt-1">
                                  <div className="d-flex align-items-center">
                                    <div className="customer-avatar me-2">
                                      {(
                                        order.user?.first_name?.[0] ||
                                        order.user?.username?.[0] ||
                                        "U"
                                      ).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="fw-semibold small">
                                        {order.user?.first_name}{" "}
                                        {order.user?.last_name}
                                      </div>
                                      <small className="text-muted">
                                        @{order.user?.username}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-lg-none mt-1">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 d-none d-md-table-cell">
                            <div className="d-flex align-items-center">
                              <div className="customer-avatar">
                                {(
                                  order.user?.first_name?.[0] ||
                                  order.user?.username?.[0] ||
                                  "U"
                                ).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-semibold">
                                  {order.user?.first_name}{" "}
                                  {order.user?.last_name}
                                </div>
                                <small className="text-muted">
                                  @{order.user?.username}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="amount-display">
                              ₹
                              {parseFloat(
                                order.final_amount || order.total_amount
                              ).toFixed(0)}
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="d-flex align-items-center mt-1">
                                <i
                                  className="fas fa-tag text-success me-1"
                                  style={{ fontSize: "0.7rem" }}
                                ></i>
                                <small className="text-success">
                                  ₹
                                  {parseFloat(order.discount_amount).toFixed(0)}{" "}
                                  saved
                                </small>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <span
                              className={`status-badge ${
                                order.status === "delivered"
                                  ? "bg-success"
                                  : order.status === "pending"
                                  ? "bg-warning text-dark"
                                  : order.status === "shipped"
                                  ? "bg-info"
                                  : order.status === "confirmed"
                                  ? "bg-primary"
                                  : order.status === "cancelled"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  order.status === "delivered"
                                    ? "fa-check-circle"
                                    : order.status === "pending"
                                    ? "fa-clock"
                                    : order.status === "shipped"
                                    ? "fa-shipping-fast"
                                    : order.status === "confirmed"
                                    ? "fa-check"
                                    : order.status === "cancelled"
                                    ? "fa-times"
                                    : "fa-question"
                                } me-1`}
                              ></i>
                              <span className="d-none d-sm-inline">
                                {order.status || "pending"}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-3 d-none d-lg-table-cell">
                            <div className="fw-medium">
                              {new Date(order.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <small className="text-muted">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {Math.floor(
                                (new Date() - new Date(order.created_at)) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago
                            </small>
                          </td>
                          <td className="py-4 px-3">
                            <select
                              className="form-select form-select-sm action-select"
                              value={order.status || "pending"}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                              style={{ minWidth: "140px" }}
                            >
                              <option value="pending">📋 Pending</option>
                              <option value="confirmed">✅ Confirmed</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">📦 Delivered</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                            {order.status === "cancelled" && (
                              <div className="mt-2">
                                <span
                                  className="badge bg-info"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  <i className="fas fa-undo me-1"></i>70%
                                  Refunded
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <div
                        className="bg-light rounded-circle mx-auto mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-shopping-bag fa-2x text-muted"></i>
                      </div>
                      <h4 className="text-muted mb-2">No Orders Yet</h4>
                      <p className="text-muted mb-0">
                        Orders will appear here once customers start purchasing
                      </p>
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-chart-line text-primary mb-2"></i>
                        <div className="small text-muted">Track Sales</div>
                      </div>
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-users text-success mb-2"></i>
                        <div className="small text-muted">Manage Customers</div>
                      </div>
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-box text-warning mb-2"></i>
                        <div className="small text-muted">Add Products</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background: transparent;
        }
      `}</style>

        {/* Product Modal */}
        {showModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center p-1 p-md-2"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 9999,
              backdropFilter: "blur(5px)",
              paddingTop: "10px",
            }}
          >
            <div
              className="bg-white shadow-lg rounded-4 overflow-hidden w-100"
              style={{ maxWidth: "1100px", height: "98vh" }}
            >
              <div className="d-flex flex-column flex-md-row h-100">
                <div
                  className="flex-shrink-0 d-flex flex-column d-md-block d-none"
                  style={{
                    background: "#f8f9fa",
                    borderRight: "1px solid #e9ecef",
                    width: "100%",
                    maxWidth: "350px",
                  }}
                >
                  <div className="p-3 border-bottom">
                    <h5 className="mb-1 text-dark">
                      <i className="fas fa-box me-2 text-primary"></i>
                      {editItem ? "Edit Product" : "Add New Product"}
                    </h5>
                    <p className="mb-0 text-muted small">
                      Manage product information and media
                    </p>
                  </div>
                  <div
                    className="flex-grow-1 p-2 p-md-3 modal-scroll"
                    style={{
                      overflowY: "auto",
                      maxHeight: "calc(95vh - 120px)",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <h6 className="fw-bold mb-2 text-dark d-md-block d-none">
                      <i className="fas fa-images me-2 text-primary"></i>Product
                      Media
                    </h6>

                    <div className="mb-3 d-md-block d-none">
                      <label className="form-label fw-medium mb-2 small">
                        Product Video
                      </label>
                      <div className="mb-2">
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          placeholder="YouTube URL"
                          value={formData.video_url || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              video_url: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="file"
                          accept="video/*"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData({
                                  ...formData,
                                  video_file: event.target.result,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        Add YouTube URL or upload video
                      </small>
                      {formData.video_url && (
                        <div className="mt-2">
                          <div
                            className="ratio ratio-16x9"
                            style={{ maxHeight: "80px" }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${
                                formData.video_url.includes("watch?v=")
                                  ? formData.video_url
                                      .split("watch?v=")[1]
                                      .split("&")[0]
                                  : formData.video_url.split("/").pop()
                              }`}
                              title="Product Video"
                              allowFullScreen
                              style={{ borderRadius: "8px" }}
                            ></iframe>
                          </div>
                        </div>
                      )}
                      {formData.video_file && (
                        <div className="mt-2">
                          <video
                            controls
                            style={{
                              width: "100%",
                              maxHeight: "80px",
                              borderRadius: "8px",
                            }}
                            src={formData.video_file}
                          ></video>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium mb-2 small">
                        Landing Image *
                      </label>
                      <div
                        className="position-relative"
                        style={{
                          height: "80px",
                          border: "2px dashed #dee2e6",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          background: "#fff",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.borderColor = "#0d6efd")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.borderColor = "#dee2e6")
                        }
                      >
                        <input
                          accept="image/*"
                          type="file"
                          id="image0"
                          className="d-none"
                          onChange={(e) => handleImageUpload(e, 0)}
                        />
                        <label
                          htmlFor="image0"
                          className="w-100 h-100 d-flex align-items-center justify-content-center m-0 position-relative"
                          style={{ cursor: "pointer" }}
                        >
                          {formData.images && formData.images[0] ? (
                            <>
                              <img
                                src={formData.images[0]}
                                alt="Landing Image"
                                className="w-100 h-100"
                                style={{
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                              <div
                                className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1"
                                style={{
                                  fontSize: "0.6rem",
                                  borderRadius: "0 0 6px 0",
                                }}
                              >
                                MAIN
                              </div>
                              <button
                                type="button"
                                className="position-absolute top-0 end-0 btn btn-danger btn-sm"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  fontSize: "8px",
                                  transform: "translate(6px, -6px)",
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const newImages = [
                                    ...(formData.images || Array(5).fill(null)),
                                  ];
                                  newImages[0] = null;
                                  setFormData({
                                    ...formData,
                                    images: newImages,
                                    image_url:
                                      newImages.filter(Boolean)[0] || "",
                                  });
                                }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <div className="text-center text-muted">
                              <i
                                className="fas fa-image mb-1"
                                style={{ fontSize: "1.2rem" }}
                              ></i>
                              <div style={{ fontSize: "0.7rem" }}>
                                Main Image
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium mb-2 small">
                        Additional Images
                      </label>
                      <div className="row g-1">
                        {Array(4)
                          .fill("")
                          .map((_, index) => {
                            const imgIndex = index + 1;
                            return (
                              <div key={imgIndex} className="col-6 col-lg-6">
                                <div
                                  className="position-relative"
                                  style={{
                                    height: "50px",
                                    border: "2px dashed #dee2e6",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    background: "#fff",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.target.style.borderColor = "#0d6efd")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.target.style.borderColor = "#dee2e6")
                                  }
                                >
                                  <input
                                    accept="image/*"
                                    type="file"
                                    id={`image${imgIndex}`}
                                    className="d-none"
                                    onChange={(e) =>
                                      handleImageUpload(e, imgIndex)
                                    }
                                  />
                                  <label
                                    htmlFor={`image${imgIndex}`}
                                    className="w-100 h-100 d-flex align-items-center justify-content-center m-0 position-relative"
                                    style={{ cursor: "pointer" }}
                                  >
                                    {formData.images &&
                                    formData.images[imgIndex] ? (
                                      <>
                                        <img
                                          src={formData.images[imgIndex]}
                                          alt={`Image ${imgIndex}`}
                                          className="w-100 h-100"
                                          style={{
                                            objectFit: "cover",
                                            borderRadius: "6px",
                                          }}
                                        />
                                        <button
                                          type="button"
                                          className="position-absolute top-0 end-0 btn btn-danger btn-sm"
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            fontSize: "6px",
                                            transform: "translate(4px, -4px)",
                                          }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const newImages = [
                                              ...(formData.images ||
                                                Array(5).fill(null)),
                                            ];
                                            newImages[imgIndex] = null;
                                            setFormData({
                                              ...formData,
                                              images: newImages,
                                              image_urls:
                                                newImages.filter(Boolean),
                                            });
                                          }}
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </>
                                    ) : (
                                      <div className="text-center text-muted">
                                        <i
                                          className="fas fa-plus mb-1"
                                          style={{ fontSize: "0.6rem" }}
                                        ></i>
                                        <div style={{ fontSize: "0.6rem" }}>
                                          +{imgIndex}
                                        </div>
                                      </div>
                                    )}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="mb-3 d-md-none">
                      <label className="form-label fw-medium mb-2 small">
                        Product Video
                      </label>
                      <div className="mb-2">
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          placeholder="YouTube URL"
                          value={formData.video_url || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              video_url: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="file"
                          accept="video/*"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData({
                                  ...formData,
                                  video_file: event.target.result,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        Add YouTube URL or upload video
                      </small>
                    </div>
                  </div>
                </div>

                <div className="flex-grow-1 d-flex flex-column">
                  <div className="p-2 p-md-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold text-dark">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Product Information
                      </h6>
                      <button
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                  </div>

                  <div
                    className="flex-grow-1 p-2 p-md-3 modal-scroll"
                    style={{
                      overflowY: "auto",
                      maxHeight: "calc(98vh - 100px)",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label fw-medium small">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          placeholder="Enter product name"
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-medium small">
                          Category *
                        </label>
                        <div className="d-flex gap-1">
                          <select
                            className="form-select form-select-sm flex-grow-1"
                            style={{ borderRadius: "8px" }}
                            value={formData.category || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Category</option>
                            <option value="electronics">Electronics</option>
                            <option value="smartphones">Smartphones</option>
                            <option value="laptops">Laptops</option>
                            <option value="tablets">Tablets</option>
                            <option value="headphones">Headphones</option>
                            <option value="gaming">Gaming</option>
                            <option value="cameras">Cameras</option>
                            <option value="home-appliances">
                              Home Appliances
                            </option>
                            <option value="accessories">Accessories</option>
                            <option value="watches">Watches</option>
                            {Array.isArray(availableCategories) &&
                              availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setShowCategoryModal(true)}
                            style={{ borderRadius: "8px" }}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label fw-medium small">
                          Price *
                        </label>
                        <div className="input-group input-group-sm">
                          <span
                            className="input-group-text"
                            style={{ borderRadius: "8px 0 0 8px" }}
                          >
                            ₹
                          </span>
                          <input
                            type="number"
                            className="form-control"
                            style={{ borderRadius: "0 8px 8px 0" }}
                            placeholder="0"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label fw-medium small">
                          Stock
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          placeholder="0"
                          value={formData.stock || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div className="col-12 d-md-block d-none">
                        <label className="form-label fw-medium small">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px", resize: "none" }}
                          placeholder="Product description"
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      <div className="col-12 col-sm-6 d-md-block d-none">
                        <label className="form-label fw-medium small">
                          Original Price
                        </label>
                        <div className="input-group input-group-sm">
                          <span
                            className="input-group-text"
                            style={{ borderRadius: "8px 0 0 8px" }}
                          >
                            ₹
                          </span>
                          <input
                            type="number"
                            className="form-control"
                            style={{ borderRadius: "0 8px 8px 0" }}
                            placeholder="0"
                            value={formData.actual_price || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                actual_price: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 d-md-block d-none">
                        <label className="form-label fw-medium small">
                          Discount %
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ borderRadius: "8px" }}
                          placeholder="0"
                          value={formData.discount_percentage || 0}
                          onChange={(e) => {
                            const discount = parseFloat(e.target.value) || 0;
                            const actualPrice =
                              parseFloat(formData.actual_price) ||
                              parseFloat(formData.price) ||
                              0;
                            const discountedPrice =
                              actualPrice - (actualPrice * discount) / 100;
                            setFormData({
                              ...formData,
                              discount_percentage: discount,
                              price: discountedPrice.toFixed(2),
                            });
                          }}
                        />
                      </div>

                      <div className="col-12 d-md-block d-none">
                        <div className="row g-2 align-items-end">
                          <div className="col-8">
                            <label className="form-label fw-medium small">
                              Exchange Discount
                            </label>
                            <div className="input-group input-group-sm">
                              <span
                                className="input-group-text"
                                style={{ borderRadius: "8px 0 0 8px" }}
                              >
                                ₹
                              </span>
                              <input
                                type="number"
                                className="form-control"
                                style={{ borderRadius: "0 8px 8px 0" }}
                                placeholder="0"
                                value={formData.exchange_discount || 0}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    exchange_discount: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="exchange-available"
                                checked={formData.exchange_available || false}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    exchange_available: e.target.checked,
                                  })
                                }
                              />
                              <label
                                className="form-check-label fw-medium small"
                                htmlFor="exchange-available"
                              >
                                Exchange
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 d-md-none">
                        <div className="mb-2">
                          <label className="form-label fw-medium mb-2 small">
                            Product Video
                          </label>
                          <div className="mb-2">
                            <input
                              type="url"
                              className="form-control form-control-sm"
                              style={{ borderRadius: "8px" }}
                              placeholder="YouTube URL"
                              value={formData.video_url || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  video_url: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <input
                              type="file"
                              accept="video/*"
                              className="form-control form-control-sm"
                              style={{ borderRadius: "8px" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setFormData({
                                      ...formData,
                                      video_file: event.target.result,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                          <small className="text-muted">
                            Add YouTube URL or upload video
                          </small>
                        </div>

                        <div className="mb-2">
                          <label className="form-label fw-medium mb-2 small">
                            Landing Image *
                          </label>
                          <div
                            className="position-relative"
                            style={{
                              height: "60px",
                              border: "2px dashed #dee2e6",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              background: "#fff",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.borderColor = "#0d6efd")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.borderColor = "#dee2e6")
                            }
                          >
                            <input
                              accept="image/*"
                              type="file"
                              id="mobile-image0"
                              className="d-none"
                              onChange={(e) => handleImageUpload(e, 0)}
                            />
                            <label
                              htmlFor="mobile-image0"
                              className="w-100 h-100 d-flex align-items-center justify-content-center m-0 position-relative"
                              style={{ cursor: "pointer" }}
                            >
                              {formData.images && formData.images[0] ? (
                                <>
                                  <img
                                    src={formData.images[0]}
                                    alt="Landing Image"
                                    className="w-100 h-100"
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                  <div
                                    className="position-absolute top-0 start-0 bg-primary text-white px-1"
                                    style={{
                                      fontSize: "0.5rem",
                                      borderRadius: "0 0 4px 0",
                                    }}
                                  >
                                    MAIN
                                  </div>
                                  <button
                                    type="button"
                                    className="position-absolute top-0 end-0 btn btn-danger btn-sm"
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      fontSize: "6px",
                                      transform: "translate(4px, -4px)",
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newImages = [
                                        ...(formData.images ||
                                          Array(5).fill(null)),
                                      ];
                                      newImages[0] = null;
                                      setFormData({
                                        ...formData,
                                        images: newImages,
                                        image_url:
                                          newImages.filter(Boolean)[0] || "",
                                      });
                                    }}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              ) : (
                                <div className="text-center text-muted">
                                  <i
                                    className="fas fa-image mb-1"
                                    style={{ fontSize: "1rem" }}
                                  ></i>
                                  <div style={{ fontSize: "0.6rem" }}>
                                    Main Image
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="form-label fw-medium mb-2 small">
                            Additional Images
                          </label>
                          <div className="row g-1">
                            {Array(4)
                              .fill("")
                              .map((_, index) => {
                                const imgIndex = index + 1;
                                return (
                                  <div key={imgIndex} className="col-6">
                                    <div
                                      className="position-relative"
                                      style={{
                                        height: "40px",
                                        border: "2px dashed #dee2e6",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        background: "#fff",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.target.style.borderColor = "#0d6efd")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.target.style.borderColor = "#dee2e6")
                                      }
                                    >
                                      <input
                                        accept="image/*"
                                        type="file"
                                        id={`mobile-image${imgIndex}`}
                                        className="d-none"
                                        onChange={(e) =>
                                          handleImageUpload(e, imgIndex)
                                        }
                                      />
                                      <label
                                        htmlFor={`mobile-image${imgIndex}`}
                                        className="w-100 h-100 d-flex align-items-center justify-content-center m-0 position-relative"
                                        style={{ cursor: "pointer" }}
                                      >
                                        {formData.images &&
                                        formData.images[imgIndex] ? (
                                          <>
                                            <img
                                              src={formData.images[imgIndex]}
                                              alt={`Image ${imgIndex}`}
                                              className="w-100 h-100"
                                              style={{
                                                objectFit: "cover",
                                                borderRadius: "6px",
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className="position-absolute top-0 end-0 btn btn-danger btn-sm"
                                              style={{
                                                width: "12px",
                                                height: "12px",
                                                borderRadius: "50%",
                                                fontSize: "5px",
                                                transform:
                                                  "translate(3px, -3px)",
                                              }}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const newImages = [
                                                  ...(formData.images ||
                                                    Array(5).fill(null)),
                                                ];
                                                newImages[imgIndex] = null;
                                                setFormData({
                                                  ...formData,
                                                  images: newImages,
                                                  image_urls:
                                                    newImages.filter(Boolean),
                                                });
                                              }}
                                            >
                                              <i className="fas fa-times"></i>
                                            </button>
                                          </>
                                        ) : (
                                          <div className="text-center text-muted">
                                            <i
                                              className="fas fa-plus mb-1"
                                              style={{ fontSize: "0.5rem" }}
                                            ></i>
                                            <div style={{ fontSize: "0.5rem" }}>
                                              +{imgIndex}
                                            </div>
                                          </div>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-2 border-top"
                    style={{ background: "#f8f9fa" }}
                  >
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowModal(false)}
                        style={{ borderRadius: "8px" }}
                      >
                        <i className="fas fa-times me-1"></i>
                        <span className="d-none d-md-inline">Cancel</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm flex-grow-1"
                        style={{ borderRadius: "8px" }}
                        onClick={handleSaveProduct}
                      >
                        <i
                          className={`fas ${
                            editItem ? "fa-save" : "fa-plus"
                          } me-1`}
                        ></i>
                        <span className="d-none d-md-inline">
                          {editItem ? "Update" : "Add"} Product
                        </span>
                        <span className="d-md-none">
                          {editItem ? "Update" : "Add"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 10000,
              backdropFilter: "blur(5px)",
            }}
          >
            <div
              className="bg-white shadow-lg rounded-4 overflow-hidden"
              style={{ width: "90vw", maxWidth: "500px" }}
            >
              <div
                className="p-4 border-bottom"
                style={{
                  background:
                    "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      <i className="fas fa-tags me-2"></i>Add New Category
                    </h5>
                    <p className="mb-0 opacity-75 small">
                      Create a new product category
                    </p>
                  </div>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowCategoryModal(false)}
                  ></button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: "10px", padding: "12px" }}
                    value={categoryFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setCategoryFormData({ name, slug });
                    }}
                    placeholder="Enter category name"
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium">URL Slug</label>
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "10px 0 0 10px" }}
                    >
                      /
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: "0 10px 10px 0", padding: "12px" }}
                      value={categoryFormData.slug}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          slug: e.target.value,
                        })
                      }
                      placeholder="category-slug"
                    />
                  </div>
                  <small className="text-muted">
                    Auto-generated from category name
                  </small>
                </div>
              </div>

              <div className="p-4 border-top" style={{ background: "#f8f9fa" }}>
                <div className="d-flex gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCategoryModal(false)}
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times me-1"></i>Cancel
                  </button>
                  <button
                    className="btn btn-success flex-grow-1"
                    style={{ borderRadius: "10px" }}
                    onClick={async () => {
                      if (!categoryFormData.name.trim()) {
                        toast.error("Category name is required");
                        return;
                      }
                      try {
                        await adminAPI.createCategory(categoryFormData);
                        toast.success("Category created successfully");
                        setShowCategoryModal(false);
                        setCategoryFormData({ name: "", slug: "" });
                        await fetchDashboardData();
                        const categoriesRes = await productsAPI.getCategories();
                        setAvailableCategories(categoriesRes.data || []);
                      } catch (error) {
                        toast.error("Failed to create category");
                      }
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
