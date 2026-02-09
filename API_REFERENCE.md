# Salon E-Commerce API Reference

This document outlines the standardized API endpoints used in the Salon E-Commerce platform. All endpoints are prefixed with `/api/v1` and require appropriate authentication tokens for role-restricted resources.

## Base Configuration
- **Base URL:** `http://localhost:5000/api/v1`
- **Content-Type:** `application/json`
- **Auth Header:** `Authorization: Bearer <token>`

---

## Authentication
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Public | Authenticate user and receive token. |
| POST | `/auth/register` | Public | Create new Customer account. |
| GET | `/auth/me` | Any | Get current user profile. |

---

## Products
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/products` | Public | List products (supports `category`, `status`, `page`, `limit`). |
| GET | `/products/:id` | Public | Get detailed product information. |
| POST | `/products` | Admin | Create new product (supports FormData/Images). |
| PATCH | `/products/:id` | Admin | Update product details or stock. |
| DELETE | `/products/:id` | Admin | Soft/Hard delete product. |

---

## Categories
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/categories` | Public | List all product categories. |
| POST | `/categories` | Admin | Create single or bulk categories. |
| DELETE | `/categories/:id` | Admin | Remove category. |

---

## Orders
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/orders` | Admin | List all platform orders. |
| GET | `/orders/me` | Customer | List current user's order history. |
| GET | `/orders/assigned` | Agent | List orders assigned to the logged-in agent. |
| GET | `/orders/:id` | Any | Get specific order tracking/details. |
| POST | `/orders` | Customer | Initialize new order from cart. |
| PATCH | `/orders/:id/status` | Admin/Agent | Update fulfillment status. |
| PATCH | `/orders/:id/assign-agent`| Admin | Manually map order to an agent. |

---

## Payouts & Wallet
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/payouts` | Admin | Audit all commission payout requests. |
| GET | `/payouts/me` | Agent | View personal earning disbursement history. |
| POST | `/payouts/request` | Agent | Request transfer from wallet. |
| PATCH | `/payouts/:id/status` | Admin | Approve or Reject payout. |

---

## Commissions
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/commissions` | Admin | View platform-wide commission volume. |
| GET | `/commissions/me` | Agent | View real-time personal earnings breakdown. |
| GET | `/commissions/tiers` | Admin | List performance slabs (Silver, Gold, etc). |
| PATCH | `/commissions/tiers/:id` | Admin | Update slab thresholds and rates. |

---

## Cart
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/cart` | Any | Retrieve persistent server-side cart. |
| POST | `/cart/add` | Any | Add item or increment quantity. |
| PATCH | `/cart/:productId` | Any| Explicitly set item quantity. |
| DELETE | `/cart/:productId` | Any | Remove item from cart. |
| DELETE | `/cart` | Any | Purge entire cart. |

---

## Users & Agents
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/users` | Admin | List all registered users. |
| GET | `/users/agents` | Admin | List active professional agents. |
| GET | `/users/:id` | Admin | Get detailed user metadata and roles. |
| PUT | `/users/profile` | Any | Update personal account settings. |

---

## Payments
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| POST | `/payments/create-order` | Customer | Initialize Razorpay Order ID. |
| POST | `/payments/verify` | Customer | Verify payment signature and finalize order. |
